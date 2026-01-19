import { describe, it, expect } from 'vitest';
import { Work } from '../Work.js';
import { DomainError } from '../../errors/index.js';

describe('Work', () => {
  describe('when creating a valid work', () => {
    it('should create work with valid name', () => {
      const name = 'Residential Building Project';

      const work = Work.create(name);

      expect(work).toBeDefined();
      expect(work.getName()).toBe(name);
      expect(work.getId()).toBeDefined();
      expect(typeof work.getId()).toBe('string');
    });

    it('should create work with custom id', () => {
      const name = 'Residential Building Project';
      const id = 'work-id-123';

      const work = Work.create(name, id);

      expect(work.getId()).toBe(id);
      expect(work.getName()).toBe(name);
    });

    it('should create work with maximum length name (150 characters)', () => {
      const name = 'A'.repeat(150);

      const work = Work.create(name);

      expect(work.getName()).toBe(name);
      expect(work.getName().length).toBe(150);
    });

    it('should trim whitespace from name', () => {
      const nameWithSpaces = '  Residential Building Project  ';

      const work = Work.create(nameWithSpaces);

      expect(work.getName()).toBe('Residential Building Project');
    });
  });

  describe('when creating an invalid work', () => {
    it('should not accept empty name', () => {
      const emptyName = '';

      expect(() => {
        Work.create(emptyName);
      }).toThrow(DomainError);
      expect(() => {
        Work.create(emptyName);
      }).toThrow('Work name cannot be empty');
    });

    it('should not accept name with only spaces', () => {
      const onlySpaces = '   ';

      expect(() => {
        Work.create(onlySpaces);
      }).toThrow(DomainError);
      expect(() => {
        Work.create(onlySpaces);
      }).toThrow('Work name cannot be empty');
    });

    it('should not accept name exceeding 150 characters', () => {
      const longName = 'A'.repeat(151);

      expect(() => {
        Work.create(longName);
      }).toThrow(DomainError);
      expect(() => {
        Work.create(longName);
      }).toThrow('Work name cannot exceed 150 characters');
    });
  });
});

