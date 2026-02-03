// Commit on 2026-03-13
// Commit on 2026-02-15
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/generate-diet-plan',
    createProxyMiddleware({
      target: 'https://babayogi.vercel.app',
      changeOrigin: true,
      secure: true,
      timeout: 60000,
      proxyTimeout: 60000,
      logLevel: 'info',
      onError: function (err, req, res) {
        console.log('Proxy Error:', err.message);
        res.writeHead(500, {
          'Content-Type': 'text/plain'
        });
        res.end('Proxy error occurred');
      },
      onProxyReq: function (proxyReq, req, res) {
        console.log('Proxying request to:', proxyReq.getHeader('host') + proxyReq.path);
      },
      onProxyRes: function (proxyRes, req, res) {
        console.log('Proxy response status: