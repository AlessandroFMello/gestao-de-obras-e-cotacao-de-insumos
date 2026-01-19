import { describe, it, expect } from 'vitest';
import { Supply } from '../Supply.js';
import { Category } from '../Category.js';
import { DomainError } from '../../errors/index.js';

describe('Supply', () => {
  const validCategory = Category.create('Construction Materials');

  describe('when creating a valid supply', () => {
    it('should create supply with valid data', () => {
      const name = 'Cement CP-II 50kg';
      const type = 'CP-II';
      const weightKg = 50.0;

      const supply = Supply.create(name, type, weightKg, validCategory);

      expect(supply).toBeDefined();
      expect(supply.getName()).toBe(name);
      expect(supply.getType()).toBe(type);
      expect(supply.getWeightKg()).toBe(weightKg);
      expect(supply.getCategory()).toBe(validCategory);
      expect(supply.getId()).toBeDefined();
      expect(typeof supply.getId()).toBe('string');
    });

    it('should create supply with custom id', () => {
      const name = 'Cement CP-II 50kg';
      const type = 'CP-II';
      const weightKg = 50.0;
      const id = 'supply-id-123';

      const supply = Supply.create(name, type, weightKg, validCategory, id);

      expect(supply.getId()).toBe(id);
      expect(supply.getName()).toBe(name);
    });

    it('should create supply with maximum length name (150 characters)', () => {
      const name = 'A'.repeat(150);
      const type = 'CP-II';
      const weightKg = 50.0;

      const supply = Supply.create(name, type, weightKg, validCategory);

      expect(supply.getName()).toBe(name);
      expect(supply.getName().length).toBe(150);
    });

    it('should create supply with maximum length type (50 characters)', () => {
      const name = 'Cement';
      const type = 'A'.repeat(50);
      const weightKg = 50.0;

      const supply = Supply.create(name, type, weightKg, validCategory);

      expect(supply.getType()).toBe(type);
      expect(supply.getType().length).toBe(50);
    });

    it('should create supply with weight with 2 decimal places', () => {
      const name = 'Cement';
      const type = 'CP-II';
      const weightKg = 50.99;

      const supply = Supply.create(name, type, weightKg, validCategory);

      expect(supply.getWeightKg()).toBe(50.99);
    });

    it('should trim whitespace from name and type', () => {
      const nameWithSpaces = '  Cement CP-II 50kg  ';
      const typeWithSpaces = '  CP-II  ';
      const weightKg = 50.0;

      const supply = Supply.create(nameWithSpaces, typeWithSpaces, weightKg, validCategory);

      expect(supply.getName()).toBe('Cement CP-II 50kg');
      expect(supply.getType()).toBe('CP-II');
    });
  });

  describe('when creating an invalid supply', () => {
    it('should not accept empty name', () => {
      const emptyName = '';
      const type = 'CP-II';
      const weightKg = 50.0;

      expect(() => {
        Supply.create(emptyName, type, weightKg, validCategory);
      }).toThrow(DomainError);
      expect(() => {
        Supply.create(emptyName, type, weightKg, validCategory);
      }).toThrow('Supply name cannot be empty');
    });

    it('should not accept name with only spaces', () => {
      const onlySpaces = '   ';
      const type = 'CP-II';
      const weightKg = 50.0;

      expect(() => {
        Supply.create(onlySpaces, type, weightKg, validCategory);
      }).toThrow(DomainError);
    });

    it('should not accept name exceeding 150 characters', () => {
      const longName = 'A'.repeat(151);
      const type = 'CP-II';
      const weightKg = 50.0;

      expect(() => {
        Supply.create(longName, type, weightKg, validCategory);
      }).toThrow(DomainError);
      expect(() => {
        Supply.create(longName, type, weightKg, validCategory);
      }).toThrow('Supply name cannot exceed 150 characters');
    });

    it('should not accept empty type', () => {
      const name = 'Cement';
      const emptyType = '';
      const weightKg = 50.0;

      expect(() => {
        Supply.create(name, emptyType, weightKg, validCategory);
      }).toThrow(DomainError);
      expect(() => {
        Supply.create(name, emptyType, weightKg, validCategory);
      }).toThrow('Supply type cannot be empty');
    });

    it('should not accept type with only spaces', () => {
      const name = 'Cement';
      const onlySpaces = '   ';
      const weightKg = 50.0;

      expect(() => {
        Supply.create(name, onlySpaces, weightKg, validCategory);
      }).toThrow(DomainError);
    });

    it('should not accept type exceeding 50 characters', () => {
      const name = 'Cement';
      const longType = 'A'.repeat(51);
      const weightKg = 50.0;

      expect(() => {
        Supply.create(name, longType, weightKg, validCategory);
      }).toThrow(DomainError);
      expect(() => {
        Supply.create(name, longType, weightKg, validCategory);
      }).toThrow('Supply type cannot exceed 50 characters');
    });

    it('should not accept zero weight', () => {
      const name = 'Cement';
      const type = 'CP-II';
      const zeroWeight = 0;

      expect(() => {
        Supply.create(name, type, zeroWeight, validCategory);
      }).toThrow(DomainError);
      expect(() => {
        Supply.create(name, type, zeroWeight, validCategory);
      }).toThrow('Supply weight must be greater than zero');
    });

    it('should not accept negative weight', () => {
      const name = 'Cement';
      const type = 'CP-II';
      const negativeWeight = -10.5;

      expect(() => {
        Supply.create(name, type, negativeWeight, validCategory);
      }).toThrow(DomainError);
      expect(() => {
        Supply.create(name, type, negativeWeight, validCategory);
      }).toThrow('Supply weight must be greater than zero');
    });

    it('should not accept null category', () => {
      const name = 'Cement';
      const type = 'CP-II';
      const weightKg = 50.0;
      const nullCategory = null as unknown as Category;

      expect(() => {
        Supply.create(name, type, weightKg, nullCategory);
      }).toThrow(DomainError);
      expect(() => {
        Supply.create(name, type, weightKg, nullCategory);
      }).toThrow('Supply must have a category');
    });
  });

  describe('string normalization', () => {
    it('should normalize name by removing accents', () => {
      const supply = Supply.create('Tábua Pinus', 'Metro Linear', 8.5, validCategory);

      expect(supply.getName()).toBe('Tabua Pinus');
    });

    it('should normalize type by removing accents', () => {
      const supply = Supply.create('Tijolo', 'Cerâmico', 2.5, validCategory);

      expect(supply.getType()).toBe('Ceramico');
    });

    it('should normalize both name and type', () => {
      const supply = Supply.create('Tábua Cerâmica', 'Metro Linear', 8.5, validCategory);

      expect(supply.getName()).toBe('Tabua Ceramica');
      expect(supply.getType()).toBe('Metro Linear');
    });
  });
});
