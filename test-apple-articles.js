const { Client } = require('pg');

async function testAppleArticles() {
  const miaClient = new Client({
    host: 'abcdteck-ce.cdggcuqweof7.eu-central-1.rds.amazonaws.com',
    port: 5432,
    database: 'mia_insights',
    user: 'postgres',
    password: 'ABCDTeck2025',
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await miaClient.connect();
    console.log('Connected to MIA database');

    // Test 1: Check if there are any Apple articles
    console.log('\n=== Test 1: Articles with Apple in company name ===');
    const result1 = await miaClient.query(`
      SELECT na.news_id, na.title, c.name as company_name, c.company_id
      FROM news_article na
      LEFT JOIN company c ON na.company_id = c.company_id
      WHERE c.name ILIKE '%Apple%' AND na.has_text = true
      LIMIT 5
    `);
    console.log(`Found ${result1.rows.length} articles`);
    result1.rows.forEach(row => {
      console.log(`  - ${row.title.substring(0, 60)}... (Company: ${row.company_name})`);
    });

    // Test 2: Check what the exact company name is in the database
    console.log('\n=== Test 2: Companies with "Apple" in name ===');
    const result2 = await miaClient.query(`
      SELECT company_id, name, ticker
      FROM company
      WHERE name ILIKE '%Apple%'
    `);
    console.log(`Found ${result2.rows.length} companies`);
    result2.rows.forEach(row => {
      console.log(`  - ID: ${row.company_id}, Name: "${row.name}", Ticker: ${row.ticker}`);
    });

    // Test 3: Test the exact SQL query used by the API with company='Apple'
    console.log('\n=== Test 3: Simulating API query with company="Apple" ===');
    const result3 = await miaClient.query(`
      SELECT na.news_id, na.title, c.name as company_name
      FROM news_article na
      LEFT JOIN company c ON na.company_id = c.company_id
      WHERE na.has_text = true
        AND c.name ILIKE $1
      LIMIT 5
    `, ['%Apple%']);
    console.log(`Found ${result3.rows.length} articles with ILIKE '%Apple%'`);
    result3.rows.forEach(row => {
      console.log(`  - ${row.title.substring(0, 60)}... (Company: ${row.company_name})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await miaClient.end();
  }
}

testAppleArticles();
