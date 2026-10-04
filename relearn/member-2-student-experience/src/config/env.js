/**
 * Environment configuration for RE:Learn
 * Switching VITE_USE_MOCK to false connects the frontend to the real backend.
 */
export const ENV = {
  USE_MOCK: import.meta?.env?.VITE_USE_MOCK === 'true' || import.meta?.env?.VITE_USE_MOCK === true || !import.meta?.env?.VITE_API_URL,
  API_URL: import.meta?.env?.VITE_API_URL || 'http://localhost:8000',
};

export default ENV;
