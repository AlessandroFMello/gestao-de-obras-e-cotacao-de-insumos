import { ListarObrasComMenorPrecoQuery } from '../../application/queries/ListarObrasComMenorPrecoQuery.js';
import { GetMenorPrecoInsumoQuery } from '../../application/queries/GetMenorPrecoInsumoQuery.js';
import { makeCotacaoReadRepository } from './repositories.js';
import { makeWorkReadRepository } from './repositories.js';

/**
 * Factory for application queries
 */
export function makeListarObrasComMenorPrecoQuery(): ListarObrasComMenorPrecoQuery {
  const workReadRepository = makeWorkReadRepository();
  const cotacaoReadRepository = makeCotacaoReadRepository();

  return new ListarObrasComMenorPrecoQuery(workReadRepository, cotacaoReadRepository);
}

export function makeGetMenorPrecoInsumoQuery(): GetMenorPrecoInsumoQuery {
  const cotacaoReadRepository = makeCotacaoReadRepository();

  return new GetMenorPrecoInsumoQuery(cotacaoReadRepository);
}

