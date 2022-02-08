import fs from "fs";
const { existsSync } = fs
import { exec } from "child_process";



export function isWindowAdminPrompt() {
  return new Promise(resolve => {
    if (process.platform == "win32") {
      exec('net session', function (err) {
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    } else {
      throw new Error('Can not determine if admin priviliges are present or not. This package is only compatible with Windows OS');
    }
  });
}


export function getHttpsOptions(KEY_PATH, CERTIFICATE_PATH) {
  if (existsSync(KEY_PATH) && existsSync(CERTIFICATE_PATH)) {
    return {
      key: fs.readFileSync(`${KEY_PATH}`),
      cert: fs.readFileSync(`${CERTIFICATE_PATH}`), // certificate, can be PEM or DER
    };
  }
  return {};
}
