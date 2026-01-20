import { getPrismaClient } from '../../infrastructure/database/PrismaClientFactory.js';
import type { ISupplyRepository } from '../../application/ports/repositories/ISupplyRepository.js';
import { Supply } from '../../domain/entities/Supply.js';
import { Category } from '../../domain/entities/Category.js';
import { Prisma } from '../../../prisma/generated/client.js';

export class SupplyRepository implements ISupplyRepository {
  async findById(id: string): Promise<Supply | null> {
    const prisma = getPrismaClient();

    const result = await prisma.$queryRaw<
      Array<{
        id: bigint;
        nome: string;
        tipo: string;
        peso_kg: number;
        categoria_id: bigint;
        categoria_nome: string;
      }>
    >(
      Prisma.sql`
        SELECT 
          i.id,
          i.nome,
          i.tipo,
          i.peso_kg,
          i.categoria_id,
          c.nome AS categoria_nome
        FROM insumos i
        INNER JOIN categorias c ON i.categoria_id = c.id
        WHERE i.id = ${BigInt(id)}
        LIMIT 1
      `
    );

    if (result.length === 0 || !result[0]) {
      return null;
    }

    return this.mapToDomain(result[0]);
  }

  private mapToDomain(row: {
    id: bigint;
    nome: string;
    tipo: string;
    peso_kg: number;
    categoria_id: bigint;
    categoria_nome: string;
  }): Supply {
    const category = Category.create(row.categoria_nome, String(row.categoria_id));
    return Supply.create(row.nome, row.tipo, row.peso_kg, category, String(row.id));
  }
}
