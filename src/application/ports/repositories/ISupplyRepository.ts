import { Supply } from '../../../domain/entities/Supply.js';

export interface ISupplyRepository {
  findById(id: string): Promise<Supply | null>;
}

