import { getHttpsOptions } from "./checkAdminPrompt.mjs";
import { createSelfSignedCertificate } from "./createSelfSignedCertificate.mjs";


export const CERTIFICATE_NAME = 'localhost';
export const CERTIFICATES_DIR_NAME = 'certificates';
const KEY_PATH = `./${CERTIFICATES_DIR_NAME}/${CERTIFICATE_NAME}.key`;
const CERTIFICATE_PATH = `./${CERTIFICATES_DIR_NAME}/${CERTIFICATE_NAME}.crt`;
createSelfSignedCertificate();
export const httpsOptions = getHttpsOptions(KEY_PATH, CERTIFICATE_PATH);
