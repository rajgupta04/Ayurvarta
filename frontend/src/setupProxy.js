const { createProxyMiddleware } = require('http-proxy-middleware');

const DEFAULT_TARGET = 'https://babayogi.vercel.app';
const proxyTarget = (process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_BACKEND_URL || DEFAULT_TARGET).replace(/\/$/, '');

module.exports = function setupProxy(app) {
  // Keep frontend and backend as separate repos while enabling seamless local development.
  app.use(
    ['/health', '/generate-diet-plan', '/diet-jobs', '/diet-logs', '/auth'],
    createProxyMiddleware({
      target: proxyTarget,
      changeOrigin: true,
      secure: true,
      timeout: 120000,
      proxyTimeout: 120000,
      logLevel: 'warn',
    })
  );
};
