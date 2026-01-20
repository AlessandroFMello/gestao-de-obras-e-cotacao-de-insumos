import type { MenorPrecoInsumoDTO } from '../../dtos/MenorPrecoInsumoDTO.js';
import type { CheapestQuoteDTO } from '../../dtos/CheapestQuoteDTO.js';

export interface ICotacaoReadRepository {
  findCheapestBySupplyId(supplyId: string): Promise<MenorPrecoInsumoDTO>;
  findCheapestByWorkId(workId: string): Promise<CheapestQuoteDTO>;
}

