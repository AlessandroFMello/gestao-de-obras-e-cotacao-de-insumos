import type { MenorPrecoInsumoDTO } from '../../dtos/MenorPrecoInsumoDTO.js';

export interface ICotacaoReadRepository {
  findCheapestBySupplyId(supplyId: string): Promise<MenorPrecoInsumoDTO>;
}

