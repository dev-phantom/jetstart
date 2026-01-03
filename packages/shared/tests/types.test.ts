/**
 * Tests for type definitions and enums
 */

import {
  SessionStatus,
  ConnectionType,
  Platform,
  Architecture,
  NetworkType,
  BuildType,
  ErrorSeverity,
  BuildPhase,
  LogLevel,
  LogSource,
} from '../src/types';

describe('Type Definitions', () => {
  describe('Enums', () => {
    it('should have correct SessionStatus values', () => {
      expect(SessionStatus.PENDING).toBe('pending');
      expect(SessionStatus.CONNECTED).toBe('connected');
      expect(SessionStatus.BUILDING).toBe('building');
      expect(SessionStatus.READY).toBe('ready');
      expect(SessionStatus.ERROR).toBe('error');
      expect(SessionStatus.DISCONNECTED).toBe('disconnected');
    });

    it('should have correct ConnectionType values', () => {
      expect(ConnectionType.MINIMAL).toBe('minimal');
      expect(ConnectionType.FASTER).toBe('faster');
    });

    it('should have correct Platform values', () => {
      expect(Platform.ANDROID).toBe('android');
      expect(Platform.WEB).toBe('web');
    });

    it('should have correct Architecture values', () => {
      expect(Architecture.ARM64_V8A).toBe('arm64-v8a');
      expect(Architecture.ARMEABI_V7A).toBe('armeabi-v7a');
      expect(Architecture.X86).toBe('x86');
      expect(Architecture.X86_64).toBe('x86_64');
    });

    it('should have correct NetworkType values', () => {
      expect(NetworkType.WIFI).toBe('wifi');
      expect(NetworkType.CELLULAR).toBe('cellular');
      expect(NetworkType.ETHERNET).toBe('ethernet');
      expect(NetworkType.UNKNOWN).toBe('unknown');
    });

    it('should have correct BuildType values', () => {
      expect(BuildType.DEBUG).toBe('debug');
      expect(BuildType.RELEASE).toBe('release');
    });

    it('should have correct ErrorSeverity values', () => {
      expect(ErrorSeverity.ERROR).toBe('error');
      expect(ErrorSeverity.WARNING).toBe('warning');
      expect(ErrorSeverity.INFO).toBe('info');
    });

    it('should have correct BuildPhase values', () => {
      expect(BuildPhase.IDLE).toBe('idle');
      expect(BuildPhase.INITIALIZING).toBe('initializing');
      expect(BuildPhase.COMPILING).toBe('compiling');
      expect(BuildPhase.PACKAGING).toBe('packaging');
      expect(BuildPhase.SIGNING).toBe('signing');
      expect(BuildPhase.OPTIMIZING).toBe('optimizing');
      expect(BuildPhase.COMPLETE).toBe('complete');
      expect(BuildPhase.FAILED).toBe('failed');
    });

    it('should have correct LogLevel values', () => {
      expect(LogLevel.VERBOSE).toBe('verbose');
      expect(LogLevel.DEBUG).toBe('debug');
      expect(LogLevel.INFO).toBe('info');
      expect(LogLevel.WARN).toBe('warn');
      expect(LogLevel.ERROR).toBe('error');
      expect(LogLevel.FATAL).toBe('fatal');
    });

    it('should have correct LogSource values', () => {
      expect(LogSource.CLI).toBe('cli');
      expect(LogSource.CORE).toBe('core');
      expect(LogSource.CLIENT).toBe('client');
      expect(LogSource.BUILD).toBe('build');
      expect(LogSource.NETWORK).toBe('network');
      expect(LogSource.SYSTEM).toBe('system');
    });
  });

  describe('Type Guards', () => {
    it('should correctly identify enum values', () => {
      const status: SessionStatus = SessionStatus.CONNECTED;
      expect(Object.values(SessionStatus)).toContain(status);

      const invalidStatus = 'invalid' as any;
      expect(Object.values(SessionStatus)).not.toContain(invalidStatus);
    });
  });
});