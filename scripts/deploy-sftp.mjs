import Client from 'ssh2-sftp-client';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CONFIGS = {
  docs: {
    username: process.env.FTP_USER_DOCS,
    password: process.env.FTP_PASSWORD_DOCS,
    host: process.env.FTP_HOST || 'ftp.jetstart.site',
    port: 22,
    localDir: path.join(__dirname, '../docs/build'),
    remoteDir: process.env.FTP_REMOTE_DOCS || '/public_html',
  },
  web: {
    username: process.env.FTP_USER_WEB,
    password: process.env.FTP_PASSWORD_WEB,
    host: process.env.FTP_HOST || 'ftp.jetstart.site',
    port: 22,
    localDir: path.join(__dirname, '../packages/web/dist'),
    remoteDir: process.env.FTP_REMOTE_WEB || '/',
  },
  sanity: {
    username: process.env.FTP_USER_SANITY,
    password: process.env.FTP_PASSWORD_SANITY,
    host: process.env.FTP_HOST || 'ftp.jetstart.site',
    port: 22,
    localDir: path.join(__dirname, '../packages/sanity-studio/dist'),
    remoteDir: process.env.FTP_REMOTE_SANITY || '/',
  },
};

const component = process.argv[2];

if (!component || !CONFIGS[component]) {
  console.error('Please specify a component to deploy: docs, web, sanity');
  process.exit(1);
}

const config = CONFIGS[component];

if (!config.username || !config.password) {
  console.error(`Missing credentials for ${component}. Check your .env file.`);
  process.exit(1);
}

async function deploy() {
  const sftp = new Client();

  try {
    console.log(`Connecting to ${config.host}:${config.port} as ${config.username}...`);
    await sftp.connect({
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
    });

    console.log(`Connected. Uploading from ${config.localDir} to ${config.remoteDir}...`);
    
    // Ensure remote directory exists
    const remoteExists = await sftp.exists(config.remoteDir);
    if (!remoteExists) {
        console.log(`Creating remote directory ${config.remoteDir}...`);
        await sftp.mkdir(config.remoteDir, true);
    }

    // Upload directory
    await sftp.uploadDir(config.localDir, config.remoteDir);

    console.log('Deployment successful!');
  } catch (err) {
    console.error('Deployment failed:', err);
    process.exit(1);
  } finally {
    await sftp.end();
  }
}

deploy();
