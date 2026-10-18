"""Gera Infra/massa/massa_volume.sql: 100 clientes, 150 carros e 1500 ordens.

As ordens cobrem os 24 meses até HOJE (fixo abaixo), de segunda a sexta,
com 2 ou 3 ordens por dia (dias de 2 são sorteados para fechar o total).
Determinístico (seed fixa): rodar de novo gera o mesmo arquivo.

Uso: python Infra/massa/gerar_massa.py
"""
import random
from datetime import date, timedelta
from pathlib import Path

HOJE = date(2026, 10, 18)
INICIO = date(2024, 10, 19)  # 24 meses antes
N_CLIENTES, N_CARROS, N_ORDENS = 100, 150, 1500

rnd = random.Random(42)

NOMES = ["Ana", "Bruno", "Carlos", "Daniela", "Eduardo", "Fernanda", "Gabriel", "Helena", "Igor", "Juliana",
         "Kleber", "Larissa", "Marcos", "Natália", "Otávio", "Patrícia", "Rafael", "Sandra", "Thiago", "Vanessa",
         "Wagner", "Yasmin", "Lucas", "Mariana", "Pedro", "Camila", "Diego", "Renata", "Felipe", "Beatriz"]
SOBRENOMES = ["Silva", "Santos", "Oliveira", "Souza", "Pereira", "Lima", "Costa", "Ribeiro", "Almeida", "Carvalho",
              "Gomes", "Martins", "Araújo", "Barbosa", "Rocha", "Dias", "Nunes", "Moreira", "Cardoso", "Teixeira"]

CARROS = {
    "Volkswagen": ["Gol", "Polo", "Virtus", "T-Cross", "Saveiro"],
    "Fiat": ["Uno", "Argo", "Mobi", "Strada", "Toro"],
    "Chevrolet": ["Onix", "Prisma", "Tracker", "S10", "Celta"],
    "Ford": ["Ka", "Fiesta", "EcoSport", "Ranger"],
    "Toyota": ["Corolla", "Etios", "Hilux", "Yaris"],
    "Honda": ["Civic", "Fit", "HR-V", "City"],
    "Hyundai": ["HB20", "Creta", "i30"],
    "Renault": ["Kwid", "Sandero", "Duster", "Logan"],
}

# (descrição, valor mín, valor máx)
SERVICOS = [
    ("Troca de óleo e filtro", 150, 380),
    ("Revisão completa de 10.000 km", 450, 900),
    ("Substituição de pastilhas de freio dianteiras", 220, 520),
    ("Alinhamento e balanceamento", 120, 260),
    ("Troca da correia dentada e tensionador", 650, 1600),
    ("Reparo no sistema de arrefecimento", 300, 1100),
    ("Substituição de bateria", 380, 780),
    ("Troca de amortecedores dianteiros", 700, 1800),
    ("Diagnóstico de injeção eletrônica", 180, 450),
    ("Troca de velas e cabos de ignição", 200, 520),
    ("Reparo do sistema elétrico", 250, 1200),
    ("Troca do kit de embreagem", 900, 2400),
    ("Higienização do ar-condicionado", 150, 350),
    ("Substituição de discos de freio", 450, 1100),
    ("Retífica do cabeçote", 1500, 4200),
    ("Troca de pneus (jogo de 4)", 1200, 3200),
    ("Reparo da suspensão", 400, 1500),
    ("Troca do filtro de combustível e limpeza de bicos", 280, 640),
]


def dv_cpf(nove):
    def calc(d):
        s = sum(int(x) * w for x, w in zip(d, range(len(d) + 1, 1, -1)))
        r = s * 10 % 11
        return str(0 if r == 10 else r)
    d1 = calc(nove)
    return nove + d1 + calc(nove + d1)


def gerar_cpfs(n):
    cpfs = set()
    while len(cpfs) < n:
        base = "".join(str(rnd.randint(0, 9)) for _ in range(9))
        if len(set(base)) > 1:
            cpfs.add(dv_cpf(base))
    return sorted(cpfs, key=lambda _: rnd.random())


def gerar_placas(n):
    L = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    placas = set()
    while len(placas) < n:
        base = "".join(rnd.choice(L) for _ in range(3))
        if rnd.random() < 0.5:  # Mercosul ABC1D23
            placas.add(f"{base}{rnd.randint(0, 9)}{rnd.choice(L)}{rnd.randint(0, 99):02d}")
        else:  # antiga ABC1234 (gravada sem hífen)
            placas.add(f"{base}{rnd.randint(0, 9999):04d}")
    return sorted(placas, key=lambda _: rnd.random())


def q(s):
    return "'" + s.replace("\\", "\\\\").replace("'", "''") + "'"


def d(x):
    return "NULL" if x is None else f"'{x.isoformat()}'"


# ---- clientes ---------------------------------------------------------------
cpfs = gerar_cpfs(N_CLIENTES)
nomes_usados = set()
clientes = []
for i in range(N_CLIENTES):
    while True:
        nome = f"{rnd.choice(NOMES)} {rnd.choice(SOBRENOMES)} {rnd.choice(SOBRENOMES)}"
        if nome not in nomes_usados:
            nomes_usados.add(nome)
            break
    contato = f"({rnd.choice([11, 19, 21, 31, 41, 47, 51, 61])}) 9{rnd.randint(1000, 9999)}-{rnd.randint(0, 9999):04d}"
    clientes.append((i + 1, nome, cpfs[i], contato))

# ---- carros: todo cliente tem >= 1; os 50 restantes vão para clientes aleatórios
placas = gerar_placas(N_CARROS)
donos = list(range(1, N_CLIENTES + 1)) + [rnd.randint(1, N_CLIENTES) for _ in range(N_CARROS - N_CLIENTES)]
rnd.shuffle(donos)
carros = []
for i, dono in enumerate(donos):
    marca = rnd.choice(list(CARROS))
    carros.append((i + 1, dono, marca, rnd.choice(CARROS[marca]), placas[i]))

# ---- ordens: dias úteis, 2 ou 3 por dia, total exato -------------------------
dias = [INICIO + timedelta(n) for n in range((HOJE - INICIO).days + 1)]
dias = [x for x in dias if x.weekday() < 5]
assert 2 * len(dias) <= N_ORDENS <= 3 * len(dias), (len(dias), N_ORDENS)
qtd = {x: 3 for x in dias}
for x in rnd.sample(dias, 3 * len(dias) - N_ORDENS):
    qtd[x] = 2


def util_depois(x, n):
    """x + n dias úteis (limitado a HOJE)."""
    while n > 0:
        x += timedelta(1)
        if x.weekday() < 5:
            n -= 1
    return min(x, HOJE)


ordens = []
for dia in dias:
    for _ in range(qtd[dia]):
        desc, vmin, vmax = rnd.choice(SERVICOS)
        valor = round(rnd.uniform(vmin, vmax) / 5) * 5 + rnd.choice([0, 0, 0, 0.90])
        idade = (HOJE - dia).days
        carro = rnd.choice(carros)[0]
        ini = fim = ret = None
        if idade > 21:  # histórico: quase tudo encerrado
            etapa = rnd.choices([4, 5, 3], [90, 8, 2])[0]
        else:  # recentes: distribuídas em todas as etapas
            etapa = rnd.choices([1, 2, 3, 4, 5], [15, 20, 25, 35, 5] if idade > 7 else [25, 25, 25, 20, 5])[0]
        if etapa in (2, 3, 4):
            ini = util_depois(dia, rnd.randint(0, 2))
        if etapa == 4:
            fim = util_depois(ini, rnd.randint(0, 5))
            if rnd.random() < 0.9 or idade > 21:
                ret = util_depois(fim, rnd.randint(0, 3))
        ordens.append((carro, desc, valor, etapa, dia, ini, fim, ret))

assert len(ordens) == N_ORDENS

# ---- saída ------------------------------------------------------------------
out = [
    "-- Massa de testes de volume (gerada por Infra/massa/gerar_massa.py - não editar à mão)",
    f"-- {N_CLIENTES} clientes, {N_CARROS} carros, {N_ORDENS} ordens de {INICIO} a {HOJE}.",
    "-- Pensada para um banco sem clientes/carros/ordens (ids explícitos a partir de 1).",
    "-- Para recomeçar: DELETE FROM tb_clientes; (cascata apaga carros e ordens)",
    "-- Uso: docker exec -i mysql mysql -uroot -proot --default-character-set=utf8mb4 oficina_mecanica < Infra/massa/massa_volume.sql",
    "",
    "USE oficina_mecanica;",
    "SET NAMES utf8mb4;",
    "START TRANSACTION;",
    "",
    "INSERT INTO tb_clientes (id, nome, cpf, contato) VALUES",
    ",\n".join(f"({i}, {q(n)}, {q(c)}, {q(t)})" for i, n, c, t in clientes) + ";",
    "",
    "INSERT INTO tb_carros (id, cliente_id, marca, modelo, placa) VALUES",
    ",\n".join(f"({i}, {c}, {q(ma)}, {q(mo)}, {q(p)})" for i, c, ma, mo, p in carros) + ";",
    "",
]
for k in range(0, N_ORDENS, 250):
    lote = ordens[k:k + 250]
    out.append("INSERT INTO tb_ordens_servico (carro_id, descricao_ordem, valor_servico, etapa, "
               "data_entrada_carro, data_inicio_servico, data_fim_servico, data_retirada_veiculo) VALUES")
    out.append(",\n".join(
        f"({c}, {q(de)}, {v:.2f}, {e}, {d(a)}, {d(b)}, {d(f)}, {d(r)})" for c, de, v, e, a, b, f, r in lote) + ";")
    out.append("")
out.append("COMMIT;")

destino = Path(__file__).with_name("massa_volume.sql")
destino.write_text("\n".join(out) + "\n", encoding="utf-8")
print(f"{destino}: {len(dias)} dias úteis, {sum(1 for x in qtd.values() if x == 2)} dias com 2 ordens")
