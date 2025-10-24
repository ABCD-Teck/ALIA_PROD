/**
 * COMPREHENSIVE TESTING SUITE FOR OPPORTUNITIES AND CUSTOMER INTERACTIONS
 *
 * This script tests:
 * 1. All CRUD operations for Opportunities
 * 2. All CRUD operations for Customer Interactions
 * 3. Database persistence verification
 * 4. UI-Database synchronization
 * 5. Data pipeline integrity
 * 6. Relationship linkages
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';
let authToken = null;

// Test results tracking
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  tests: []
};

// Color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(title) {
  console.log('\n' + '═'.repeat(70));
  log(`  ${title}`, 'cyan');
  console.log('═'.repeat(70));
}

function logTest(name, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    log(`✓ PASS: ${name}`, 'green');
  } else {
    testResults.failed++;
    log(`✗ FAIL: ${name}`, 'red');
  }
  if (details) {
    log(`  └─ ${details}`, 'yellow');
  }
  testResults.tests.push({ name, passed, details });
}

async function makeRequest(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
    };
    if (data) config.data = data;

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500,
    };
  }
}

// ============================================================================
// AUTHENTICATION
// ============================================================================
async function authenticate() {
  logHeader('AUTHENTICATION');

  const result = await makeRequest('POST', '/auth/login', {
    email: 'n3bula.chen@gmail.com',
    password: 'Poqw1209!',
  });

  if (result.success && result.data.accessToken) {
    authToken = result.data.accessToken;
    logTest('Authentication successful', true, `User: ${result.data.user.email}`);
    return true;
  }

  logTest('Authentication failed', false, JSON.stringify(result.error));
  return false;
}

// ============================================================================
// SETUP: CREATE TEST DATA
// ============================================================================
let testData = {
  customerId: null,
  contactId: null,
  opportunityId: null,
  interactionId: null,
};

async function setupTestData() {
  logHeader('TEST DATA SETUP');

  // Create test customer
  const customerResult = await makeRequest('POST', '/customers', {
    company_name: `Test Corp ${Date.now()}`,
    industry_id: 1,
    description: 'Automated test customer',
  });

  if (customerResult.success && customerResult.data.customer_id) {
    testData.customerId = customerResult.data.customer_id;
    logTest('Test customer created', true, `ID: ${testData.customerId}`);
  } else {
    logTest('Test customer creation failed', false, JSON.stringify(customerResult.error));
    return false;
  }

  // Create test contact
  const contactResult = await makeRequest('POST', '/contacts', {
    customer_id: testData.customerId,
    first_name: 'John',
    last_name: 'Tester',
    email: `test${Date.now()}@example.com`,
    phone: '+1234567890',
  });

  if (contactResult.success && contactResult.data.contact_id) {
    testData.contactId = contactResult.data.contact_id;
    logTest('Test contact created', true, `ID: ${testData.contactId}`);
  }

  return true;
}

// ============================================================================
// OPPORTUNITIES TESTING
// ============================================================================
async function testOpportunities() {
  logHeader('OPPORTUNITIES - CRUD OPERATIONS');

  // CREATE
  log('\n1. Testing CREATE Opportunity...', 'blue');
  const createData = {
    customer_id: testData.customerId,
    name: 'Q1 2025 Enterprise Software Deal',
    description: 'Major enterprise software licensing opportunity',
    amount: 250000,
    currency_id: null, // Let database handle default or make nullable
    stage: 'PROSPECT', // Use uppercase as per database constraint
    probability: 30,
    priority: 'HIGH', // Use uppercase as per database constraint
    expected_close_date: '2025-03-31',
    notes: 'Initial discussion completed, strong interest',
  };

  const createResult = await makeRequest('POST', '/opportunities', createData);
  if (createResult.success && createResult.data.opportunity_id) {
    testData.opportunityId = createResult.data.opportunity_id;
    logTest(
      'CREATE Opportunity',
      true,
      `ID: ${testData.opportunityId}, Name: ${createResult.data.name}`
    );
  } else {
    logTest('CREATE Opportunity', false, JSON.stringify(createResult.error));
    return false;
  }

  // READ - Single
  log('\n2. Testing READ Single Opportunity...', 'blue');
  const readResult = await makeRequest('GET', `/opportunities/${testData.opportunityId}`);
  const readSuccess =
    readResult.success &&
    readResult.data.opportunity_id === testData.opportunityId &&
    readResult.data.name === createData.name &&
    readResult.data.amount === createData.amount;

  logTest(
    'READ Single Opportunity',
    readSuccess,
    readSuccess
      ? `Retrieved: ${readResult.data.name}, Amount: ${readResult.data.amount}`
      : 'Data mismatch or retrieval failed'
  );

  // READ - List
  log('\n3. Testing READ Opportunities List...', 'blue');
  const listResult = await makeRequest('GET', '/opportunities?limit=100');
  const foundInList = listResult.success && listResult.data.opportunities?.some(
    opp => opp.opportunity_id === testData.opportunityId
  );

  logTest(
    'READ Opportunities List',
    foundInList,
    foundInList
      ? `Total: ${listResult.data.total}, Found our test opportunity`
      : 'Test opportunity not found in list'
  );

  // UPDATE
  log('\n4. Testing UPDATE Opportunity...', 'blue');
  const updateData = {
    stage: 'PROPOSAL', // Use uppercase
    probability: 60,
    amount: 300000,
    notes: 'UPDATED: Proposal submitted, excellent feedback received',
  };

  const updateResult = await makeRequest(
    'PUT',
    `/opportunities/${testData.opportunityId}`,
    updateData
  );
  const updateSuccess =
    updateResult.success &&
    updateResult.data.stage === 'PROPOSAL' &&
    updateResult.data.probability === 60 &&
    updateResult.data.amount === 300000;

  logTest(
    'UPDATE Opportunity',
    updateSuccess,
    updateSuccess
      ? `Stage: ${updateResult.data.stage}, Probability: ${updateResult.data.probability}%, Amount: $${updateResult.data.amount}`
      : 'Update failed or data mismatch'
  );

  // Verify UPDATE Persistence
  log('\n5. Verifying UPDATE Persistence in Database...', 'blue');
  const verifyResult = await makeRequest('GET', `/opportunities/${testData.opportunityId}`);
  const persistSuccess =
    verifyResult.success &&
    verifyResult.data.stage === 'PROPOSAL' &&
    verifyResult.data.probability === 60 &&
    verifyResult.data.amount === 300000 &&
    verifyResult.data.notes.includes('UPDATED');

  logTest(
    'UPDATE Persistence Verification',
    persistSuccess,
    persistSuccess ? 'All updates persisted correctly in database' : 'Database not updated correctly'
  );

  // Test Search Functionality
  log('\n6. Testing Search Functionality...', 'blue');
  const searchResult = await makeRequest('GET', '/opportunities?search=Enterprise');
  const searchSuccess =
    searchResult.success &&
    searchResult.data.opportunities?.some(opp => opp.opportunity_id === testData.opportunityId);

  logTest(
    'Search Functionality',
    searchSuccess,
    searchSuccess ? 'Opportunity found via search' : 'Search functionality failed'
  );

  // Test Customer Linkage
  log('\n7. Testing Customer Linkage...', 'blue');
  const linkageResult = await makeRequest('GET', `/opportunities/${testData.opportunityId}`);
  const linkageSuccess =
    linkageResult.success &&
    linkageResult.data.customer_id === testData.customerId &&
    linkageResult.data.company_name;

  logTest(
    'Customer Linkage',
    linkageSuccess,
    linkageSuccess
      ? `Linked to: ${linkageResult.data.company_name} (ID: ${linkageResult.data.customer_id})`
      : 'Customer linkage broken'
  );

  return true;
}

// ============================================================================
// CUSTOMER INTERACTIONS TESTING
// ============================================================================
async function testInteractions() {
  logHeader('CUSTOMER INTERACTIONS - CRUD OPERATIONS');

  // CREATE
  log('\n1. Testing CREATE Interaction...', 'blue');
  const createData = {
    customer_id: testData.customerId,
    contact_id: testData.contactId,
    interaction_type: 'Meeting',
    subject: 'Q1 Deal Strategy Discussion',
    description: 'Discussed product requirements, pricing, and implementation timeline',
    interaction_date: new Date().toISOString(),
    duration_minutes: 90,
    direction: 'outbound',
    medium: 'video_call',
    outcome: 'positive',
    sentiment: 'positive',
    importance: 'high',
    location: 'Virtual',
    private_notes: 'Decision maker present, budget confirmed',
  };

  const createResult = await makeRequest('POST', '/interactions', createData);
  if (createResult.success && createResult.data.interaction_id) {
    testData.interactionId = createResult.data.interaction_id;
    logTest(
      'CREATE Interaction',
      true,
      `ID: ${testData.interactionId}, Subject: ${createResult.data.subject}`
    );
  } else {
    logTest('CREATE Interaction', false, JSON.stringify(createResult.error));
    return false;
  }

  // READ - Single
  log('\n2. Testing READ Single Interaction...', 'blue');
  const readResult = await makeRequest('GET', `/interactions/${testData.interactionId}`);
  const readSuccess =
    readResult.success &&
    readResult.data.interaction_id === testData.interactionId &&
    readResult.data.subject === createData.subject;

  logTest(
    'READ Single Interaction',
    readSuccess,
    readSuccess
      ? `Retrieved: ${readResult.data.subject}, Type: ${readResult.data.interaction_type}`
      : 'Data mismatch or retrieval failed'
  );

  // READ - By Customer
  log('\n3. Testing READ Interactions by Customer...', 'blue');
  const customerResult = await makeRequest(
    'GET',
    `/interactions/customer/${testData.customerId}`
  );
  const foundForCustomer =
    customerResult.success &&
    customerResult.data.interactions?.some(int => int.interaction_id === testData.interactionId);

  logTest(
    'READ Interactions by Customer',
    foundForCustomer,
    foundForCustomer
      ? `Customer has ${customerResult.data.total} interactions, found our test`
      : 'Test interaction not found for customer'
  );

  // READ - List
  log('\n4. Testing READ Interactions List...', 'blue');
  const listResult = await makeRequest('GET', '/interactions?limit=100');
  const foundInList =
    listResult.success &&
    listResult.data.interactions?.some(int => int.interaction_id === testData.interactionId);

  logTest(
    'READ Interactions List',
    foundInList,
    foundInList
      ? `Total: ${listResult.data.total}, Found our test interaction`
      : 'Test interaction not found in list'
  );

  // UPDATE
  log('\n5. Testing UPDATE Interaction...', 'blue');
  const updateData = {
    outcome: 'very_positive',
    sentiment: 'very_positive',
    description:
      'UPDATED: Exceptional meeting! Client committed to moving forward with implementation',
    private_notes: 'UPDATED: Verbal commitment received, contract review next week',
  };

  const updateResult = await makeRequest(
    'PUT',
    `/interactions/${testData.interactionId}`,
    updateData
  );
  const updateSuccess =
    updateResult.success &&
    updateResult.data.outcome === 'very_positive' &&
    updateResult.data.sentiment === 'very_positive';

  logTest(
    'UPDATE Interaction',
    updateSuccess,
    updateSuccess
      ? `Outcome: ${updateResult.data.outcome}, Sentiment: ${updateResult.data.sentiment}`
      : 'Update failed or data mismatch'
  );

  // Verify UPDATE Persistence
  log('\n6. Verifying UPDATE Persistence in Database...', 'blue');
  const verifyResult = await makeRequest('GET', `/interactions/${testData.interactionId}`);
  const persistSuccess =
    verifyResult.success &&
    verifyResult.data.outcome === 'very_positive' &&
    verifyResult.data.description.includes('UPDATED') &&
    verifyResult.data.private_notes.includes('UPDATED');

  logTest(
    'UPDATE Persistence Verification',
    persistSuccess,
    persistSuccess ? 'All updates persisted correctly in database' : 'Database not updated correctly'
  );

  // Test Customer and Contact Linkage
  log('\n7. Testing Customer & Contact Linkage...', 'blue');
  const linkageResult = await makeRequest('GET', `/interactions/${testData.interactionId}`);
  const linkageSuccess =
    linkageResult.success &&
    linkageResult.data.customer_id === testData.customerId &&
    linkageResult.data.contact_id === testData.contactId &&
    linkageResult.data.company_name &&
    linkageResult.data.contact_name;

  logTest(
    'Customer & Contact Linkage',
    linkageSuccess,
    linkageSuccess
      ? `Customer: ${linkageResult.data.company_name}, Contact: ${linkageResult.data.contact_name}`
      : 'Linkage broken'
  );

  return true;
}

// ============================================================================
// PIPELINE AND RELATIONSHIP TESTING
// ============================================================================
async function testPipelinesAndRelationships() {
  logHeader('DATA PIPELINES & RELATIONSHIPS');

  // Test 1: Opportunity-Customer Pipeline
  log('\n1. Testing Opportunity-Customer Data Pipeline...', 'blue');
  const oppResult = await makeRequest('GET', `/opportunities/${testData.opportunityId}`);
  const oppPipelineSuccess =
    oppResult.success &&
    oppResult.data.customer_id === testData.customerId &&
    oppResult.data.company_name &&
    typeof oppResult.data.amount === 'number' &&
    oppResult.data.stage &&
    oppResult.data.priority;

  logTest(
    'Opportunity-Customer Pipeline',
    oppPipelineSuccess,
    oppPipelineSuccess
      ? 'All data correctly joined and populated'
      : 'Pipeline data incomplete'
  );

  // Test 2: Interaction-Customer-Contact Pipeline
  log('\n2. Testing Interaction-Customer-Contact Pipeline...', 'blue');
  const intResult = await makeRequest('GET', `/interactions/${testData.interactionId}`);
  const intPipelineSuccess =
    intResult.success &&
    intResult.data.customer_id === testData.customerId &&
    intResult.data.contact_id === testData.contactId &&
    intResult.data.company_name &&
    intResult.data.contact_name &&
    intResult.data.interaction_type &&
    intResult.data.outcome;

  logTest(
    'Interaction-Customer-Contact Pipeline',
    intPipelineSuccess,
    intPipelineSuccess
      ? 'All relational data correctly joined'
      : 'Pipeline data incomplete'
  );

  // Test 3: Customer Aggregation
  log('\n3. Testing Customer Data Aggregation...', 'blue');
  const [customerOpps, customerInts] = await Promise.all([
    makeRequest('GET', `/opportunities?limit=1000`),
    makeRequest('GET', `/interactions/customer/${testData.customerId}`),
  ]);

  const hasOpps =
    customerOpps.success &&
    customerOpps.data.opportunities?.some(opp => opp.customer_id === testData.customerId);
  const hasInts =
    customerInts.success &&
    customerInts.data.interactions?.some(int => int.customer_id === testData.customerId);

  logTest(
    'Customer Data Aggregation',
    hasOpps && hasInts,
    hasOpps && hasInts
      ? `Customer has ${customerOpps.data.opportunities?.filter(o => o.customer_id === testData.customerId).length} opportunities and ${customerInts.data.total} interactions`
      : 'Aggregation incomplete'
  );

  // Test 4: Data Integrity
  log('\n4. Testing Data Integrity...', 'blue');
  const [oppIntegrity, intIntegrity] = await Promise.all([
    makeRequest('GET', `/opportunities/${testData.opportunityId}`),
    makeRequest('GET', `/interactions/${testData.interactionId}`),
  ]);

  const integritySuccess =
    oppIntegrity.success &&
    intIntegrity.success &&
    oppIntegrity.data.updated_at &&
    intIntegrity.data.created_at &&
    new Date(oppIntegrity.data.updated_at) > new Date(oppIntegrity.data.created_at);

  logTest(
    'Data Integrity (Timestamps)',
    integritySuccess,
    integritySuccess ? 'All timestamps correct and properly maintained' : 'Timestamp integrity issues'
  );

  return true;
}

// ============================================================================
// DELETE OPERATIONS & CLEANUP
// ============================================================================
async function testDeleteOperations() {
  logHeader('DELETE OPERATIONS');

  // Delete Interaction
  log('\n1. Testing DELETE Interaction...', 'blue');
  const deleteIntResult = await makeRequest('DELETE', `/interactions/${testData.interactionId}`);
  const intDeleteSuccess = deleteIntResult.success;

  logTest(
    'DELETE Interaction',
    intDeleteSuccess,
    intDeleteSuccess ? 'Interaction deleted successfully' : 'Delete failed'
  );

  // Verify Interaction Deletion
  log('\n2. Verifying Interaction Deletion...', 'blue');
  const verifyIntResult = await makeRequest('GET', `/interactions/${testData.interactionId}`);
  const intVerifySuccess = !verifyIntResult.success && verifyIntResult.status === 404;

  logTest(
    'Verify Interaction Deletion',
    intVerifySuccess,
    intVerifySuccess ? 'Interaction no longer exists in database' : 'Deletion not persisted'
  );

  // Delete Opportunity (Soft Delete)
  log('\n3. Testing DELETE Opportunity (Soft Delete)...', 'blue');
  const deleteOppResult = await makeRequest('DELETE', `/opportunities/${testData.opportunityId}`);
  const oppDeleteSuccess = deleteOppResult.success;

  logTest(
    'DELETE Opportunity',
    oppDeleteSuccess,
    oppDeleteSuccess ? 'Opportunity soft deleted successfully' : 'Delete failed'
  );

  // Cleanup
  if (testData.contactId) {
    await makeRequest('DELETE', `/contacts/${testData.contactId}`);
  }
  if (testData.customerId) {
    await makeRequest('DELETE', `/customers/${testData.customerId}`);
  }

  return true;
}

// ============================================================================
// TEST SUMMARY
// ============================================================================
function printSummary() {
  logHeader('TEST EXECUTION SUMMARY');

  const passRate = ((testResults.passed / testResults.total) * 100).toFixed(2);

  console.log('');
  log(`Total Tests:  ${testResults.total}`, 'cyan');
  log(`Passed:       ${testResults.passed}`, 'green');
  log(`Failed:       ${testResults.failed}`, 'red');
  log(`Pass Rate:    ${passRate}%`, passRate >= 80 ? 'green' : 'yellow');
  console.log('');

  if (testResults.failed > 0) {
    log('Failed Tests:', 'red');
    testResults.tests
      .filter(t => !t.passed)
      .forEach(t => {
        log(`  • ${t.name}`, 'red');
        if (t.details) log(`    ${t.details}`, 'yellow');
      });
  }

  console.log('\n' + '═'.repeat(70));
  if (passRate >= 90) {
    log('🎉 EXCELLENT! All core functionality is working correctly.', 'green');
  } else if (passRate >= 70) {
    log('⚠️  PARTIAL SUCCESS. Some issues need attention.', 'yellow');
  } else {
    log('❌ CRITICAL ISSUES. Major functionality is broken.', 'red');
  }
  console.log('═'.repeat(70) + '\n');
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================
async function runAllTests() {
  console.clear();
  log('╔═══════════════════════════════════════════════════════════════════╗', 'cyan');
  log('║   COMPREHENSIVE TESTING - OPPORTUNITIES & CUSTOMER INTERACTIONS  ║', 'cyan');
  log('╚═══════════════════════════════════════════════════════════════════╝', 'cyan');

  try {
    const authSuccess = await authenticate();
    if (!authSuccess) {
      log('\n❌ Authentication failed. Cannot proceed with tests.', 'red');
      return;
    }

    const setupSuccess = await setupTestData();
    if (!setupSuccess) {
      log('\n❌ Test data setup failed. Cannot proceed with tests.', 'red');
      return;
    }

    await testOpportunities();
    await testInteractions();
    await testPipelinesAndRelationships();
    await testDeleteOperations();

    printSummary();
  } catch (error) {
    log(`\n❌ FATAL ERROR: ${error.message}`, 'red');
    console.error(error);
  }
}

// Run tests
runAllTests();
