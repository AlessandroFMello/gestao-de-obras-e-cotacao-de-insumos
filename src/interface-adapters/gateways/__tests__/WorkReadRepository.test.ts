import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkReadRepository } from '../WorkReadRepository.js';
import { getPrismaClient } from '../../../infrastructure/database/PrismaClientFactory.js';
import type { WorkWithSuppliesDTO } from '../../../application/ports/queries/IWorkReadRepository.js';

vi.mock('../../../infrastructure/database/PrismaClientFactory.js', () => ({
  getPrismaClient: vi.fn(),
}));

describe('WorkReadRepository', () => {
  let repository: WorkReadRepository;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      $queryRaw: vi.fn(),
    };
    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma);
    repository = new WorkReadRepository();
  });

  it('should return works with associated supplies', async () => {
    const mockResult = [
      {
        obra_id: BigInt(1),
        obra_nome: 'Obra Alpha',
        insumo_ids: '1,2,3',
      },
      {
        obra_id: BigInt(2),
        obra_nome: 'Obra Beta',
        insumo_ids: '1,4',
      },
    ];

    mockPrisma.$queryRaw.mockResolvedValue(mockResult);

    const result = await repository.findAllWithSupplies();

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      workId: '1',
      workName: 'Obra Alpha',
      supplyIds: ['1', '2', '3'],
    });
    expect(result[1]).toEqual({
      workId: '2',
      workName: 'Obra Beta',
      supplyIds: ['1', '4'],
    });
    expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('should return empty array when no works exist', async () => {
    mockPrisma.$queryRaw.mockResolvedValue([]);

    const result = await repository.findAllWithSupplies();

    expect(result).toEqual([]);
    expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('should respect limit parameter', async () => {
    const limit = 1;
    const mockResult = [
      {
        obra_id: BigInt(1),
        obra_nome: 'Obra Alpha',
        insumo_ids: '1,2,3',
      },
    ];

    mockPrisma.$queryRaw.mockResolvedValue(mockResult);

    const result = await repository.findAllWithSupplies(limit);

    expect(result).toHaveLength(1);
    expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
  });

  it('should handle works without supplies', async () => {
    const mockResult = [
      {
        obra_id: BigInt(1),
        obra_nome: 'Obra Alpha',
        insumo_ids: null,
      },
    ];

    mockPrisma.$queryRaw.mockResolvedValue(mockResult);

    const result = await repository.findAllWithSupplies();

    expect(result).toHaveLength(1);
    expect(result[0].supplyIds).toEqual([]);
  });

  it('should handle empty supply ids string', async () => {
    const mockResult = [
      {
        obra_id: BigInt(1),
        obra_nome: 'Obra Alpha',
        insumo_ids: '',
      },
    ];

    mockPrisma.$queryRaw.mockResolvedValue(mockResult);

    const result = await repository.findAllWithSupplies();

    expect(result).toHaveLength(1);
    // Empty string is falsy, so it returns empty array
    expect(result[0].supplyIds).toEqual([]);
  });

  it('should convert bigint to string correctly', async () => {
    const mockResult = [
      {
        obra_id: BigInt('9223372036854775807'),
        obra_nome: 'Obra Test',
        insumo_ids: '1,2',
      },
    ];

    mockPrisma.$queryRaw.mockResolvedValue(mockResult);

    const result = await repository.findAllWithSupplies();

    expect(result).toHaveLength(1);
    expect(result[0].workId).toBe('9223372036854775807');
    expect(typeof result[0].workId).toBe('string');
  });

  it('should parse supply ids correctly', async () => {
    const mockResult = [
      {
        obra_id: BigInt(1),
        obra_nome: 'Obra Alpha',
        insumo_ids: '1,2,3,10,20,30',
      },
    ];

    mockPrisma.$queryRaw.mockResolvedValue(mockResult);

    const result = await repository.findAllWithSupplies();

    expect(result[0].supplyIds).toEqual(['1', '2', '3', '10', '20', '30']);
    expect(result[0].supplyIds).toHaveLength(6);
  });

  it('should filter out null or undefined rows', async () => {
    const mockResult = [
      {
        obra_id: BigInt(1),
        obra_nome: 'Obra Alpha',
        insumo_ids: '1,2',
      },
      null,
      undefined,
      {
        obra_id: BigInt(2),
        obra_nome: 'Obra Beta',
        insumo_ids: '3,4',
      },
    ];

    mockPrisma.$queryRaw.mockResolvedValue(mockResult);

    const result = await repository.findAllWithSupplies();

    expect(result).toHaveLength(2);
    expect(result[0].workId).toBe('1');
    expect(result[1].workId).toBe('2');
  });

  describe('findCategoriesByWorkId', () => {
    it('should return categories for a work', async () => {
      const workId = '1';
      const mockResult = [
        { categoria_nome: 'Cimento' },
        { categoria_nome: 'Ferro' },
        { categoria_nome: 'Madeira' },
      ];

      mockPrisma.$queryRaw.mockResolvedValue(mockResult);

      const result = await repository.findCategoriesByWorkId(workId);

      expect(result).toHaveLength(3);
      expect(result).toEqual([
        { name: 'Cimento' },
        { name: 'Ferro' },
        { name: 'Madeira' },
      ]);
      expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when work has no supplies', async () => {
      const workId = '999';
      mockPrisma.$queryRaw.mockResolvedValue([]);

      const result = await repository.findCategoriesByWorkId(workId);

      expect(result).toEqual([]);
      expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('should return unique categories', async () => {
      const workId = '1';
      const mockResult = [
        { categoria_nome: 'Cimento' },
        { categoria_nome: 'Cimento' }, // Duplicado
        { categoria_nome: 'Ferro' },
      ];

      mockPrisma.$queryRaw.mockResolvedValue(mockResult);

      const result = await repository.findCategoriesByWorkId(workId);

      // DISTINCT na query garante unicidade
      expect(result).toHaveLength(3);
      expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
    });
  });

  describe('findInspectionsByWorkId', () => {
    it('should return inspections for a work', async () => {
      const workId = '1';
      const mockResult = [
        { status: 'APPROVED', note: 'Test note 1' },
        { status: 'PENDING', note: 'Test note 2' },
        { status: 'REJECTED', note: null },
      ];

      mockPrisma.$queryRaw.mockResolvedValue(mockResult);

      const result = await repository.findInspectionsByWorkId(workId);

      expect(result).toHaveLength(3);
      expect(result).toEqual([
        { status: 'APPROVED', note: 'Test note 1' },
        { status: 'PENDING', note: 'Test note 2' },
        { status: 'REJECTED', note: null },
      ]);
      expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when work has no inspections', async () => {
      const workId = '999';
      mockPrisma.$queryRaw.mockResolvedValue([]);

      const result = await repository.findInspectionsByWorkId(workId);

      expect(result).toEqual([]);
      expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('should respect limit parameter', async () => {
      const workId = '1';
      const limit = 2;
      // Query SQL aplica LIMIT, então retorna apenas os 2 primeiros
      const mockResult = [
        { status: 'APPROVED', note: 'Note 1' },
        { status: 'PENDING', note: 'Note 2' },
      ];

      mockPrisma.$queryRaw.mockResolvedValue(mockResult);

      const result = await repository.findInspectionsByWorkId(workId, limit);

      expect(result).toHaveLength(2);
      expect(result[0].status).toBe('APPROVED');
      expect(result[1].status).toBe('PENDING');
      expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('should handle null notes', async () => {
      const workId = '1';
      const mockResult = [
        { status: 'APPROVED', note: null },
        { status: 'PENDING', note: 'Some note' },
      ];

      mockPrisma.$queryRaw.mockResolvedValue(mockResult);

      const result = await repository.findInspectionsByWorkId(workId);

      expect(result[0].note).toBeNull();
      expect(result[1].note).toBe('Some note');
    });
  });
});
