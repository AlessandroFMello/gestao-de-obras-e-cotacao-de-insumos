import type { IWorkReadRepository } from '../ports/queries/IWorkReadRepository.js';
import type { ICotacaoReadRepository } from '../ports/queries/ICotacaoReadRepository.js';
import type { ObraComMenorPrecoDTO } from '../dtos/ObraComMenorPrecoDTO.js';

export class ListarObrasComMenorPrecoQuery {
  constructor(
    private readonly workReadRepository: IWorkReadRepository,
    private readonly cotacaoReadRepository: ICotacaoReadRepository
  ) {}

  async execute(limit?: number): Promise<ObraComMenorPrecoDTO[]> {
    const works = await this.workReadRepository.findAllWithSupplies(limit);

    const results: ObraComMenorPrecoDTO[] = [];

    for (const work of works) {
      // Skip works without supplies
      if (work.supplyIds.length === 0) {
        continue;
      }

      // Get cheapest quote for each supply
      const cheapestQuotes = await Promise.all(
        work.supplyIds.map((supplyId) =>
          this.cotacaoReadRepository.findCheapestBySupplyId(supplyId)
        )
      );

      results.push({
        workId: work.workId,
        workName: work.workName,
        cheapestQuotes,
      });
    }

    return results;
  }
}

