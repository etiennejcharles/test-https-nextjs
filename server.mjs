import fs from "fs";
import { platform } from "os"
const {existsSync} = fs
const { log } = console
import isEmpty from "lodash/isEmpty.js";
import chalk from 'chalk';
const { green, blue, yellow } = chalk;
import { execSync, exec } from "child_process";
import { sync as commandExistsSync } from 'command-exists'
const { mkdirSync } = fs
import { createServer as serverHttps } from "https"
import { createServer as serverHttp } from "http"
import next from "next"
import { parse } from "url"
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const CERTIFICATE_NAME = 'localhost';
const CERTIFICATES_DIR_NAME = 'certificates';
createSelfSignedCertificate();
const KEY_PATH = `./${CERTIFICATES_DIR_NAME}/${CERTIFICATE_NAME}.key`;
const CERTIFICATE_PATH = `./${CERTIFICATES_DIR_NAME}/${CERTIFICATE_NAME}.crt`;
const httpsOptions = getHttpsOptions(KEY_PATH, CERTIFICATE_PATH)

app.prepare().then(() => {
  const PORT = 3000;
  const hasCertificates = !isEmpty(httpsOptions);
  const createServer = hasCertificates ?  serverHttps : serverHttp;
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(PORT, (err) => {
    const protocol = hasCertificates ? 'https' : 'http';
    if (err) throw err;
    console.log(`> Server started on ${protocol}://localhost:${PORT}"`);
  });
});


async function createSelfSignedCertificate() {
  const openSSLInstalled = commandExistsSync('openssl')
  if (!openSSLInstalled) {
    log(yellow('...openssl command is not installed. Please install it to run project in HTTPS.'))
    return
  }

  const folderAndName = `${CERTIFICATES_DIR_NAME}/${CERTIFICATE_NAME}`
  const certPath  = `./${folderAndName}.crt`
  // return if certificate already exists
  if (fs.existsSync(`${certPath}`)) {
    log(green('...Certificates found, using them'))
    return;
  }

  // makes the directory if it doesn't exist
  mkdirSync(`./${CERTIFICATES_DIR_NAME}`, { recursive: true });
  // creates the certificate
  log(green(`...Creating the Self-Signed ${CERTIFICATE_NAME} Certificate for HTTPS dev locally`))
  createCert(folderAndName, CERTIFICATE_NAME);

  const isWindows = process.platform === 'win32';
  const isMacOs = process.platform === 'darwin';

  // Add the certificate to the keychain on mac os

  if (isMacOs) {
    execSync(`sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ${certPath}`);
    // Add the certificate to the keychain on windows
  } else if (isWindows) {
    const isAdmin = await checkAdminPrompt()
    if(isAdmin){
      execSync(`certutil -addstore -f "Root" "${certPath}"`);
    }
    else {
      console.log(yellow('...You must have admin priviliges to add the certificate to the keychain. Please run the command as an admin'));
    }

  } else {
    // unknown platform
    log(blue(`Unknown platform: ${process.platform} certificate not added to keychain manager`))
  }
  // Add the certificate to the keychain on windows
  log(green(`Certificate: ${CERTIFICATE_NAME} Successfully Created`))

}

function createCert(folderAndName, certificateName) {
  if (!folderAndName) {
    throw new Error('Please provide a folder and name for the certificate')
  }
  if (!certificateName) {
    throw new Error('Please provide a name for the certificate')
  }
  execSync(`openssl req -x509 -out ./${folderAndName}.crt -keyout ./${folderAndName}.key \
-days 3650 \
-newkey rsa:2048 -nodes -sha256 \
-subj "/CN=${certificateName}" -extensions EXT -config ./openssl.cnf`);
}




function checkAdminPrompt() {
  return new Promise(resolve => { // Has to be a promise since Windows can take quite a while to respond under some circumstances
    if (process.platform == "win32") {
      exec('net session', function (err) { // "net session" will return an error when admin privileges are not present
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    } else {
      throw new Error('Can not determine if admin priviliges are present or not. This package is only compatible with Windows OS')
    }
  });
}


function getHttpsOptions(KEY_PATH, CERTIFICATE_PATH){
  if(existsSync(KEY_PATH) && existsSync(CERTIFICATE_PATH)){
    return {
      key: fs.readFileSync(`${KEY_PATH}`), // private key, can be PEM or DER
      cert: fs.readFileSync(`${CERTIFICATE_PATH}`), // certificate, can be PEM or DER
    }
  }
  return {}
}