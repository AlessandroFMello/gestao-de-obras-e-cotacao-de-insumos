import { DomainError } from '../errors/index.js';
import { randomUUID } from 'crypto';

export class Work {
  private constructor(
    private readonly id: string,
    private readonly name: string
  ) {}

  private static readonly MAX_NAME_LENGTH = 150;

  static create(name: string, id?: string): Work {
    const nameTrimmed = name.trim();

    if (!nameTrimmed || nameTrimmed.length === 0) {
      throw new DomainError('Work name cannot be empty');
    }

    if (nameTrimmed.length > Work.MAX_NAME_LENGTH) {
      throw new DomainError(
        `Work name cannot exceed ${Work.MAX_NAME_LENGTH} characters`
      );
    }

    return new Work(id || randomUUID(), nameTrimmed);
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }
}

