import { execSync } from "child_process";


export function createCert(folderAndName, certificateName) {
  if (!folderAndName) {
    throw new Error('Please provide a folder and name for the certificate');
  }
  if (!certificateName) {
    throw new Error('Please provide a name for the certificate');
  }
  execSync(`openssl req -x509 -out ./${folderAndName}.crt -keyout ./${folderAndName}.key \
-days 3650 \
-newkey rsa:2048 -nodes -sha256 \
-subj "/CN=${certificateName}" -extensions EXT -config ./openssl.cnf`);
}
