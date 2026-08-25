import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const BACKEND_URL = 'http://localhost:5000/api';
const prisma = new PrismaClient();

async function runTests() {
  console.log('--- Starting Sandbox Aadhaar OTP Integration Tests ---');

  try {
    // Step 1: Start advocate registration session
    console.log('\n[Test 1] Starting Advocate Registration Session...');
    const startRes = await axios.post(`${BACKEND_URL}/auth/advocate/register/start`, {
      fullName: 'Test Lawyer OTP',
      email: `test.lawyer.otp.${Date.now()}@example.com`
    });

    if (!startRes.data.success || !startRes.data.registrationId) {
      throw new Error('Failed to start advocate registration session.');
    }
    const registrationId = startRes.data.registrationId;
    console.log('✔ Registration Session started successfully. ID:', registrationId);

    // Step 2: Generate Aadhaar OTP using mock bypass
    console.log('\n[Test 2] Generating Aadhaar OTP (Mock Bypass)...');
    const genRes = await axios.post(`${BACKEND_URL}/auth/advocate/aadhaar/otp/generate`, {
      registrationId,
      aadhaar_number: '123456789012'
    });

    if (!genRes.data.success || !genRes.data.reference_id) {
      throw new Error('Failed to generate Aadhaar OTP mock bypass.');
    }
    const referenceId = genRes.data.reference_id;
    console.log('✔ OTP generated successfully. Reference ID:', referenceId);

    // Step 3: Verify OTP with incorrect code
    console.log('\n[Test 3] Verifying OTP with incorrect code (expecting 400)...');
    try {
      await axios.post(`${BACKEND_URL}/auth/advocate/aadhaar/otp/verify`, {
        registrationId,
        reference_id: referenceId,
        otp: '000000'
      });
      throw new Error('Should have failed with 400 for incorrect OTP');
    } catch (err) {
      if (err.response && err.response.status === 400) {
        console.log('✔ Incorrect OTP correctly rejected. Response:', JSON.stringify(err.response.data));
      } else {
        throw err;
      }
    }

    // Step 4: Verify OTP with correct code
    console.log('\n[Test 4] Verifying OTP with correct code...');
    const verifyRes = await axios.post(`${BACKEND_URL}/auth/advocate/aadhaar/otp/verify`, {
      registrationId,
      reference_id: referenceId,
      otp: '123456'
    });

    if (!verifyRes.data.success || !verifyRes.data.aadhaarVerified) {
      throw new Error('Failed to verify OTP with correct code.');
    }
    console.log('✔ OTP verified successfully! Response:', JSON.stringify(verifyRes.data));

    // Step 5: Test Profile Completion and check database persistence
    console.log('\n[Test 5] Simulating Verification completeness via DB update...');
    // We update emailVerified, phoneVerified, phone, and profilePhotoUrl in the registrationSession so we can complete profile registration
    const phoneNum = `98765${Math.floor(10000 + Math.random() * 90000)}`;
    await prisma.registrationSession.update({
      where: { id: registrationId },
      data: {
        emailVerified: true,
        phoneVerified: true,
        phone: phoneNum,
        profilePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
        profilePhotoPublicId: 'placeholder_id'
      }
    });
    console.log('✔ DB updated to simulate full verification criteria met.');

    console.log('Completing registration profile...');
    const barId = `BAR-${Math.floor(100000 + Math.random() * 900000)}`;
    const completeRes = await axios.post(`${BACKEND_URL}/auth/advocate/profile`, {
      registrationId,
      barCouncilId: barId,
      aadhaarNumber: '123456789012',
      password: 'Password123',
      languagesSpoken: ['English', 'Hindi'],
      state: 'Delhi',
      city: 'New Delhi',
      pincode: '110001'
    });

    if (!completeRes.data.success) {
      throw new Error('Failed to complete Advocate profile registration.');
    }
    console.log('✔ Profile completed successfully!');

    // Query the database to ensure the Advocate record has been created and contains 'OTP' as method
    console.log('Verifying Advocate record in DB...');
    const advocate = await prisma.advocate.findUnique({
      where: { barCouncilId: barId }
    });

    if (!advocate) {
      throw new Error('Advocate record not found in database.');
    }

    console.log('Advocate ID:', advocate.id);
    console.log('Advocate Name:', advocate.fullName);
    console.log('Advocate Aadhaar Verification Method:', advocate.aadhaarVerificationMethod);

    if (advocate.aadhaarVerificationMethod !== 'OTP') {
      throw new Error(`Expected verification method to be 'OTP', but got: ${advocate.aadhaarVerificationMethod}`);
    }
    console.log('✔ Advocate record saved with correct aadhaarVerificationMethod in DB!');

    // Clean up advocate record to keep DB clean
    await prisma.advocate.delete({
      where: { barCouncilId: barId }
    });
    console.log('✔ Cleaned up mock Advocate record.');

    console.log('\n--- All Sandbox Aadhaar OTP Integration Tests Passed! ---');
  } catch (error) {
    console.error('\n✖ Test Run Failed:', error.message);
    if (error.response && error.response.data) {
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
