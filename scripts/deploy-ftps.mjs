import * as ftp from 'basic-ftp';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CONFIGS = {
  docs: {
    user: process.env.FTP_USER_DOCS,
    password: process.env.FTP_PASSWORD_DOCS,
    host: process.env.FTP_HOST || 'ftp.jetstart.site',
    localDir: path.join(__dirname, '../docs/build'),
    remoteDir: process.env.FTP_REMOTE_DOCS || '/', // Default to root of the FTP user
    secure: true,
  },
  web: {
    user: process.env.FTP_USER_WEB,
    password: process.env.FTP_PASSWORD_WEB,
    host: process.env.FTP_HOST || 'ftp.jetstart.site',
    localDir: path.join(__dirname, '../packages/web/dist'),
    remoteDir: process.env.FTP_REMOTE_WEB || '/',
    secure: true,
  },
  sanity: {
    user: process.env.FTP_USER_SANITY,
    password: process.env.FTP_PASSWORD_SANITY,
    host: process.env.FTP_HOST || 'ftp.jetstart.site',
    localDir: path.join(__dirname, '../packages/sanity-studio/dist'),
    remoteDir: process.env.FTP_REMOTE_SANITY || '/',
    secure: true,
  },
};

const component = process.argv[2];

if (!component || !CONFIGS[component]) {
  console.error('Please specify a component to deploy: docs, web, sanity');
  process.exit(1);
}

const config = CONFIGS[component];

if (!config.user || !config.password) {
  console.error(`Missing credentials for ${component}. Check your .env file.`);
  process.exit(1);
}

async function deploy() {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    // For Plain FTP test
    const secure = process.env.PLAIN_FTP === 'true' ? false : config.secure;
    
    console.log(`Deploying ${component} to ${config.host} (Secure: ${secure})...`);
    await client.access({
      host: config.host,
      user: config.user,
      password: config.password,
      secureOptions: { rejectUnauthorized: false },
    }); // Let basic-ftp verify the certificate

    // Try Active Mode
    client.ftp.active = true;
    client.ftp.ipFamily = 4;




    console.log(`Connected. Uploading from ${config.localDir} to ${config.remoteDir}...`);
    
    // Ensure remote directory exists (might not be needed if we assume root, but safer)
    await client.ensureDir(config.remoteDir);
    
    // Upload directory. true = clear remote directory first? Maybe dangerous if wrong path. 
    // We'll just upload and overwrite.
    await client.uploadFromDir(config.localDir, config.remoteDir);

    console.log('Deployment successful!');
  } catch (err) {
    console.error('Deployment failed:', err);
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy();
