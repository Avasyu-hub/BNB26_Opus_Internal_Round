/**
 * Environment configuration for RE:Learn
 */
const rawUrl = import.meta.env.VITE_API_URL;

function resolveApiUrl() {
  if (!rawUrl) {
    return 'http://localhost:8000';
  }
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    return rawUrl;
  }
  return `https://${rawUrl}`;
}

export const ENV = {
  USE_MOCK: false,
  API_URL: resolveApiUrl().replace(/\/$/, ''),
};

export default ENV;
