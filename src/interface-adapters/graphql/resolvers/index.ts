import { WorksResolver } from './WorksResolver.js';
import { CotacaoResolver } from './CotacaoResolver.js';
import { makeListarObrasComMenorPrecoQuery } from '../../../main/factories/queries.js';
import { makeCreateCotacaoUseCase } from '../../../main/factories/useCases.js';
import { makeWorkReadRepository } from '../../../main/factories/repositories.js';

/**
 * Create resolver instances with dependencies injected
 */
const worksResolver = new WorksResolver(
  makeListarObrasComMenorPrecoQuery(),
  makeWorkReadRepository()
);
const cotacaoResolver = new CotacaoResolver(makeCreateCotacaoUseCase());

/**
 * GraphQL resolvers
 */
export const resolvers = {
  Query: {
    works: (parent: unknown, args: { limit?: number }) => worksResolver.works(parent, args),
  },
  Mutation: {
    createCotacao: (parent: unknown, args: { input: unknown }) =>
      cotacaoResolver.createCotacao(parent, args as { input: { sku: string; unitPrice: number; deliveryDays: number; supplyId: string; supplierId: string } }),
  },
  Work: {
    inspections: (parent: unknown, args: { last?: number }) =>
      worksResolver.inspections(parent as any, args),
  },
};

