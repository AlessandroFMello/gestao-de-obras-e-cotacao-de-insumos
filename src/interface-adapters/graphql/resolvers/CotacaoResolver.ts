import type { CreateCotacaoUseCase } from '../../../application/use-cases/CreateCotacaoUseCase.js';
import { CotacaoPresenter } from '../../presenters/CotacaoPresenter.js';
import type { CotacaoGraphQL } from '../../presenters/CotacaoPresenter.js';
import type { CreateCotacaoDTO } from '../../../application/dtos/CreateCotacaoDTO.js';

/**
 * GraphQL input type for CreateCotacao mutation
 */
export type CreateCotacaoInput = {
  sku: string;
  unitPrice: number;
  deliveryDays: number;
  supplyId: string;
  supplierId: string;
};

/**
 * Resolver for Cotacao Mutations
 */
export class CotacaoResolver {
  constructor(private readonly createCotacaoUseCase: CreateCotacaoUseCase) {}

  async createCotacao(
    _parent: unknown,
    args: { input: CreateCotacaoInput }
  ): Promise<CotacaoGraphQL> {
    const dto: CreateCotacaoDTO = {
      sku: args.input.sku,
      unitPrice: args.input.unitPrice,
      deliveryDays: args.input.deliveryDays,
      supplyId: args.input.supplyId,
      supplierId: args.input.supplierId,
    };

    const output = await this.createCotacaoUseCase.execute(dto);
    return CotacaoPresenter.toGraphQL(output);
  }
}

