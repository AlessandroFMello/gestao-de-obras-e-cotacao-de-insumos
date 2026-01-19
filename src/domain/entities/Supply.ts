import { DomainError } from '../errors/index.js';
import { randomUUID } from 'crypto';
import { Category } from './Category.js';

export class Supply {
  private constructor(
    private readonly id: string,
    private readonly name: string,
    private readonly type: string,
    private readonly weightKg: number,
    private readonly category: Category
  ) {}

  private static readonly MAX_NAME_LENGTH = 150;
  private static readonly MAX_TYPE_LENGTH = 50;

  static create(
    name: string,
    type: string,
    weightKg: number,
    category: Category,
    id?: string
  ): Supply {
    const nameTrimmed = name.trim();
    const typeTrimmed = type.trim();

    if (!nameTrimmed || nameTrimmed.length === 0) {
      throw new DomainError('Supply name cannot be empty');
    }

    if (nameTrimmed.length > Supply.MAX_NAME_LENGTH) {
      throw new DomainError(
        `Supply name cannot exceed ${Supply.MAX_NAME_LENGTH} characters`
      );
    }

    if (!typeTrimmed || typeTrimmed.length === 0) {
      throw new DomainError('Supply type cannot be empty');
    }

    if (typeTrimmed.length > Supply.MAX_TYPE_LENGTH) {
      throw new DomainError(
        `Supply type cannot exceed ${Supply.MAX_TYPE_LENGTH} characters`
      );
    }

    if (weightKg <= 0) {
      throw new DomainError('Supply weight must be greater than zero');
    }

    if (!category) {
      throw new DomainError('Supply must have a category');
    }

    return new Supply(
      id || randomUUID(),
      nameTrimmed,
      typeTrimmed,
      weightKg,
      category
    );
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getType(): string {
    return this.type;
  }

  getWeightKg(): number {
    return this.weightKg;
  }

  getCategory(): Category {
    return this.category;
  }
}

