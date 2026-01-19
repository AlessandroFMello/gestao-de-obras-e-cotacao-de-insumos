import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SupplyRepository } from '../SupplyRepository.js';
import { getPrismaClient } from '../../../infrastructure/database/PrismaClientFactory.js';
import { Supply } from '../../../domain/entities/Supply.js';

vi.mock('../../../infrastructure/database/PrismaClientFactory.js', () => ({
  getPrismaClient: vi.fn(),
}));

describe('SupplyRepository', () => {
  let repository: SupplyRepository;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      $queryRaw: vi.fn(),
    };
    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma);
    repository = new SupplyRepository();
  });

  it('should return supply when found by id', async () => {
    const supplyId = '1';
    const mockResult = [
      {
        id: BigInt(1),
        nome: 'Cimento CP-II 50kg',
        tipo: 'Saco',
        peso_kg: 50.0,
        categoria_id: BigInt(1),
        categoria_nome: 'Cimento',
      },
    ];

    mockPrisma.$queryRaw.mockResolvedValue(mockResult);

    const result = await repository.findById(supplyId);

    expect(result).not.toBeNull();
    expect(result?.getId()).toBe('1');
    expect(result?.getName()).toBe('Cimento CP-II 50kg');
    expect(result?.getType()).toBe('Saco');
    expect(result?.getWeightKg()).toBe(50.0);
    expect(result?.getCategory().getName()).toBe('Cimento');
    expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('should return null when supply not found', async () => {
    const supplyId = '999';
    mockPrisma.$queryRaw.mockResolvedValue([]);

    const result = await repository.findById(supplyId);

    expect(result).toBeNull();
    expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('should map database result to domain entity correctly', async () => {
    const supplyId = '2';
    const mockResult = [
      {
        id: BigInt(2),
        nome: 'Areia Média',
        tipo: 'm³',
        peso_kg: 1500.0,
        categoria_id: BigInt(2),
        categoria_nome: 'Areia',
      },
    ];

    mockPrisma.$queryRaw.mockResolvedValue(mockResult);

    const result = await repository.findById(supplyId);

    expect(result).not.toBeNull();
    expect(result?.getId()).toBe('2');
    expect(result?.getName()).toBe('Areia Média');
    expect(result?.getType()).toBe('m³');
    expect(result?.getWeightKg()).toBe(1500.0);
    expect(result?.getCategory().getId()).toBe('2');
    expect(result?.getCategory().getName()).toBe('Areia');
  });

  it('should convert bigint to string correctly', async () => {
    const supplyId = '1';
    const mockResult = [
      {
        id: BigInt('9223372036854775807'),
        nome: 'Test Supply',
        tipo: 'Test Type',
        peso_kg: 10.5,
        categoria_id: BigInt('123456789'),
        categoria_nome: 'Test Category',
      },
    ];

    mockPrisma.$queryRaw.mockResolvedValue(mockResult);

    const result = await repository.findById(supplyId);

    expect(result).not.toBeNull();
    expect(result?.getId()).toBe('9223372036854775807');
    expect(result?.getCategory().getId()).toBe('123456789');
    expect(typeof result?.getId()).toBe('string');
  });

  it('should handle null result correctly', async () => {
    const supplyId = '999';
    mockPrisma.$queryRaw.mockResolvedValue([null]);

    const result = await repository.findById(supplyId);

    expect(result).toBeNull();
  });
});

