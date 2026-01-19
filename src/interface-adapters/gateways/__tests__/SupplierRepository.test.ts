import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupplierRepository } from '../SupplierRepository.js';
import { getPrismaClient } from '../../../infrastructure/database/PrismaClientFactory.js';
import { Supplier } from '../../../domain/entities/Supplier.js';

vi.mock('../../../infrastructure/database/PrismaClientFactory.js', () => ({
  getPrismaClient: vi.fn(),
}));

describe('SupplierRepository', () => {
  let repository: SupplierRepository;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      $queryRaw: vi.fn(),
    };
    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma);
    repository = new SupplierRepository();
  });

  it('should return supplier when found by id', async () => {
    const supplierId = '1';
    const mockResult = [
      {
        id: BigInt(1),
        nome: 'Fornecedor A',
      },
    ];

    mockPrisma.$queryRaw.mockResolvedValue(mockResult);

    const result = await repository.findById(supplierId);

    expect(result).not.toBeNull();
    expect(result?.getId()).toBe('1');
    expect(result?.getName()).toBe('Fornecedor A');
    expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('should return null when supplier not found', async () => {
    const supplierId = '999';
    mockPrisma.$queryRaw.mockResolvedValue([]);

    const result = await repository.findById(supplierId);

    expect(result).toBeNull();
    expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('should map database result to domain entity correctly', async () => {
    const supplierId = '2';
    const mockResult = [
      {
        id: BigInt(2),
        nome: 'Fornecedor B',
      },
    ];

    mockPrisma.$queryRaw.mockResolvedValue(mockResult);

    const result = await repository.findById(supplierId);

    expect(result).not.toBeNull();
    expect(result?.getId()).toBe('2');
    expect(result?.getName()).toBe('Fornecedor B');
  });

  it('should convert bigint to string correctly', async () => {
    const supplierId = '1';
    const mockResult = [
      {
        id: BigInt('9223372036854775807'),
        nome: 'Test Supplier',
      },
    ];

    mockPrisma.$queryRaw.mockResolvedValue(mockResult);

    const result = await repository.findById(supplierId);

    expect(result).not.toBeNull();
    expect(result?.getId()).toBe('9223372036854775807');
    expect(typeof result?.getId()).toBe('string');
  });

  it('should handle null result correctly', async () => {
    const supplierId = '999';
    mockPrisma.$queryRaw.mockResolvedValue([null]);

    const result = await repository.findById(supplierId);

    expect(result).toBeNull();
  });
});

