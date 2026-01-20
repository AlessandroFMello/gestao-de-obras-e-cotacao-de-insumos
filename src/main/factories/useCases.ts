import { CreateCotacaoUseCase } from '../../application/use-cases/CreateCotacaoUseCase.js';
import { makeCotacaoWriteRepository } from './repositories.js';
import { makeSupplyRepository } from './repositories.js';
import { makeSupplierRepository } from './repositories.js';

/**
 * Factory for application use cases (commands)
 */
export function makeCreateCotacaoUseCase(): CreateCotacaoUseCase {
  const quoteRepository = makeCotacaoWriteRepository();
  const supplyRepository = makeSupplyRepository();
  const supplierRepository = makeSupplierRepository();

  return new CreateCotacaoUseCase(quoteRepository, supplyRepository, supplierRepository);
}

