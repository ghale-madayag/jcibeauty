// Custom Next.js server for Phusion Passenger (Hostinger "Setup Node.js App").
//
// Passenger boots this file directly — it can't run `next start`. We hand every
// request to Next's request handler. Passenger injects PORT; we fall back to
// 3000 for plain `node server.js` runs. Requires a production build first
// (`npm run build`).
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const port = process.env.PORT || 3000;
const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res, parse(req.url, true));
  }).listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`> JCI Beauty ready on port ${port}`);
  });
});
