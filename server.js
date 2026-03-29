const http = require('http');
const https = require('https');

const API_KEY = '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';

const server = http.createServer((req, res) => {
  console.log('[' + new Date().toISOString() + ']', req.method, req.url);

  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-api-key, anthropic-version'
    });
    res.end();
    return;
  }

  if (req.url === '/anthropic' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const anthropicReq = https.request({
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }, (anthropicRes) => {
        let data = '';
        anthropicRes.on('data', chunk => { data += chunk; });
        anthropicRes.on('end', () => {
          console.log('[' + new Date().toISOString() + '] Anthropic status:', anthropicRes.statusCode);
          console.log('[' + new Date().toISOString() + '] Anthropic response:', data.substring(0, 500));
          res.writeHead(200, { 'Access-Control-Allow-Origin': '*' });
          res.end(data);
        });
      });
      anthropicReq.on('error', (e) => {
        console.error('[' + new Date().toISOString() + '] Proxy error:', e.message);
        res.writeHead(500, { 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: { message: e.message } }));
      });
      anthropicReq.write(body);
      anthropicReq.end();
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(3000, () => {
  console.log('AURUM proxy server running at http://localhost:3000');
});
ye