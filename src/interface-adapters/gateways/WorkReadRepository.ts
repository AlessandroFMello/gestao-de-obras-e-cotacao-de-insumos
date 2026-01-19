import { getPrismaClient } from '../../infrastructure/database/PrismaClientFactory.js';

import type { IWorkReadRepository, WorkWithSuppliesDTO } from '../../application/ports/queries/IWorkReadRepository.js';
import { Prisma } from '../../../prisma/generated/client.js';

export class WorkReadRepository implements IWorkReadRepository {
  async findAllWithSupplies(limit?: number): Promise<WorkWithSuppliesDTO[]> {
    const prisma = getPrismaClient();

    const limitClause = limit ? Prisma.sql`LIMIT ${limit}` : Prisma.empty;

    const result = await prisma.$queryRaw<
      Array<{
        obra_id: bigint;
        obra_nome: string;
        insumo_ids: string;
      }>
    >(
      Prisma.sql`
        SELECT 
          o.id AS obra_id,
          o.nome AS obra_nome,
          GROUP_CONCAT(oi.insumo_id ORDER BY oi.insumo_id) AS insumo_ids
        FROM obras o
        INNER JOIN obras_insumos oi ON o.id = oi.obra_id
        GROUP BY o.id, o.nome
        ${limitClause}
      `
    );

    return result
      .filter((row): row is NonNullable<typeof row> => row !== null && row !== undefined)
      .map((row) => ({
        workId: String(row.obra_id),
        workName: row.obra_nome,
        supplyIds: row.insumo_ids ? row.insumo_ids.split(',').map(String) : [],
      }));
  }
}

