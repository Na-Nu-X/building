// Dev-server proxy: forwards API and media requests to Django.
// Override the target with API_PROXY_TARGET, e.g. `API_PROXY_TARGET=http://localhost:8001 npm start`.
const target = process.env.API_PROXY_TARGET || 'http://localhost:8000';

export default {
  '/api': { target, secure: false, changeOrigin: true },
  '/media': { target, secure: false, changeOrigin: true },
};
