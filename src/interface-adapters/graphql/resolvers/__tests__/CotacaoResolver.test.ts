import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CotacaoResolver } from '../CotacaoResolver.js';
import type { CreateCotacaoUseCase } from '../../../../application/use-cases/CreateCotacaoUseCase.js';
import type { CreateCotacaoOutput } from '../../../../application/dtos/CreateCotacaoOutput.js';
import type { CreateCotacaoInput } from '../CotacaoResolver.js';

describe('CotacaoResolver', () => {
  let resolver: CotacaoResolver;
  let createCotacaoUseCase: CreateCotacaoUseCase;

  beforeEach(() => {
    createCotacaoUseCase = {
      execute: vi.fn(),
    } as unknown as CreateCotacaoUseCase;
    resolver = new CotacaoResolver(createCotacaoUseCase);
  });

  it('should create cotacao and return formatted for GraphQL', async () => {
    const input: CreateCotacaoInput = {
      sku: 'CIM-001',
      unitPrice: 50.0,
      deliveryDays: 5,
      supplyId: 'supply-1',
      supplierId: 'supplier-1',
    };

    const mockOutput: CreateCotacaoOutput = {
      id: 'quote-1',
      sku: 'CIM-001',
      unitPrice: 50.0,
      deliveryDays: 5,
      validFrom: new Date('2024-01-01T00:00:00Z'),
      validTo: null,
      supplyId: 'supply-1',
      supplierId: 'supplier-1',
    };

    vi.mocked(createCotacaoUseCase.execute).mockResolvedValue(mockOutput);

    const result = await resolver.createCotacao(null, { input });

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

    expect(createCotacaoUseCase.execute).toHaveBeenCalledWith({
      sku: 'CIM-001',
      unitPrice: 50.0,
      deliveryDays: 5,
      supplyId: 'supply-1',
      supplierId: 'supplier-1',
    });
  });

  it('should format dates as ISO strings', async () => {
    const input: CreateCotacaoInput = {
      sku: 'CIM-001',
      unitPrice: 50.0,
      deliveryDays: 5,
      supplyId: 'supply-1',
      supplierId: 'supplier-1',
    };

    const validFrom = new Date('2024-01-01T10:30:00Z');
    const validTo = new Date('2024-12-31T23:59:59Z');

    const mockOutput: CreateCotacaoOutput = {
      id: 'quote-1',
      sku: 'CIM-001',
      unitPrice: 50.0,
      deliveryDays: 5,
      validFrom,
      validTo,
      supplyId: 'supply-1',
      supplierId: 'supplier-1',
    };

    vi.mocked(createCotacaoUseCase.execute).mockResolvedValue(mockOutput);

    const result = await resolver.createCotacao(null, { input });

    expect(result.validFrom).toBe(validFrom.toISOString());
    expect(result.validTo).toBe(validTo.toISOString());
  });

  it('should handle null validTo correctly', async () => {
    const input: CreateCotacaoInput = {
      sku: 'CIM-001',
      unitPrice: 50.0,
      deliveryDays: 5,
      supplyId: 'supply-1',
      supplierId: 'supplier-1',
    };

    const mockOutput: CreateCotacaoOutput = {
      id: 'quote-1',
      sku: 'CIM-001',
      unitPrice: 50.0,
      deliveryDays: 5,
      validFrom: new Date('2024-01-01T00:00:00Z'),
      validTo: null,
      supplyId: 'supply-1',
      supplierId: 'supplier-1',
    };

    vi.mocked(createCotacaoUseCase.execute).mockResolvedValue(mockOutput);

    const result = await resolver.createCotacao(null, { input });

    expect(result.validTo).toBeNull();
  });
});

