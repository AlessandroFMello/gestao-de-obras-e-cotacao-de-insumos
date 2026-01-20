import type { ObraComMenorPrecoDTO } from '../../application/dtos/ObraComMenorPrecoDTO.js';
import type { CheapestQuoteDTO } from '../../application/dtos/CheapestQuoteDTO.js';
import type { CategoryDTO } from '../../application/dtos/CategoryDTO.js';
import type { InspectionDTO } from '../../application/dtos/InspectionDTO.js';

/**
 * GraphQL output types for Work (Obra)
 */
export type WorkGraphQL = {
  id: string;
  name: string;
  cheapestQuote: CheapestQuoteGraphQL | null;
  categories: CategoryGraphQL[];
  inspections: InspectionGraphQL[];
};

/**
 * GraphQL output type for cheapest quote
 */
export type CheapestQuoteGraphQL = {
  unitPrice: number;
  sku: string;
  supplier: SupplierGraphQL;
};

/**
 * GraphQL output type for supplier
 */
export type SupplierGraphQL = {
  name: string;
};

/**
 * GraphQL output type for category
 */
export type CategoryGraphQL = {
  name: string;
};

/**
 * GraphQL output type for inspection
 */
export type InspectionGraphQL = {
  status: string;
  note: string | null;
};

/**
 * Presenter for formatting Work (Obra) data to GraphQL format
 */
export class ObraPresenter {
  /**
   * Formats ObraComMenorPrecoDTO to GraphQL Work type
   */
  static toGraphQL(dto: ObraComMenorPrecoDTO): WorkGraphQL {
    return {
      id: dto.workId,
      name: dto.workName,
      cheapestQuote: dto.cheapestQuote ? this.quoteToGraphQL(dto.cheapestQuote) : null,
      categories: dto.categories.map((cat) => this.categoryToGraphQL(cat)),
      inspections: dto.inspections.map((insp) => this.inspectionToGraphQL(insp)),
    };
  }

  /**
   * Formats multiple ObraComMenorPrecoDTO to GraphQL Work array
   */
  static toGraphQLArray(dtos: ObraComMenorPrecoDTO[]): WorkGraphQL[] {
    return dtos.map((dto) => this.toGraphQL(dto));
  }

  private static quoteToGraphQL(quote: CheapestQuoteDTO): CheapestQuoteGraphQL {
    if (!quote) {
      throw new Error('Quote cannot be null');
    }

    return {
      unitPrice: quote.unitPrice,
      sku: quote.sku,
      supplier: {
        name: quote.supplierName,
      },
    };
  }

  private static categoryToGraphQL(category: CategoryDTO): CategoryGraphQL {
    return {
      name: category.name,
    };
  }

  private static inspectionToGraphQL(inspection: InspectionDTO): InspectionGraphQL {
    return {
      status: inspection.status,
      note: inspection.note,
    };
  }
}
