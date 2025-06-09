// Centralized API for fetching all counts from the admin endpoint
import { AdminCounts, getAdminCounts } from './admin';

export const CountsAPI = {
  getCounts: getAdminCounts,
};

export type { AdminCounts };
