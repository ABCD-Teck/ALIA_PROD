const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE_ALIA,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  ssl: { rejectUnauthorized: false }
});

const industries = [
  { code: 'TECH', name: 'Technology' },
  { code: 'FINSERV', name: 'Finance' },
  { code: 'HEALTHCARE', name: 'Healthcare' },
  { code: 'EDUCATION', name: 'Education' },
  { code: 'MANUF', name: 'Manufacturing' },
  { code: 'RETAIL', name: 'Retail' },
  { code: 'REALESTATE', name: 'Real Estate' },
  { code: 'CONSULTING', name: 'Consulting' },
  { code: 'ENERGY', name: 'Energy' },
  { code: 'AUTOMOTIVE', name: 'Automotive' },
  { code: 'TELECOM', name: 'Telecommunications' },
  { code: 'MEDIA', name: 'Media' },
  { code: 'TRANSPORT', name: 'Transportation' },
  { code: 'AGRICULTURE', name: 'Agriculture' },
  { code: 'CONSTRUCTION', name: 'Construction' },
  { code: 'OTHER', name: 'Other' }
];

async function populateIndustries() {
  try {
    console.log('Populating industries...\n');
    
    for (const industry of industries) {
      try {
        // Try to insert, ignore if already exists
        await pool.query(
          'INSERT INTO industry (industry_code, industry_name) VALUES ($1, $2) ON CONFLICT (industry_code) DO NOTHING',
          [industry.code, industry.name]
        );
        console.log(`✓ ${industry.code}: ${industry.name}`);
      } catch (err) {
        console.log(`- ${industry.code}: ${industry.name} (already exists or error)`);
      }
    }
    
    // Verify
    const result = await pool.query('SELECT COUNT(*) FROM industry');
    console.log(`\nTotal industries in database: ${result.rows[0].count}`);
    
    await pool.end();
    console.log('\n✅ Industry population complete!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

populateIndustries();
