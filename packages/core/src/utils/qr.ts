/**
 * QR Code Generator
 * Generates QR codes for device pairing
 */

import QRCode from 'qrcode';
import { QRCodeData } from '@jetstart/shared';
import { QRCodeOptions } from '../types';

export async function generateQRCode(options: QRCodeOptions): Promise<string> {
  const data: QRCodeData = {
    sessionId: options.sessionId,
    serverUrl: options.serverUrl,
    wsUrl: options.wsUrl,
    token: options.token,
    projectName: options.projectName,
    version: options.version,
  };

  // Generate QR code as data URL
  return QRCode.toDataURL(JSON.stringify(data), {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    width: 300,
  });
}

export async function generateQRCodeTerminal(options: QRCodeOptions): Promise<void> {
  const data: QRCodeData = {
    sessionId: options.sessionId,
    serverUrl: options.serverUrl,
    wsUrl: options.wsUrl,
    token: options.token,
    projectName: options.projectName,
    version: options.version,
  };

  // Generate QR code for terminal
  return QRCode.toString(JSON.stringify(data), {
    type: 'terminal',
    small: true,
  }, (err, url) => {
    if (err) throw err;
    console.log(url);
  });
}