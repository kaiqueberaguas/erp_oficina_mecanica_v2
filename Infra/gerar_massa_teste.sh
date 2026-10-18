#!/usr/bin/env bash
# Limpa clientes/carros/ordens do banco e recarrega a massa de volume
# (100 clientes, 150 carros, 1500 ordens). Mantém tb_usuarios (admin).
# Requer: container "mysql" do docker-compose rodando e Python 3.
# Uso: ./Infra/gerar_massa_teste.sh
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PY="$(command -v python3 || command -v python)"
MYSQL=(docker exec -i mysql mysql -uroot -proot --default-character-set=utf8mb4 oficina_mecanica)

echo "==> Limpando base (clientes, carros, ordens)..."
# DELETE em cascata e reinício dos auto_increment: os ids da massa começam em 1
"${MYSQL[@]}" 2>/dev/null <<'SQL'
DELETE FROM tb_clientes;
ALTER TABLE tb_clientes AUTO_INCREMENT = 1;
ALTER TABLE tb_carros AUTO_INCREMENT = 1;
ALTER TABLE tb_ordens_servico AUTO_INCREMENT = 1;
SQL

echo "==> Gerando SQL..."
"$PY" "$DIR/massa/gerar_massa.py"

echo "==> Carregando no MySQL..."
"${MYSQL[@]}" 2>/dev/null < "$DIR/massa/massa_volume.sql"

echo "==> Pronto:"
"${MYSQL[@]}" 2>/dev/null -e "SELECT (SELECT COUNT(*) FROM tb_clientes) AS clientes, (SELECT COUNT(*) FROM tb_carros) AS carros, (SELECT COUNT(*) FROM tb_ordens_servico) AS ordens;"
