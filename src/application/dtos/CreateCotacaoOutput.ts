export interface CreateCotacaoOutput {
  id: string;
  sku: string;
  unitPrice: number;
  deliveryDays: number;
  validFrom: Date;
  validTo: Date | null;
  supplyId: string;
  supplierId: string;
}

