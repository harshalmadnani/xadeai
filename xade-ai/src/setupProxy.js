const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api/v1/analytics_events',
    createProxyMiddleware({
      target: 'https://auth.privy.io',
      changeOrigin: true,
      pathRewrite: {
        '^/api/v1/analytics_events': '/api/v1/analytics_events'
      },
      onProxyReq: (proxyReq, req, res) => {
        // Add origin to the request headers
        proxyReq.setHeader('Origin', 'http://localhost:3001');
      },
      onProxyRes: (proxyRes, req, res) => {
        // Modify response headers
        proxyRes.headers['Access-Control-Allow-Origin'] = '*';
        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
        proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      },
    })
  );
}; 