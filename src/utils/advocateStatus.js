/**
 * Advocate Online Status Utility
 */

export const getAdvocateOnlineTimeoutSeconds = () => {
  const envVal = parseInt(process.env.ADVOCATE_ONLINE_TIMEOUT_SECONDS, 10);
  return !isNaN(envVal) && envVal > 0 ? envVal : 120;
};

/**
 * Calculates whether an advocate is effectively ONLINE based on their isOnline flag,
 * lastSeenAt timestamp, and the configured timeout (default 120 seconds).
 *
 * @param {boolean} isOnline - Stored boolean in database
 * @param {Date|string|null} lastSeenAt - Last seen timestamp
 * @returns {boolean} - Effective online status
 */
export const computeEffectiveOnlineStatus = (isOnline, lastSeenAt) => {
  if (!isOnline || !lastSeenAt) {
    return false;
  }

  const timeoutSeconds = getAdvocateOnlineTimeoutSeconds();
  const lastSeenTime = new Date(lastSeenAt).getTime();
  if (isNaN(lastSeenTime)) {
    return false;
  }

  const diffMs = Date.now() - lastSeenTime;
  return diffMs >= 0 && diffMs <= timeoutSeconds * 1000;
};
