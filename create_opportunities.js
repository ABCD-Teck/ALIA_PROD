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

async function checkCustomersAndCreateOpportunities() {
  try {
    console.log('=== NEW CUSTOMERS FOR OPPORTUNITIES ===');
    const customers = await pool.query(`
      SELECT customer_id, company_name, industry_code
      FROM customer
      WHERE created_at >= '2025-10-10'  -- New customers we created
      ORDER BY company_name
    `);
    customers.rows.forEach(customer => {
      console.log(`${customer.customer_id}: ${customer.company_name} (${customer.industry_code})`);
    });

    // Get currency and region IDs
    const currencies = {
      USD: '76d02e9c-f71a-4d8e-9d11-c9e2e7e81ec8',
      EUR: '5dd2f770-f1c2-42a0-b3d5-7b2d568fc9d6',
      GBP: '2899173e-8f1a-41d9-bb93-793118d264e5',
      SGD: 'a75f7caa-a0eb-4fc2-abcd-36844a9fbb28'
    };

    const regions = {
      'North America': '55883d82-8be9-4cd3-8e01-20b07a7e90a9',
      'Europe': 'fb3d16eb-8d9a-4181-8aff-e9c96e8a9594',
      'APAC': '4cf77bc1-5810-4c59-b77a-7c75f83e784d'
    };

    const ownerUserId = 'b7b8826e-d8e9-4bf7-bb39-5aefd830cdd4'; // Default user

    console.log('\n=== CREATING OPPORTUNITIES ===');

    // Create opportunities for each new customer
    const opportunities = [
      {
        customerName: 'GreenTech Innovations Ltd',
        name: 'Solar Panel Efficiency AI Solution',
        description: 'Implementation of AI-powered solar panel monitoring and predictive maintenance system to reduce efficiency losses from 15% to under 5%.',
        countryCode: 'GB',
        regionId: regions['Europe'],
        priority: 'HIGH',
        amount: 2000000,
        currencyId: currencies.EUR,
        stage: 'PROPOSAL',
        probability: 85,
        expectedCloseDate: '2025-12-15'
      },
      {
        customerName: 'DataFlow Analytics Inc',
        name: 'Enterprise AI Analytics Platform',
        description: 'Comprehensive deployment of AI-powered analytics platform with ethical AI framework and system integration capabilities.',
        countryCode: 'US',
        regionId: regions['North America'],
        priority: 'HIGH',
        amount: 5000000,
        currencyId: currencies.USD,
        stage: 'PROPOSAL',
        probability: 75,
        expectedCloseDate: '2026-02-28'
      },
      {
        customerName: 'Nordic Manufacturing AB',
        name: 'Industry 4.0 Smart Manufacturing Suite',
        description: 'Complete Industry 4.0 solution including IoT sensor integration, predictive maintenance algorithms, and quality control automation.',
        countryCode: 'SE',
        regionId: regions['Europe'],
        priority: 'MEDIUM',
        amount: 1250000,
        currencyId: currencies.EUR,
        stage: 'PROPOSAL',
        probability: 60,
        expectedCloseDate: '2025-11-30'
      },
      {
        customerName: 'TechnoCore Startups Accelerator',
        name: 'Startup Portfolio CRM Licensing',
        description: 'Bulk licensing agreement for CRM solution deployment across 50+ portfolio startups with customized accelerator features.',
        countryCode: 'SG',
        regionId: regions['APAC'],
        priority: 'MEDIUM',
        amount: 750000,
        currencyId: currencies.SGD,
        stage: 'PROPOSAL',
        probability: 70,
        expectedCloseDate: '2025-12-31'
      },
      {
        customerName: 'Cloud9 Digital Agency',
        name: 'Digital Marketing Intelligence Platform',
        description: 'AI-powered digital marketing analytics and customer behavior prediction platform for enhanced campaign optimization.',
        countryCode: 'GB',
        regionId: regions['Europe'],
        priority: 'LOW',
        amount: 480000,
        currencyId: currencies.GBP,
        stage: 'PROPOSAL',
        probability: 40,
        expectedCloseDate: '2026-03-15'
      }
    ];

    for (const opp of opportunities) {
      // Find customer by name
      const customer = customers.rows.find(c => c.company_name === opp.customerName);
      if (!customer) {
        console.log(`❌ Customer ${opp.customerName} not found`);
        continue;
      }

      // Insert opportunity
      await pool.query(`
        INSERT INTO opportunity (
          customer_id, name, description, country_code, region_id,
          priority, amount, currency_id, stage, probability,
          expected_close_date, owner_user_id, created_by, updated_by,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
        )
      `, [
        customer.customer_id,
        opp.name,
        opp.description,
        opp.countryCode,
        opp.regionId,
        opp.priority,
        opp.amount,
        opp.currencyId,
        opp.stage,
        opp.probability,
        opp.expectedCloseDate,
        ownerUserId,
        ownerUserId,
        ownerUserId,
        new Date(),
        new Date()
      ]);

      console.log(`✅ Created opportunity: ${opp.name} for ${opp.customerName}`);
    }

    console.log('\n=== OPPORTUNITIES CREATED SUCCESSFULLY ===');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkCustomersAndCreateOpportunities();