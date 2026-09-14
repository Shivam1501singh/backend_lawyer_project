import { processExpiredAccountDeletions } from './accountDeletion.service.js';

let jobInterval = null;

export const startAccountDeletionJob = (intervalMs = 60 * 60 * 1000) => {
  if (jobInterval) {
    clearInterval(jobInterval);
  }

  // Initial check on startup
  processExpiredAccountDeletions().catch(err => {
    console.error('Error running initial account deletion job:', err);
  });

  // Scheduled periodic check
  jobInterval = setInterval(() => {
    processExpiredAccountDeletions().catch(err => {
      console.error('Error running periodic account deletion job:', err);
    });
  }, intervalMs);

  console.log(`Account deletion scheduled job initialized (interval: ${intervalMs}ms).`);
};

export const stopAccountDeletionJob = () => {
  if (jobInterval) {
    clearInterval(jobInterval);
    jobInterval = null;
  }
};
