import type { ICotacaoReadRepository } from '../ports/queries/ICotacaoReadRepository.js';
import type { MenorPrecoInsumoDTO } from '../dtos/MenorPrecoInsumoDTO.js';

export class GetMenorPrecoInsumoQuery {
  constructor(private readonly readRepository: ICotacaoReadRepository) {}

  async execute(supplyId: string): Promise<MenorPrecoInsumoDTO> {
    return this.readRepository.findCheapestBySupplyId(supplyId);
  }
}

