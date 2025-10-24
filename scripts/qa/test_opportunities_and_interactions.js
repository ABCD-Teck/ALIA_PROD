/**
 * Comprehensive Testing Script for Opportunities and Customer Interactions
 * Tests all CRUD operations and verifies UI-Database sync
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';
let authToken = null;
let testCustomerId = null;
let testOpportunityId = null;
let testInteractionId = null;
let testContactId = null;

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'cyan');
  console.log('='.repeat(60) + '\n');
}

function logTest(testName, passed, details = '') {
  const status = passed ? '✓ PASS' : '✗ FAIL';
  const color = passed ? 'green' : 'red';
  log(`${status} - ${testName}`, color);
  if (details) {
    log(`  Details: ${details}`, 'yellow');
  }
}

// Helper function to make authenticated requests
async function makeRequest(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status,
    };
  }
}

// Authentication
async function authenticate() {
  logSection('AUTHENTICATION');

  // Try to login with default credentials
  const loginResult = await makeRequest('POST', '/auth/login', {
    email: 'admin@alia.com',
    password: 'admin123',
  });

  if (loginResult.success && loginResult.data.accessToken) {
    authToken = loginResult.data.accessToken;
    logTest('Login successful', true, `User: ${loginResult.data.user.email}`);
    return true;
  }

  // If login fails, try to register
  log('Login failed, attempting registration...', 'yellow');
  const registerResult = await makeRequest('POST', '/auth/register', {
    email: 'test@alia.com',
    password: 'test123',
    first_name: 'Test',
    last_name: 'User',
    role: 'user',
  });

  if (registerResult.success && registerResult.data.accessToken) {
    authToken = registerResult.data.accessToken;
    logTest('Registration successful', true, `User: ${registerResult.data.user.email}`);
    return true;
  }

  logTest('Authentication failed', false, JSON.stringify(registerResult.error));
  return false;
}

// Create test customer
async function createTestCustomer() {
  logSection('CUSTOMER SETUP');

  const customerData = {
    company_name: 'Test Opportunity Corp',
    industry_id: 1,
    description: 'Test customer for opportunities and interactions testing',
  };

  const result = await makeRequest('POST', '/customers', customerData);

  if (result.success && result.data.customer_id) {
    testCustomerId = result.data.customer_id;
    logTest('Test customer created', true, `Customer ID: ${testCustomerId}`);
    return true;
  }

  // Try to find existing customer
  const searchResult = await makeRequest('GET', '/customers?search=Test Opportunity Corp&limit=1');
  if (searchResult.success && searchResult.data.customers?.length > 0) {
    testCustomerId = searchResult.data.customers[0].customer_id;
    logTest('Using existing test customer', true, `Customer ID: ${testCustomerId}`);
    return true;
  }

  logTest('Customer creation failed', false, JSON.stringify(result.error));
  return false;
}

// Create test contact
async function createTestContact() {
  if (!testCustomerId) return false;

  const contactData = {
    customer_id: testCustomerId,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@testopportunity.com',
    phone: '+1234567890',
    position: 'Sales Manager',
  };

  const result = await makeRequest('POST', '/contacts', contactData);

  if (result.success && result.data.contact_id) {
    testContactId = result.data.contact_id;
    logTest('Test contact created', true, `Contact ID: ${testContactId}`);
    return true;
  }

  logTest('Contact creation failed (non-critical)', false, JSON.stringify(result.error));
  return false;
}

// TEST: Opportunities CRUD Operations
async function testOpportunitiesCRUD() {
  logSection('OPPORTUNITIES CRUD OPERATIONS');

  // CREATE
  log('\n1. Testing CREATE operation...', 'blue');
  const createData = {
    customer_id: testCustomerId,
    name: 'Q1 2025 Enterprise Deal',
    description: 'Major enterprise software deal for Q1 2025',
    amount: 150000,
    currency_id: 1,
    stage: 'prospecting',
    probability: 25,
    priority: 'high',
    expected_close_date: '2025-03-31',
    notes: 'Initial contact made, strong interest shown',
  };

  const createResult = await makeRequest('POST', '/opportunities', createData);
  if (createResult.success && createResult.data.opportunity_id) {
    testOpportunityId = createResult.data.opportunity_id;
    logTest('Create opportunity', true, `ID: ${testOpportunityId}`);
  } else {
    logTest('Create opportunity', false, JSON.stringify(createResult.error));
    return false;
  }

  // READ - Single
  log('\n2. Testing READ (single) operation...', 'blue');
  const readResult = await makeRequest('GET', `/opportunities/${testOpportunityId}`);
  if (readResult.success && readResult.data.opportunity_id === testOpportunityId) {
    logTest('Read single opportunity', true, `Name: ${readResult.data.name}`);
  } else {
    logTest('Read single opportunity', false, JSON.stringify(readResult.error));
  }

  // READ - List
  log('\n3. Testing READ (list) operation...', 'blue');
  const listResult = await makeRequest('GET', '/opportunities?limit=100');
  if (listResult.success && Array.isArray(listResult.data.opportunities)) {
    const foundOpp = listResult.data.opportunities.find(
      opp => opp.opportunity_id === testOpportunityId
    );
    logTest(
      'Read opportunities list',
      !!foundOpp,
      `Total: ${listResult.data.total}, Found our test: ${!!foundOpp}`
    );
  } else {
    logTest('Read opportunities list', false, JSON.stringify(listResult.error));
  }

  // UPDATE
  log('\n4. Testing UPDATE operation...', 'blue');
  const updateData = {
    stage: 'proposal',
    probability: 50,
    amount: 175000,
    notes: 'Updated: Proposal submitted, positive feedback received',
  };

  const updateResult = await makeRequest('PUT', `/opportunities/${testOpportunityId}`, updateData);
  if (updateResult.success && updateResult.data.stage === 'proposal') {
    logTest('Update opportunity', true, `New stage: ${updateResult.data.stage}, Amount: ${updateResult.data.amount}`);
  } else {
    logTest('Update opportunity', false, JSON.stringify(updateResult.error));
  }

  // Verify UPDATE persisted
  log('\n5. Verifying UPDATE persisted in database...', 'blue');
  const verifyResult = await makeRequest('GET', `/opportunities/${testOpportunityId}`);
  if (
    verifyResult.success &&
    verifyResult.data.stage === 'proposal' &&
    verifyResult.data.probability === 50
  ) {
    logTest('Verify UPDATE persisted', true, 'Changes saved to database');
  } else {
    logTest('Verify UPDATE persisted', false, 'Database not updated correctly');
  }

  return true;
}

// TEST: Customer Interactions CRUD Operations
async function testInteractionsCRUD() {
  logSection('CUSTOMER INTERACTIONS CRUD OPERATIONS');

  // CREATE
  log('\n1. Testing CREATE operation...', 'blue');
  const createData = {
    customer_id: testCustomerId,
    contact_id: testContactId,
    interaction_type: 'Meeting',
    subject: 'Q1 2025 Deal Discussion',
    description: 'Discussed product requirements and pricing for the Q1 deal',
    interaction_date: new Date().toISOString(),
    duration_minutes: 60,
    direction: 'outbound',
    medium: 'in_person',
    outcome: 'positive',
    sentiment: 'positive',
    importance: 3,
    location: 'Customer Office',
    private_notes: 'Client is very interested, decision maker was present',
  };

  const createResult = await makeRequest('POST', '/interactions', createData);
  if (createResult.success && createResult.data.interaction_id) {
    testInteractionId = createResult.data.interaction_id;
    logTest('Create interaction', true, `ID: ${testInteractionId}`);
  } else {
    logTest('Create interaction', false, JSON.stringify(createResult.error));
    return false;
  }

  // READ - Single
  log('\n2. Testing READ (single) operation...', 'blue');
  const readResult = await makeRequest('GET', `/interactions/${testInteractionId}`);
  if (readResult.success && readResult.data.interaction_id === testInteractionId) {
    logTest('Read single interaction', true, `Subject: ${readResult.data.subject}`);
  } else {
    logTest('Read single interaction', false, JSON.stringify(readResult.error));
  }

  // READ - By Customer
  log('\n3. Testing READ (by customer) operation...', 'blue');
  const customerResult = await makeRequest('GET', `/interactions/customer/${testCustomerId}`);
  if (customerResult.success && Array.isArray(customerResult.data.interactions)) {
    const foundInt = customerResult.data.interactions.find(
      int => int.interaction_id === testInteractionId
    );
    logTest(
      'Read customer interactions',
      !!foundInt,
      `Total for customer: ${customerResult.data.total}, Found our test: ${!!foundInt}`
    );
  } else {
    logTest('Read customer interactions', false, JSON.stringify(customerResult.error));
  }

  // READ - List
  log('\n4. Testing READ (list) operation...', 'blue');
  const listResult = await makeRequest('GET', '/interactions?limit=100');
  if (listResult.success && Array.isArray(listResult.data.interactions)) {
    const foundInt = listResult.data.interactions.find(
      int => int.interaction_id === testInteractionId
    );
    logTest(
      'Read interactions list',
      !!foundInt,
      `Total: ${listResult.data.total}, Found our test: ${!!foundInt}`
    );
  } else {
    logTest('Read interactions list', false, JSON.stringify(listResult.error));
  }

  // UPDATE
  log('\n5. Testing UPDATE operation...', 'blue');
  const updateData = {
    outcome: 'very_positive',
    sentiment: 'very_positive',
    description: 'UPDATED: Excellent meeting! Client confirmed budget and timeline.',
    private_notes: 'UPDATED: Decision to proceed expected within 2 weeks',
  };

  const updateResult = await makeRequest('PUT', `/interactions/${testInteractionId}`, updateData);
  if (updateResult.success && updateResult.data.outcome === 'very_positive') {
    logTest('Update interaction', true, `New outcome: ${updateResult.data.outcome}`);
  } else {
    logTest('Update interaction', false, JSON.stringify(updateResult.error));
  }

  // Verify UPDATE persisted
  log('\n6. Verifying UPDATE persisted in database...', 'blue');
  const verifyResult = await makeRequest('GET', `/interactions/${testInteractionId}`);
  if (
    verifyResult.success &&
    verifyResult.data.outcome === 'very_positive' &&
    verifyResult.data.description.includes('UPDATED')
  ) {
    logTest('Verify UPDATE persisted', true, 'Changes saved to database');
  } else {
    logTest('Verify UPDATE persisted', false, 'Database not updated correctly');
  }

  return true;
}

// TEST: Pipeline and Data Flow
async function testPipelineIntegrity() {
  logSection('PIPELINE AND DATA FLOW INTEGRITY');

  // Test 1: Verify opportunity is linked to customer
  log('\n1. Testing opportunity-customer linkage...', 'blue');
  const oppResult = await makeRequest('GET', `/opportunities/${testOpportunityId}`);
  if (oppResult.success && oppResult.data.customer_id === testCustomerId) {
    logTest(
      'Opportunity-Customer linkage',
      true,
      `Opportunity correctly linked to customer ${oppResult.data.company_name}`
    );
  } else {
    logTest('Opportunity-Customer linkage', false, 'Linkage broken');
  }

  // Test 2: Verify interaction is linked to customer
  log('\n2. Testing interaction-customer linkage...', 'blue');
  const intResult = await makeRequest('GET', `/interactions/${testInteractionId}`);
  if (intResult.success && intResult.data.customer_id === testCustomerId) {
    logTest(
      'Interaction-Customer linkage',
      true,
      `Interaction correctly linked to customer ${intResult.data.company_name}`
    );
  } else {
    logTest('Interaction-Customer linkage', false, 'Linkage broken');
  }

  // Test 3: Verify customer can retrieve all related data
  log('\n3. Testing customer data aggregation...', 'blue');
  const [customerOppResult, customerIntResult] = await Promise.all([
    makeRequest('GET', `/opportunities?search=Test Opportunity Corp`),
    makeRequest('GET', `/interactions/customer/${testCustomerId}`),
  ]);

  const hasOpportunities = customerOppResult.success && customerOppResult.data.opportunities?.length > 0;
  const hasInteractions = customerIntResult.success && customerIntResult.data.interactions?.length > 0;

  logTest(
    'Customer data aggregation',
    hasOpportunities && hasInteractions,
    `Opportunities: ${customerOppResult.data?.total || 0}, Interactions: ${customerIntResult.data?.total || 0}`
  );

  // Test 4: Search functionality
  log('\n4. Testing search functionality...', 'blue');
  const searchResult = await makeRequest('GET', '/opportunities?search=Enterprise');
  if (searchResult.success && searchResult.data.opportunities?.some(
    opp => opp.opportunity_id === testOpportunityId
  )) {
    logTest('Search functionality', true, 'Opportunity found via search');
  } else {
    logTest('Search functionality', false, 'Search not working properly');
  }

  return true;
}

// TEST: Cleanup (DELETE operations)
async function testCleanup() {
  logSection('CLEANUP AND DELETE OPERATIONS');

  // Delete interaction
  log('\n1. Testing DELETE interaction...', 'blue');
  if (testInteractionId) {
    const deleteIntResult = await makeRequest('DELETE', `/interactions/${testInteractionId}`);
    logTest(
      'Delete interaction',
      deleteIntResult.success,
      deleteIntResult.success ? 'Deleted successfully' : JSON.stringify(deleteIntResult.error)
    );

    // Verify deletion
    const verifyResult = await makeRequest('GET', `/interactions/${testInteractionId}`);
    logTest(
      'Verify interaction deleted',
      !verifyResult.success && verifyResult.status === 404,
      'Interaction no longer exists'
    );
  }

  // Delete opportunity (soft delete)
  log('\n2. Testing DELETE opportunity...', 'blue');
  if (testOpportunityId) {
    const deleteOppResult = await makeRequest('DELETE', `/opportunities/${testOpportunityId}`);
    logTest(
      'Delete opportunity',
      deleteOppResult.success,
      deleteOppResult.success ? 'Soft deleted successfully' : JSON.stringify(deleteOppResult.error)
    );
  }

  // Cleanup test contact
  if (testContactId) {
    await makeRequest('DELETE', `/contacts/${testContactId}`);
  }

  // Cleanup test customer
  if (testCustomerId) {
    await makeRequest('DELETE', `/customers/${testCustomerId}`);
  }

  return true;
}

// Main test execution
async function runTests() {
  console.clear();
  log('╔═══════════════════════════════════════════════════════════╗', 'cyan');
  log('║  ALIA WEB - OPPORTUNITIES & INTERACTIONS TEST SUITE     ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════╝', 'cyan');

  try {
    // Authenticate
    const authSuccess = await authenticate();
    if (!authSuccess) {
      log('\n❌ Authentication failed. Cannot proceed with tests.', 'red');
      return;
    }

    // Setup
    const customerCreated = await createTestCustomer();
    if (!customerCreated) {
      log('\n❌ Customer setup failed. Cannot proceed with tests.', 'red');
      return;
    }

    await createTestContact(); // Non-critical

    // Run test suites
    await testOpportunitiesCRUD();
    await testInteractionsCRUD();
    await testPipelineIntegrity();
    await testCleanup();

    // Summary
    logSection('TEST EXECUTION COMPLETE');
    log('All core functionality tests completed!', 'green');
    log('Please review the results above for any failures.', 'yellow');

  } catch (error) {
    log(`\n❌ FATAL ERROR: ${error.message}`, 'red');
    console.error(error);
  }
}

// Run the tests
runTests();
