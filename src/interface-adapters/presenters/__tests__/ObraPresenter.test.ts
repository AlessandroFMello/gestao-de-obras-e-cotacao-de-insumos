import { describe, it, expect } from 'vitest';
import { ObraPresenter } from '../ObraPresenter.js';
import type { ObraComMenorPrecoDTO } from '../../../application/dtos/ObraComMenorPrecoDTO.js';

describe('ObraPresenter', () => {
  describe('toGraphQL', () => {
    it('should format ObraComMenorPrecoDTO to GraphQL Work type', () => {
      const dto: ObraComMenorPrecoDTO = {
        workId: 'work-1',
        workName: 'Obra Teste',
        cheapestQuote: {
          unitPrice: 50.0,
          sku: 'CIM-001',
          supplierName: 'Fornecedor A',
        },
        categories: [
          { name: 'Cimento' },
          { name: 'Ferro' },
        ],
        inspections: [
          { status: 'APPROVED', note: 'Test note 1' },
          { status: 'PENDING', note: 'Test note 2' },
        ],
      };

      const result = ObraPresenter.toGraphQL(dto);

      expect(result).toEqual({
        id: 'work-1',
        name: 'Obra Teste',
        cheapestQuote: {
          unitPrice: 50.0,
          sku: 'CIM-001',
          supplier: {
            name: 'Fornecedor A',
          },
        },
        categories: [
          { name: 'Cimento' },
          { name: 'Ferro' },
        ],
        inspections: [
          { status: 'APPROVED', note: 'Test note 1' },
          { status: 'PENDING', note: 'Test note 2' },
        ],
      });
    });

    it('should handle null cheapestQuote', () => {
      const dto: ObraComMenorPrecoDTO = {
        workId: 'work-1',
        workName: 'Obra Teste',
        cheapestQuote: null,
        categories: [],
        inspections: [],
      };

      const result = ObraPresenter.toGraphQL(dto);

      expect(result.cheapestQuote).toBeNull();
      expect(result.categories).toEqual([]);
      expect(result.inspections).toEqual([]);
    });

    it('should handle empty categories and inspections', () => {
      const dto: ObraComMenorPrecoDTO = {
        workId: 'work-1',
        workName: 'Obra Teste',
        cheapestQuote: {
          unitPrice: 50.0,
          sku: 'CIM-001',
          supplierName: 'Fornecedor A',
        },
        categories: [],
        inspections: [],
      };

      const result = ObraPresenter.toGraphQL(dto);

      expect(result.categories).toEqual([]);
      expect(result.inspections).toEqual([]);
      expect(result.cheapestQuote).not.toBeNull();
    });
  });

  describe('toGraphQLArray', () => {
    it('should format multiple ObraComMenorPrecoDTO to GraphQL Work array', () => {
      const dtos: ObraComMenorPrecoDTO[] = [
        {
          workId: 'work-1',
          workName: 'Obra 1',
          cheapestQuote: {
            unitPrice: 50.0,
            sku: 'CIM-001',
            supplierName: 'Fornecedor A',
          },
          categories: [{ name: 'Cimento' }],
          inspections: [],
        },
        {
          workId: 'work-2',
          workName: 'Obra 2',
          cheapestQuote: {
            unitPrice: 30.0,
            sku: 'ARE-001',
            supplierName: 'Fornecedor B',
          },
          categories: [{ name: 'Areia' }],
          inspections: [],
        },
      ];

      const result = ObraPresenter.toGraphQLArray(dtos);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('work-1');
      expect(result[1].id).toBe('work-2');
      expect(result[0].cheapestQuote?.unitPrice).toBe(50.0);
      expect(result[1].cheapestQuote?.unitPrice).toBe(30.0);
    });

    it('should handle multiple works with null cheapestQuote', () => {
      const dtos: ObraComMenorPrecoDTO[] = [
        {
          workId: 'work-1',
          workName: 'Obra 1',
          cheapestQuote: null,
          categories: [],
          inspections: [],
        },
        {
          workId: 'work-2',
          workName: 'Obra 2',
          cheapestQuote: {
            unitPrice: 30.0,
            sku: 'ARE-001',
            supplierName: 'Fornecedor B',
          },
          categories: [],
          inspections: [],
        },
      ];

      const result = ObraPresenter.toGraphQLArray(dtos);

      expect(result).toHaveLength(2);
      expect(result[0].cheapestQuote).toBeNull();
      expect(result[1].cheapestQuote).not.toBeNull();
    });
  });

  describe('quoteToGraphQL', () => {
    it('should throw error when quote is null', () => {
      expect(() => {
        // @ts-expect-error - Testing null case
        ObraPresenter['quoteToGraphQL'](null);
      }).toThrow('Quote cannot be null');
    });
  });

  describe('categoryToGraphQL', () => {
    it('should format category correctly', () => {
      const category = { name: 'Cimento' };
      // @ts-expect-error - Testing private method
      const result = ObraPresenter['categoryToGraphQL'](category);

      expect(result).toEqual({ name: 'Cimento' });
    });
  });

  describe('inspectionToGraphQL', () => {
    it('should format inspection with note', () => {
      const inspection = { status: 'APPROVED', note: 'Test note' };
      // @ts-expect-error - Testing private method
      const result = ObraPresenter['inspectionToGraphQL'](inspection);

      expect(result).toEqual({ status: 'APPROVED', note: 'Test note' });
    });

    it('should format inspection with null note', () => {
      const inspection = { status: 'PENDING', note: null };
      // @ts-expect-error - Testing private method
      const result = ObraPresenter['inspectionToGraphQL'](inspection);

      expect(result).toEqual({ status: 'PENDING', note: null });
    });
  });
});

