// Bootstrap: no top-level await (Vercel may require() this entrypoint).
// Loads the app lazily and returns the real error text on failure.
import http from 'node:http';

let appPromise = null;
function loadApp() {
  if (!appPromise) appPromise = import('./app.js');
  return appPromise;
}
loadApp().catch((err) => console.error('BOOT ERROR:', err));

const server = http.createServer(async (req, res) => {
  let handler;
  try {
    ({ appHandler: handler } = await loadApp());
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('BOOT ERROR\n' + (err.stack || String(err)));
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
