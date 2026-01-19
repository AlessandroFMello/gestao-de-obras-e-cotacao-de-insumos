import { Quote } from '../../../domain/entities/Quote.js';

export interface ICotacaoWriteRepository {
  save(quote: Quote): Promise<void>;
  findActiveBySupplyAndSupplier(supplyId: string, supplierId: string): Promise<Quote | null>;
  update(quote: Quote): Promise<void>;
}

