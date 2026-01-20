import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorksResolver } from '../WorksResolver.js';
import type { ListarObrasComMenorPrecoQuery } from '../../../../application/queries/ListarObrasComMenorPrecoQuery.js';
import type { IWorkReadRepository } from '../../../../application/ports/queries/IWorkReadRepository.js';
import type { ObraComMenorPrecoDTO } from '../../../../application/dtos/ObraComMenorPrecoDTO.js';

describe('WorksResolver', () => {
  let resolver: WorksResolver;
  let listarObrasQuery: ListarObrasComMenorPrecoQuery;
  let workReadRepository: IWorkReadRepository;

  beforeEach(() => {
    listarObrasQuery = {
      execute: vi.fn(),
    } as unknown as ListarObrasComMenorPrecoQuery;
    workReadRepository = {
      findInspectionsByWorkId: vi.fn(),
    } as unknown as IWorkReadRepository;
    resolver = new WorksResolver(listarObrasQuery, workReadRepository);
  });

  it('should return works formatted for GraphQL', async () => {
    const mockDTOs: ObraComMenorPrecoDTO[] = [
      {
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
          { status: 'APPROVED', note: 'Test note' },
        ],
      },
    ];

    vi.mocked(listarObrasQuery.execute).mockResolvedValue(mockDTOs);

    const result = await resolver.works(null, {});

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
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
        { status: 'APPROVED', note: 'Test note' },
      ],
    });
    expect(listarObrasQuery.execute).toHaveBeenCalledWith(undefined);
  });

  it('should pass limit parameter when provided', async () => {
    const mockDTOs: ObraComMenorPrecoDTO[] = [];
    vi.mocked(listarObrasQuery.execute).mockResolvedValue(mockDTOs);

    await resolver.works(null, { limit: 5 });

    expect(listarObrasQuery.execute).toHaveBeenCalledWith(5);
  });

  it('should ignore invalid limit (zero or negative)', async () => {
    const mockDTOs: ObraComMenorPrecoDTO[] = [];
    vi.mocked(listarObrasQuery.execute).mockResolvedValue(mockDTOs);

    await resolver.works(null, { limit: 0 });
    expect(listarObrasQuery.execute).toHaveBeenCalledWith(undefined);

    await resolver.works(null, { limit: -1 });
    expect(listarObrasQuery.execute).toHaveBeenCalledWith(undefined);
  });

  it('should handle null cheapestQuote', async () => {
    const mockDTOs: ObraComMenorPrecoDTO[] = [
      {
        workId: 'work-1',
        workName: 'Obra Teste',
        cheapestQuote: null,
        categories: [],
        inspections: [],
      },
    ];

    vi.mocked(listarObrasQuery.execute).mockResolvedValue(mockDTOs);

    const result = await resolver.works(null, {});

    expect(result[0].cheapestQuote).toBeNull();
    expect(result[0].categories).toEqual([]);
    expect(result[0].inspections).toEqual([]);
  });

  it('should filter inspections by last parameter', async () => {
    const workGraphQL = {
      id: 'work-1',
      name: 'Obra Teste',
      cheapestQuote: null,
      categories: [],
      inspections: [
        { status: 'APPROVED', note: 'Note 1' },
        { status: 'PENDING', note: 'Note 2' },
        { status: 'APPROVED', note: 'Note 3' },
        { status: 'REJECTED', note: 'Note 4' },
        { status: 'APPROVED', note: 'Note 5' },
      ],
    };

    const result = await resolver.inspections(workGraphQL, { last: 3 });

    expect(result).toHaveLength(3);
    expect(result[0].status).toBe('APPROVED');
    expect(result[0].note).toBe('Note 1');
  });

  it('should return all inspections when last parameter is not provided', async () => {
    const workGraphQL = {
      id: 'work-1',
      name: 'Obra Teste',
      cheapestQuote: null,
      categories: [],
      inspections: [
        { status: 'APPROVED', note: 'Note 1' },
        { status: 'PENDING', note: 'Note 2' },
      ],
    };

    const result = await resolver.inspections(workGraphQL, {});

    expect(result).toHaveLength(2);
    expect(result[0].status).toBe('APPROVED');
    expect(result[1].status).toBe('PENDING');
  });

  it('should return empty array when work has no inspections', async () => {
    const workGraphQL = {
      id: 'work-1',
      name: 'Obra Teste',
      cheapestQuote: null,
      categories: [],
      inspections: [],
    };

    const result = await resolver.inspections(workGraphQL, {});

    expect(result).toEqual([]);
  });

  it('should return empty array when inspections is null', async () => {
    const workGraphQL = {
      id: 'work-1',
      name: 'Obra Teste',
      cheapestQuote: null,
      categories: [],
      inspections: null as any,
    };

    const result = await resolver.inspections(workGraphQL, {});

    expect(result).toEqual([]);
  });

  it('should return all inspections when last is greater than array length', async () => {
    const workGraphQL = {
      id: 'work-1',
      name: 'Obra Teste',
      cheapestQuote: null,
      categories: [],
      inspections: [
        { status: 'APPROVED', note: 'Note 1' },
        { status: 'PENDING', note: 'Note 2' },
      ],
    };

    const result = await resolver.inspections(workGraphQL, { last: 10 });

    expect(result).toHaveLength(2);
  });

  it('should ignore invalid last parameter (zero or negative)', async () => {
    const workGraphQL = {
      id: 'work-1',
      name: 'Obra Teste',
      cheapestQuote: null,
      categories: [],
      inspections: [
        { status: 'APPROVED', note: 'Note 1' },
        { status: 'PENDING', note: 'Note 2' },
      ],
    };

    const result1 = await resolver.inspections(workGraphQL, { last: 0 });
    const result2 = await resolver.inspections(workGraphQL, { last: -1 });

    expect(result1).toHaveLength(2);
    expect(result2).toHaveLength(2);
  });
});

