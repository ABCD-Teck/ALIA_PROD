const { Client } = require('pg');

async function checkCompanies() {
  // CRM Database
  const crmClient = new Client({
    host: 'abcdteck-ce.cdggcuqweof7.eu-central-1.rds.amazonaws.com',
    port: 5432,
    database: 'alia_crm',
    user: 'postgres',
    password: 'ABCDTeck2025',
    ssl: {
      rejectUnauthorized: false
    }
  });

  // MIA Database
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
    await crmClient.connect();
    await miaClient.connect();

    console.log('\n=== CRM CUSTOMERS ===');
    const crmResult = await crmClient.query('SELECT customer_id, company_name FROM customer ORDER BY company_name');
    crmResult.rows.forEach(row => {
      console.log(`${row.customer_id}: ${row.company_name}`);
    });

    console.log('\n=== NEWS COMPANIES (first 30) ===');
    const miaResult = await miaClient.query(`
      SELECT c.company_id, c.name, COUNT(na.news_id) as article_count
      FROM company c
      LEFT JOIN news_article na ON c.company_id = na.company_id AND na.has_text = true
      GROUP BY c.company_id, c.name
      ORDER BY article_count DESC
      LIMIT 30
    `);
    miaResult.rows.forEach(row => {
      console.log(`${row.company_id}: ${row.name} (${row.article_count} articles)`);
    });

    console.log('\n=== MATCHING ANALYSIS ===');
    const crmCompanies = crmResult.rows.map(r => r.company_name.toLowerCase());
    const miaCompanies = miaResult.rows.map(r => r.name.toLowerCase());

    console.log(`Total CRM companies: ${crmCompanies.length}`);
    console.log(`Total NEWS companies (sample): ${miaCompanies.length}`);

    const matches = crmCompanies.filter(crm => miaCompanies.includes(crm));
    console.log(`\nExact matches (case-insensitive): ${matches.length}`);
    if (matches.length > 0) {
      console.log('Matched companies:', matches);
    }

    console.log('\n=== POTENTIAL PARTIAL MATCHES ===');
    crmResult.rows.forEach(crm => {
      const crmName = crm.company_name.toLowerCase();
      const partialMatches = miaResult.rows.filter(mia => {
        const miaName = mia.name.toLowerCase();
        return miaName.includes(crmName) || crmName.includes(miaName);
      });

      if (partialMatches.length > 0) {
        console.log(`\nCRM: "${crm.company_name}"`);
        partialMatches.forEach(m => {
          console.log(`  → NEWS: "${m.name}" (${m.article_count} articles)`);
        });
      }
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await crmClient.end();
    await miaClient.end();
  }
}

checkCompanies();
