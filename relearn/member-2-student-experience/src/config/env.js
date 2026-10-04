/**
 * Environment configuration for RE:Learn
 * Switching VITE_USE_MOCK to false connects the frontend to the real backend.
 */
export const ENV = {
  USE_MOCK: false,
  API_URL: import.meta.env?.VITE_API_URL || 'http://localhost:8000',
};

export default ENV;
