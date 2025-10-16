require('dotenv').config();
const { Pool } = require('pg');

const miaPool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE_MIA,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test connection
miaPool.on('connect', () => {
  console.log('Connected to MIA PostgreSQL database');
});

miaPool.on('error', (err) => {
  console.error('Unexpected error on MIA idle client', err);
  // Log the error but don't exit the process immediately
  // process.exit(-1);
});

module.exports = miaPool;
