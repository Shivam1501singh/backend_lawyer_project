import axios from 'axios';

export const sendOtpSms = async ({ mobile, otp, expiryMinutes }) => {
  const smsApiUrl = process.env.SMS_API_URL;
  const smsAuthKey = process.env.SMS_AUTH_KEY;
  const smsSenderId = process.env.SMS_SENDER_ID;
  const smsRoute = process.env.SMS_ROUTE;
  const smsTemplateId = process.env.SMS_TEMPLATE_ID;

  if (!smsApiUrl || !smsAuthKey || !smsSenderId || !smsRoute || !smsTemplateId) {
    // If running in development without configured credentials, fallback to console log
    if (process.env.NODE_ENV !== 'production' || smsAuthKey === 'YOUR_ROTATED_POWERSTEXT_AUTH_KEY') {
      console.log(`[DEV SMS SERVICE] SMS OTP to mobile (ending ${mobile.slice(-4)}): ${otp}`);
      return true;
    }
    throw new Error('SMS service is not fully configured.');
  }

  // Construct message using the DLT-approved template format
  const message =
    `Dear Customer, your OTP is ${otp}. ` +
    `This OTP is valid for ${expiryMinutes} minutes. ` +
    `Do not share this code with anyone. -Vardhman Finance`;
  try {
    const mobileEnding = mobile.slice(-4);
    console.log(`Sending SMS OTP to number ending in: ${mobileEnding}`);

    const response = await axios.get(smsApiUrl, {
      params: {
        'authentic-key': smsAuthKey,
        senderid: smsSenderId,
        route: smsRoute,
        number: mobile,
        message: message,
        templateid: smsTemplateId
      },
      timeout: 15000
    });

    const responseData = String(response.data || '').toLowerCase();

    // Check for provider rejection keywords
    if (
      responseData.includes('fail') ||
      responseData.includes('error') ||
      responseData.includes('invalid') ||
      responseData.includes('reject')
    ) {
      console.error(`Powerstext SMS rejection response: ${response.data}`);
      throw new Error('PROVIDER_REJECTION');
    }

    return true;
  } catch (error) {
    if (error.message === 'PROVIDER_REJECTION') {
      throw new Error('OTP could not be sent. Please try again.');
    }
    if (error.code === 'ECONNABORTED') {
      console.error('Powerstext SMS connection timeout.');
      throw new Error('SMS gateway timed out. Please try again.');
    }
    console.error('Powerstext SMS network or general failure:', error.message);
    throw new Error('OTP SMS transmission failed. Please try again.');
  }
};
