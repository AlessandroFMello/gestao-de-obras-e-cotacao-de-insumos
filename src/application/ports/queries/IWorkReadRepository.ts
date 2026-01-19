export type WorkWithSuppliesDTO = {
  workId: string;
  workName: string;
  supplyIds: string[];
};

export interface IWorkReadRepository {
  findAllWithSupplies(limit?: number): Promise<WorkWithSuppliesDTO[]>;
}

