import { DomainError } from '../errors/index.js';
import { randomUUID } from 'crypto';
import { Supply } from './Supply.js';
import { Supplier } from './Supplier.js';
import { normalizeString } from '../utils/stringNormalizer.js';

export class Quote {
  private constructor(
    private readonly id: string,
    private readonly sku: string,
    private readonly unitPrice: number,
    private readonly deliveryDays: number,
    private readonly validFrom: Date,
    private readonly validTo: Date | null,
    private readonly supply: Supply,
    private readonly supplier: Supplier
  ) {}

  private static readonly MAX_SKU_LENGTH = 100;

  static create(
    sku: string,
    unitPrice: number,
    deliveryDays: number,
    validFrom: Date,
    validTo: Date | null,
    supply: Supply,
    supplier: Supplier,
    id?: string
  ): Quote {
    const skuTrimmed = sku.trim();

    if (!skuTrimmed || skuTrimmed.length === 0) {
      throw new DomainError('Quote SKU cannot be empty');
    }

    if (skuTrimmed.length > Quote.MAX_SKU_LENGTH) {
      throw new DomainError(
        `Quote SKU cannot exceed ${Quote.MAX_SKU_LENGTH} characters`
      );
    }

    if (unitPrice <= 0) {
      throw new DomainError('Quote unit price must be greater than zero');
    }

    if (deliveryDays < 0) {
      throw new DomainError('Quote delivery days cannot be negative');
    }

    if (!validFrom) {
      throw new DomainError('Quote validFrom date is required');
    }

    if (validTo && validTo <= validFrom) {
      throw new DomainError('Quote validTo date must be after validFrom date');
    }

    if (!supply) {
      throw new DomainError('Quote must have a supply');
    }

    if (!supplier) {
      throw new DomainError('Quote must have a supplier');
    }

    // Normalize string to remove accents and special characters
    const skuNormalized = normalizeString(skuTrimmed);

    return new Quote(
      id || randomUUID(),
      skuNormalized,
      unitPrice,
      deliveryDays,
      validFrom,
      validTo,
      supply,
      supplier
    );
  }

  getId(): string {
    return this.id;
  }

  getSku(): string {
    return this.sku;
  }

  getUnitPrice(): number {
    return this.unitPrice;
  }

  getDeliveryDays(): number {
    return this.deliveryDays;
  }

  getValidFrom(): Date {
    return this.validFrom;
  }

  getValidTo(): Date | null {
    return this.validTo;
  }

  getSupply(): Supply {
    return this.supply;
  }

  getSupplier(): Supplier {
    return this.supplier;
  }

  isActive(): boolean {
    return this.validTo === null;
  }
}

