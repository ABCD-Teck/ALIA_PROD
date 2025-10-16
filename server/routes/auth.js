const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db');
const { authenticateToken, generateToken, generateRefreshToken } = require('../middleware/auth');

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const query = 'SELECT * FROM "user" WHERE email = $1 AND is_active = true';
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Compare password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await pool.query(
      'UPDATE "user" SET last_login = NOW() WHERE user_id = $1',
      [user.user_id]
    );

    // Return user data (without password hash) and JWT tokens
    const { password_hash, ...userData } = user;

    // Generate JWT tokens
    const accessToken = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      user: userData,
      accessToken,
      refreshToken,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', message: error.message });
  }
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name, role = 'user' } = req.body;

    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM "user" WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert new user
    const query = `
      INSERT INTO "user" (
        email, password_hash, first_name, last_name, role,
        is_active, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW())
      RETURNING user_id, email, first_name, last_name, role, is_active, created_at
    `;

    const result = await pool.query(query, [
      email,
      password_hash,
      first_name,
      last_name,
      role
    ]);

    const newUser = result.rows[0];

    // Generate JWT tokens
    const accessToken = generateToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    res.status(201).json({
      user: newUser,
      accessToken,
      refreshToken,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed', message: error.message });
  }
});

// Get current user (protected route)
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // User data is already available from the middleware
    res.json({
      user: req.user,
      message: 'User authenticated successfully'
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user', message: error.message });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    const jwt = require('jsonwebtoken');

    jwt.verify(refreshToken, process.env.JWT_SECRET, async (err, decoded) => {
      if (err || decoded.type !== 'refresh') {
        return res.status(403).json({ error: 'Invalid refresh token' });
      }

      try {
        // Get fresh user data
        const result = await pool.query(
          'SELECT user_id, email, first_name, last_name, role, is_active FROM "user" WHERE user_id = $1 AND is_active = true',
          [decoded.userId]
        );

        if (result.rows.length === 0) {
          return res.status(403).json({ error: 'User not found' });
        }

        const user = result.rows[0];

        // Generate new tokens
        const newAccessToken = generateToken(user);
        const newRefreshToken = generateRefreshToken(user);

        res.json({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          user: user,
          message: 'Tokens refreshed successfully'
        });
      } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({ error: 'Token refresh failed' });
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Token refresh failed', message: error.message });
  }
});

module.exports = router;
