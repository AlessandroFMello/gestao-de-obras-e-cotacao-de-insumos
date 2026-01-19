import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateCotacaoUseCase } from '../CreateCotacaoUseCase.js';
import { ICotacaoWriteRepository } from '../../ports/repositories/ICotacaoWriteRepository.js';
import { ISupplyRepository } from '../../ports/repositories/ISupplyRepository.js';
import { ISupplierRepository } from '../../ports/repositories/ISupplierRepository.js';
import { Quote } from '../../../domain/entities/Quote.js';
import { Supply } from '../../../domain/entities/Supply.js';
import { Supplier } from '../../../domain/entities/Supplier.js';
import { Category } from '../../../domain/entities/Category.js';
import { EntityNotFoundError } from '../../errors/index.js';

describe('CreateCotacaoUseCase', () => {
  let useCase: CreateCotacaoUseCase;
  let quoteRepository: ICotacaoWriteRepository;
  let supplyRepository: ISupplyRepository;
  let supplierRepository: ISupplierRepository;

  const mockCategory = Category.create('Categoria Test', 'cat-1');
  const mockSupply = Supply.create('Supply Test', 'Type Test', 10.5, mockCategory, 'supply-1');
  const mockSupplier = Supplier.create('Supplier Test', 'supplier-1');

  beforeEach(() => {
    quoteRepository = {
      save: vi.fn(),
      findActiveBySupplyAndSupplier: vi.fn(),
      update: vi.fn(),
    };

    supplyRepository = {
      findById: vi.fn(),
    };

    supplierRepository = {
      findById: vi.fn(),
    };

    useCase = new CreateCotacaoUseCase(quoteRepository, supplyRepository, supplierRepository);
  });

  describe('create active quote successfully', () => {
    it('should create an active quote when no previous active quote exists', async () => {
      const dto = {
        sku: 'SKU-001',
        unitPrice: 25.90,
        deliveryDays: 3,
        supplyId: 'supply-1',
        supplierId: 'supplier-1',
      };

      vi.mocked(supplyRepository.findById).mockResolvedValue(mockSupply);
      vi.mocked(supplierRepository.findById).mockResolvedValue(mockSupplier);
      vi.mocked(quoteRepository.findActiveBySupplyAndSupplier).mockResolvedValue(null);
      vi.mocked(quoteRepository.save).mockResolvedValue();

      const result = await useCase.execute(dto);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.sku).toBe('SKU-001');
      expect(result.unitPrice).toBe(25.90);
      expect(result.deliveryDays).toBe(3);
      expect(result.validTo).toBeNull();
      expect(result.supplyId).toBe('supply-1');
      expect(result.supplierId).toBe('supplier-1');

      expect(supplyRepository.findById).toHaveBeenCalledWith('supply-1');
      expect(supplierRepository.findById).toHaveBeenCalledWith('supplier-1');
      expect(quoteRepository.findActiveBySupplyAndSupplier).toHaveBeenCalledWith('supply-1', 'supplier-1');
      expect(quoteRepository.save).toHaveBeenCalledTimes(1);
      expect(quoteRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('end previous active quote when creating new one', () => {
    it('should end previous active quote when creating new quote for same supply and supplier', async () => {
      const dto = {
        sku: 'SKU-002',
        unitPrice: 24.50,
        deliveryDays: 5,
        supplyId: 'supply-1',
        supplierId: 'supplier-1',
      };

      const previousActiveQuote = Quote.create(
        'SKU-001',
        25.90,
        3,
        new Date('2024-01-01'),
        null, // active
        mockSupply,
        mockSupplier,
        'quote-1'
      );

      vi.mocked(supplyRepository.findById).mockResolvedValue(mockSupply);
      vi.mocked(supplierRepository.findById).mockResolvedValue(mockSupplier);
      vi.mocked(quoteRepository.findActiveBySupplyAndSupplier).mockResolvedValue(previousActiveQuote);
      vi.mocked(quoteRepository.update).mockResolvedValue();
      vi.mocked(quoteRepository.save).mockResolvedValue();

      const result = await useCase.execute(dto);

   
      expect(quoteRepository.findActiveBySupplyAndSupplier).toHaveBeenCalledWith('supply-1', 'supplier-1');
      expect(quoteRepository.update).toHaveBeenCalledTimes(1);
      
      // Verify that the previous quote was updated to end its validity
      const updatedQuote = vi.mocked(quoteRepository.update).mock.calls[0]?.[0];
      expect(updatedQuote).toBeDefined();
      expect(updatedQuote?.getValidTo()).not.toBeNull();
      expect(updatedQuote?.getValidTo()?.getTime()).toBeLessThanOrEqual(new Date().getTime());

      expect(quoteRepository.save).toHaveBeenCalledTimes(1);
      expect(result).toBeDefined();
      expect(result.sku).toBe('SKU-002');
    });
  });

  describe('validate supply exists', () => {
    it('should throw EntityNotFoundError when supply does not exist', async () => {
      const dto = {
        sku: 'SKU-001',
        unitPrice: 25.90,
        deliveryDays: 3,
        supplyId: 'non-existent-supply',
        supplierId: 'supplier-1',
      };

      vi.mocked(supplyRepository.findById).mockResolvedValue(null);

      await expect(useCase.execute(dto)).rejects.toThrow(EntityNotFoundError);
      await expect(useCase.execute(dto)).rejects.toThrow('Supply with id "non-existent-supply" not found');

      expect(supplyRepository.findById).toHaveBeenCalledWith('non-existent-supply');
      expect(supplierRepository.findById).not.toHaveBeenCalled();
      expect(quoteRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('validate supplier exists', () => {
    it('should throw EntityNotFoundError when supplier does not exist', async () => {
      const dto = {
        sku: 'SKU-001',
        unitPrice: 25.90,
        deliveryDays: 3,
        supplyId: 'supply-1',
        supplierId: 'non-existent-supplier',
      };

      vi.mocked(supplyRepository.findById).mockResolvedValue(mockSupply);
      vi.mocked(supplierRepository.findById).mockResolvedValue(null);

      await expect(useCase.execute(dto)).rejects.toThrow(EntityNotFoundError);
      await expect(useCase.execute(dto)).rejects.toThrow('Supplier with id "non-existent-supplier" not found');

      expect(supplyRepository.findById).toHaveBeenCalledWith('supply-1');
      expect(supplierRepository.findById).toHaveBeenCalledWith('non-existent-supplier');
      expect(quoteRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('prevent multiple active quotes', () => {
    it('should ensure only one active quote exists per supply and supplier combination', async () => {
      const dto = {
        sku: 'SKU-002',
        unitPrice: 24.50,
        deliveryDays: 5,
        supplyId: 'supply-1',
        supplierId: 'supplier-1',
      };

      const existingActiveQuote = Quote.create(
        'SKU-001',
        25.90,
        3,
        new Date('2024-01-01'),
        null, // active
        mockSupply,
        mockSupplier,
        'quote-1'
      );

      vi.mocked(supplyRepository.findById).mockResolvedValue(mockSupply);
      vi.mocked(supplierRepository.findById).mockResolvedValue(mockSupplier);
      vi.mocked(quoteRepository.findActiveBySupplyAndSupplier).mockResolvedValue(existingActiveQuote);
      vi.mocked(quoteRepository.update).mockResolvedValue();
      vi.mocked(quoteRepository.save).mockResolvedValue();

      await useCase.execute(dto);

   
      // The previous active quote should be ended
      expect(quoteRepository.update).toHaveBeenCalledTimes(1);
      const endedQuote = vi.mocked(quoteRepository.update).mock.calls[0]?.[0];
      expect(endedQuote?.isActive()).toBe(false);
      expect(endedQuote?.getValidTo()).not.toBeNull();

      // New quote should be saved as active
      expect(quoteRepository.save).toHaveBeenCalledTimes(1);
      const newQuote = vi.mocked(quoteRepository.save).mock.calls[0]?.[0];
      expect(newQuote?.isActive()).toBe(true);
    });
  });
});

