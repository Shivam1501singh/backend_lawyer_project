/**
 * Centralized pricing configuration for Consultancy Requests.
 *
 * Packages:
 * - Normal Call (CALL):
 *   - 15 mins: ₹199
 *   - 30 mins: ₹499
 * - Video Call (VIDEO_CALL):
 *   - 15 mins: ₹499
 *   - 30 mins: ₹899
 */

export const CONSULTANCY_PACKAGES = {
  CALL: {
    15: 199,
    30: 499
  },
  VIDEO_CALL: {
    15: 499,
    30: 899
  }
};

/**
 * Returns the exact price for a valid callType and duration combination.
 * Throws an error if the combination is invalid.
 *
 * @param {string} callType - 'CALL' | 'VIDEO_CALL'
 * @param {number} duration - 15 | 30
 * @returns {number} Price in INR
 */
export const getConsultancyPrice = (callType, duration) => {
  const typePackages = CONSULTANCY_PACKAGES[callType];
  if (!typePackages) {
    const err = new Error(`Invalid call type '${callType}'. Allowed types: CALL, VIDEO_CALL`);
    err.statusCode = 400;
    throw err;
  }

  const price = typePackages[duration];
  if (price === undefined) {
    const err = new Error(`Invalid duration '${duration}' for call type '${callType}'. Allowed durations: 15, 30`);
    err.statusCode = 400;
    throw err;
  }

  return price;
};
