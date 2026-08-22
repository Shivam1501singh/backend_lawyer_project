import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
  const requestBody = {
    client_id: process.env.IDSPAY_CLIENT_ID || 'APID1058',
    api_id: process.env.IDSPAY_CLIENT_ID || 'APID1058',
    client_secret: process.env.IDSPAY_CLIENT_SECRET || 'cFpvJWqVWsWjEKC3ER9LLtnEu67zHp0t',
    api_key: process.env.IDSPAY_API_KEY || '9a75388c-0370-4070-b007-0fad98c0db79',
    methodName: 'fetchDetails',
    client_id_param: 'mock_success_id'
  };

  const headers = {
    'Content-Type': 'application/json',
    'client-id': process.env.IDSPAY_CLIENT_ID || 'APID1058',
    'client-secret': process.env.IDSPAY_CLIENT_SECRET || 'cFpvJWqVWsWjEKC3ER9LLtnEu67zHp0t',
    'api-key': process.env.IDSPAY_API_KEY || '9a75388c-0370-4070-b007-0fad98c0db79'
  };

  try {
    const url = 'https://javabackend.idspay.in/api/v1/prod/srv2/validation/digilocker-digital-kyc';
    console.log('Sending fetchDetails request to IDSPay...');
    const response = await axios.post(url, requestBody, { headers });
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('Response Status:', error.response?.status);
    console.log('Response Data:', JSON.stringify(error.response?.data, null, 2));
  }
};

run();
