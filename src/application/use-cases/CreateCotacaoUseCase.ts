import type { ICotacaoWriteRepository } from '../ports/repositories/ICotacaoWriteRepository.js';
import type { ISupplyRepository } from '../ports/repositories/ISupplyRepository.js';
import type { ISupplierRepository } from '../ports/repositories/ISupplierRepository.js';
import type { CreateCotacaoDTO, CreateCotacaoOutput } from '../dtos/index.js';
import { Quote } from '../../domain/entities/Quote.js';
import { EntityNotFoundError } from '../errors/index.js';

export class CreateCotacaoUseCase {
  constructor(
    private readonly quoteRepository: ICotacaoWriteRepository,
    private readonly supplyRepository: ISupplyRepository,
    private readonly supplierRepository: ISupplierRepository
  ) {}

  async execute(dto: CreateCotacaoDTO): Promise<CreateCotacaoOutput> {
    const supply = await this.supplyRepository.findById(dto.supplyId);
    if (!supply) {
      throw new EntityNotFoundError('Supply', dto.supplyId);
    }

    const supplier = await this.supplierRepository.findById(dto.supplierId);
    if (!supplier) {
      throw new EntityNotFoundError('Supplier', dto.supplierId);
    }

    const existingActiveQuote = await this.quoteRepository.findActiveBySupplyAndSupplier(
      dto.supplyId,
      dto.supplierId
    );

    if (existingActiveQuote) {
      const endedQuote = Quote.create(
        existingActiveQuote.getSku(),
        existingActiveQuote.getUnitPrice(),
        existingActiveQuote.getDeliveryDays(),
        existingActiveQuote.getValidFrom(),
        new Date(), // End the quote now
        existingActiveQuote.getSupply(),
        existingActiveQuote.getSupplier(),
        existingActiveQuote.getId()
      );
      await this.quoteRepository.update(endedQuote);
    }

    // Create new active quote
    const newQuote = Quote.create(
      dto.sku,
      dto.unitPrice,
      dto.deliveryDays,
      new Date(), // validFrom is now
      null, // validTo is null (active)
      supply,
      supplier
    );

    await this.quoteRepository.save(newQuote);

    return {
      id: newQuote.getId(),
      sku: newQuote.getSku(),
      unitPrice: newQuote.getUnitPrice(),
      deliveryDays: newQuote.getDeliveryDays(),
      validFrom: newQuote.getValidFrom(),
      validTo: newQuote.getValidTo(),
      supplyId: supply.getId(),
      supplierId: supplier.getId(),
    };
  }
}

