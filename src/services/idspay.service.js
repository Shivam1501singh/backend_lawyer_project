import axios from 'axios';

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  if (process.env.IDSPAY_CLIENT_ID) {
    headers['client-id'] = process.env.IDSPAY_CLIENT_ID;
    headers['client_id'] = process.env.IDSPAY_CLIENT_ID;
  }
  if (process.env.IDSPAY_CLIENT_SECRET) {
    headers['client-secret'] = process.env.IDSPAY_CLIENT_SECRET;
    headers['client_secret'] = process.env.IDSPAY_CLIENT_SECRET;
  }
  if (process.env.IDSPAY_API_KEY) {
    headers['api-key'] = process.env.IDSPAY_API_KEY;
    headers['api_key'] = process.env.IDSPAY_API_KEY;
    headers['Authorization'] = `Bearer ${process.env.IDSPAY_API_KEY}`;
  }

  return headers;
};

export const initiateAadhaarDigiLocker = async (aadhaarNumber, registrationId) => {
  // Mock bypass for sandbox testing
  if (aadhaarNumber === '123456789012') {
    console.log('[MOCK IDSPAY] Initiated mock success Aadhaar DigiLocker verification.');
    const mockRedirect = registrationId 
      ? `http://localhost:5173/register/advocate?step=4&registrationId=${registrationId}&status=success&client_id=mock_success_id`
      : 'http://localhost:5173/digilocker-mock-success';
    return {
      status: 'success',
      data: {
        client_id: 'mock_success_id',
        url: mockRedirect
      }
    };
  }
  
  if (aadhaarNumber === '123456789000') {
    console.log('[MOCK IDSPAY] Initiated mock failure Aadhaar DigiLocker verification.');
    const mockRedirectFail = registrationId 
      ? `http://localhost:5173/register/advocate?step=4&registrationId=${registrationId}&status=failed&client_id=mock_fail_id`
      : 'http://localhost:5173/digilocker-mock-fail';
    return {
      status: 'success',
      data: {
        client_id: 'mock_fail_id',
        url: mockRedirectFail
      }
    };
  }

  const baseUrl = process.env.IDSPAY_BASE_URL;
  const path = process.env.IDSPAY_AADHAAR_INITIATE_PATH;
  if (!baseUrl || !path) {
    throw new Error('IDSPay API configuration is missing.');
  }

  try {
    const redirectBase = process.env.CLIENT_URL || 'http://localhost:5173';
    const redirectUrl = registrationId 
      ? `${redirectBase}/register/advocate` 
      : redirectBase;

    const requestBody = {
      client_id: process.env.IDSPAY_CLIENT_ID,
      api_id: process.env.IDSPAY_CLIENT_ID,
      client_secret: process.env.IDSPAY_CLIENT_SECRET,
      api_key: process.env.IDSPAY_API_KEY,
      methodName: 'generateToken',
      aadhaar_number: aadhaarNumber,
      redirectUrl
    };

    const response = await axios.post(`${baseUrl}${path}`, requestBody, {
      headers: getHeaders(),
      timeout: 15000
    });

    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error('IDSPay initiate connection timeout.');
      const timeoutErr = new Error('IDSPay connection timed out. Please try again.');
      timeoutErr.statusCode = 504;
      throw timeoutErr;
    }
    console.error('IDSPay initiate Aadhaar error:', error.message);
    throw error;
  }
};

export const fetchAadhaarDetails = async (clientId) => {
  // Mock bypass for sandbox testing
  if (clientId === 'mock_success_id') {
    return {
      status: 'success',
      data: {
        status: 'SUCCESS',
        verification_status: 'SUCCESS'
      }
    };
  }

  if (clientId === 'mock_fail_id') {
    return {
      status: 'success',
      data: {
        status: 'FAILED',
        verification_status: 'FAILED'
      }
    };
  }

  const baseUrl = process.env.IDSPAY_BASE_URL;
  const path = process.env.IDSPAY_AADHAAR_STATUS_PATH;
  if (!baseUrl || !path) {
    throw new Error('IDSPay API configuration is missing.');
  }

  try {
    const requestBody = {
      client_id: process.env.IDSPAY_CLIENT_ID,
      api_id: process.env.IDSPAY_CLIENT_ID,
      client_secret: process.env.IDSPAY_CLIENT_SECRET,
      api_key: process.env.IDSPAY_API_KEY,
      methodName: 'fetchDetails',
      client_id_param: clientId, // Send transaction client ID
      client_id: clientId // Send transaction client ID to be safe
    };

    const response = await axios.post(`${baseUrl}${path}`, requestBody, {
      headers: getHeaders(),
      timeout: 15000
    });

    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      console.error('IDSPay fetch status connection timeout.');
      const timeoutErr = new Error('IDSPay connection timed out. Please try again.');
      timeoutErr.statusCode = 504;
      throw timeoutErr;
    }
    console.error('IDSPay fetch Aadhaar details error:', error.message);
    throw error;
  }
};
