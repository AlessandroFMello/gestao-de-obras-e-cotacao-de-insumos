import { describe, it, expect } from 'vitest';
import { CotacaoPresenter } from '../CotacaoPresenter.js';
import type { CreateCotacaoOutput } from '../../../application/dtos/CreateCotacaoOutput.js';

describe('CotacaoPresenter', () => {
  describe('toGraphQL', () => {
    it('should format CreateCotacaoOutput to GraphQL Cotacao type', () => {
      const dto: CreateCotacaoOutput = {
        id: 'quote-1',
        sku: 'CIM-001',
        unitPrice: 50.0,
        deliveryDays: 5,
        validFrom: new Date('2024-01-01T00:00:00Z'),
        validTo: null,
        supplyId: 'supply-1',
        supplierId: 'supplier-1',
      };

      const result = CotacaoPresenter.toGraphQL(dto);

      expect(result).toEqual({
        id: 'quote-1',
        sku: 'CIM-001',
        unitPrice: 50.0,
        deliveryDays: 5,
        validFrom: '2024-01-01T00:00:00.000Z',
        validTo: null,
        supplyId: 'supply-1',
        supplierId: 'supplier-1',
      });
    });

    it('should format dates as ISO strings', () => {
      const validFrom = new Date('2024-01-01T10:30:00Z');
      const validTo = new Date('2024-12-31T23:59:59Z');

      const dto: CreateCotacaoOutput = {
        id: 'quote-1',
        sku: 'CIM-001',
        unitPrice: 50.0,
        deliveryDays: 5,
        validFrom,
        validTo,
        supplyId: 'supply-1',
        supplierId: 'supplier-1',
      };

      const result = CotacaoPresenter.toGraphQL(dto);

      expect(result.validFrom).toBe(validFrom.toISOString());
      expect(result.validTo).toBe(validTo.toISOString());
    });

    it('should handle null validTo correctly', () => {
      const dto: CreateCotacaoOutput = {
        id: 'quote-1',
        sku: 'CIM-001',
        unitPrice: 50.0,
        deliveryDays: 5,
        validFrom: new Date('2024-01-01T00:00:00Z'),
        validTo: null,
        supplyId: 'supply-1',
        supplierId: 'supplier-1',
      };

      const result = CotacaoPresenter.toGraphQL(dto);

      expect(result.validTo).toBeNull();
    });
  });
});

