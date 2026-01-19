import { DomainError } from '../errors/index.js';
import { randomUUID } from 'crypto';
import { normalizeString } from '../utils/stringNormalizer.js';

export class Category {
  private constructor(
    private readonly id: string,
    private readonly name: string
  ) {}

  private static readonly MAX_NAME_LENGTH = 100;

  static create(name: string, id?: string): Category {
    const nameTrimmed = name.trim();

    if (!nameTrimmed || nameTrimmed.length === 0) {
      throw new DomainError('Category name cannot be empty');
    }

    if (nameTrimmed.length > Category.MAX_NAME_LENGTH) {
      throw new DomainError(`Category name cannot exceed ${Category.MAX_NAME_LENGTH} characters`);
    }

    const nameNormalized = normalizeString(nameTrimmed);

    return new Category(id || randomUUID(), nameNormalized);
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }
}
