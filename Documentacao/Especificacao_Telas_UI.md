# Especificação Funcional e de Design de Interfaces (UI/UX)
**Projeto:** ERP Oficina Mecânica v2  

**Tecnologias**

- Angular
- Tailwind

---

## 1. Telas do Sistema

| ID | Nome da Tela | Rota | Autenticação | Objetivo Principal |
| :--- | :--- | :--- | :--- | :--- |
| **T01** | Autenticação / Login | `/login` | Pública | Acesso seguro de operadores e mecânicos ao sistema. |
| **T02** | Cadastro de Novo Usuário | `/cadastro` | Pública | Registro de novos operadores no ERP. |
| **T03** | Shell / Layout Principal | `/*` (Container) | Privada (JWT) | Header com menu de navegação, status do usuário logado e logout. |
| **T04** | Dashboard Executivo & BI | `/dashboard` | Privada (JWT) | Visão geral de KPIs financeiros, volume de OS e gráficos analíticos. |
| **T05** | Gestão de Clientes | `/clientes` | Privada (JWT) | Listagem, busca, criação, edição e exclusão de clientes. |
| **T06** | Gestão de Carros / Veículos | `/carros` | Privada (JWT) | Listagem, busca, vinculação ao cliente, edição e exclusão de veículos. |
| **T07** | Gestão de Ordens de Serviço | `/ordens` | Privada (JWT) | Controle de OS, fluxo de status, datas de oficina, valores e histórico. |

---

## 2. Especificação Detalhada por Tela

---

### TELA 01: Autenticação (Login)
- **Rota:** `/login`
- **Acesso:** Público (redireciona para `/dashboard` se já autenticado).
- **Estrutura Visual:**
  - Layout centralizado (Card no centro da tela com fundo `slate-100`).
  - Logotipo ou ícone da oficina com título **"ERP Mecânica"** e subtítulo **"Acesse sua conta para continuar"**.
- **Componentes & Campos do Formulário:**
  1. **Campo Login:**
     - Tipo: `text`
     - Label: "Login ou E-mail"
     - Placeholder: `ex: admin@oficina.com`
     - Validação: Obrigatório.
  2. **Campo Senha:**
     - Tipo: `password` (com botão de alternar visibilidade ver/ocultar senha opcional)
     - Label: "Senha"
     - Placeholder: `••••••••`
     - Validação: Obrigatório.
  3. **Área de Alerta / Erro:**
     - Mensagem de credenciais inválidas ou erro de conexão (`role="alert"`).
  4. **Ações:**
     - Botão primário: **"Entrar"** (com estado de carregamento *"Entrando..."* e `disabled`).
     - Link de rodapé: "Não possui cadastro? **Cadastre-se**" direcionando para `/cadastro`.

---

### TELA 02: Cadastro de Operador / Usuário
- **Rota:** `/cadastro`
- **Acesso:** Público.
- **Estrutura Visual:**
  - Card centralizado semelhante ao Login, com cabeçalho explicativo.
- **Componentes & Campos do Formulário:**
  1. **Nome Completo:**
     - Tipo: `text` | Max: 100 caracteres.
     - Validação: Obrigatório, mínimo 3 caracteres.
     - Placeholder: `ex: Carlos Silva`
  2. **Login / E-mail:**
     - Tipo: `text` | Max: 100 caracteres.
     - Validação: Obrigatório, formato de e-mail ou username sem espaços.
     - Placeholder: `ex: carlos.mecanica`
  3. **Senha:**
     - Tipo: `password`
     - Validação: Obrigatório, mínimo 6 caracteres.
     - Helper text: "Mínimo de 6 caracteres".
  4. **Confirmação de Senha:**
     - Tipo: `password`
     - Validação: Obrigatório, deve ser idêntico ao campo Senha.
  5. **Ações:**
     - Botão primário: **"Criar Conta"** (com loading state).
     - Link secundário: "Já possui uma conta? **Fazer Login**" direcionando para `/login`.

---

### TELA 03: Shell / Layout Global (Header & Navegação)
- **Aplicação:** Presente em todas as páginas autenticadas (`/dashboard`, `/clientes`, `/carros`, `/ordens`).
- **Componentes do Header (`bg-slate-900`):**
  - **Brand:** Ícone de ferramenta/carro + texto "ERP Oficina Mecânica".
  - **Menu de Navegação:**
    - Link `Dashboard` (`/dashboard`)
    - Link `Clientes` (`/clientes`)
    - Link `Veículos` (`/carros`)
    - Link `Ordens de Serviço` (`/ordens`)
    - Estilo ativo: Destaque com sublinhado ou pílula `text-sky-300 font-semibold`.
  - **Área do Usuário Logado:**
    - Avatar ou iniciais + Nome do usuário logado + Login entre parênteses (`Carlos (carlos.mecanica)`).
    - Botão secundário de saída: **"Sair"** (`Logout`), redirecionando para `/login` e limpando JWT.

---

### TELA 04: Dashboard Executivo & Indicadores (BI)
- **Rota:** `/dashboard`
- **Objetivo:** Visão analítica em tempo real da oficina para suporte à tomada de decisão.
- **Seção 1: Cabeçalho da Página**
  - Título: "Visão Geral da Oficina"
  - Subtítulo: "Indicadores operacionais e financeiros em tempo real"
  - Filtro/Período (Opcional): Seletor de período (Mês Atual, Últimos 3 Meses, Ano).
- **Seção 2: Cards de Métricas Principais (KPIs - 4 colunas responsivas)**
  1. **Card Faturamento Total:**
     - Valor em moeda: `R$ 45.800,00`
     - Ícone: Cifrão / Dinheiro.
     - Indicador secundário: "Soma das OSs finalizadas".
  2. **Card Ticket Médio:**
     - Valor em moeda: `R$ 458,00`
     - Ícone: Calculadora / Gráfico ascendente.
     - Indicador secundário: "Média por ordem concluída".
  3. **Card Lead Time Médio (Tempo de Oficina):**
     - Valor: `3.2 dias`
     - Ícone: Relógio / Cronômetro.
     - Indicador secundário: "Tempo médio entrada -> conclusão".
  4. **Card Total de Ordens:**
     - Valor: `100 OS` (ex: 15 abertas, 80 finalizadas, 5 canceladas).
     - Ícone: Prancheta de serviços.
- **Seção 3: Visualizações e Gráficos Analíticos**
  1. **Gráfico 1: Evolução Financeira Mensal (Chart de Barras/Linhas Combinado):**
     - Eixo X: Meses (Jan/26, Fev/26, Mar/26...)
     - Eixo Y1: Faturamento em R$ (Barras)
     - Eixo Y2: Quantidade de Ordens (Linha)
  2. **Gráfico 2: Distribuição por Status (Donut / Rosca):**
     - Fatias: Finalizada (Verde), Aberta (Amarelo/Laranja), Cancelada (Vermelho).
     - Legenda com percentuais e quantidades absolutas.
  3. **Gráfico 3: Top 5 Marcas Atendidas (Barras Horizontais):**
     - Exemplo: Volkswagen (28 OS), Chevrolet (22 OS), Fiat (19 OS), Toyota (16 OS), Ford (15 OS).
- **Seção 4: Alertas e Pátio**
  - Card de "Tempo Médio no Pátio pós-conserto": dias entre término e retirada do cliente.

---

### TELA 05: Gestão de Clientes
- **Rota:** `/clientes`
- **Objetivo:** Cadastro, consulta e manutenção da base de clientes proprietários de veículos.
- **Seção 1: Barra de Ações do Topo**
  - Título da tela: "Clientes"
  - Campo de Busca: Input com ícone de lupa: "Buscar por nome ou CPF..." (filtro com debounce).
  - Botão de Ação Primária: **"+ Novo Cliente"** (Abre Modal de Cadastro).
- **Seção 2: Tabela de Dados**
  - **Colunas:**
    1. `ID` (numérico, alinhado à esquerda)
    2. `Nome do Cliente` (destaque em negrito)
    3. `CPF` (formatado `000.000.000-00`)
    4. `Contato` (telefone formatado ou e-mail)
    5. `Veículos Vinculados` (badge com contador, ex: "2 veículos")
    6. `Ações` (botões com ícones):
       - Visualizar Veículos (ícone de carro ou olho)
       - Editar (ícone de lápis)
       - Excluir (ícone de lixeira, cor vermelha)
  - **Estado Vazio (Empty State):** Mensagem ilustrada caso nenhum cliente seja encontrado.
- **Seção 3: Modal / Formulário de Cadastro e Edição de Cliente**
  - Título dinâmico: "Cadastrar Novo Cliente" / "Editar Cliente"
  - **Campos:**
    - **Nome:** Input texto | Obrigatório | Max 100 caracteres | Placeholder: `ex: Mariana Souza`.
    - **CPF:** Input texto com máscara `999.999.999-99` | Obrigatório | Validação de CPF.
    - **Contato:** Input texto com máscara `(99) 99999-9999` ou e-mail | Obrigatório | Max 20 caracteres.
  - **Botões do Modal:**
    - "Cancelar" (fecha modal)
    - "Salvar Cliente" (submete com loading)
- **Seção 4: Modal de Confirmação de Exclusão**
  - Título: "Confirmar Exclusão de Cliente"
  - Mensagem de Alerta Crítico:  
    > "Atenção: A exclusão deste cliente removerá permanentemente todos os veículos associados e o histórico de ordens de serviço vinculadas (exclusão em cascata). Tem certeza que deseja prosseguir?"
  - Botão de Confirmação: "Excluir Definitivamente" (`bg-rose-600 hover:bg-rose-700`).

---

### TELA 06: Gestão de Veículos (Carros)
- **Rota:** `/carros`
- **Objetivo:** Registro dos automóveis atendidos na oficina e vinculação ao respectivo cliente.
- **Seção 1: Barra de Ações do Topo**
  - Título da tela: "Veículos"
  - Campo de Busca: Input "Buscar por placa, modelo ou cliente..."
  - Botão Primário: **"+ Novo Veículo"** (Abre Modal de Veículo).
- **Seção 2: Tabela de Dados**
  - **Colunas:**
    1. `ID`
    2. `Placa` (Badge com fonte monoespaçada estilo placa automotiva, ex: `BRA-2E19` ou `ABC-1234`)
    3. `Marca / Modelo` (ex: `Toyota Corolla`, `VW Gol`)
    4. `Proprietário (Cliente)` (Nome do cliente com link para ficha do cliente)
    5. `Histórico de OS` (Contador de ordens)
    6. `Ações`:
       - Criar Nova OS para este carro (ícone de ferramenta/prancheta)
       - Editar (ícone de lápis)
       - Excluir (ícone de lixeira)
- **Seção 3: Modal de Cadastro / Edição de Veículo**
  - Título: "Cadastrar Veículo" / "Editar Veículo"
  - **Campos:**
    - **Proprietário / Cliente:** Dropdown com busca (`Select` autocomplete) pesquisando por Nome ou CPF do cliente já cadastrado. Obrigatório.
    - **Marca:** Input texto ou Dropdown com marcas comuns (ex: Fiat, Volkswagen, Chevrolet, Ford, Toyota, Honda, Hyundai) | Max 50 caracteres | Obrigatório.
    - **Modelo:** Input texto (ex: "Civic 2.0 EXL", "Onix 1.0 Turbo") | Max 50 caracteres | Obrigatório.
    - **Placa:** Input texto com máscara automática (Padrão Mercosul `AAA1A23` ou Tradicional `AAA-1234`) | Max 8 caracteres | Validação de unicidade.
  - **Botões do Modal:**
    - "Cancelar"
    - "Salvar Veículo"
- **Seção 4: Modal de Confirmação de Exclusão**
  - Mensagem de Alerta: Exclusão do veículo removerá as ordens de serviço atreladas a ele.

---

### TELA 07: Gestão de Ordens de Serviço (OS)
- **Rota:** `/ordens`
- **Objetivo:** Controle central de fluxo de serviço da oficina (o coração do ERP).
- **Seção 1: Barra de Filtros e Busca**
  - Título: "Ordens de Serviço"
  - Campo de Busca: Por número da OS, placa do veículo ou nome do cliente.
  - Filtro por Status (Tabs ou Dropdown):
    - Todas | Abertas (badge amarelo) | Finalizadas (badge verde) | Canceladas (badge vermelho)
  - Botão Primário: **"+ Nova Ordem de Serviço"** (Abre Modal de Criação).
- **Seção 2: Tabela Principal de Ordens de Serviço**
  - **Colunas:**
    1. `OS #ID` (ex: `#00124`)
    2. `Veículo & Placa` (ex: `Ford Ka (ABC-1234)`)
    3. `Cliente` (Nome do proprietário)
    4. `Descrição do Serviço` (Texto truncado com tooltip para visualização completa)
    5. `Valor (R$)` (formatado: `R$ 1.250,00`)
    6. `Data Entrada` (formatado `DD/MM/AAAA`)
    7. `Status` (Badge visual: `Aberta`, `Finalizada`, `Cancelada`)
    8. `Ações`:
       - Ver Detalhes & Timeline (ícone de documento/olho)
       - Atualizar Status / Datas (ícone de fluxo/play)
       - Editar OS (ícone lápis)
       - Excluir OS (ícone lixeira)
- **Seção 3: Modal de Abertura / Cadastro de OS**
  - Título: "Nova Ordem de Serviço"
  - **Campos:**
    - **Veículo:** Select pesquisável por Placa ou Modelo com indicação do proprietário (ex: `ABC-1234 - Fiat Palio (João Silva)`). Obrigatório.
    - **Descrição do Defeito e Serviço a Executar:** Campo `textarea` (mínimo 3 linhas) detalhando sintomas e peças/mão de obra necessárias. Obrigatório.
    - **Valor do Serviço (R$):** Input monetário com prefixo `R$` e máscara decimal (`0,00`). Obrigatório.
    - **Data de Entrada:** Datepicker (padrão preenchido com a data atual). Obrigatório.
    - **Status Inicial:** Pré-fixado como `'aberta'`.
  - **Botões:**
    - "Cancelar"
    - "Abrir Ordem de Serviço"
- **Seção 4: Modal / Painel de Detalhes e Transição de Status (Timeline de Serviço)**
  - Título: "Detalhes da OS #00124 - Fiat Palio (ABC-1234)"
  - **Linha do Tempo / Stepper das 4 Datas de Controle:**
    1. 🟢 **Entrada do Veículo:** Data registrada (`data_entrada_carro`)
    2. 🟡 **Início do Serviço:** Data de início (`data_inicio_servico`) - Botão "Iniciar Manutenção Hoje"
    3. 🔵 **Fim do Serviço:** Data de conclusão (`data_fim_servico`) - Botão "Concluir Manutenção"
    4. 🟣 **Retirada do Veículo:** Data de entrega ao cliente (`data_retirada_veiculo`) - Botão "Registrar Retirada"
  - **Transição de Status (`PATCH /ordens/{id}/status`):**
    - Seletor de Status: `Aberta` -> `Finalizada` ou `Cancelada`.
    - Ao marcar como `Finalizada`, exige ou preenche automaticamente a data de término do serviço.
    - Campo de observação de cancelamento caso o status seja alterado para `Cancelada`.
  - **Informações Financeiras:**
    - Valor acordado: `R$ 1.250,00` (possibilidade de reajuste antes da finalização).
- **Seção 5: Modal de Exclusão de OS**
  - Confirmação de exclusão da ordem de serviço.

---

## 3. Matriz de Componentes Reutilizáveis (UI Kit)

Para garantir consistência no Tailwind, os seguintes componentes modulares devem ser adotados:
1. **`AppHeader`:** Barra superior escura com navegação e perfil.
2. **`KpiCard`:** Card de métrica com título, valor grande, variação e ícone em container circular.
3. **`StatusBadge`:** Badge estilizado para os 3 status (`aberta`, `finalizada`, `cancelada`).
4. **`DataTable`:** Tabela responsiva com cabeçalho fixo, suporte a ordenação e paginação.
5. **`ModalDialog`:** Caixa de diálogo acessível com backdrop borrado, foco isolado e tecla `Esc`.
6. **`InputField` / `SelectField`:** Controles de formulário com estados de foco, erro e mensagem de ajuda.
7. **`ConfirmDeleteModal`:** Modal padronizado para alertas de exclusão perigosa.

---
