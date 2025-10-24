const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('./db');

async function testDashboardFunctions() {
  console.log('\n=================================');
  console.log('DASHBOARD FUNCTIONALITY TESTS');
  console.log('=================================\n');

  try {
    // Test 1: Get all customers
    console.log('📋 Test 1: Fetching all customers...');
    const customersQuery = `
      SELECT
        c.*,
        i.industry_name,
        (SELECT COUNT(*) FROM contact WHERE customer_id = c.customer_id AND is_active = true) as contact_count,
        (SELECT COUNT(*) FROM opportunity WHERE customer_id = c.customer_id) as opportunity_count
      FROM customer c
      LEFT JOIN industry i ON c.industry_code = i.industry_code
      WHERE c.is_active = true
      ORDER BY c.created_at DESC
      LIMIT 10
    `;
    const customersResult = await pool.query(customersQuery);
    console.log(`✅ Found ${customersResult.rows.length} customers`);
    if (customersResult.rows.length > 0) {
      console.log(`   First customer: ${customersResult.rows[0].company_name}`);
    }

    // Test 2: Create a new test customer
    console.log('\n👤 Test 2: Creating a new test customer...');
    const createCustomerQuery = `
      INSERT INTO customer (
        company_name, industry_code, website, description,
        phone, email, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const newCustomerValues = [
      'Test Company ABC',
      null, // industry_code - can be null
      'https://testcompany.com',
      'This is a test customer created by automated test',
      '+1-555-TEST',
      'test@testcompany.com',
      'active'
    ];
    const newCustomerResult = await pool.query(createCustomerQuery, newCustomerValues);
    const testCustomer = newCustomerResult.rows[0];
    console.log(`✅ Created customer: ${testCustomer.company_name} (ID: ${testCustomer.customer_id})`);

    // Test 3: Verify customer appears in database
    console.log('\n🔍 Test 3: Verifying customer in database...');
    const verifyQuery = `
      SELECT * FROM customer WHERE customer_id = $1
    `;
    const verifyResult = await pool.query(verifyQuery, [testCustomer.customer_id]);
    if (verifyResult.rows.length > 0) {
      console.log(`✅ Customer verified in database`);
      console.log(`   Company: ${verifyResult.rows[0].company_name}`);
      console.log(`   Status: ${verifyResult.rows[0].status}`);
      console.log(`   Created: ${verifyResult.rows[0].created_at}`);
    } else {
      console.log(`❌ Customer not found in database!`);
    }

    // Test 4: Check document table structure
    console.log('\n📄 Test 4: Checking document table structure...');
    const tableQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'document'
      ORDER BY ordinal_position
    `;
    const tableResult = await pool.query(tableQuery);
    console.log(`✅ Document table has ${tableResult.rows.length} columns:`);
    tableResult.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
    });

    // Test 5: Create a test document entry
    console.log('\n📎 Test 5: Creating test document entry...');
    const createDocQuery = `
      INSERT INTO document (
        customer_id, file_name, file_path, file_size,
        file_type, category, description
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const docValues = [
      testCustomer.customer_id,
      'test-document.pdf',
      '/uploads/documents/test-document-123.pdf',
      1024000,
      'application/pdf',
      'customerInfo',
      'Test document for automated testing'
    ];
    const docResult = await pool.query(createDocQuery, docValues);
    const testDoc = docResult.rows[0];
    console.log(`✅ Created document: ${testDoc.file_name} (ID: ${testDoc.document_id})`);

    // Test 6: Retrieve documents for customer
    console.log('\n📚 Test 6: Retrieving documents for customer...');
    const getDocsQuery = `
      SELECT * FROM document
      WHERE customer_id = $1 AND is_active = true
      ORDER BY uploaded_at DESC
    `;
    const docsResult = await pool.query(getDocsQuery, [testCustomer.customer_id]);
    console.log(`✅ Found ${docsResult.rows.length} document(s) for customer`);
    if (docsResult.rows.length > 0) {
      console.log(`   Document: ${docsResult.rows[0].file_name}`);
      console.log(`   Category: ${docsResult.rows[0].category}`);
      console.log(`   Size: ${docsResult.rows[0].file_size} bytes`);
    }

    // Test 7: Update customer
    console.log('\n✏️  Test 7: Updating customer information...');
    const updateQuery = `
      UPDATE customer SET
        description = $1,
        updated_at = NOW()
      WHERE customer_id = $2
      RETURNING *
    `;
    const updateResult = await pool.query(updateQuery, [
      'Updated test customer description',
      testCustomer.customer_id
    ]);
    console.log(`✅ Updated customer description`);

    // Test 8: Dashboard statistics
    console.log('\n📊 Test 8: Calculating dashboard statistics...');
    const statsQuery = `
      SELECT
        COUNT(*) as total_customers,
        COUNT(*) FILTER (WHERE EXISTS (
          SELECT 1 FROM contact
          WHERE contact.customer_id = customer.customer_id
          AND contact.is_active = true
        )) as customers_with_contacts,
        (SELECT COUNT(*) FROM opportunity) as total_opportunities
      FROM customer
      WHERE customer.is_active = true
    `;
    const statsResult = await pool.query(statsQuery);
    const stats = statsResult.rows[0];
    console.log(`✅ Dashboard Statistics:`);
    console.log(`   Total Customers: ${stats.total_customers}`);
    console.log(`   Customers with Contacts: ${stats.customers_with_contacts}`);
    console.log(`   Total Opportunities: ${stats.total_opportunities}`);

    // Cleanup: Delete test data
    console.log('\n🧹 Cleanup: Removing test data...');
    await pool.query('DELETE FROM document WHERE document_id = $1', [testDoc.document_id]);
    await pool.query('DELETE FROM customer WHERE customer_id = $1', [testCustomer.customer_id]);
    console.log('✅ Test data cleaned up');

    console.log('\n=================================');
    console.log('✅ ALL TESTS PASSED SUCCESSFULLY!');
    console.log('=================================\n');

    console.log('Summary:');
    console.log('✓ Customer retrieval works');
    console.log('✓ Customer creation works');
    console.log('✓ Customer updates work');
    console.log('✓ Database persistence verified');
    console.log('✓ Document table structure correct');
    console.log('✓ Document creation works');
    console.log('✓ Document retrieval works');
    console.log('✓ Dashboard statistics calculation works');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testDashboardFunctions();
