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

      // Get cheapest quote across all supplies of the work
      const cheapestQuote = await this.cotacaoReadRepository.findCheapestByWorkId(work.workId);
      
      // Get categories of supplies in this work
      const categories = await this.workReadRepository.findCategoriesByWorkId(work.workId);
      
      // Get inspections for this work (fetch all, resolver will filter by last if needed)
      const inspections = await this.workReadRepository.findInspectionsByWorkId(work.workId);

      results.push({
        workId: work.workId,
        workName: work.workName,
        cheapestQuote,
        categories,
        inspections,
      });
    }

    return results;
  }
}

