import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CotacaoReadRepository } from '../CotacaoReadRepository.js';
import { getPrismaClient } from '../../../infrastructure/database/PrismaClientFactory.js';
import type { MenorPrecoInsumoDTO } from '../../../application/dtos/MenorPrecoInsumoDTO.js';

vi.mock('../../../infrastructure/database/PrismaClientFactory.js', () => ({
  getPrismaClient: vi.fn(),
}));

describe('CotacaoReadRepository', () => {
  let repository: CotacaoReadRepository;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      $queryRaw: vi.fn(),
    };
    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma);
    repository = new CotacaoReadRepository();
  });

  it('should return cheapest active quote for a supply', async () => {
    const supplyId = '1';
    const mockResult = [
      {
        supply_id: BigInt(1),
        supply_name: 'Cimento CP-II 50kg',
        unit_price: 25.4,
        delivery_days: 5,
        supplier_id: BigInt(2),
        supplier_name: 'Fornecedor B',
        sku: 'CIM-CPII-50-B',
      },
    ];

    mockPrisma.$queryRaw.mockResolvedValue(mockResult);

    const result = await repository.findCheapestBySupplyId(supplyId);

    expect(result).not.toBeNull();
    expect(result).toEqual({
      supplyId: '1',
      supplyName: 'Cimento CP-II 50kg',
      unitPrice: 25.4,
      deliveryDays: 5,
      supplierId: '2',
      supplierName: 'Fornecedor B',
      sku: 'CIM-CPII-50-B',
    });
    expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('should return null when no active quote exists for supply', async () => {
    const supplyId = '999';
    mockPrisma.$queryRaw.mockResolvedValue([]);

    const result = await repository.findCheapestBySupplyId(supplyId);

    expect(result).toBeNull();
    expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('should return null when supply does not exist', async () => {
    const supplyId = '999';
    mockPrisma.$queryRaw.mockResolvedValue([]);

    const result = await repository.findCheapestBySupplyId(supplyId);

    expect(result).toBeNull();
  });

  it('should return cheapest quote when multiple active quotes exist', async () => {
    const supplyId = '1';
    // Simula que a query retorna apenas o mais barato (já ordenado)
    const mockResult = [
      {
        supply_id: BigInt(1),
        supply_name: 'Cimento CP-II 50kg',
        unit_price: 24.9, // Menor preço
        delivery_days: 7,
        supplier_id: BigInt(3),
        supplier_name: 'Fornecedor C',
        sku: 'CIM-CPII-50-C',
      },
    ];

    mockPrisma.$queryRaw.mockResolvedValue(mockResult);

    const result = await repository.findCheapestBySupplyId(supplyId);

    expect(result).not.toBeNull();
    expect(result?.unitPrice).toBe(24.9);
    expect(result?.supplierId).toBe('3');
  });

  it('should convert bigint to string correctly', async () => {
    const supplyId = '1';
    const mockResult = [
      {
        supply_id: BigInt('9223372036854775807'), // Max bigint
        supply_name: 'Test Supply',
        unit_price: 10.0,
        delivery_days: 3,
        supplier_id: BigInt('123456789'),
        supplier_name: 'Test Supplier',
        sku: 'TEST-SKU',
      },
    ];

    mockPrisma.$queryRaw.mockResolvedValue(mockResult);

    const result = await repository.findCheapestBySupplyId(supplyId);

    expect(result).not.toBeNull();
    expect(result?.supplyId).toBe('9223372036854775807');
    expect(result?.supplierId).toBe('123456789');
    expect(typeof result?.supplyId).toBe('string');
    expect(typeof result?.supplierId).toBe('string');
  });

  it('should convert number types correctly', async () => {
    const supplyId = '1';
    const mockResult = [
      {
        supply_id: BigInt(1),
        supply_name: 'Test Supply',
        unit_price: 25.99,
        delivery_days: 5,
        supplier_id: BigInt(1),
        supplier_name: 'Test Supplier',
        sku: 'TEST-SKU',
      },
    ];

    mockPrisma.$queryRaw.mockResolvedValue(mockResult);

    const result = await repository.findCheapestBySupplyId(supplyId);

    expect(result).not.toBeNull();
    expect(result?.unitPrice).toBe(25.99);
    expect(typeof result?.unitPrice).toBe('number');
    expect(result?.deliveryDays).toBe(5);
    expect(typeof result?.deliveryDays).toBe('number');
  });

  describe('findCheapestByWorkId', () => {
    it('should return cheapest quote across all supplies of a work', async () => {
      const workId = '1';
      const mockResult = [
        {
          unit_price: 0.78,
          sku: 'TIJ-CERAMICO-C',
          supplier_name: 'Fornecedor C - Atacado',
        },
      ];

      mockPrisma.$queryRaw.mockResolvedValue(mockResult);

      const result = await repository.findCheapestByWorkId(workId);

      expect(result).not.toBeNull();
      expect(result).toEqual({
        unitPrice: 0.78,
        sku: 'TIJ-CERAMICO-C',
        supplierName: 'Fornecedor C - Atacado',
      });
      expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('should return null when work has no active quotes', async () => {
      const workId = '999';
      mockPrisma.$queryRaw.mockResolvedValue([]);

      const result = await repository.findCheapestByWorkId(workId);

      expect(result).toBeNull();
      expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('should return null when work has no supplies', async () => {
      const workId = '1';
      mockPrisma.$queryRaw.mockResolvedValue([]);

      const result = await repository.findCheapestByWorkId(workId);

      expect(result).toBeNull();
    });

    it('should return the cheapest quote when multiple quotes exist', async () => {
      const workId = '1';
      // Query já retorna ordenado por preco_unitario ASC, então o primeiro é o mais barato
      const mockResult = [
        {
          unit_price: 0.78, // Mais barato
          sku: 'TIJ-CERAMICO-C',
          supplier_name: 'Fornecedor C',
        },
      ];

      mockPrisma.$queryRaw.mockResolvedValue(mockResult);

      const result = await repository.findCheapestByWorkId(workId);

      expect(result).not.toBeNull();
      expect(result?.unitPrice).toBe(0.78);
      expect(result?.sku).toBe('TIJ-CERAMICO-C');
    });

    it('should convert decimal to number correctly', async () => {
      const workId = '1';
      const mockResult = [
        {
          unit_price: 25.99,
          sku: 'TEST-SKU',
          supplier_name: 'Test Supplier',
        },
      ];

      mockPrisma.$queryRaw.mockResolvedValue(mockResult);

      const result = await repository.findCheapestByWorkId(workId);

      expect(result).not.toBeNull();
      expect(result?.unitPrice).toBe(25.99);
      expect(typeof result?.unitPrice).toBe('number');
    });
  });
});
