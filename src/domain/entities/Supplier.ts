import { DomainError } from '../errors/index.js';
import { randomUUID } from 'crypto';
import { normalizeString } from '../utils/stringNormalizer.js';

export class Supplier {
  private constructor(
    private readonly id: string,
    private readonly name: string
  ) {}

  private static readonly MAX_NAME_LENGTH = 150;

  static create(name: string, id?: string): Supplier {
    const nameTrimmed = name.trim();

    if (!nameTrimmed || nameTrimmed.length === 0) {
      throw new DomainError('Supplier name cannot be empty');
    }

    if (nameTrimmed.length > Supplier.MAX_NAME_LENGTH) {
      throw new DomainError(
        `Supplier name cannot exceed ${Supplier.MAX_NAME_LENGTH} characters`
      );
    }

    // Normalize string to remove accents and special characters
    const nameNormalized = normalizeString(nameTrimmed);

    return new Supplier(id || randomUUID(), nameNormalized);
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }
}

