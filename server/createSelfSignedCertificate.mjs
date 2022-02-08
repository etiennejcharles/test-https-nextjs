import fs from "fs";
import { execSync } from "child_process";
import { sync as commandExistsSync } from 'command-exists';
import chalk from 'chalk';
import { CERTIFICATES_DIR_NAME, CERTIFICATE_NAME } from "./serverUtils.mjs";
import { createCert } from "./createCert.mjs";
import { isWindowAdminPrompt } from "./checkAdminPrompt.mjs";
const { mkdirSync } = fs
const { green, blue, yellow } = chalk;
const { log } = console

export async function createSelfSignedCertificate() {
  const openSSLInstalled = commandExistsSync('openssl');
  if (!openSSLInstalled) {
    log(yellow('...openssl command is not installed. Please install it to run project in HTTPS.'));
    return;
  }

  const folderAndName = `${CERTIFICATES_DIR_NAME}/${CERTIFICATE_NAME}`;
  const certPath = `./${folderAndName}.crt`;
  // return if certificate already exists
  if (fs.existsSync(`${certPath}`)) {
    log(green('...Certificates found, using them'));
    return;
  }

  // makes the directory if it doesn't exist
  mkdirSync(`./${CERTIFICATES_DIR_NAME}`, { recursive: true });
  // creates the certificate
  log(green(`...Creating the Self-Signed ${CERTIFICATE_NAME} Certificate for HTTPS dev locally`));
  createCert(folderAndName, CERTIFICATE_NAME);

  const isWindows = process.platform === 'win32';
  const isMacOs = process.platform === 'darwin';

  // Add the certificate to the keychain on mac os
  if (isMacOs) {
    execSync(`sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ${certPath}`);
    // Add the certificate to the keychain on windows
  } else if (isWindows) {
    const isAdmin = await isWindowAdminPrompt();
    if (isAdmin) {
      execSync(`certutil -addstore -f "Root" "${certPath}"`);
    }
    else {
      console.log(yellow('...You must have admin priviliges to add the certificate to the keychain. Please run the command as an admin'));
    }

  } else {
    // unknown platform
    log(blue(`Unknown platform: ${process.platform} certificate not added to keychain manager`));
  }
  // Add the certificate to the keychain on windows
  log(green(`Certificate: ${CERTIFICATE_NAME} Successfully Created`));

}
