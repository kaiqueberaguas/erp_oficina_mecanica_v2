-- ============================================================================
-- Carga inicial (dados de domínio)
-- ============================================================================

USE oficina_mecanica;

-- Usuário administrador padrão: admin@oficina.com / Admin@123
-- senha_hash = BCrypt (custo 11) de 'Admin@123'
INSERT INTO tb_usuarios (nome, login, senha_hash)
VALUES (
    'Administrador',
    'admin@oficina.com',
    '$2b$11$NnA.Gu9scta2ozzssQwLuOUBk0yVE4oBuIRRqNFBbF51B.ev0w812'
)
ON DUPLICATE KEY UPDATE login = login;
