const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Test configuration
const API_URL = 'http://localhost:3001/api';
const TEST_FILES_DIR = path.join(__dirname, 'test-files');

// Test credentials (you may need to update these)
const TEST_USER = {
  email: 'test@example.com',
  password: 'test123'
};

async function testDocumentUpload() {
  console.log('\n========================================');
  console.log('DOCUMENT UPLOAD TESTS');
  console.log('========================================\n');

  let authToken;
  let testCustomerId;

  try {
    // ========================================
    // TEST 1: Login to get auth token
    // ========================================
    console.log('🔐 TEST 1: Authentication');
    console.log('----------------------------------------');

    try {
      const loginResponse = await axios.post(`${API_URL}/auth/login`, TEST_USER);
      authToken = loginResponse.data.token;
      console.log('✅ Authentication successful');
    } catch (error) {
      console.log('⚠️  Could not authenticate with test credentials');
      console.log('  Please ensure server is running and test user exists');
      console.log('  Or manually set authToken in the script');
      return;
    }

    // ========================================
    // TEST 2: Get a test customer ID
    // ========================================
    console.log('\n👤 TEST 2: Get Test Customer');
    console.log('----------------------------------------');

    const customersResponse = await axios.get(`${API_URL}/customers`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (customersResponse.data.customers && customersResponse.data.customers.length > 0) {
      testCustomerId = customersResponse.data.customers[0].customer_id;
      console.log(`✅ Using customer: ${customersResponse.data.customers[0].company_name}`);
      console.log(`  Customer ID: ${testCustomerId}`);
    } else {
      console.log('⚠️  No customers found. Please create a customer first');
      return;
    }

    // ========================================
    // TEST 3: Create test files directory
    // ========================================
    console.log('\n📁 TEST 3: Prepare Test Files');
    console.log('----------------------------------------');

    if (!fs.existsSync(TEST_FILES_DIR)) {
      fs.mkdirSync(TEST_FILES_DIR, { recursive: true });
      console.log('✅ Created test files directory');
    }

    // Create test files with different types
    const testFiles = [
      { name: 'test-document.txt', content: 'This is a test document for upload testing.', type: 'text/plain' },
      { name: 'test-data.csv', content: 'Name,Value\nTest1,100\nTest2,200', type: 'text/csv' }
    ];

    for (const file of testFiles) {
      const filePath = path.join(TEST_FILES_DIR, file.name);
      fs.writeFileSync(filePath, file.content);
      console.log(`✅ Created test file: ${file.name}`);
    }

    // ========================================
    // TEST 4: Upload documents with different sizes
    // ========================================
    console.log('\n📤 TEST 4: Upload Documents');
    console.log('----------------------------------------');

    const uploadTests = [
      {
        name: 'Small text file (< 1KB)',
        file: 'test-document.txt',
        category: 'general',
        expectedSuccess: true
      },
      {
        name: 'CSV file',
        file: 'test-data.csv',
        category: 'financial',
        expectedSuccess: true
      }
    ];

    for (const test of uploadTests) {
      console.log(`\n  Testing: ${test.name}`);

      try {
        const filePath = path.join(TEST_FILES_DIR, test.file);
        const fileStats = fs.statSync(filePath);
        console.log(`    File size: ${fileStats.size} bytes`);

        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));
        formData.append('customer_id', testCustomerId);
        formData.append('category', test.category);
        formData.append('description', `Test upload: ${test.name}`);

        const uploadResponse = await axios.post(
          `${API_URL}/documents/upload`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
              Authorization: `Bearer ${authToken}`
            }
          }
        );

        if (test.expectedSuccess) {
          console.log(`    ✅ Upload successful`);
          console.log(`    Document ID: ${uploadResponse.data.document.document_id}`);
          console.log(`    File name: ${uploadResponse.data.document.file_name}`);
        } else {
          console.log(`    ❌ Upload should have failed but succeeded`);
        }
      } catch (error) {
        if (!test.expectedSuccess) {
          console.log(`    ✅ Upload failed as expected: ${error.response?.data?.error || error.message}`);
        } else {
          console.log(`    ❌ Upload failed unexpectedly: ${error.response?.data?.error || error.message}`);
          if (error.response?.data) {
            console.log(`    Error details:`, error.response.data);
          }
        }
      }
    }

    // ========================================
    // TEST 5: Verify uploaded documents
    // ========================================
    console.log('\n\n📋 TEST 5: Verify Uploaded Documents');
    console.log('----------------------------------------');

    const documentsResponse = await axios.get(
      `${API_URL}/documents/customer/${testCustomerId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    console.log(`✅ Found ${documentsResponse.data.total} document(s) for customer`);
    documentsResponse.data.documents.forEach((doc, idx) => {
      console.log(`  ${idx + 1}. ${doc.file_name}`);
      console.log(`     Category: ${doc.category}`);
      console.log(`     Size: ${doc.file_size} bytes`);
      console.log(`     Type: ${doc.file_type}`);
      console.log(`     Uploaded: ${new Date(doc.uploaded_at).toLocaleString()}`);
    });

    // ========================================
    // TEST 6: Test large file (simulated)
    // ========================================
    console.log('\n\n📦 TEST 6: Large File Upload');
    console.log('----------------------------------------');

    // Create a file just under the 10MB limit
    const largeFileName = 'test-large.txt';
    const largeFilePath = path.join(TEST_FILES_DIR, largeFileName);
    const largeFileSize = 9 * 1024 * 1024; // 9MB

    console.log(`  Creating ${(largeFileSize / 1024 / 1024).toFixed(1)}MB test file...`);
    const buffer = Buffer.alloc(largeFileSize, 'a');
    fs.writeFileSync(largeFilePath, buffer);
    console.log(`  ✅ Created large test file`);

    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(largeFilePath));
      formData.append('customer_id', testCustomerId);
      formData.append('category', 'general');
      formData.append('description', 'Large file upload test');

      console.log(`  Uploading ${(largeFileSize / 1024 / 1024).toFixed(1)}MB file...`);
      const uploadResponse = await axios.post(
        `${API_URL}/documents/upload`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            Authorization: `Bearer ${authToken}`
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      console.log(`  ✅ Large file upload successful`);
      console.log(`  Document ID: ${uploadResponse.data.document.document_id}`);
    } catch (error) {
      console.log(`  ❌ Large file upload failed: ${error.response?.data?.error || error.message}`);
      if (error.response?.data) {
        console.log(`  Error details:`, error.response.data);
      }
    }

    // ========================================
    // CLEANUP
    // ========================================
    console.log('\n\n🧹 CLEANUP: Removing test files...');
    if (fs.existsSync(TEST_FILES_DIR)) {
      fs.rmSync(TEST_FILES_DIR, { recursive: true, force: true });
      console.log('✅ Test files cleaned up');
    }

    console.log('\n========================================');
    console.log('✅ DOCUMENT UPLOAD TESTS COMPLETED!');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error);

    // Cleanup on error
    if (fs.existsSync(TEST_FILES_DIR)) {
      fs.rmSync(TEST_FILES_DIR, { recursive: true, force: true });
      console.log('Cleaned up test files after error');
    }
  }
}

// Check if server is running before starting tests
console.log('Checking if server is running...');
axios.get(`${API_URL}/health`)
  .then(() => {
    console.log('✅ Server is running\n');
    testDocumentUpload();
  })
  .catch(() => {
    console.error('❌ Server is not running. Please start the server first with: npm run server');
    process.exit(1);
  });
