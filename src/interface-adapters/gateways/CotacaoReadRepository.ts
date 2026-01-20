import { getPrismaClient } from '../../infrastructure/database/PrismaClientFactory.js';
import type { ICotacaoReadRepository } from '../../application/ports/queries/ICotacaoReadRepository.js';
import type { MenorPrecoInsumoDTO } from '../../application/dtos/MenorPrecoInsumoDTO.js';
import type { CheapestQuoteDTO } from '../../application/dtos/CheapestQuoteDTO.js';
import { Prisma } from '../../../prisma/generated/client.js';

export class CotacaoReadRepository implements ICotacaoReadRepository {
  async findCheapestByWorkId(workId: string): Promise<CheapestQuoteDTO> {
    const prisma = getPrismaClient();

    const result = await prisma.$queryRaw<
      Array<{
        unit_price: number;
        sku: string;
        supplier_name: string;
      }>
    >(
      Prisma.sql`
        SELECT 
          c.preco_unitario AS unit_price,
          c.sku AS sku,
          f.nome AS supplier_name
        FROM cotacoes c
        INNER JOIN insumos i ON c.insumo_id = i.id
        INNER JOIN obras_insumos oi ON i.id = oi.insumo_id
        INNER JOIN fornecedores f ON c.fornecedor_id = f.id
        WHERE oi.obra_id = ${BigInt(workId)}
          AND c.valid_to IS NULL
        ORDER BY c.preco_unitario ASC
        LIMIT 1
      `
    );

    if (result.length === 0 || !result[0]) {
      return null;
    }

    const row = result[0];
    return {
      unitPrice: Number(row.unit_price),
      sku: row.sku,
      supplierName: row.supplier_name,
    };
  }

  async findCheapestBySupplyId(supplyId: string): Promise<MenorPrecoInsumoDTO> {
    const prisma = getPrismaClient();

    const result = await prisma.$queryRaw<
      Array<{
        supply_id: bigint;
        supply_name: string;
        unit_price: number;
        delivery_days: number;
        supplier_id: bigint;
        supplier_name: string;
        sku: string;
      }>
    >(
      Prisma.sql`
        SELECT 
          i.id AS supply_id,
          i.nome AS supply_name,
          c.preco_unitario AS unit_price,
          c.prazo_entrega_dias AS delivery_days,
          f.id AS supplier_id,
          f.nome AS supplier_name,
          c.sku AS sku
        FROM cotacoes c
        INNER JOIN insumos i ON c.insumo_id = i.id
        INNER JOIN fornecedores f ON c.fornecedor_id = f.id
        WHERE c.insumo_id = ${BigInt(supplyId)}
          AND c.valid_to IS NULL
        ORDER BY c.preco_unitario ASC
        LIMIT 1
      `
    );

    if (result.length === 0 || !result[0]) {
      return null;
    }

    const row = result[0];
    return {
      supplyId: String(row.supply_id),
      supplyName: row.supply_name,
      unitPrice: Number(row.unit_price),
      deliveryDays: row.delivery_days,
      supplierId: String(row.supplier_id),
      supplierName: row.supplier_name,
      sku: row.sku,
    };
  }
}
