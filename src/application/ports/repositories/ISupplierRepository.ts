import { Supplier } from '../../../domain/entities/Supplier.js';

export interface ISupplierRepository {
  findById(id: string): Promise<Supplier | null>;
}

