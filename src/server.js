// Bootstrap: loads the app and, if anything fails at startup or per request,
// returns the real error text instead of an opaque platform 500.
import http from 'node:http';

let handler = null;
let bootError = null;
try {
  ({ appHandler: handler } = await import('./app.js'));
} catch (err) {
  bootError = err;
  console.error('BOOT ERROR:', err);
}

const server = http.createServer(async (req, res) => {
  if (bootError) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('BOOT ERROR\n' + (bootError.stack || String(bootError)));
  }
  try {
    await handler(req, res);
  } catch (err) {
    console.error('REQUEST ERROR:', err);
    if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('REQUEST ERROR\n' + (err.stack || String(err)));
  }
});

const port = Number(process.env.PORT || 3000);
server.listen(port, () => console.log(`APKworlds server listening on port ${port}`));

export default server;
