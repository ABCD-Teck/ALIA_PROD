const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE_ALIA,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createUser() {
  try {
    const email = 'n3bula.chen@gmail.com';
    const password = 'Poqw1209!';
    const first_name = 'N3BULA';
    const last_name = 'Chen';
    const role = 'admin';

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM "user" WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log('User already exists:', existingUser.rows[0].email);
      await pool.end();
      return;
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
      RETURNING user_id, email, first_name, last_name, role, created_at
    `;

    const result = await pool.query(query, [
      email,
      password_hash,
      first_name,
      last_name,
      role
    ]);

    console.log('✅ User created successfully:');
    console.log(JSON.stringify(result.rows[0], null, 2));
    console.log('\nLogin credentials:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

    await pool.end();
  } catch (error) {
    console.error('❌ Error creating user:', error);
    await pool.end();
    process.exit(1);
  }
}

createUser();
