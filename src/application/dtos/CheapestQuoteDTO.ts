/**
 * DTO for the cheapest quote across all supplies of a work
 */
export type CheapestQuoteDTO = {
  unitPrice: number;
  sku: string;
  supplierName: string;
} | null;

