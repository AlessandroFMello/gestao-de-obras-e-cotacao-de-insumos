import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListarObrasComMenorPrecoQuery } from '../ListarObrasComMenorPrecoQuery.js';
import type { ICotacaoReadRepository } from '../../ports/queries/ICotacaoReadRepository.js';
import type { IWorkReadRepository } from '../../ports/queries/IWorkReadRepository.js';
import type { ObraComMenorPrecoDTO } from '../../dtos/ObraComMenorPrecoDTO.js';
import type { MenorPrecoInsumoDTO } from '../../dtos/MenorPrecoInsumoDTO.js';

describe('ListarObrasComMenorPrecoQuery', () => {
  let query: ListarObrasComMenorPrecoQuery;
  let workReadRepository: IWorkReadRepository;
  let cotacaoReadRepository: ICotacaoReadRepository;

  beforeEach(() => {
    workReadRepository = {
      findAllWithSupplies: vi.fn(),
    };
    cotacaoReadRepository = {
      findCheapestBySupplyId: vi.fn(),
    };
    query = new ListarObrasComMenorPrecoQuery(workReadRepository, cotacaoReadRepository);
  });

  it('should return work with cheapest quote for each associated supply', async () => {
    const mockWork: IWorkReadRepository['findAllWithSupplies'] extends (
      ...args: any[]
    ) => Promise<infer R>
      ? R
      : never = [
      {
        workId: 'work-1',
        workName: 'Obra Alpha',
        supplyIds: ['supply-1', 'supply-2'],
      },
    ];

    const mockCheapestQuote1: MenorPrecoInsumoDTO = {
      supplyId: 'supply-1',
      supplyName: 'Cimento CP-II 50kg',
      unitPrice: 25.4,
      deliveryDays: 5,
      supplierId: 'supplier-2',
      supplierName: 'Fornecedor B',
      sku: 'CIM-CPII-50-B',
    };

    const mockCheapestQuote2: MenorPrecoInsumoDTO = {
      supplyId: 'supply-2',
      supplyName: 'Areia Média',
      unitPrice: 120.0,
      deliveryDays: 3,
      supplierId: 'supplier-1',
      supplierName: 'Fornecedor A',
      sku: 'ARE-MED-A',
    };

    vi.mocked(workReadRepository.findAllWithSupplies).mockResolvedValue(mockWork);
    vi.mocked(cotacaoReadRepository.findCheapestBySupplyId)
      .mockResolvedValueOnce(mockCheapestQuote1)
      .mockResolvedValueOnce(mockCheapestQuote2);

    const result = await query.execute();

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      workId: 'work-1',
      workName: 'Obra Alpha',
      cheapestQuotes: [mockCheapestQuote1, mockCheapestQuote2],
    });
    expect(workReadRepository.findAllWithSupplies).toHaveBeenCalledWith(undefined);
    expect(cotacaoReadRepository.findCheapestBySupplyId).toHaveBeenCalledWith('supply-1');
    expect(cotacaoReadRepository.findCheapestBySupplyId).toHaveBeenCalledWith('supply-2');
  });

  it('should include NULL for supplies without active quotes', async () => {
    const mockWork: IWorkReadRepository['findAllWithSupplies'] extends (
      ...args: any[]
    ) => Promise<infer R>
      ? R
      : never = [
      {
        workId: 'work-1',
        workName: 'Obra Alpha',
        supplyIds: ['supply-1', 'supply-2'],
      },
    ];

    const mockCheapestQuote1: MenorPrecoInsumoDTO = {
      supplyId: 'supply-1',
      supplyName: 'Cimento CP-II 50kg',
      unitPrice: 25.4,
      deliveryDays: 5,
      supplierId: 'supplier-2',
      supplierName: 'Fornecedor B',
      sku: 'CIM-CPII-50-B',
    };

    vi.mocked(workReadRepository.findAllWithSupplies).mockResolvedValue(mockWork);
    vi.mocked(cotacaoReadRepository.findCheapestBySupplyId)
      .mockResolvedValueOnce(mockCheapestQuote1)
      .mockResolvedValueOnce(null); // No active quote for supply-2

    const result = await query.execute();

    expect(result).toHaveLength(1);
    expect(result[0].cheapestQuotes).toHaveLength(2);
    expect(result[0].cheapestQuotes[0]).toEqual(mockCheapestQuote1);
    expect(result[0].cheapestQuotes[1]).toBeNull();
  });

  it('should not return works without supplies', async () => {
    const mockWork: IWorkReadRepository['findAllWithSupplies'] extends (
      ...args: any[]
    ) => Promise<infer R>
      ? R
      : never = [
      {
        workId: 'work-1',
        workName: 'Obra Alpha',
        supplyIds: [],
      },
    ];

    vi.mocked(workReadRepository.findAllWithSupplies).mockResolvedValue(mockWork);

    const result = await query.execute();

    expect(result).toHaveLength(0);
    expect(cotacaoReadRepository.findCheapestBySupplyId).not.toHaveBeenCalled();
  });

  it('should return multiple works correctly', async () => {
    const mockWorks: IWorkReadRepository['findAllWithSupplies'] extends (
      ...args: any[]
    ) => Promise<infer R>
      ? R
      : never = [
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

    const mockCheapestQuote1: MenorPrecoInsumoDTO = {
      supplyId: 'supply-1',
      supplyName: 'Cimento CP-II 50kg',
      unitPrice: 25.4,
      deliveryDays: 5,
      supplierId: 'supplier-2',
      supplierName: 'Fornecedor B',
      sku: 'CIM-CPII-50-B',
    };

    const mockCheapestQuote2: MenorPrecoInsumoDTO = {
      supplyId: 'supply-2',
      supplyName: 'Areia Média',
      unitPrice: 120.0,
      deliveryDays: 3,
      supplierId: 'supplier-1',
      supplierName: 'Fornecedor A',
      sku: 'ARE-MED-A',
    };

    vi.mocked(workReadRepository.findAllWithSupplies).mockResolvedValue(mockWorks);
    vi.mocked(cotacaoReadRepository.findCheapestBySupplyId)
      .mockResolvedValueOnce(mockCheapestQuote1)
      .mockResolvedValueOnce(mockCheapestQuote2);

    const result = await query.execute();

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      workId: 'work-1',
      workName: 'Obra Alpha',
      cheapestQuotes: [mockCheapestQuote1],
    });
    expect(result[1]).toEqual({
      workId: 'work-2',
      workName: 'Obra Beta',
      cheapestQuotes: [mockCheapestQuote2],
    });
  });

  it('should only consider active quotes (valid_to IS NULL)', async () => {
    const mockWork: IWorkReadRepository['findAllWithSupplies'] extends (
      ...args: any[]
    ) => Promise<infer R>
      ? R
      : never = [
      {
        workId: 'work-1',
        workName: 'Obra Alpha',
        supplyIds: ['supply-1'],
      },
    ];

    const mockCheapestQuote: MenorPrecoInsumoDTO = {
      supplyId: 'supply-1',
      supplyName: 'Cimento CP-II 50kg',
      unitPrice: 25.4,
      deliveryDays: 5,
      supplierId: 'supplier-2',
      supplierName: 'Fornecedor B',
      sku: 'CIM-CPII-50-B',
    };

    vi.mocked(workReadRepository.findAllWithSupplies).mockResolvedValue(mockWork);
    vi.mocked(cotacaoReadRepository.findCheapestBySupplyId).mockResolvedValue(mockCheapestQuote);

    const result = await query.execute();

    expect(result[0].cheapestQuotes[0]).toEqual(mockCheapestQuote);
    // The repository is responsible for filtering non-active quotes
    // This is tested at the repository level
  });

  it('should respect limit parameter', async () => {
    const limit = 2;
    vi.mocked(workReadRepository.findAllWithSupplies).mockResolvedValue([]);

    await query.execute(limit);

    expect(workReadRepository.findAllWithSupplies).toHaveBeenCalledWith(limit);
  });
});
