-- ============================================================================
-- ERP Oficina Mecânica v2 - Criação do esquema (MySQL 8.x)
-- Baseado em Documentacao/Arquitetura.md (seção 4)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS tb_oficina_mecanica
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_0900_ai_ci;

USE oficina_mecanica;

-- ----------------------------------------------------------------------------
-- usuarios (autenticação do sistema)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tb_usuarios (
    id            INT          NOT NULL AUTO_INCREMENT,
    nome          VARCHAR(100) NOT NULL,
    login         VARCHAR(100) NOT NULL,
    senha_hash    VARCHAR(255) NOT NULL,
    data_criacao  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT uq_usuarios_login UNIQUE (login)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------------------------
-- clientes
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tb_clientes (
    id       INT          NOT NULL AUTO_INCREMENT,
    nome     VARCHAR(100) NOT NULL,
    cpf      VARCHAR(14)  NOT NULL,   -- formato 000.000.000-00
    contato  VARCHAR(20)  NOT NULL,   -- telefone ou e-mail
    PRIMARY KEY (id),
    CONSTRAINT uq_clientes_cpf UNIQUE (cpf)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------------------------
-- carros
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tb_carros (
    id          INT         NOT NULL AUTO_INCREMENT,
    cliente_id  INT         NOT NULL,
    marca       VARCHAR(50) NOT NULL,
    modelo      VARCHAR(50) NOT NULL,
    placa       VARCHAR(8)  NOT NULL,  -- ABC-1234 ou ABC1D23 (Mercosul)
    PRIMARY KEY (id),
    CONSTRAINT uq_carros_placa UNIQUE (placa),
    INDEX idx_carros_cliente_id (cliente_id),
    CONSTRAINT fk_carros_cliente FOREIGN KEY (cliente_id)
        REFERENCES tb_clientes (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------------------------------------------------------
-- ordens_servico
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tb_ordens_servico (
    id                     INT           NOT NULL AUTO_INCREMENT,
    carro_id               INT           NOT NULL,
    descricao_ordem        TEXT          NOT NULL,
    valor_servico          DECIMAL(10,2) NOT NULL,
    status                 VARCHAR(20)   NOT NULL,
    data_entrada_carro     DATE          NOT NULL,
    data_inicio_servico    DATE          NULL,
    data_fim_servico       DATE          NULL,
    data_retirada_veiculo  DATE          NULL,
    PRIMARY KEY (id),
    INDEX idx_ordens_carro_id (carro_id),
    INDEX idx_ordens_status (status),
    INDEX idx_ordens_data_entrada (data_entrada_carro),
    CONSTRAINT fk_ordens_carro FOREIGN KEY (carro_id)
        REFERENCES tb_carros (id) ON DELETE CASCADE,
    CONSTRAINT chk_ordens_status
        CHECK (status IN ('aberta', 'finalizada', 'cancelada'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
