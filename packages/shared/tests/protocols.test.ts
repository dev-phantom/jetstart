/**
 * Tests for protocol definitions
 */

import {
  WSState,
  WSErrorCode,
  ClientConnectMessage,
  CoreConnectedMessage,
  CoreBuildCompleteMessage,
} from '../src/protocols/websocket';
import { Platform, Architecture } from '../src/types';

describe('WebSocket Protocol', () => {
  describe('WSState enum', () => {
    it('should have correct state values', () => {
      expect(WSState.CONNECTING).toBe('connecting');
      expect(WSState.CONNECTED).toBe('connected');
      expect(WSState.DISCONNECTING).toBe('disconnecting');
      expect(WSState.DISCONNECTED).toBe('disconnected');
      expect(WSState.ERROR).toBe('error');
    });
  });

  describe('WSErrorCode enum', () => {
    it('should have correct error codes', () => {
      expect(WSErrorCode.CONNECTION_FAILED).toBe('connection_failed');
      expect(WSErrorCode.AUTHENTICATION_FAILED).toBe('authentication_failed');
      expect(WSErrorCode.TIMEOUT).toBe('timeout');
      expect(WSErrorCode.INVALID_MESSAGE).toBe('invalid_message');
      expect(WSErrorCode.SESSION_EXPIRED).toBe('session_expired');
      expect(WSErrorCode.UNKNOWN).toBe('unknown');
    });
  });

  describe('Message structures', () => {
    it('should create valid ClientConnectMessage', () => {
      const message: ClientConnectMessage = {
        type: 'client:connect',
        timestamp: Date.now(),
        sessionId: 'session12345',
        token: 'token1234567890abc',
        deviceInfo: {
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
        },
      };

      expect(message.type).toBe('client:connect');
      expect(message.sessionId).toBe('session12345');
      expect(message.deviceInfo.platform).toBe(Platform.ANDROID);
    });

    it('should create valid CoreConnectedMessage', () => {
      const message: CoreConnectedMessage = {
        type: 'core:connected',
        timestamp: Date.now(),
        sessionId: 'session12345',
        projectName: 'MyProject',
      };

      expect(message.type).toBe('core:connected');
      expect(message.sessionId).toBe('session12345');
      expect(message.projectName).toBe('MyProject');
    });

    it('should create valid CoreBuildCompleteMessage', () => {
      const message: CoreBuildCompleteMessage = {
        type: 'core:build-complete',
        timestamp: Date.now(),
        sessionId: 'session12345',
        apkInfo: {
          path: '/path/to/app.apk',
          size: 5242880,
          hash: 'abc123',
          versionCode: 1,
          versionName: '1.0.0',
          minSdkVersion: 24,
          targetSdkVersion: 34,
          applicationId: 'com.example.app',
        },
        downloadUrl: 'http://localhost:8765/download/app.apk',
      };

      expect(message.type).toBe('core:build-complete');
      expect(message.apkInfo.size).toBe(5242880);
      expect(message.downloadUrl).toContain('/download/');
    });
  });

  describe('Message type guards', () => {
    it('should identify message types by type field', () => {
      const connectMessage = {
        type: 'client:connect',
        timestamp: Date.now(),
      };

      expect(connectMessage.type).toBe('client:connect');
      expect(connectMessage.type.startsWith('client:')).toBe(true);

      const coreMessage = {
        type: 'core:build-start',
        timestamp: Date.now(),
      };

      expect(coreMessage.type).toBe('core:build-start');
      expect(coreMessage.type.startsWith('core:')).toBe(true);
    });
  });
});