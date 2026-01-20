import type { CategoryDTO } from '../../dtos/CategoryDTO.js';
import type { InspectionDTO } from '../../dtos/InspectionDTO.js';

export type WorkWithSuppliesDTO = {
  workId: string;
  workName: string;
  supplyIds: string[];
};

export interface IWorkReadRepository {
  findAllWithSupplies(limit?: number): Promise<WorkWithSuppliesDTO[]>;
  findCategoriesByWorkId(workId: string): Promise<CategoryDTO[]>;
  findInspectionsByWorkId(workId: string, limit?: number): Promise<InspectionDTO[]>;
}

