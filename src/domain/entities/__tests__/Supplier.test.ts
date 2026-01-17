import { describe, it, expect } from 'vitest';
import { Supplier } from '../Supplier.js';
import { DomainError } from '../../errors/index.js';

describe('Supplier', () => {
  describe('when creating a valid supplier', () => {
    it('should create supplier with valid name', () => {
      const name = 'ABC Construction Supplies';

      const supplier = Supplier.create(name);

      expect(supplier).toBeDefined();
      expect(supplier.getName()).toBe(name);
      expect(supplier.getId()).toBeDefined();
      expect(typeof supplier.getId()).toBe('string');
    });

    it('should create supplier with custom id', () => {
      const name = 'ABC Construction Supplies';
      const id = 'supplier-id-123';

      const supplier = Supplier.create(name, id);

      expect(supplier.getId()).toBe(id);
      expect(supplier.getName()).toBe(name);
    });

    it('should create supplier with maximum length name (150 characters)', () => {
      const name = 'A'.repeat(150);

      const supplier = Supplier.create(name);

      expect(supplier.getName()).toBe(name);
      expect(supplier.getName().length).toBe(150);
    });

    it('should trim whitespace from name', () => {
      const nameWithSpaces = '  ABC Construction Supplies  ';

      const supplier = Supplier.create(nameWithSpaces);

      expect(supplier.getName()).toBe('ABC Construction Supplies');
    });
  });

  describe('when creating an invalid supplier', () => {
    it('should not accept empty name', () => {
      const emptyName = '';

      expect(() => {
        Supplier.create(emptyName);
      }).toThrow(DomainError);
      expect(() => {
        Supplier.create(emptyName);
      }).toThrow('Supplier name cannot be empty');
    });

    it('should not accept name with only spaces', () => {
      const onlySpaces = '   ';

      expect(() => {
        Supplier.create(onlySpaces);
      }).toThrow(DomainError);
      expect(() => {
        Supplier.create(onlySpaces);
      }).toThrow('Supplier name cannot be empty');
    });

    it('should not accept name exceeding 150 characters', () => {
      const longName = 'A'.repeat(151);

      expect(() => {
        Supplier.create(longName);
      }).toThrow(DomainError);
      expect(() => {
        Supplier.create(longName);
      }).toThrow('Supplier name cannot exceed 150 characters');
    });
  });
});
