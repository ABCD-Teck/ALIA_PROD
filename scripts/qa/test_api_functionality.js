const https = require('https');

// Disable SSL verification for testing (since we're using self-signed cert)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const BASE_URL = 'http://localhost:3001';
let authToken = '';
let testOpportunityId = '';
let testInteractionId = '';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = require('http').request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function runTests() {
  console.log('=== Starting API Functionality Tests ===\n');

  try {
    // Test 1: Login
    console.log('1. Testing Login...');
    const loginResponse = await makeRequest('POST', '/api/auth/login', {
      email: 'n3bula.chen@gmail.com',
      password: 'Poqw1209!'
    });

    if (loginResponse.status === 200 && loginResponse.data.accessToken) {
      authToken = loginResponse.data.accessToken;
      console.log('✅ Login successful');
      console.log(`   User: ${loginResponse.data.user.email}`);
    } else {
      console.log('❌ Login failed');
      console.log('   Response:', loginResponse);
      return;
    }

    // Test 2: Get Customers (needed for creating opportunity)
    console.log('\n2. Getting customers list...');
    const customersResponse = await makeRequest('GET', '/api/customers?limit=1', null, authToken);

    if (customersResponse.status === 200 && customersResponse.data.customers?.length > 0) {
      const testCustomer = customersResponse.data.customers[0];
      console.log('✅ Got customers');
      console.log(`   Using customer: ${testCustomer.company_name} (${testCustomer.customer_id})`);

      // Test 3: Create Opportunity
      console.log('\n3. Testing Create Opportunity...');
      const createOppResponse = await makeRequest('POST', '/api/opportunities', {
        customer_id: testCustomer.customer_id,
        name: 'Test Opportunity - API Test',
        description: 'This is a test opportunity created via API',
        amount: 50000, // Changed from value to amount
        currency_id: '76d02e9c-f71a-4d8e-9d11-c9e2e7e81ec8', // USD
        stage: 'PROSPECT', // Changed to match DB default
        priority: 'HIGH', // Changed to match DB format
        notes: 'Created by automated test'
      }, authToken);

      if (createOppResponse.status === 201 && createOppResponse.data.opportunity_id) {
        testOpportunityId = createOppResponse.data.opportunity_id;
        console.log('✅ Create Opportunity successful');
        console.log(`   ID: ${testOpportunityId}`);
        console.log(`   Name: ${createOppResponse.data.name}`);
      } else {
        console.log('❌ Create Opportunity failed');
        console.log('   Response:', createOppResponse);
      }

      // Test 4: Update Opportunity
      if (testOpportunityId) {
        console.log('\n4. Testing Update Opportunity...');
        const updateOppResponse = await makeRequest('PUT', `/opportunities/${testOpportunityId}`, {
          stage: 'proposal',
          priority: 'medium',
          notes: 'Updated by automated test'
        }, authToken);

        if (updateOppResponse.status === 200) {
          console.log('✅ Update Opportunity successful');
          console.log(`   New stage: ${updateOppResponse.data.stage}`);
          console.log(`   New priority: ${updateOppResponse.data.priority}`);
        } else {
          console.log('❌ Update Opportunity failed');
          console.log('   Response:', updateOppResponse);
        }
      }

      // Test 5: Create Interaction
      console.log('\n5. Testing Create Interaction...');
      const createIntResponse = await makeRequest('POST', '/api/interactions', {
        interaction_type: 'meeting',
        subject: 'Test Meeting - API Test',
        description: 'This is a test interaction created via API',
        interaction_date: new Date().toISOString(),
        customer_id: testCustomer.customer_id,
        duration_minutes: 60,
        direction: 'outbound',
        medium: 'in-person',
        outcome: 'positive',
        sentiment: 'positive',
        importance: 3, // Changed from 'high' to 3 (integer)
        location: 'Office',
        private_notes: 'Created by automated test'
      }, authToken);

      if (createIntResponse.status === 201 && createIntResponse.data.interaction_id) {
        testInteractionId = createIntResponse.data.interaction_id;
        console.log('✅ Create Interaction successful');
        console.log(`   ID: ${testInteractionId}`);
        console.log(`   Subject: ${createIntResponse.data.subject}`);
      } else {
        console.log('❌ Create Interaction failed');
        console.log('   Response:', createIntResponse);
      }

      // Test 6: Update Interaction
      if (testInteractionId) {
        console.log('\n6. Testing Update Interaction...');
        const updateIntResponse = await makeRequest('PUT', `/interactions/${testInteractionId}`, {
          subject: 'Test Meeting - Updated',
          outcome: 'excellent',
          private_notes: 'Updated by automated test'
        }, authToken);

        if (updateIntResponse.status === 200) {
          console.log('✅ Update Interaction successful');
          console.log(`   New subject: ${updateIntResponse.data.subject}`);
          console.log(`   New outcome: ${updateIntResponse.data.outcome}`);
        } else {
          console.log('❌ Update Interaction failed');
          console.log('   Response:', updateIntResponse);
        }
      }

      // Test 7: Get Opportunities List
      console.log('\n7. Testing Get Opportunities List...');
      const getOppsResponse = await makeRequest('GET', '/api/opportunities?limit=5', null, authToken);

      if (getOppsResponse.status === 200 && getOppsResponse.data.opportunities) {
        console.log('✅ Get Opportunities successful');
        console.log(`   Total opportunities: ${getOppsResponse.data.total}`);
        console.log(`   Returned: ${getOppsResponse.data.opportunities.length}`);
      } else {
        console.log('❌ Get Opportunities failed');
        console.log('   Response:', getOppsResponse);
      }

      // Test 8: Get Interactions List
      console.log('\n8. Testing Get Interactions List...');
      const getIntsResponse = await makeRequest('GET', '/api/interactions?limit=5', null, authToken);

      if (getIntsResponse.status === 200 && getIntsResponse.data.interactions) {
        console.log('✅ Get Interactions successful');
        console.log(`   Total interactions: ${getIntsResponse.data.total}`);
        console.log(`   Returned: ${getIntsResponse.data.interactions.length}`);
      } else {
        console.log('❌ Get Interactions failed');
        console.log('   Response:', getIntsResponse);
      }

    } else {
      console.log('❌ Failed to get customers');
      console.log('   Response:', customersResponse);
    }

    console.log('\n=== Tests Complete ===');
    console.log('\nTest IDs created:');
    console.log(`  Opportunity: ${testOpportunityId || 'N/A'}`);
    console.log(`  Interaction: ${testInteractionId || 'N/A'}`);

  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
  }
}

runTests();
