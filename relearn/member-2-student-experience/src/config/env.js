/**
 * Environment configuration for RE:Learn
 */
const rawUrl = import.meta.env.VITE_API_URL;

function resolveApiUrl() {
  if (!rawUrl) {
    return 'http://localhost:8000';
  }
  let url = rawUrl.trim();
  // If Render passed an internal service name like 'relearn-backend-wzkd' without a domain
  if (!url.includes('.') && !url.includes('localhost')) {
    url = `${url}.onrender.com`;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
}

export const ENV = {
  USE_MOCK: false,
  API_URL: resolveApiUrl().replace(/\/$/, ''),
};

export default ENV;
