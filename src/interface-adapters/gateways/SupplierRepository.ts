import { getPrismaClient } from '../../infrastructure/database/PrismaClientFactory.js';
import type { ISupplierRepository } from '../../application/ports/repositories/ISupplierRepository.js';
import { Supplier } from '../../domain/entities/Supplier.js';
import { Prisma } from '../../../prisma/generated/client.js';

export class SupplierRepository implements ISupplierRepository {
  async findById(id: string): Promise<Supplier | null> {
    const prisma = getPrismaClient();

    const result = await prisma.$queryRaw<
      Array<{
        id: bigint;
        nome: string;
      }>
    >(
      Prisma.sql`
        SELECT 
          id,
          nome
        FROM fornecedores
        WHERE id = ${BigInt(id)}
        LIMIT 1
      `
    );

    if (result.length === 0 || !result[0]) {
      return null;
    }

    return this.mapToDomain(result[0]);
  }

  private mapToDomain(row: { id: bigint; nome: string }): Supplier {
    return Supplier.create(row.nome, String(row.id));
  }
}
