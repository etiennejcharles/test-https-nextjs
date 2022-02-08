import { createServer as serverHttp } from "http";
import { createServer as serverHttps } from "https";
import isEmpty from "lodash/isEmpty.js";
import next from "next";
import { parse } from "url";
import chalk from 'chalk';
const { green, blue, yellow } = chalk;
const dev = process.env.NODE_ENV !== "production";
import { getCertificateOptions } from './serverUtils.mjs'
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  const PORT = 3000;
  const httpsOptions = await getCertificateOptions()
  const hasCertificates = !isEmpty(httpsOptions);
  const createServer = hasCertificates ?  serverHttps : serverHttp;
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(PORT, (err) => {
    const protocol = hasCertificates ? 'https' : 'http';
    if(!hasCertificates){
      console.log(yellow(`...No certificates found. HTTPS will not be used.`));
    }
    if (err) throw err;
    console.log(`> Server started on ${protocol}://localhost:${PORT}"`);
  });
});


