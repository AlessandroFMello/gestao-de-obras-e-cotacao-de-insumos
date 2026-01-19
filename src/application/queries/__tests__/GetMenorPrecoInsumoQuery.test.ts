import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetMenorPrecoInsumoQuery } from '../GetMenorPrecoInsumoQuery.js';
import type { ICotacaoReadRepository } from '../../ports/queries/ICotacaoReadRepository.js';
import type { MenorPrecoInsumoDTO } from '../../dtos/MenorPrecoInsumoDTO.js';

describe('GetMenorPrecoInsumoQuery', () => {
  let query: GetMenorPrecoInsumoQuery;
  let readRepository: ICotacaoReadRepository;

  beforeEach(() => {
    readRepository = {
      findCheapestBySupplyId: vi.fn(),
    };
    query = new GetMenorPrecoInsumoQuery(readRepository);
  });

  it('should return cheapest quote among active quotes for a supply', async () => {
    // Arrange
    const supplyId = 'supply-1';
    const expectedResult: MenorPrecoInsumoDTO = {
      supplyId: 'supply-1',
      supplyName: 'Cimento CP-II 50kg',
      unitPrice: 25.4,
      deliveryDays: 5,
      supplierId: 'supplier-2',
      supplierName: 'Fornecedor B',
      sku: 'CIM-CPII-50-B',
    };

    vi.mocked(readRepository.findCheapestBySupplyId).mockResolvedValue(expectedResult);

    // Act
    const result = await query.execute(supplyId);

    // Assert
    expect(result).toEqual(expectedResult);
    expect(readRepository.findCheapestBySupplyId).toHaveBeenCalledWith(supplyId);
    expect(readRepository.findCheapestBySupplyId).toHaveBeenCalledTimes(1);
  });

  it('should ignore non-active quotes (valid_to IS NOT NULL)', async () => {
    // Arrange
    const supplyId = 'supply-1';
    const expectedResult: MenorPrecoInsumoDTO = {
      supplyId: 'supply-1',
      supplyName: 'Cimento CP-II 50kg',
      unitPrice: 26.9,
      deliveryDays: 3,
      supplierId: 'supplier-1',
      supplierName: 'Fornecedor A',
      sku: 'CIM-CPII-50-A',
    };

    vi.mocked(readRepository.findCheapestBySupplyId).mockResolvedValue(expectedResult);

    // Act
    const result = await query.execute(supplyId);

    // Assert
    expect(result).toEqual(expectedResult);
    // The repository should filter out non-active quotes (this is tested at repository level)
    expect(readRepository.findCheapestBySupplyId).toHaveBeenCalledWith(supplyId);
  });

  it('should return correct supplier associated with cheapest price', async () => {
    // Arrange
    const supplyId = 'supply-1';
    const expectedResult: MenorPrecoInsumoDTO = {
      supplyId: 'supply-1',
      supplyName: 'Cimento CP-II 50kg',
      unitPrice: 24.9,
      deliveryDays: 7,
      supplierId: 'supplier-3',
      supplierName: 'Fornecedor C',
      sku: 'CIM-CPII-50-C',
    };

    vi.mocked(readRepository.findCheapestBySupplyId).mockResolvedValue(expectedResult);

    // Act
    const result = await query.execute(supplyId);

    // Assert
    expect(result).not.toBeNull();
    expect(result?.supplierId).toBe('supplier-3');
    expect(result?.supplierName).toBe('Fornecedor C');
    expect(result?.unitPrice).toBe(24.9);
  });

  it('should return NULL if there is no active quote', async () => {
    // Arrange
    const supplyId = 'supply-1';
    vi.mocked(readRepository.findCheapestBySupplyId).mockResolvedValue(null);

    // Act
    const result = await query.execute(supplyId);

    // Assert
    expect(result).toBeNull();
    expect(readRepository.findCheapestBySupplyId).toHaveBeenCalledWith(supplyId);
  });

  it('should return NULL if supply does not exist', async () => {
    // Arrange
    const supplyId = 'non-existent-supply';
    vi.mocked(readRepository.findCheapestBySupplyId).mockResolvedValue(null);

    // Act
    const result = await query.execute(supplyId);

    // Assert
    expect(result).toBeNull();
    expect(readRepository.findCheapestBySupplyId).toHaveBeenCalledWith(supplyId);
  });
});

