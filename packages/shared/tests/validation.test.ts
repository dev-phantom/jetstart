/**
 * Tests for validation utilities
 */

import {
  isValidSessionId,
  isValidToken,
  isValidProjectName,
  isValidPackageName,
  isValidPort,
  isValidUrl,
  isValidQRCodeData,
  isValidSessionToken,
  isValidDeviceInfo,
  sanitizeInput,
  isValidVersion,
} from '../src/utils/validation';
import { Platform, Architecture } from '../src/types';

describe('Validation Utilities', () => {
  describe('isValidSessionId', () => {
    it('should accept valid session IDs', () => {
      expect(isValidSessionId('abc12345')).toBe(true);
      expect(isValidSessionId('session-123-abc')).toBe(true);
      expect(isValidSessionId('ABC_123_xyz')).toBe(true);
      expect(isValidSessionId('a'.repeat(64))).toBe(true);
    });

    it('should reject invalid session IDs', () => {
      expect(isValidSessionId('short')).toBe(false); // Too short
      expect(isValidSessionId('a'.repeat(65))).toBe(false); // Too long
      expect(isValidSessionId('invalid@session')).toBe(false); // Invalid char
      expect(isValidSessionId('spaces not allowed')).toBe(false);
      expect(isValidSessionId('')).toBe(false); // Empty
    });
  });

  describe('isValidToken', () => {
    it('should accept valid tokens', () => {
      expect(isValidToken('a'.repeat(16))).toBe(true);
      expect(isValidToken('token-123-abc-xyz')).toBe(true);
      expect(isValidToken('a'.repeat(128))).toBe(true);
    });

    it('should reject invalid tokens', () => {
      expect(isValidToken('short')).toBe(false); // Too short
      expect(isValidToken('a'.repeat(129))).toBe(false); // Too long
      expect(isValidToken('invalid@token')).toBe(false); // Invalid char
      expect(isValidToken('')).toBe(false); // Empty
    });
  });

  describe('isValidProjectName', () => {
    it('should accept valid project names', () => {
      expect(isValidProjectName('myApp')).toBe(true);
      expect(isValidProjectName('MyProject123')).toBe(true);
      expect(isValidProjectName('test-app')).toBe(true);
      expect(isValidProjectName('app_name')).toBe(true);
    });

    it('should reject invalid project names', () => {
      expect(isValidProjectName('123app')).toBe(false); // Starts with number
      expect(isValidProjectName('-myapp')).toBe(false); // Starts with hyphen
      expect(isValidProjectName('my app')).toBe(false); // Contains space
      expect(isValidProjectName('app@name')).toBe(false); // Invalid char
      expect(isValidProjectName('')).toBe(false); // Empty
      expect(isValidProjectName('a'.repeat(65))).toBe(false); // Too long
    });
  });

  describe('isValidPackageName', () => {
    it('should accept valid package names', () => {
      expect(isValidPackageName('com.example.app')).toBe(true);
      expect(isValidPackageName('com.mycompany.myapp')).toBe(true);
      expect(isValidPackageName('org.jetstart.client')).toBe(true);
    });

    it('should reject invalid package names', () => {
      expect(isValidPackageName('com.Example.app')).toBe(false); // Uppercase
      expect(isValidPackageName('singlename')).toBe(false); // No dots
      expect(isValidPackageName('com..app')).toBe(false); // Double dot
      expect(isValidPackageName('123.example.app')).toBe(false); // Starts with number
      expect(isValidPackageName('')).toBe(false); // Empty
    });
  });

  describe('isValidPort', () => {
    it('should accept valid ports', () => {
      expect(isValidPort(1024)).toBe(true);
      expect(isValidPort(8080)).toBe(true);
      expect(isValidPort(65535)).toBe(true);
    });

    it('should reject invalid ports', () => {
      expect(isValidPort(0)).toBe(false);
      expect(isValidPort(1023)).toBe(false); // Too low
      expect(isValidPort(65536)).toBe(false); // Too high
      expect(isValidPort(8080.5)).toBe(false); // Not integer
      expect(isValidPort(-1)).toBe(false); // Negative
    });
  });

  describe('isValidUrl', () => {
    it('should accept valid URLs', () => {
      expect(isValidUrl('http://localhost:8080')).toBe(true);
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('ws://192.168.1.1:8765')).toBe(true);
      expect(isValidUrl('wss://jetstart.dev/ws')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('ftp://invalid')).toBe(true); // Actually valid URL format
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('http://')).toBe(false);
    });
  });

  describe('isValidQRCodeData', () => {
    const validQRData = {
      sessionId: 'session12345',
      serverUrl: 'http://localhost:8765',
      wsUrl: 'ws://localhost:8766',
      token: 'token1234567890abc',
      projectName: 'MyProject',
      version: '0.1.0',
    };

    it('should accept valid QR code data', () => {
      expect(isValidQRCodeData(validQRData)).toBe(true);
    });

    it('should reject invalid QR code data', () => {
      expect(isValidQRCodeData({ ...validQRData, sessionId: 'bad' })).toBe(false);
      expect(isValidQRCodeData({ ...validQRData, serverUrl: 'not-url' })).toBe(false);
      expect(isValidQRCodeData({ ...validQRData, token: 'short' })).toBe(false);
      expect(isValidQRCodeData(null)).toBe(false);
      expect(isValidQRCodeData({})).toBe(false);
    });
  });

  describe('isValidSessionToken', () => {
    const validToken = {
      sessionId: 'session12345',
      token: 'token1234567890abc',
      expiresAt: Date.now() + 3600000,
      serverUrl: 'http://localhost:8765',
      wsUrl: 'ws://localhost:8766',
    };

    it('should accept valid session tokens', () => {
      expect(isValidSessionToken(validToken)).toBe(true);
    });

    it('should reject invalid session tokens', () => {
      expect(isValidSessionToken({ ...validToken, sessionId: 'bad' })).toBe(false);
      expect(isValidSessionToken({ ...validToken, token: 'short' })).toBe(false);
      expect(isValidSessionToken({ ...validToken, expiresAt: 'not-number' })).toBe(false);
      expect(isValidSessionToken(null)).toBe(false);
    });
  });

  describe('isValidDeviceInfo', () => {
    const validDevice = {
      id: 'device123',
      name: 'Pixel 6',
      model: 'Pixel 6',
      manufacturer: 'Google',
      platform: Platform.ANDROID,
      osVersion: '14',
      apiLevel: 34,
      screenResolution: { width: 1080, height: 2400 },
      density: 3.0,
      isEmulator: false,
      architecture: Architecture.ARM64_V8A,
      locale: 'en-US',
      timezone: 'America/New_York',
    };

    it('should accept valid device info', () => {
      expect(isValidDeviceInfo(validDevice)).toBe(true);
    });

    it('should reject invalid device info', () => {
      expect(isValidDeviceInfo({ ...validDevice, id: 123 })).toBe(false);
      expect(isValidDeviceInfo({ ...validDevice, apiLevel: '34' })).toBe(false);
      expect(isValidDeviceInfo(null)).toBe(false);
      expect(isValidDeviceInfo({})).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
      expect(sanitizeInput('\nhello\n')).toBe('hello');
    });

    it('should remove dangerous characters', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('scriptalert("xss")/script');
      expect(sanitizeInput('hello<>world')).toBe('helloworld');
    });

    it('should handle empty strings', () => {
      expect(sanitizeInput('')).toBe('');
      expect(sanitizeInput('   ')).toBe('');
    });
  });

  describe('isValidVersion', () => {
    it('should accept valid semantic versions', () => {
      expect(isValidVersion('0.1.0')).toBe(true);
      expect(isValidVersion('1.0.0')).toBe(true);
      expect(isValidVersion('2.3.4')).toBe(true);
      expect(isValidVersion('1.0.0-alpha')).toBe(true);
      expect(isValidVersion('1.0.0-beta.1')).toBe(true);
    });

    it('should reject invalid versions', () => {
      expect(isValidVersion('1.0')).toBe(false);
      expect(isValidVersion('v1.0.0')).toBe(false);
      expect(isValidVersion('1.0.0.0')).toBe(false);
      expect(isValidVersion('abc')).toBe(false);
      expect(isValidVersion('')).toBe(false);
    });
  });
});