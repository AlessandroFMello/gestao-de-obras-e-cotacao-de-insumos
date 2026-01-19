import { getPrismaClient } from '../../infrastructure/database/PrismaClientFactory.js';
import type { ICotacaoWriteRepository } from '../../application/ports/repositories/ICotacaoWriteRepository.js';
import { Quote } from '../../domain/entities/Quote.js';
import { Category } from '../../domain/entities/Category.js';
import { Supply } from '../../domain/entities/Supply.js';
import { Supplier } from '../../domain/entities/Supplier.js';
import { Prisma } from '../../../prisma/generated/client.js';

export class CotacaoWriteRepository implements ICotacaoWriteRepository {
  async save(quote: Quote): Promise<void> {
    const prisma = getPrismaClient();

    // Try to parse quote ID as number (if it's a database ID)
    // Otherwise, let database generate it (AUTO_INCREMENT)
    const quoteId = quote.getId();
    const numericId = quoteId && !isNaN(Number(quoteId)) ? Number(quoteId) : null;

    // Parse supply and supplier IDs (they might be UUIDs or numeric)
    const supplyId = this.parseId(quote.getSupply().getId());
    const supplierId = this.parseId(quote.getSupplier().getId());

    if (numericId) {
      await prisma.$executeRaw`
        INSERT INTO cotacoes (
          id,
          insumo_id,
          fornecedor_id,
          sku,
          preco_unitario,
          prazo_entrega_dias,
          valid_from,
          valid_to
        ) VALUES (
          ${BigInt(numericId)},
          ${BigInt(supplyId)},
          ${BigInt(supplierId)},
          ${quote.getSku()},
          ${quote.getUnitPrice()},
          ${quote.getDeliveryDays()},
          ${quote.getValidFrom()},
          ${quote.getValidTo()}
        )
      `;
    } else {
      // Let database generate ID (AUTO_INCREMENT)
      // The entity keeps its UUID, which is fine for domain purposes
      await prisma.$executeRaw`
        INSERT INTO cotacoes (
          insumo_id,
          fornecedor_id,
          sku,
          preco_unitario,
          prazo_entrega_dias,
          valid_from,
          valid_to
        ) VALUES (
          ${BigInt(supplyId)},
          ${BigInt(supplierId)},
          ${quote.getSku()},
          ${quote.getUnitPrice()},
          ${quote.getDeliveryDays()},
          ${quote.getValidFrom()},
          ${quote.getValidTo()}
        )
      `;
    }
  }

  private parseId(id: string): number {
    // Try to parse as number, if it fails, extract numeric part or use a default
    const numeric = Number(id);
    if (!isNaN(numeric) && numeric > 0) {
      return numeric;
    }
    // If it's a UUID or non-numeric, try to extract number from string (e.g., "supply-1" -> 1)
    const match = id.match(/\d+/);
    if (match) {
      return Number(match[0]);
    }
    // Fallback: throw error as we need a valid numeric ID for database
    throw new Error(`Invalid ID format: ${id}. Expected numeric ID or format like "supply-1"`);
  }

  async findActiveBySupplyAndSupplier(
    supplyId: string,
    supplierId: string
  ): Promise<Quote | null> {
    const prisma = getPrismaClient();

    const result = await prisma.$queryRaw<
      Array<{
        id: bigint;
        sku: string;
        preco_unitario: number;
        prazo_entrega_dias: number;
        valid_from: Date;
        valid_to: Date | null;
        insumo_id: bigint;
        fornecedor_id: bigint;
        insumo_nome: string;
        insumo_tipo: string;
        insumo_peso_kg: number;
        categoria_id: bigint;
        categoria_nome: string;
        fornecedor_nome: string;
      }>
    >(
      Prisma.sql`
        SELECT 
          c.id,
          c.sku,
          c.preco_unitario,
          c.prazo_entrega_dias,
          c.valid_from,
          c.valid_to,
          c.insumo_id,
          c.fornecedor_id,
          i.nome AS insumo_nome,
          i.tipo AS insumo_tipo,
          i.peso_kg AS insumo_peso_kg,
          i.categoria_id,
          cat.nome AS categoria_nome,
          f.nome AS fornecedor_nome
        FROM cotacoes c
        INNER JOIN insumos i ON c.insumo_id = i.id
        INNER JOIN categorias cat ON i.categoria_id = cat.id
        INNER JOIN fornecedores f ON c.fornecedor_id = f.id
        WHERE c.insumo_id = ${BigInt(supplyId)}
          AND c.fornecedor_id = ${BigInt(supplierId)}
          AND c.valid_to IS NULL
        LIMIT 1
      `
    );

    if (result.length === 0 || !result[0]) {
      return null;
    }

    return this.mapToDomain(result[0]);
  }

  async update(quote: Quote): Promise<void> {
    const prisma = getPrismaClient();

    const quoteId = this.parseId(quote.getId());

    await prisma.$executeRaw`
      UPDATE cotacoes
      SET 
        sku = ${quote.getSku()},
        preco_unitario = ${quote.getUnitPrice()},
        prazo_entrega_dias = ${quote.getDeliveryDays()},
        valid_from = ${quote.getValidFrom()},
        valid_to = ${quote.getValidTo()}
      WHERE id = ${BigInt(quoteId)}
    `;
  }

  private mapToDomain(row: {
    id: bigint;
    sku: string;
    preco_unitario: number;
    prazo_entrega_dias: number;
    valid_from: Date;
    valid_to: Date | null;
    insumo_id: bigint;
    fornecedor_id: bigint;
    insumo_nome: string;
    insumo_tipo: string;
    insumo_peso_kg: number;
    categoria_id: bigint;
    categoria_nome: string;
    fornecedor_nome: string;
  }): Quote {
    const category = Category.create(row.categoria_nome, String(row.categoria_id));
    const supply = Supply.create(
      row.insumo_nome,
      row.insumo_tipo,
      row.insumo_peso_kg,
      category,
      String(row.insumo_id)
    );
    const supplier = Supplier.create(row.fornecedor_nome, String(row.fornecedor_id));

    return Quote.create(
      row.sku,
      row.preco_unitario,
      row.prazo_entrega_dias,
      row.valid_from,
      row.valid_to,
      supply,
      supplier,
      String(row.id)
    );
  }
}

