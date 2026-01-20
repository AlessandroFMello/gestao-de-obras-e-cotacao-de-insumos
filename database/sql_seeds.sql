USE obras_insumos_db;

-- Limpar dados existentes (cuidado em producao!)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE inspecoes;
TRUNCATE TABLE obras_insumos;
TRUNCATE TABLE cotacoes;
TRUNCATE TABLE obras;
TRUNCATE TABLE insumos;
TRUNCATE TABLE fornecedores;
TRUNCATE TABLE categorias;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO categorias (nome) VALUES
('Cimento'),
('Ferro'),
('Madeira'),
('Tijolo'),
('Tinta');

INSERT INTO fornecedores (nome) VALUES
('Fornecedor A - Construcoes'),
('Fornecedor B - Materiais Premium'),
('Fornecedor C - Atacado'),
('Fornecedor D - Regional'),
('Fornecedor E - Express');

INSERT INTO insumos (nome, tipo, peso_kg, categoria_id) VALUES
-- Cimentos
('Cimento CP-II E-32 50kg', 'Saco', 50.00, 1),
('Cimento CP-II E-32 50kg', 'Saco', 50.00, 1), -- Duplicado para demonstrar multiplas cotacoes
('Cimento CP-III 50kg', 'Saco', 50.00, 1),
('Cimento Portland 50kg', 'Saco', 50.00, 1),

-- Ferros
('Ferro CA-50 10mm', 'Barra', 12.50, 2),
('Ferro CA-50 12mm', 'Barra', 18.00, 2),
('Ferro CA-60 6mm', 'Barra', 0.22, 2),

-- Madeiras
('Tabua Pinus 2.5cm x 30cm', 'Metro Linear', 8.50, 3),
('Viga Eucalipto 6cm x 12cm', 'Metro Linear', 15.00, 3),

-- Tijolos
('Tijolo Ceramico 9x19x19cm', 'Unidade', 2.50, 4),
('Tijolo Baiano 9x19x19cm', 'Unidade', 2.20, 4),

-- Tintas
('Tinta Acrilica Branco 18L', 'Lata', 25.00, 5),
('Tinta Esmalte Sintetico 3.6L', 'Lata', 4.50, 5);


INSERT INTO cotacoes (insumo_id, fornecedor_id, sku, preco_unitario, prazo_entrega_dias, valid_from, valid_to) VALUES
-- Multiplas cotacoes vigentes e historicas para demonstrar a query de menor preco
-- Cotacoes para Cimento CP-II E-32 50kg (insumo_id = 1)
-- Cotacao vigente do Fornecedor A (mais cara)
(1, 1, 'CIM-CPII-50KG-A', 28.90, 3, '2024-01-15 00:00:00', NULL),
-- Cotacao vigente do Fornecedor B (mais barata - MENOR PRECO)
(1, 2, 'CIM-CPII-50KG-B', 25.40, 5, '2024-01-20 00:00:00', NULL),
-- Cotacao vigente do Fornecedor C (intermediaria)
(1, 3, 'CIM-CPII-50KG-C', 27.50, 2, '2024-02-01 00:00:00', NULL),
-- Cotacao historica (encerrada)
(1, 1, 'CIM-CPII-50KG-A-OLD', 30.00, 4, '2023-12-01 00:00:00', '2024-01-14 23:59:59'),

-- Cotacoes para Cimento CP-III 50kg (insumo_id = 3)
(3, 1, 'CIM-CPIII-50KG-A', 32.00, 3, '2024-01-10 00:00:00', NULL),
(3, 2, 'CIM-CPIII-50KG-B', 30.50, 5, '2024-01-15 00:00:00', NULL),
(3, 3, 'CIM-CPIII-50KG-C', 31.20, 2, '2024-02-01 00:00:00', NULL),

-- Cotacoes para Ferro CA-50 10mm (insumo_id = 5)
(5, 1, 'FER-CA50-10MM-A', 45.00, 5, '2024-01-01 00:00:00', NULL),
(5, 2, 'FER-CA50-10MM-B', 42.80, 7, '2024-01-05 00:00:00', NULL),
(5, 3, 'FER-CA50-10MM-C', 44.50, 3, '2024-01-20 00:00:00', NULL),

-- Cotacoes para Ferro CA-50 12mm (insumo_id = 6)
(6, 1, 'FER-CA50-12MM-A', 65.00, 5, '2024-01-01 00:00:00', NULL),
(6, 2, 'FER-CA50-12MM-B', 62.00, 7, '2024-01-10 00:00:00', NULL),

-- Cotacoes para Tabua Pinus (insumo_id = 8)
(8, 1, 'MAD-TABUA-PINUS-A', 12.50, 4, '2024-01-01 00:00:00', NULL),
(8, 3, 'MAD-TABUA-PINUS-C', 11.80, 6, '2024-01-15 00:00:00', NULL),
(8, 4, 'MAD-TABUA-PINUS-D', 12.00, 3, '2024-02-01 00:00:00', NULL),

-- Cotacoes para Tijolo Ceramico (insumo_id = 10)
(10, 1, 'TIJ-CERAMICO-A', 0.85, 2, '2024-01-01 00:00:00', NULL),
(10, 3, 'TIJ-CERAMICO-C', 0.78, 4, '2024-01-20 00:00:00', NULL),
(10, 4, 'TIJ-CERAMICO-D', 0.82, 3, '2024-02-01 00:00:00', NULL),

-- Cotacoes para Tinta Acrilica (insumo_id = 12)
(12, 2, 'TIN-ACRILICA-B', 185.00, 5, '2024-01-01 00:00:00', NULL),
(12, 3, 'TIN-ACRILICA-C', 178.50, 7, '2024-01-15 00:00:00', NULL),
(12, 5, 'TIN-ACRILICA-E', 180.00, 2, '2024-02-01 00:00:00', NULL);

INSERT INTO obras (nome) VALUES
('Obra Residencial - Condominio Sol Nascente'),
('Obra Comercial - Shopping Center'),
('Obra Industrial - Galpao Logistico');

-- Obra 1 usa: Cimento CP-II, Ferro CA-50 10mm, Tabua Pinus, Tijolo Ceramico
INSERT INTO obras_insumos (obra_id, insumo_id) VALUES
(1, 1), -- Cimento CP-II E-32
(1, 5), -- Ferro CA-50 10mm
(1, 8), -- Tabua Pinus
(1, 10); -- Tijolo Ceramico

-- Obra 2 usa: Cimento CP-III, Ferro CA-50 12mm, Tinta Acrilica
INSERT INTO obras_insumos (obra_id, insumo_id) VALUES
(2, 3), -- Cimento CP-III
(2, 6), -- Ferro CA-50 12mm
(2, 12); -- Tinta Acrilica

-- Obra 3 usa: Cimento CP-II, Ferro CA-50 10mm, Tabua Pinus
INSERT INTO obras_insumos (obra_id, insumo_id) VALUES
(3, 1), -- Cimento CP-II E-32
(3, 5), -- Ferro CA-50 10mm
(3, 8); -- Tabua Pinus

-- Inspeções para as obras
INSERT INTO inspecoes (obra_id, status, note, created_at) VALUES
-- Inspeções para Obra 1
(1, 'APPROVED', 'Estrutura aprovada. Fundacoes em conformidade.', '2024-01-15 10:00:00'),
(1, 'PENDING', 'Aguardando revisao de instalacoes eletricas.', '2024-01-20 14:30:00'),
(1, 'APPROVED', 'Instalacoes hidraulicas aprovadas.', '2024-01-25 09:15:00'),
(1, 'REJECTED', 'Necessario ajuste na impermeabilizacao.', '2024-02-01 16:45:00'),
(1, 'APPROVED', 'Impermeabilizacao corrigida e aprovada.', '2024-02-05 11:20:00'),

-- Inspeções para Obra 2
(2, 'APPROVED', 'Projeto estrutural aprovado.', '2024-01-10 08:00:00'),
(2, 'PENDING', 'Aguardando documentacao de licenca.', '2024-01-18 13:00:00'),
(2, 'APPROVED', 'Licenca obtida. Inicio de obras aprovado.', '2024-01-22 10:30:00'),

-- Inspeções para Obra 3
(3, 'APPROVED', 'Terreno preparado e aprovado.', '2024-01-05 09:00:00'),
(3, 'APPROVED', 'Fundacoes concluidas com sucesso.', '2024-01-12 15:00:00'),
(3, 'PENDING', 'Aguardando entrega de materiais.', '2024-01-28 10:00:00');
