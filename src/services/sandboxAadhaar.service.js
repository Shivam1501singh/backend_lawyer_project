import axios from 'axios';
import { getSandboxToken } from './sandboxAuth.service.js';

/**
 * Initiates Aadhaar OTP generation with Sandbox API.
 * Includes mock bypass for testing environment.
 * @param {string} aadhaarNumber - The clean 12-digit Aadhaar number
 * @returns {Promise<object>} The API response from Sandbox
 */
export const generateAadhaarOtpSandbox = async (aadhaarNumber) => {
  // Mock bypass rules for testing
  if (aadhaarNumber === '123456789012' || aadhaarNumber === '123456789011') {
    console.log(`[MOCK SANDBOX] Generating mock Aadhaar OTP for: ${aadhaarNumber}`);
    return {
      code: 200,
      data: {
        reference_id: `mock_ref_${Date.now()}`,
        message: 'OTP sent successfully'
      }
    };
  }

  if (aadhaarNumber === '123456789000') {
    console.log(`[MOCK SANDBOX] Simulating Aadhaar OTP generation failure for: ${aadhaarNumber}`);
    return {
      code: 400,
      message: 'Invalid Aadhaar Number or Aadhaar not registered.'
    };
  }

  const baseUrl = process.env.SANDBOX_API_BASE_URL || 'https://api.sandbox.co.in';
  const apiVersion = process.env.SANDBOX_API_VERSION || '2.0';
  const apiKey = process.env.SANDBOX_API_KEY;

  if (!apiKey) {
    throw new Error('Sandbox API configuration key (SANDBOX_API_KEY) is missing.');
  }

  // Get active JWT token (cached or fresh)
  const token = await getSandboxToken();

  try {
    const response = await axios.post(
      `${baseUrl}/kyc/aadhaar/okyc/otp`,
      {
        '@entity': 'in.co.sandbox.kyc.aadhaar.okyc.otp.request',
        aadhaar_number: aadhaarNumber,
        consent: 'Y',
        reason: 'Advocate registration Aadhaar verification'
      },
      {
        headers: {
          'Authorization': token,
          'x-api-key': apiKey,
          'x-api-version': apiVersion,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    console.error('Sandbox Generate Aadhaar OTP connection error:', error.message);
    throw error;
  }
};

/**
 * Verifies the Aadhaar OTP with Sandbox API.
 * Includes mock bypass for testing environment.
 * @param {string} referenceId - The reference ID received from generate OTP
 * @param {string} otp - The 6-digit OTP entered by the user
 * @returns {Promise<object>} The API response from Sandbox containing verification status/KYC data
 */
export const verifyAadhaarOtpSandbox = async (referenceId, otp) => {
  // Mock bypass rules for testing
  if (referenceId && referenceId.startsWith('mock_ref_')) {
    console.log(`[MOCK SANDBOX] Verifying mock Aadhaar OTP: ${otp} for reference: ${referenceId}`);
    if (otp === '123456') {
      return {
        code: 200,
        data: {
          status: 'VALID',
          name: 'Rahul Verma',
          dob: '1990-01-01',
          gender: 'M',
          address: 'New Delhi, Delhi, India',
          message: 'Aadhaar verified successfully'
        }
      };
    } else {
      return {
        code: 400,
        message: 'Invalid OTP.'
      };
    }
  }

  const baseUrl = process.env.SANDBOX_API_BASE_URL || 'https://api.sandbox.co.in';
  const apiVersion = process.env.SANDBOX_API_VERSION || '2.0';
  const apiKey = process.env.SANDBOX_API_KEY;

  if (!apiKey) {
    throw new Error('Sandbox API configuration key (SANDBOX_API_KEY) is missing.');
  }

  // Get active JWT token (cached or fresh)
  const token = await getSandboxToken();

  try {
    const response = await axios.post(
      `${baseUrl}/kyc/aadhaar/okyc/otp/verify`,
      {
        '@entity': 'in.co.sandbox.kyc.aadhaar.okyc.request',
        reference_id: referenceId,
        otp: otp
      },
      {
        headers: {
          'Authorization': token,
          'x-api-key': apiKey,
          'x-api-version': apiVersion,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    console.error('Sandbox Verify Aadhaar OTP connection error:', error.message);
    throw error;
  }
};
