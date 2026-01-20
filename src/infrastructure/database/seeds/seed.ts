import { getPrismaClient } from '../PrismaClientFactory.js';

/**
 * Seed script to populate the database with initial data.
 * This demonstrates multiple quotes per supply,
 * with some active and some historical.
 */
async function seed() {
  const prisma = getPrismaClient();

  try {
    await prisma.$connect();
    console.log('Starting database seed...');

    // Clear existing data (careful in production!)
    // console.log('Clearing existing data...');
    // await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0`;
    // await prisma.$executeRaw`TRUNCATE TABLE obras_insumos`;
    // await prisma.$executeRaw`TRUNCATE TABLE cotacoes`;
    // await prisma.$executeRaw`TRUNCATE TABLE obras`;
    // await prisma.$executeRaw`TRUNCATE TABLE insumos`;
    // await prisma.$executeRaw`TRUNCATE TABLE fornecedores`;
    // await prisma.$executeRaw`TRUNCATE TABLE categorias`;
    // await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1`;

    console.log('Inserting categories...');
    await prisma.$executeRaw`
      INSERT INTO categorias (nome) VALUES
      ('Cimento'),
      ('Ferro'),
      ('Madeira'),
      ('Tijolo'),
      ('Tinta')
    `;

    console.log('Inserting suppliers...');
    await prisma.$executeRaw`
      INSERT INTO fornecedores (nome) VALUES
      ('Fornecedor A - Construcoes'),
      ('Fornecedor B - Materiais Premium'),
      ('Fornecedor C - Atacado'),
      ('Fornecedor D - Regional'),
      ('Fornecedor E - Express')
    `;

    console.log('Inserting supplies...');
    await prisma.$executeRaw`
      INSERT INTO insumos (nome, tipo, peso_kg, categoria_id) VALUES
      ('Cimento CP-II E-32 50kg', 'Saco', 50.00, 1),
      ('Cimento CP-II E-32 50kg', 'Saco', 50.00, 1),
      ('Cimento CP-III 50kg', 'Saco', 50.00, 1),
      ('Cimento Portland 50kg', 'Saco', 50.00, 1),
      ('Ferro CA-50 10mm', 'Barra', 12.50, 2),
      ('Ferro CA-50 12mm', 'Barra', 18.00, 2),
      ('Ferro CA-60 6mm', 'Barra', 0.22, 2),
      ('Tabua Pinus 2.5cm x 30cm', 'Metro Linear', 8.50, 3),
      ('Viga Eucalipto 6cm x 12cm', 'Metro Linear', 15.00, 3),
      ('Tijolo Ceramico 9x19x19cm', 'Unidade', 2.50, 4),
      ('Tijolo Baiano 9x19x19cm', 'Unidade', 2.20, 4),
      ('Tinta Acrilica Branco 18L', 'Lata', 25.00, 5),
      ('Tinta Esmalte Sintetico 3.6L', 'Lata', 4.50, 5)
    `;

    console.log('Inserting quotes...');
    await prisma.$executeRaw`
      INSERT INTO cotacoes (insumo_id, fornecedor_id, sku, preco_unitario, prazo_entrega_dias, valid_from, valid_to) VALUES
      -- Quotes for Cimento CP-II E-32 50kg (supply_id = 1)
      (1, 1, 'CIM-CPII-50KG-A', 28.90, 3, '2024-01-15 00:00:00', NULL),
      (1, 2, 'CIM-CPII-50KG-B', 25.40, 5, '2024-01-20 00:00:00', NULL),
      (1, 3, 'CIM-CPII-50KG-C', 27.50, 2, '2024-02-01 00:00:00', NULL),
      (1, 1, 'CIM-CPII-50KG-A-OLD', 30.00, 4, '2023-12-01 00:00:00', '2024-01-14 23:59:59'),
      -- Quotes for Cimento CP-III 50kg (supply_id = 3)
      (3, 1, 'CIM-CPIII-50KG-A', 32.00, 3, '2024-01-10 00:00:00', NULL),
      (3, 2, 'CIM-CPIII-50KG-B', 30.50, 5, '2024-01-15 00:00:00', NULL),
      (3, 3, 'CIM-CPIII-50KG-C', 31.20, 2, '2024-02-01 00:00:00', NULL),
      -- Quotes for Ferro CA-50 10mm (supply_id = 5)
      (5, 1, 'FER-CA50-10MM-A', 45.00, 5, '2024-01-01 00:00:00', NULL),
      (5, 2, 'FER-CA50-10MM-B', 42.80, 7, '2024-01-05 00:00:00', NULL),
      (5, 3, 'FER-CA50-10MM-C', 44.50, 3, '2024-01-20 00:00:00', NULL),
      -- Quotes for Ferro CA-50 12mm (supply_id = 6)
      (6, 1, 'FER-CA50-12MM-A', 65.00, 5, '2024-01-01 00:00:00', NULL),
      (6, 2, 'FER-CA50-12MM-B', 62.00, 7, '2024-01-10 00:00:00', NULL),
      -- Quotes for Tabua Pinus (supply_id = 8)
      (8, 1, 'MAD-TABUA-PINUS-A', 12.50, 4, '2024-01-01 00:00:00', NULL),
      (8, 3, 'MAD-TABUA-PINUS-C', 11.80, 6, '2024-01-15 00:00:00', NULL),
      (8, 4, 'MAD-TABUA-PINUS-D', 12.00, 3, '2024-02-01 00:00:00', NULL),
      -- Quotes for Tijolo Ceramico (supply_id = 10)
      (10, 1, 'TIJ-CERAMICO-A', 0.85, 2, '2024-01-01 00:00:00', NULL),
      (10, 3, 'TIJ-CERAMICO-C', 0.78, 4, '2024-01-20 00:00:00', NULL),
      (10, 4, 'TIJ-CERAMICO-D', 0.82, 3, '2024-02-01 00:00:00', NULL),
      -- Quotes for Tinta Acrilica (supply_id = 12)
      (12, 2, 'TIN-ACRILICA-B', 185.00, 5, '2024-01-01 00:00:00', NULL),
      (12, 3, 'TIN-ACRILICA-C', 178.50, 7, '2024-01-15 00:00:00', NULL),
      (12, 5, 'TIN-ACRILICA-E', 180.00, 2, '2024-02-01 00:00:00', NULL)
    `;

    console.log('Inserting works...');
    await prisma.$executeRaw`
      INSERT INTO obras (nome) VALUES
      ('Obra Residencial - Condominio Sol Nascente'),
      ('Obra Comercial - Shopping Center'),
      ('Obra Industrial - Galpao Logistico')
    `;

    console.log('Inserting work-supply associations...');
    await prisma.$executeRaw`
      INSERT INTO obras_insumos (obra_id, insumo_id) VALUES
      -- Work 1 uses: Cimento CP-II, Ferro CA-50 10mm, Tabua Pinus, Tijolo Ceramico
      (1, 1),
      (1, 5),
      (1, 8),
      (1, 10),
      -- Work 2 uses: Cimento CP-III, Ferro CA-50 12mm, Tinta Acrilica
      (2, 3),
      (2, 6),
      (2, 12),
      -- Work 3 uses: Cimento CP-II, Ferro CA-50 10mm, Tabua Pinus
      (3, 1),
      (3, 5),
      (3, 8)
    `;

    console.log('Inserting inspections...');
    await prisma.$executeRaw`
      INSERT INTO inspecoes (obra_id, status, note, created_at) VALUES
      -- Inspections for Work 1
      (1, 'APPROVED', 'Estrutura aprovada. Fundacoes em conformidade.', '2024-01-15 10:00:00'),
      (1, 'PENDING', 'Aguardando revisao de instalacoes eletricas.', '2024-01-20 14:30:00'),
      (1, 'APPROVED', 'Instalacoes hidraulicas aprovadas.', '2024-01-25 09:15:00'),
      (1, 'REJECTED', 'Necessario ajuste na impermeabilizacao.', '2024-02-01 16:45:00'),
      (1, 'APPROVED', 'Impermeabilizacao corrigida e aprovada.', '2024-02-05 11:20:00'),
      -- Inspections for Work 2
      (2, 'APPROVED', 'Projeto estrutural aprovado.', '2024-01-10 08:00:00'),
      (2, 'PENDING', 'Aguardando documentacao de licenca.', '2024-01-18 13:00:00'),
      (2, 'APPROVED', 'Licenca obtida. Inicio de obras aprovado.', '2024-01-22 10:30:00'),
      -- Inspections for Work 3
      (3, 'APPROVED', 'Terreno preparado e aprovado.', '2024-01-05 09:00:00'),
      (3, 'APPROVED', 'Fundacoes concluidas com sucesso.', '2024-01-12 15:00:00'),
      (3, 'PENDING', 'Aguardando entrega de materiais.', '2024-01-28 10:00:00')
    `;

    console.log('Seed completed successfully!');
    console.log('\nSummary:');
    console.log('  - 5 Categories');
    console.log('  - 5 Suppliers');
    console.log('  - 13 Supplies');
    console.log('  - 20 Quotes (some active, some historical)');
    console.log('  - 3 Works');
    console.log('  - 10 Work-Supply associations');
    console.log('  - 11 Inspections');
    console.log('\nThe Supply ID 1 has 4 quotes (3 active, 1 historical)');
    console.log('   The cheapest active quote for Supply ID 1 is from Supplier B (R$ 25.40)');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed()
  .then(() => {
    console.log('Seed script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed script failed:', error);
    process.exit(1);
  });

export { seed };
