import fs from "fs";
const { log } = console
import chalk from 'chalk';
const { green, blue } = chalk;
import { execSync } from "child_process";
const { mkdirSync } = fs
import { createServer }  from  "https"
import next  from  "next"
import { parse }  from  "url"
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const CERTIFICATES_DIR_NAME = 'certificates';
createSelfSignedCertificate();
const httpsOptions = {
  key: fs.readFileSync(`./${CERTIFICATES_DIR_NAME}/localhost.key`), // private key, can be PEM or DER
  cert: fs.readFileSync(`./${CERTIFICATES_DIR_NAME}/localhost.crt`), // certificate, can be PEM or DER
}
;
app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log("> Server started on https://localhost:3000");
  });
});


function createSelfSignedCertificate() {
  const CERTIFICATE_NAME = 'localhost';
  const folderAndName = `${CERTIFICATES_DIR_NAME}/${CERTIFICATE_NAME}`
  // return if certificate already exists
  if(fs.existsSync(`./${folderAndName}.crt`))
  {
    log(blue(`...Certificate ${CERTIFICATE_NAME} already exists for HTTPS local development`))
    return;
  }

  // makes the directory if it doesn't exist
  mkdirSync(`./${CERTIFICATES_DIR_NAME}`, { recursive: true });
  // creates the certificate
  log(green(`...Creating the Self-Signed ${CERTIFICATE_NAME} Certificate for HTTPS dev locally`))
  createCert(folderAndName, CERTIFICATE_NAME);

  const isWindows = process.platform === 'win32';
  const isMacOs = process.platform === 'darwin';
  const platform = isWindows ? 'windows' : 'macos'
  const message =`You must add the certificate to your keychain on ${platform} to prevent the server from being blocked by the browser`

  // Add the certificate to the keychain on mac os
  if (isMacOs) {
    execSync(`sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ./${folderAndName}.crt`);
  // Add the certificate to the keychain on windows
  } else if (isWindows){
    execSync(`certutil -addstore -f "Root" ./${folderAndName}.crt`);
  } else {
    // unknown platform
    log(blue(`Unknown platform: ${process.platform} certificate not added to keychain manager`))
  }
  // Add the certificate to the keychain on windows
  log(green(`Certificate: ${CERTIFICATE_NAME} Successfully Created`))

}

function createCert(folderAndName, certificateName) {
  if(!folderAndName)
  {
    throw new Error('Please provide a folder and name for the certificate')
  }
  if(!certificateName){
    throw new Error('Please provide a name for the certificate')
  }
  execSync(`openssl req -x509 -out ./${folderAndName}.crt -keyout ./${folderAndName}.key \
-days 3650 \
-newkey rsa:2048 -nodes -sha256 \
-subj '/CN=${certificateName}' -extensions EXT -config ./openssl.cnf`);
}
