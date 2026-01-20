import type { CreateCotacaoOutput } from '../../application/dtos/CreateCotacaoOutput.js';

/**
 * GraphQL output type for Cotacao (Quote)
 */
export type CotacaoGraphQL = {
  id: string;
  sku: string;
  unitPrice: number;
  deliveryDays: number;
  validFrom: string; // ISO date string
  validTo: string | null; // ISO date string or null
  supplyId: string;
  supplierId: string;
};

/**
 * Presenter for formatting Cotacao (Quote) data to GraphQL format
 */
export class CotacaoPresenter {
  /**
   * Formats CreateCotacaoOutput to GraphQL Cotacao type
   */
  static toGraphQL(dto: CreateCotacaoOutput): CotacaoGraphQL {
    return {
      id: dto.id,
      sku: dto.sku,
      unitPrice: dto.unitPrice,
      deliveryDays: dto.deliveryDays,
      validFrom: dto.validFrom.toISOString(),
      validTo: dto.validTo ? dto.validTo.toISOString() : null,
      supplyId: dto.supplyId,
      supplierId: dto.supplierId,
    };
  }
}

