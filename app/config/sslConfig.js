import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const loadSSLCertificates = () => {

  try {
    const certsPath = path.join(__dirname, '../../certs');

    if (fs.existsSync(path.join(certsPath, 'privatekey.pem')) && fs.existsSync(path.join(certsPath, 'fullchain.pem'))) {
      return {
        key: fs.readFileSync(path.join(certsPath, 'privatekey.pem')),
        cert: fs.readFileSync(path.join(certsPath, 'fullchain.pem')),

        rejectUnauthorized: false,
      }
    }

    return null;
  } catch (error) {
    console.error('Error loading SSL certificates:', error);
    throw error;
  }
}