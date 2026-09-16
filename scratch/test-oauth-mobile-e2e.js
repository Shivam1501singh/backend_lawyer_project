import express from 'express';
import axios from 'axios';
import oauthRoutes from '../src/routes/oauth.routes.js';
import { parseOAuthState, oauthCodeStore } from '../src/controllers/oauth.controller.js';

async function testOAuthFlow() {
  console.log('--- STARTING OAUTH MOBILE FLOW TESTS ---');

  // Test 1: parseOAuthState defaults to mobile
  console.log('\n[TEST 1] Testing parseOAuthState default behavior...');
  const defaultState = parseOAuthState(undefined);
  console.log('Default state result:', defaultState);
  if (defaultState.platform !== 'mobile' || defaultState.scheme !== 'advocateconnect') {
    throw new Error('Test 1 Failed: Default state must be mobile with advocateconnect scheme');
  }
  console.log('✔ [TEST 1 PASSED]');

  // Test 2: parseOAuthState with base64url encoded JSON
  console.log('\n[TEST 2] Testing parseOAuthState with base64url state...');
  const encodedState = Buffer.from(JSON.stringify({ platform: 'mobile', scheme: 'customscheme', registrationId: '123' })).toString('base64url');
  const parsedState = parseOAuthState(encodedState);
  console.log('Parsed base64 state:', parsedState);
  if (parsedState.scheme !== 'customscheme' || parsedState.registrationId !== '123' || parsedState.platform !== 'mobile') {
    throw new Error('Test 2 Failed: Base64 state parsing failed');
  }
  console.log('✔ [TEST 2 PASSED]');

  // Test 3: Express app testing for /auth/oauth/exchange and /api/auth/oauth/exchange
  console.log('\n[TEST 3] Testing exchange endpoint routing...');
  const app = express();
  app.use(express.json());
  app.use('/api/auth', oauthRoutes);
  app.use('/auth', oauthRoutes);

  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // Put a test code in oauthCodeStore
    const testCode = 'test-secret-exchange-code-12345';
    oauthCodeStore.set(testCode, {
      token: 'jwt-token-xyz-123',
      user: { id: 'user-id-1', email: 'test@example.com', fullName: 'Test User', accountType: 'user' },
      expiresAt: Date.now() + 60000
    });

    // Call POST /auth/oauth/exchange
    const res1 = await axios.post(`${baseUrl}/auth/oauth/exchange`, { code: testCode });
    console.log('Response from POST /auth/oauth/exchange:', res1.status, res1.data);
    if (res1.status !== 200 || !res1.data.success || res1.data.token !== 'jwt-token-xyz-123') {
      throw new Error('Test 3 Failed: /auth/oauth/exchange did not return expected response');
    }
    console.log('✔ [TEST 3 PASSED]: /auth/oauth/exchange successfully exchanged code for token.');

    // Put another test code for /api/auth/oauth/exchange
    const testCode2 = 'test-secret-exchange-code-67890';
    oauthCodeStore.set(testCode2, {
      token: 'jwt-token-abc-456',
      user: { id: 'advocate-id-1', email: 'adv@example.com', fullName: 'Advocate Test', accountType: 'advocate' },
      expiresAt: Date.now() + 60000
    });

    const res2 = await axios.post(`${baseUrl}/api/auth/oauth/exchange`, { code: testCode2 });
    console.log('Response from POST /api/auth/oauth/exchange:', res2.status, res2.data);
    if (res2.status !== 200 || !res2.data.success || res2.data.token !== 'jwt-token-abc-456') {
      throw new Error('Test 3b Failed: /api/auth/oauth/exchange did not return expected response');
    }
    console.log('✔ [TEST 3b PASSED]: /api/auth/oauth/exchange successfully exchanged code for token.');

    console.log('\n======================================================');
    console.log('🎉 ALL OAUTH MOBILE FIX TESTS PASSED SUCCESSFULLY!');
    console.log('======================================================\n');
  } finally {
    server.close();
  }
}

testOAuthFlow().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
