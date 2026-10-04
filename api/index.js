import { appHandler } from '../src/server.js';

export default async function handler(req, res) {
  try {
    return await appHandler(req, res);
  } catch (err) {
    console.error('Serverless request error:', err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('500 Internal Server Error: ' + (err.message || 'Error occurred'));
    }
  }
}
