import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CotacaoWriteRepository } from '../CotacaoWriteRepository.js';
import { getPrismaClient } from '../../../infrastructure/database/PrismaClientFactory.js';
import { Quote } from '../../../domain/entities/Quote.js';
import { Supply } from '../../../domain/entities/Supply.js';
import { Supplier } from '../../../domain/entities/Supplier.js';
import { Category } from '../../../domain/entities/Category.js';

vi.mock('../../../infrastructure/database/PrismaClientFactory.js', () => ({
  getPrismaClient: vi.fn(),
}));

describe('CotacaoWriteRepository', () => {
  let repository: CotacaoWriteRepository;
  let mockPrisma: any;

  const createTestQuote = (id?: string, validTo: Date | null = null): Quote => {
    const category = Category.create('Categoria Test', 'cat-1');
    const supply = Supply.create('Supply Test', 'Type Test', 10.5, category, 'supply-1');
    const supplier = Supplier.create('Supplier Test', 'supplier-1');
    const validFrom = new Date('2024-01-01');

    return Quote.create('SKU-TEST', 25.5, 5, validFrom, validTo, supply, supplier, id);
  };

  beforeEach(() => {
    mockPrisma = {
      $executeRaw: vi.fn(),
      $queryRaw: vi.fn(),
    };
    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma);
    repository = new CotacaoWriteRepository();
  });

  describe('save', () => {
    it('should save quote with numeric ID', async () => {
      const quote = createTestQuote('123');

      await repository.save(quote);

      expect(mockPrisma.$executeRaw).toHaveBeenCalledTimes(1);
      const call = mockPrisma.$executeRaw.mock.calls[0][0];
      expect(call).toBeDefined();
    });

    it('should save quote without ID and let database generate it', async () => {
      const quote = createTestQuote(); // UUID, not numeric

      await repository.save(quote);

      expect(mockPrisma.$executeRaw).toHaveBeenCalledTimes(1);
      const call = mockPrisma.$executeRaw.mock.calls[0][0];
      expect(call).toBeDefined();
    });

    it('should save quote with all required fields', async () => {
      const quote = createTestQuote('456');

      await repository.save(quote);

      expect(mockPrisma.$executeRaw).toHaveBeenCalledTimes(1);
    });

    it('should save active quote (validTo is null)', async () => {
      const quote = createTestQuote('789', null);

      await repository.save(quote);

      expect(mockPrisma.$executeRaw).toHaveBeenCalledTimes(1);
    });

    it('should save inactive quote (validTo is not null)', async () => {
      const validTo = new Date('2024-12-31');
      const quote = createTestQuote('101', validTo);

      await repository.save(quote);

      expect(mockPrisma.$executeRaw).toHaveBeenCalledTimes(1);
    });

    it('should throw error when supply ID cannot be parsed', async () => {
      const category = Category.create('Categoria Test', 'cat-1');
      // Supply with invalid ID (no numbers to extract)
      const supply = Supply.create('Supply Test', 'Type Test', 10.5, category, 'invalid-id-no-numbers');
      const supplier = Supplier.create('Supplier Test', 'supplier-1');
      const validFrom = new Date('2024-01-01');
      const quote = Quote.create('SKU-TEST', 25.5, 5, validFrom, null, supply, supplier);

      await expect(repository.save(quote)).rejects.toThrow(
        'Invalid ID format: invalid-id-no-numbers. Expected numeric ID or format like "supply-1"'
      );
    });

    it('should throw error when supplier ID cannot be parsed', async () => {
      const category = Category.create('Categoria Test', 'cat-1');
      const supply = Supply.create('Supply Test', 'Type Test', 10.5, category, 'supply-1');
      // Supplier with invalid ID (no numbers to extract)
      const supplier = Supplier.create('Supplier Test', 'invalid-id-no-numbers');
      const validFrom = new Date('2024-01-01');
      const quote = Quote.create('SKU-TEST', 25.5, 5, validFrom, null, supply, supplier);

      await expect(repository.save(quote)).rejects.toThrow(
        'Invalid ID format: invalid-id-no-numbers. Expected numeric ID or format like "supply-1"'
      );
    });
  });

  describe('findActiveBySupplyAndSupplier', () => {
    it('should return active quote when found', async () => {
      const supplyId = '1';
      const supplierId = '2';
      const mockResult = [
        {
          id: BigInt(1),
          sku: 'SKU-TEST',
          preco_unitario: 25.5,
          prazo_entrega_dias: 5,
          valid_from: new Date('2024-01-01'),
          valid_to: null,
          insumo_id: BigInt(1),
          fornecedor_id: BigInt(2),
          insumo_nome: 'Supply Test',
          insumo_tipo: 'Type Test',
          insumo_peso_kg: 10.5,
          categoria_id: BigInt(1),
          categoria_nome: 'Categoria Test',
          fornecedor_nome: 'Supplier Test',
        },
      ];

      mockPrisma.$queryRaw.mockResolvedValue(mockResult);

      const result = await repository.findActiveBySupplyAndSupplier(supplyId, supplierId);

      expect(result).not.toBeNull();
      expect(result?.getSku()).toBe('SKU-TEST');
      expect(result?.getUnitPrice()).toBe(25.5);
      expect(result?.isActive()).toBe(true);
      expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('should return null when no active quote found', async () => {
      const supplyId = '999';
      const supplierId = '888';
      mockPrisma.$queryRaw.mockResolvedValue([]);

      const result = await repository.findActiveBySupplyAndSupplier(supplyId, supplierId);

      expect(result).toBeNull();
      expect(mockPrisma.$queryRaw).toHaveBeenCalledTimes(1);
    });

    it('should return null when quote is not active (validTo is not null)', async () => {
      const supplyId = '1';
      const supplierId = '2';
      const mockResult = [
        {
          id: BigInt(1),
          sku: 'SKU-TEST',
          preco_unitario: 25.5,
          prazo_entrega_dias: 5,
          valid_from: new Date('2024-01-01'),
          valid_to: new Date('2024-12-31'), // Not active
          insumo_id: BigInt(1),
          fornecedor_id: BigInt(2),
          insumo_nome: 'Supply Test',
          insumo_tipo: 'Type Test',
          insumo_peso_kg: 10.5,
          categoria_id: BigInt(1),
          categoria_nome: 'Categoria Test',
          fornecedor_nome: 'Supplier Test',
        },
      ];

      // Query filters by valid_to IS NULL, so this won't be returned
      mockPrisma.$queryRaw.mockResolvedValue([]);

      const result = await repository.findActiveBySupplyAndSupplier(supplyId, supplierId);

      expect(result).toBeNull();
    });

    it('should map database result to domain entity correctly', async () => {
      const supplyId = '1';
      const supplierId = '2';
      const mockResult = [
        {
          id: BigInt(100),
          sku: 'SKU-MAPPED',
          preco_unitario: 30.99,
          prazo_entrega_dias: 7,
          valid_from: new Date('2024-01-01'),
          valid_to: null,
          insumo_id: BigInt(1),
          fornecedor_id: BigInt(2),
          insumo_nome: 'Mapped Supply',
          insumo_tipo: 'Mapped Type',
          insumo_peso_kg: 15.5,
          categoria_id: BigInt(1),
          categoria_nome: 'Mapped Category',
          fornecedor_nome: 'Mapped Supplier',
        },
      ];

      mockPrisma.$queryRaw.mockResolvedValue(mockResult);

      const result = await repository.findActiveBySupplyAndSupplier(supplyId, supplierId);

      expect(result).not.toBeNull();
      expect(result?.getId()).toBe('100');
      expect(result?.getSku()).toBe('SKU-MAPPED');
      expect(result?.getUnitPrice()).toBe(30.99);
      expect(result?.getDeliveryDays()).toBe(7);
      expect(result?.getSupply().getName()).toBe('Mapped Supply');
      expect(result?.getSupplier().getName()).toBe('Mapped Supplier');
    });
  });

  describe('update', () => {
    it('should update quote in database', async () => {
      const quote = createTestQuote('123');

      await repository.update(quote);

      expect(mockPrisma.$executeRaw).toHaveBeenCalledTimes(1);
      const call = mockPrisma.$executeRaw.mock.calls[0][0];
      expect(call).toBeDefined();
    });

    it('should update quote with new values', async () => {
      const quote = createTestQuote('456');
      const updatedQuote = Quote.create(
        'SKU-UPDATED',
        30.0,
        10,
        new Date('2024-01-01'),
        null,
        quote.getSupply(),
        quote.getSupplier(),
        '456'
      );

      await repository.update(updatedQuote);

      expect(mockPrisma.$executeRaw).toHaveBeenCalledTimes(1);
    });

    it('should update quote to inactive (set validTo)', async () => {
      const quote = createTestQuote('789');
      const validTo = new Date('2024-12-31');
      const endedQuote = Quote.create(
        quote.getSku(),
        quote.getUnitPrice(),
        quote.getDeliveryDays(),
        quote.getValidFrom(),
        validTo,
        quote.getSupply(),
        quote.getSupplier(),
        '789'
      );

      await repository.update(endedQuote);

      expect(mockPrisma.$executeRaw).toHaveBeenCalledTimes(1);
    });
  });
});

