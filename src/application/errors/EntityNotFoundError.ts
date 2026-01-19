import { ApplicationError } from './ApplicationError.js';

export class EntityNotFoundError extends ApplicationError {
  constructor(entityName: string, id: string) {
    super(`${entityName} with id "${id}" not found`);
    this.name = 'EntityNotFoundError';
    Object.setPrototypeOf(this, EntityNotFoundError.prototype);
  }
}

