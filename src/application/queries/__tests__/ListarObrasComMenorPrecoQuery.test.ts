import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListarObrasComMenorPrecoQuery } from '../ListarObrasComMenorPrecoQuery.js';
import type { ICotacaoReadRepository } from '../../ports/queries/ICotacaoReadRepository.js';
import type { IWorkReadRepository } from '../../ports/queries/IWorkReadRepository.js';

describe('ListarObrasComMenorPrecoQuery', () => {
  let query: ListarObrasComMenorPrecoQuery;
  let workReadRepository: IWorkReadRepository;
  let cotacaoReadRepository: ICotacaoReadRepository;

  beforeEach(() => {
    workReadRepository = {
      findAllWithSupplies: vi.fn(),
      findCategoriesByWorkId: vi.fn(),
      findInspectionsByWorkId: vi.fn(),
    };
    cotacaoReadRepository = {
      findCheapestBySupplyId: vi.fn(),
      findCheapestByWorkId: vi.fn(),
    };
    query = new ListarObrasComMenorPrecoQuery(workReadRepository, cotacaoReadRepository);
  });

  it('should return work with cheapest quote, categories and inspections', async () => {
    const mockWork = [
      {
        workId: 'work-1',
        workName: 'Obra Alpha',
        supplyIds: ['supply-1', 'supply-2'],
      },
    ];

    const mockCheapestQuote = {
      unitPrice: 25.4,
      sku: 'CIM-CPII-50-B',
      supplierName: 'Fornecedor B',
    };

    const mockCategories = [
      { name: 'Cimento' },
      { name: 'Areia' },
    ];

    const mockInspections = [
      { status: 'APPROVED', note: 'Test note 1' },
      { status: 'PENDING', note: 'Test note 2' },
    ];

    vi.mocked(workReadRepository.findAllWithSupplies).mockResolvedValue(mockWork);
    vi.mocked(cotacaoReadRepository.findCheapestByWorkId).mockResolvedValue(mockCheapestQuote);
    vi.mocked(workReadRepository.findCategoriesByWorkId).mockResolvedValue(mockCategories);
    vi.mocked(workReadRepository.findInspectionsByWorkId).mockResolvedValue(mockInspections);

    const result = await query.execute();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      workId: 'work-1',
      workName: 'Obra Alpha',
      cheapestQuote: mockCheapestQuote,
      categories: mockCategories,
      inspections: mockInspections,
    });
    expect(workReadRepository.findAllWithSupplies).toHaveBeenCalledWith(undefined);
    expect(cotacaoReadRepository.findCheapestByWorkId).toHaveBeenCalledWith('work-1');
    expect(workReadRepository.findCategoriesByWorkId).toHaveBeenCalledWith('work-1');
    expect(workReadRepository.findInspectionsByWorkId).toHaveBeenCalledWith('work-1');
  });

  it('should handle null cheapestQuote', async () => {
    const mockWork = [
      {
        workId: 'work-1',
        workName: 'Obra Alpha',
        supplyIds: ['supply-1'],
      },
    ];

    vi.mocked(workReadRepository.findAllWithSupplies).mockResolvedValue(mockWork);
    vi.mocked(cotacaoReadRepository.findCheapestByWorkId).mockResolvedValue(null);
    vi.mocked(workReadRepository.findCategoriesByWorkId).mockResolvedValue([]);
    vi.mocked(workReadRepository.findInspectionsByWorkId).mockResolvedValue([]);

    const result = await query.execute();

    expect(result).toHaveLength(1);
    expect(result[0].cheapestQuote).toBeNull();
    expect(result[0].categories).toEqual([]);
    expect(result[0].inspections).toEqual([]);
  });

  it('should not return works without supplies', async () => {
    const mockWork = [
      {
        workId: 'work-1',
        workName: 'Obra Alpha',
        supplyIds: [],
      },
    ];

    vi.mocked(workReadRepository.findAllWithSupplies).mockResolvedValue(mockWork);

    const result = await query.execute();

    expect(result).toHaveLength(0);
    expect(cotacaoReadRepository.findCheapestByWorkId).not.toHaveBeenCalled();
  });

  it('should return multiple works correctly', async () => {
    const mockWorks = [
      {
        workId: 'work-1',
        workName: 'Obra Alpha',
        supplyIds: ['supply-1'],
      },
      {
        workId: 'work-2',
        workName: 'Obra Beta',
        supplyIds: ['supply-2'],
      },
    ];

    const mockCheapestQuote1 = {
      unitPrice: 25.4,
      sku: 'CIM-CPII-50-B',
      supplierName: 'Fornecedor B',
    };

    const mockCheapestQuote2 = {
      unitPrice: 120.0,
      sku: 'ARE-MED-A',
      supplierName: 'Fornecedor A',
    };

    vi.mocked(workReadRepository.findAllWithSupplies).mockResolvedValue(mockWorks);
    vi.mocked(cotacaoReadRepository.findCheapestByWorkId)
      .mockResolvedValueOnce(mockCheapestQuote1)
      .mockResolvedValueOnce(mockCheapestQuote2);
    vi.mocked(workReadRepository.findCategoriesByWorkId)
      .mockResolvedValueOnce([{ name: 'Cimento' }])
      .mockResolvedValueOnce([{ name: 'Areia' }]);
    vi.mocked(workReadRepository.findInspectionsByWorkId)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const result = await query.execute();

    expect(result).toHaveLength(2);
    expect(result[0].workId).toBe('work-1');
    expect(result[0].cheapestQuote).toEqual(mockCheapestQuote1);
    expect(result[1].workId).toBe('work-2');
    expect(result[1].cheapestQuote).toEqual(mockCheapestQuote2);
  });

  it('should respect limit parameter', async () => {
    const limit = 2;
    vi.mocked(workReadRepository.findAllWithSupplies).mockResolvedValue([]);

    await query.execute(limit);

    expect(workReadRepository.findAllWithSupplies).toHaveBeenCalledWith(limit);
  });
});
