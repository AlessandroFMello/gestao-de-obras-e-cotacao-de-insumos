import { describe, it, expect } from 'vitest';
import { Quote } from '../Quote.js';
import { Supply } from '../Supply.js';
import { Supplier } from '../Supplier.js';
import { Category } from '../Category.js';
import { DomainError } from '../../errors/index.js';

describe('Quote', () => {
  const validCategory = Category.create('Construction Materials');
  const validSupply = Supply.create('Cement CP-II 50kg', 'CP-II', 50.0, validCategory);
  const validSupplier = Supplier.create('ABC Construction Supplies');
  const validSku = 'CEMENT-CPII-50KG-001';
  const validUnitPrice = 26.9;
  const validDeliveryDays = 3;
  const validFrom = new Date('2024-01-01T00:00:00Z');

  describe('when creating a valid quote', () => {
    it('should create quote with valid data (active - validTo null)', () => {
      const validTo = null;

      const quote = Quote.create(
        validSku,
        validUnitPrice,
        validDeliveryDays,
        validFrom,
        validTo,
        validSupply,
        validSupplier
      );

      expect(quote).toBeDefined();
      expect(quote.getSku()).toBe(validSku);
      expect(quote.getUnitPrice()).toBe(validUnitPrice);
      expect(quote.getDeliveryDays()).toBe(validDeliveryDays);
      expect(quote.getValidFrom()).toBe(validFrom);
      expect(quote.getValidTo()).toBeNull();
      expect(quote.getSupply()).toBe(validSupply);
      expect(quote.getSupplier()).toBe(validSupplier);
      expect(quote.getId()).toBeDefined();
      expect(typeof quote.getId()).toBe('string');
    });

    it('should create quote with valid data (historical - with validTo)', () => {
      const validTo = new Date('2024-12-31T23:59:59Z');

      const quote = Quote.create(
        validSku,
        validUnitPrice,
        validDeliveryDays,
        validFrom,
        validTo,
        validSupply,
        validSupplier
      );

      expect(quote.getValidTo()).toBe(validTo);
    });

    it('should create quote with custom id', () => {
      const id = 'quote-id-123';
      const validTo = null;

      const quote = Quote.create(
        validSku,
        validUnitPrice,
        validDeliveryDays,
        validFrom,
        validTo,
        validSupply,
        validSupplier,
        id
      );

      expect(quote.getId()).toBe(id);
    });

    it('should create quote with maximum length SKU (100 characters)', () => {
      const maxSku = 'A'.repeat(100);
      const validTo = null;

      const quote = Quote.create(
        maxSku,
        validUnitPrice,
        validDeliveryDays,
        validFrom,
        validTo,
        validSupply,
        validSupplier
      );

      expect(quote.getSku()).toBe(maxSku);
      expect(quote.getSku().length).toBe(100);
    });

    it('should create quote with zero delivery days', () => {
      const zeroDeliveryDays = 0;
      const validTo = null;

      const quote = Quote.create(
        validSku,
        validUnitPrice,
        zeroDeliveryDays,
        validFrom,
        validTo,
        validSupply,
        validSupplier
      );

      expect(quote.getDeliveryDays()).toBe(0);
    });

    it('should create quote with price with 2 decimal places', () => {
      const priceWithDecimals = 26.99;
      const validTo = null;

      const quote = Quote.create(
        validSku,
        priceWithDecimals,
        validDeliveryDays,
        validFrom,
        validTo,
        validSupply,
        validSupplier
      );

      expect(quote.getUnitPrice()).toBe(26.99);
    });

    it('should trim whitespace from SKU', () => {
      const skuWithSpaces = '  CEMENT-CPII-50KG-001  ';
      const validTo = null;

      const quote = Quote.create(
        skuWithSpaces,
        validUnitPrice,
        validDeliveryDays,
        validFrom,
        validTo,
        validSupply,
        validSupplier
      );

      expect(quote.getSku()).toBe('CEMENT-CPII-50KG-001');
    });
  });

  describe('when checking if quote is active', () => {
    it('should return true when validTo is null (active quote)', () => {
      const validTo = null;
      const quote = Quote.create(
        validSku,
        validUnitPrice,
        validDeliveryDays,
        validFrom,
        validTo,
        validSupply,
        validSupplier
      );

      const isActive = quote.isActive();

      expect(isActive).toBe(true);
    });

    it('should return false when validTo is defined (historical quote)', () => {
      const validTo = new Date('2024-12-31T23:59:59Z');
      const quote = Quote.create(
        validSku,
        validUnitPrice,
        validDeliveryDays,
        validFrom,
        validTo,
        validSupply,
        validSupplier
      );

      const isActive = quote.isActive();

      expect(isActive).toBe(false);
    });
  });

  describe('when creating an invalid quote', () => {
    it('should not accept empty SKU', () => {
      const emptySku = '';
      const validTo = null;

      expect(() => {
        Quote.create(
          emptySku,
          validUnitPrice,
          validDeliveryDays,
          validFrom,
          validTo,
          validSupply,
          validSupplier
        );
      }).toThrow(DomainError);
      expect(() => {
        Quote.create(
          emptySku,
          validUnitPrice,
          validDeliveryDays,
          validFrom,
          validTo,
          validSupply,
          validSupplier
        );
      }).toThrow('Quote SKU cannot be empty');
    });

    it('should not accept SKU with only spaces', () => {
      const onlySpaces = '   ';
      const validTo = null;

      expect(() => {
        Quote.create(
          onlySpaces,
          validUnitPrice,
          validDeliveryDays,
          validFrom,
          validTo,
          validSupply,
          validSupplier
        );
      }).toThrow(DomainError);
    });

    it('should not accept SKU exceeding 100 characters', () => {
      const longSku = 'A'.repeat(101);
      const validTo = null;

      expect(() => {
        Quote.create(
          longSku,
          validUnitPrice,
          validDeliveryDays,
          validFrom,
          validTo,
          validSupply,
          validSupplier
        );
      }).toThrow(DomainError);
      expect(() => {
        Quote.create(
          longSku,
          validUnitPrice,
          validDeliveryDays,
          validFrom,
          validTo,
          validSupply,
          validSupplier
        );
      }).toThrow('Quote SKU cannot exceed 100 characters');
    });

    it('should not accept zero unit price', () => {
      const zeroPrice = 0;
      const validTo = null;

      expect(() => {
        Quote.create(
          validSku,
          zeroPrice,
          validDeliveryDays,
          validFrom,
          validTo,
          validSupply,
          validSupplier
        );
      }).toThrow(DomainError);
      expect(() => {
        Quote.create(
          validSku,
          zeroPrice,
          validDeliveryDays,
          validFrom,
          validTo,
          validSupply,
          validSupplier
        );
      }).toThrow('Quote unit price must be greater than zero');
    });

    it('should not accept negative unit price', () => {
      const negativePrice = -10.5;
      const validTo = null;

      expect(() => {
        Quote.create(
          validSku,
          negativePrice,
          validDeliveryDays,
          validFrom,
          validTo,
          validSupply,
          validSupplier
        );
      }).toThrow(DomainError);
      expect(() => {
        Quote.create(
          validSku,
          negativePrice,
          validDeliveryDays,
          validFrom,
          validTo,
          validSupply,
          validSupplier
        );
      }).toThrow('Quote unit price must be greater than zero');
    });

    it('should not accept negative delivery days', () => {
      const negativeDays = -1;
      const validTo = null;

      expect(() => {
        Quote.create(
          validSku,
          validUnitPrice,
          negativeDays,
          validFrom,
          validTo,
          validSupply,
          validSupplier
        );
      }).toThrow(DomainError);
      expect(() => {
        Quote.create(
          validSku,
          validUnitPrice,
          negativeDays,
          validFrom,
          validTo,
          validSupply,
          validSupplier
        );
      }).toThrow('Quote delivery days cannot be negative');
    });

    it('should not accept null supply', () => {
      const nullSupply = null as unknown as Supply;
      const validTo = null;

      expect(() => {
        Quote.create(
          validSku,
          validUnitPrice,
          validDeliveryDays,
          validFrom,
          validTo,
          nullSupply,
          validSupplier
        );
      }).toThrow(DomainError);
      expect(() => {
        Quote.create(
          validSku,
          validUnitPrice,
          validDeliveryDays,
          validFrom,
          validTo,
          nullSupply,
          validSupplier
        );
      }).toThrow('Quote must have a supply');
    });

    it('should not accept null supplier', () => {
      const nullSupplier = null as unknown as Supplier;
      const validTo = null;

      expect(() => {
        Quote.create(
          validSku,
          validUnitPrice,
          validDeliveryDays,
          validFrom,
          validTo,
          validSupply,
          nullSupplier
        );
      }).toThrow(DomainError);
      expect(() => {
        Quote.create(
          validSku,
          validUnitPrice,
          validDeliveryDays,
          validFrom,
          validTo,
          validSupply,
          nullSupplier
        );
      }).toThrow('Quote must have a supplier');
    });

    it('should not accept null validFrom', () => {
      const nullValidFrom = null as unknown as Date;
      const validTo = null;

      expect(() => {
        Quote.create(
          validSku,
          validUnitPrice,
          validDeliveryDays,
          nullValidFrom,
          validTo,
          validSupply,
          validSupplier
        );
      }).toThrow(DomainError);
      expect(() => {
        Quote.create(
          validSku,
          validUnitPrice,
          validDeliveryDays,
          nullValidFrom,
          validTo,
          validSupply,
          validSupplier
        );
      }).toThrow('Quote validFrom date is required');
    });

    it('should not accept validTo before validFrom', () => {
      const validToBefore = new Date('2023-12-31T23:59:59Z');

      expect(() => {
        Quote.create(
          validSku,
          validUnitPrice,
          validDeliveryDays,
          validFrom,
          validToBefore,
          validSupply,
          validSupplier
        );
      }).toThrow(DomainError);
      expect(() => {
        Quote.create(
          validSku,
          validUnitPrice,
          validDeliveryDays,
          validFrom,
          validToBefore,
          validSupply,
          validSupplier
        );
      }).toThrow('Quote validTo date must be after validFrom date');
    });

    it('should not accept validTo equal to validFrom', () => {
      const validToEqual = new Date(validFrom);

      expect(() => {
        Quote.create(
          validSku,
          validUnitPrice,
          validDeliveryDays,
          validFrom,
          validToEqual,
          validSupply,
          validSupplier
        );
      }).toThrow(DomainError);
      expect(() => {
        Quote.create(
          validSku,
          validUnitPrice,
          validDeliveryDays,
          validFrom,
          validToEqual,
          validSupply,
          validSupplier
        );
      }).toThrow('Quote validTo date must be after validFrom date');
    });
  });
});
