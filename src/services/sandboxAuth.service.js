import axios from 'axios';

let cachedToken = null;
let tokenExpiry = null;

/**
 * Retrieves a valid JWT access token from the Sandbox API, caching it to avoid redundant requests.
 * The token is valid for 24 hours, so we cache it for 23 hours to account for clock drift.
 * @returns {Promise<string>} The JWT access token
 */
export const getSandboxToken = async () => {
  const now = new Date();

  // Return cached token if valid
  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    return cachedToken;
  }

  const baseUrl = process.env.SANDBOX_API_BASE_URL || 'https://api.sandbox.co.in';
  const apiKey = process.env.SANDBOX_API_KEY;
  const apiSecret = process.env.SANDBOX_API_SECRET;
  const authVersion = process.env.SANDBOX_AUTH_VERSION || '1.0.0';

  if (!apiKey || !apiSecret) {
    throw new Error('Sandbox API configuration is missing. Ensure SANDBOX_API_KEY and SANDBOX_API_SECRET are set.');
  }

  try {
    const response = await axios.post(
      `${baseUrl}/authenticate`,
      {},
      {
        headers: {
          'x-api-key': apiKey,
          'x-api-secret': apiSecret,
          'x-api-version': authVersion,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    if (response.data && response.data.code === 200 && response.data.data?.access_token) {
      cachedToken = response.data.data.access_token;
      // Cache for 23 hours to be safe
      tokenExpiry = new Date(now.getTime() + 23 * 60 * 60 * 1000);
      return cachedToken;
    } else {
      const errorMsg = response.data?.message || 'Failed to authenticate with Sandbox.';
      const err = new Error(errorMsg);
      err.statusCode = response.data?.code || 500;
      throw err;
    }
  } catch (error) {
    if (error.response && error.response.data) {
      const apiErrorMsg = error.response.data.message || 'Sandbox Authentication Error';
      const apiStatusCode = error.response.data.code || error.response.status;
      const err = new Error(apiErrorMsg);
      err.statusCode = apiStatusCode;
      throw err;
    }
    console.error('Sandbox Authentication connection error:', error.message);
    throw error;
  }
};

/**
 * Resets the in-memory token cache (useful for testing authentication errors/expiry).
 */
export const clearSandboxTokenCache = () => {
  cachedToken = null;
  tokenExpiry = null;
};
