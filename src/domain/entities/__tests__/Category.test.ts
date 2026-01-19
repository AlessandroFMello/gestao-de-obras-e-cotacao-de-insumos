import { describe, it, expect } from 'vitest';
import { Category } from '../Category.js';
import { DomainError } from '../../errors/index.js';

describe('Category', () => {
  describe('when creating a valid category', () => {
    it('should create category with valid name', () => {
      const name = 'Construction Materials';

      const category = Category.create(name);

      expect(category).toBeDefined();
      expect(category.getName()).toBe(name);
      expect(category.getId()).toBeDefined();
      expect(typeof category.getId()).toBe('string');
    });

    it('should create category with custom id', () => {
      const name = 'Construction Materials';
      const id = 'custom-id-123';

      const category = Category.create(name, id);

      expect(category.getId()).toBe(id);
      expect(category.getName()).toBe(name);
    });

    it('should create category with maximum length name (100 characters)', () => {
      const name = 'A'.repeat(100);

      const category = Category.create(name);

      expect(category.getName()).toBe(name);
      expect(category.getName().length).toBe(100);
    });
  });

  describe('when creating an invalid category', () => {
    it('should not accept empty name', () => {
      const emptyName = '';

      expect(() => {
        Category.create(emptyName);
      }).toThrow(DomainError);
    });

    it('should not accept name with only spaces', () => {
      const onlySpaces = '   ';

      expect(() => {
        Category.create(onlySpaces);
      }).toThrow(DomainError);
    });

    it('should not accept name exceeding 100 characters', () => {
      const longName = 'A'.repeat(101);

      expect(() => {
        Category.create(longName);
      }).toThrow(DomainError);
    });
  });
});
