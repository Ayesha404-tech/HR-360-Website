import { api } from './api';

// Re-export the API service as convexApi for backward compatibility
export const convexApi = api;

// Keep the old export for any remaining references
export default null;
