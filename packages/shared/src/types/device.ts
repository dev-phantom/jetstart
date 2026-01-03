/**
 * Device Information Types
 * Device and platform-related information
 */

export interface DeviceInfo {
  id: string;
  name: string;
  model: string;
  manufacturer: string;
  platform: Platform;
  osVersion: string;
  apiLevel: number;
  screenResolution: ScreenResolution;
  density: number;
  isEmulator: boolean;
  architecture: Architecture;
  locale: string;
  timezone: string;
}

export enum Platform {
  ANDROID = 'android',
  WEB = 'web',
}

export interface ScreenResolution {
  width: number;
  height: number;
}

export enum Architecture {
  ARM64_V8A = 'arm64-v8a',
  ARMEABI_V7A = 'armeabi-v7a',
  X86 = 'x86',
  X86_64 = 'x86_64',
}

export interface NetworkInfo {
  ipAddress: string;
  networkType: NetworkType;
  isConnected: boolean;
}

export enum NetworkType {
  WIFI = 'wifi',
  CELLULAR = 'cellular',
  ETHERNET = 'ethernet',
  UNKNOWN = 'unknown',
}