/**
 * Tests for create command
 */

import { isValidProjectName, isValidPackageName } from '@jetstart/shared';

describe('Create Command', () => {
  describe('Project name validation', () => {
    it('should accept valid project names', () => {
      expect(isValidProjectName('myApp')).toBe(true);
      expect(isValidProjectName('MyProject123')).toBe(true);
      expect(isValidProjectName('test-app')).toBe(true);
    });

    it('should reject invalid project names', () => {
      expect(isValidProjectName('123app')).toBe(false);
      expect(isValidProjectName('my app')).toBe(false);
      expect(isValidProjectName('')).toBe(false);
    });
  });

  describe('Package name validation', () => {
    it('should accept valid package names', () => {
      expect(isValidPackageName('com.example.app')).toBe(true);
      expect(isValidPackageName('com.company.myapp')).toBe(true);
    });

    it('should reject invalid package names', () => {
      expect(isValidPackageName('InvalidName')).toBe(false);
      expect(isValidPackageName('com')).toBe(false);
    });
  });
});