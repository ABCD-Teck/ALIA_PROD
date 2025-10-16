const jwt = require('jsonwebtoken');
const pool = require('../db');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    try {
      // Verify user still exists and is active
      const result = await pool.query(
        'SELECT user_id, email, first_name, last_name, role, is_active FROM "user" WHERE user_id = $1 AND is_active = true',
        [user.userId]
      );

      if (result.rows.length === 0) {
        return res.status(403).json({ error: 'User not found or inactive' });
      }

      req.user = result.rows[0];
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(500).json({ error: 'Authentication failed' });
    }
  });
};

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.user_id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user.user_id,
      email: user.email,
      type: 'refresh'
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = {
  authenticateToken,
  generateToken,
  generateRefreshToken
};