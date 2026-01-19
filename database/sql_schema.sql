CREATE DATABASE IF NOT EXISTS obras_insumos_db;
USE obras_insumos_db;

CREATE TABLE IF NOT EXISTS categorias (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS insumos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    peso_kg DECIMAL(10,2) NOT NULL,
    categoria_id BIGINT NOT NULL,
    CONSTRAINT fk_insumo_categoria
        FOREIGN KEY (categoria_id)
        REFERENCES categorias(id)
);

CREATE TABLE IF NOT EXISTS fornecedores (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL
);

CREATE TABLE IF NOT EXISTS cotacoes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    insumo_id BIGINT NOT NULL,
    fornecedor_id BIGINT NOT NULL,
    sku VARCHAR(100) NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    prazo_entrega_dias INT NOT NULL,
    valid_from DATETIME NOT NULL,
    valid_to DATETIME NULL,

    CONSTRAINT fk_cotacao_insumo
        FOREIGN KEY (insumo_id)
        REFERENCES insumos(id),

    CONSTRAINT fk_cotacao_fornecedor
        FOREIGN KEY (fornecedor_id)
        REFERENCES fornecedores(id)
);

CREATE TABLE IF NOT EXISTS obras (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL
);

CREATE TABLE IF NOT EXISTS obras_insumos (
    obra_id BIGINT NOT NULL,
    insumo_id BIGINT NOT NULL,
    PRIMARY KEY (obra_id, insumo_id),

    CONSTRAINT fk_obra_insumo_obra
        FOREIGN KEY (obra_id)
        REFERENCES obras(id),

    CONSTRAINT fk_obra_insumo_insumo
        FOREIGN KEY (insumo_id)
        REFERENCES insumos(id)
);

CREATE INDEX idx_cotacao_vigente
ON cotacoes (insumo_id, valid_to);

CREATE INDEX idx_cotacao_preco
ON cotacoes (insumo_id, preco_unitario);

CREATE INDEX idx_obra_insumo
ON obras_insumos (obra_id, insumo_id);

-- =========================================================
-- Observações:
-- - Cotação vigente: valid_to IS NULL
-- - Histórico suportado via versionamento
-- - Modelo preparado para futuras extensões (obra/região)
-- =========================================================
