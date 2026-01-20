import type { ListarObrasComMenorPrecoQuery } from '../../../application/queries/ListarObrasComMenorPrecoQuery.js';
import { ObraPresenter } from '../../presenters/ObraPresenter.js';
import type { WorkGraphQL, InspectionGraphQL } from '../../presenters/ObraPresenter.js';
import type { IWorkReadRepository } from '../../../application/ports/queries/IWorkReadRepository.js';

/**
 * Resolver for Works Query
 */
export class WorksResolver {
  constructor(
    private readonly listarObrasQuery: ListarObrasComMenorPrecoQuery,
    private readonly workReadRepository: IWorkReadRepository
  ) {}

  async works(_parent: unknown, args: { limit?: number }): Promise<WorkGraphQL[]> {
    const limit = args.limit && args.limit > 0 ? args.limit : undefined;
    const dtos = await this.listarObrasQuery.execute(limit);
    return ObraPresenter.toGraphQLArray(dtos);
  }

  /**
   * Resolver for inspections field with last parameter
   * Since inspections are already loaded in the DTO, we just filter by last if needed
   */
  async inspections(
    parent: WorkGraphQL,
    args: { last?: number }
  ): Promise<InspectionGraphQL[]> {
    if (!parent.inspections || parent.inspections.length === 0) {
      return [];
    }

    // If last parameter is provided, return only the last N inspections
    // Note: inspections are already ordered by created_at DESC from the query
    if (args.last && args.last > 0) {
      return parent.inspections.slice(0, args.last);
    }

    return parent.inspections;
  }
}

