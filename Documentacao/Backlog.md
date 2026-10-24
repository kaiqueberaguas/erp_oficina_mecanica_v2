# Backlog de Desenvolvimento do Projeto

**Projeto:** Sistema de Gestão de Ordens de Serviço para Oficina Mecânica (ERP Mecânica v2)  
**Versão:** 2.0  
**Data de Atualização:** 24/10/2026  

---

## 📋 Resumo das Funcionalidades e Épicos

| ID | Funcionalidade / Módulo | Camada | Responsável Sugerido | Status |
| :--- | :--- | :--- | :--- | :--- |
| **1** | Infraestrutura | DevOps | Fullstack | [X] Concluído |
| **2** | Configurar Docker Compose | DevOps | Fullstack | [X] Concluído |
| **3** | Backend: Banco de Dados e Entidades | Backend | Backend | [X] Concluído |
| **4** | Backend: Autenticação de Usuário da Aplicação | Backend | Backend / QA | [X] Concluído |
| **5** | Frontend: Autenticação e Usuários | Frontend | Frontend / QA | [X] Concluído |
| **6** | Backend: CRUD entidade Clientes | Backend | Backend / QA | [X] Concluído |
| **7** | Frontend: Gestão de Clientes | Frontend | Frontend / QA | [X] Concluído |
| **8** | Backend: CRUD entidade Carros | Backend | Backend / QA | [X] Concluído |
| **9** | Frontend: Gestão de Carros | Frontend | Frontend / QA | [~] Em andamento |
| **10** | Backend: CRUD entidade Ordens de Serviço | Backend | Backend / QA | [X] Concluído |
| **11** | Frontend: Gestão de Ordens de Serviço | Frontend | Frontend / QA | [~] Em andamento |
| **12** | Backend: Dashboard e Métricas | Backend | Backend / QA | [ ] A Fazer |
| **13** | Frontend: Dashboard e Gráficos | Frontend | Frontend / QA | [ ] A Fazer |
| **14** | Acessibilidade e Design System | Frontend | Frontend | [ ] A Fazer |
| **15** | Validação de CI/CD e Documentação | DevOps | Fullstack | [ ] A Fazer |

---

## 1. Infraestrutura

- [X] **1.1 Configuração do Repositório Git**
  - [X] Criar repositório Git com arquivos base `.gitignore` e `README.md`
  - [X] Incluir pasta `/Documentacao` para documentação do projeto.
- [X] **1.2 Setup do Backend (.NET 10 Web API)**
  - [X] Criar solução .NET e projeto Web API.
- [X] **1.3 Setup do Frontend (Angular + Tailwind CSS)**
  - [X] Inicializar aplicação Angular com Standalone Components.
  - [X] Instalar e configurar **Tailwind CSS**.
- [X] **1.4 Configurar CI no GitHub Actions & Branch Protection**
  - [X] Criar workflow de CI acionado exclusivamente na abertura/atualização de Pull Request para a branch principal (`main`/`master`).
  - [X] Configurar jobs base de validação de compilação (build) e linting do frontend e backend.
  - [X] Configurar regras de proteção de branch (*Branch Protection Rules*):
    - [X] Bloquear push direto para a branch principal (merge apenas via PR).
    - [X] Exigir aprovação do workflow de CI com sucesso no pipeline como critério obrigatório para liberação do merge.

---

## 2. Configurar Docker Compose

- [X] **2.1 Banco de Dados MySQL no Docker**
  - [X] Configurar serviço `database` com imagem MySQL 8.0 no `docker-compose.yml`.
  - [X] Configurar Healthcheck do MySQL para controle de inicialização.
- [X] **2.2 Dockerfile do Backend (.NET 10)**
  - [X] Adicionar serviço `backend` no `docker-compose.yml` dependente do healthcheck do MySQL.
- [X] **2.3 Dockerfile do Frontend (Angular)**
  - [X] Criar `Dockerfile` multi-stage (Node.js build + Nginx Alpine).
  - [X] Configurar Nginx para SPA (redirecionamento de rotas para `index.html`).
  - [X] Adicionar serviço `frontend` no `docker-compose.yml`.
- [X] **2.4 Rede e Validação**
  - [X] Configurar rede interna.
  - [X] Testar subida de todos os serviços via `docker compose up --build -d`.

---

## 3. Backend: Banco de Dados e Entidades

- [X] **3.1 Script DDL e Carga Inicial (init.sql)**
  - [X] Criar script SQL de inicialização do banco com o esquema das tabelas.
  - [X] Incluir carga inicial com usuário administrador padrão.
  - [X] Mapear o scripts de inicialização no volume de inicialização do MySQL.
- [X] **3.2 Gerar entidades usando engenharia reversa do EF Core**
  - [X] Executar scaffold via CLI do EF Core a partir do MySQL rodando no Docker.
- [X] **3.3 Configurar conexão com banco de dados e DbContext**
  - [X] Configurar backend para acesso ao banco de dados.

---

## 4. Backend: Autenticação de Usuário da Aplicação

- [X] **4.1 Implementação de Negócio e Endpoints**
  - [X] Implementar serviço de hash de senhas seguro com BCrypt.
  - [X] Implementar serviço de geração e validação de token JWT.
  - [X] Criar `AuthController` com endpoints:
    - `POST /api/v1/auth/register` (Cadastro de usuário com validação de login único)
    - `POST /api/v1/auth/login` (Validação de credenciais e emissão de JWT)
    - `GET /api/v1/auth/me` (Dados do usuário autenticado)
- [X] **4.2 Testes Automatizados (Backend)**
  - [X] **Testes Unitários (xUnit + Moq):**
  - [X] **Testes Integrados (acessando base de dados do docker-compose):**
    - [X] Teste do endpoint de registro com dados válidos (HTTP 201).
    - [X] Teste de tentativa de cadastro com login duplicado (HTTP 400).
    - [X] Teste de login com credenciais corretas (HTTP 200 + token retornado) e incorretas (HTTP 401).

---

## 5. Frontend: Autenticação e Usuários

- [X] **5.1 Interface e Serviços**
  - [X] Criar tela responsiva de **Login** estilizada com Tailwind CSS.
  - [X] Criar tela responsiva de **Cadastro de Usuário** (com validações de campos e confirmação de senha).
  - [X] Implementar `AuthService` para requisições HTTP de login/registro e armazenamento seguro do JWT.
  - [X] Implementar `AuthGuard` para proteção de rotas privadas.
  - [X] Implementar `AuthInterceptor` para anexar o cabeçalho `Authorization: Bearer <token>`.
  - [X] Implementar componente de cabeçalho com dados do usuário logado e botão de Logout.
- [X] **5.2 Testes Automatizados (Frontend)**
  - [X] **Testes Unitários (vitest):**
    - [X] Teste de validação de formulário (campos obrigatórios inválidos).
    - [X] Teste de chamada do `AuthService` ao submeter credenciais.
    - [X] Teste do `AuthGuard` bloqueando acesso de usuário não logado.
  - [X] **Testes E2E (Cypress):**
    - [X] Teste do fluxo completo de Cadastro de novo usuário.
    - [X] Teste do fluxo de Login com credenciais válidas e redirecionamento para o dashboard.
    - [X] Teste de exibição de mensagem de erro em caso de senha inválida.

---

## 6. Backend: CRUD entidade Clientes

- [x] **6.1 Endpoints do CRUD de Clientes**
  - [x] Implementar endpoints (POST - criar, GET - listar com filtro por nome/CPF, GET by ID - obter por ID, PUT - atualizar e DELETE - deletar).
- [x] Criar Testes Unitários
- [x] Criar Testes Integrados

---

## 7. Frontend: Gestão de Clientes

- [x] **7.1 Interface e Serviços**
  - [x] Criar `ClienteService` para consumo dos endpoints de clientes.
  - [x] Criar tela de listagem de clientes (tabela com busca em tempo real, paginação e ações).
  - [x] Criar modal/formulário de cadastro e edição de cliente com máscaras de CPF e Telefone.
  - [x] Criar modal de confirmação de exclusão alertando sobre a remoção de veículos vinculados.
  - [x] Criar Testes Unitários (Vitest)
  - [x] Criar Testes E2E (Cypress)

---

## 8. Backend: CRUD entidade Carros

- [x] **8.1 Endpoints do CRUD de Carros**
  - [x] Implementar endpoints (POST - criar, GET - listar com filtro por placa/modelo, GET by ID - obter por ID, PUT - atualizar e DELETE - deletar).
- [x] Criar Testes Unitários
- [x] Criar Testes Integrados

---

## 9. Frontend: Gestão de Carros

- [x] **9.1 Interface e Serviços**
  - [x] Criar `CarroService` para consumo dos endpoints de carros.
  - [x] Criar tela de listagem de carros (tabela com busca em tempo real, paginação e ações).
  - [x] Criar modal/formulário de cadastro e edição de carro com máscara de placa e seleção de cliente (combobox com busca no servidor).
  - [x] Criar modal de confirmação de exclusão alertando sobre a remoção de ordens de serviço vinculadas.
  - [x] Criar Testes Unitários (Vitest)
  - [X] Criar Testes E2E (Cypress)

---

## 10. Backend: CRUD entidade Ordens de Serviço

- [x] **10.1 Endpoints do CRUD de Ordens de Serviço**
  - [x] Implementar endpoints (POST - criar, GET - listar paginado com filtro por etapa (múltiplas) e busca por nº da OS/placa/cliente, GET by ID - obter por ID, PUT/PATCH - atualizar e transicionar status com datas automáticas, DELETE - deletar).
  - [x] Campo `observacao` (motivo do cancelamento) em `tb_ordens_servico` e no `PATCH /ordens/{id}/status`; registro da retirada do veículo repetindo a etapa final.
  - [x] Presenters de listagem sem N+1 (`placa`, `marca`, `modelo`, `clienteNome`, `totalCarros`, `totalOrdens`).
- [x] Criar Testes Unitários
- [x] Criar Testes Integrados

---

## 11. Frontend: Gestão de Ordens de Serviço

- [x] **11.1 Interface e Serviços**
  - [x] Criar `OrdemServicoService` para consumo dos endpoints de ordens de serviço.
  - [x] Criar tela de listagem de ordens de serviço (tabela com busca em tempo real, paginação, filtros de status e ações).
  - [x] Criar modal/formulário de cadastro e edição de ordem de serviço com seleção de carro, descrição, valores e controle de transição de status.
  - [x] Criar modal de confirmação de exclusão.
  - [x] Criar Testes Unitários (Vitest)
  - [X] Criar Testes E2E (Cypress)
- [x] **11.2 Refinamentos da listagem**
  - [x] Colunas **Veículo** e **Placa** separadas na tabela.
  - [x] Engrenagem na barra da tela para ocultar/exibir colunas (preferência salva no `localStorage`).
  - [x] Abas de status com contagem e timeline de etapas no modal de detalhes.

---

## 12. Backend: Dashboard e Métricas

- [x] **12.1 Implementação de Consultas Agregadas**
  - [x] Criar DTO de resposta consolidada (`DashboardResponseDto`).
  - [x] Criar `DashboardController` com o endpoint:
    - `GET /api/v1/dashboard`
  - [x] Implementar queries otimizadas no Entity Framework Core:
    - Faturamento total e faturamento mensal das OS finalizadas (`SumAsync`).
    - Ticket médio das ordens de serviço (`AverageAsync`).
    - Lead Time médio de reparo em dias (`data_fim_servico - data_entrada_carro`).
    - Quantidade de OS agrupadas por status (`GroupBy`).
    - Top 5 marcas de veículos com maior volume de atendimentos (`Join`/`GroupBy`).
- [x] **12.2 Testes Automatizados (Backend)**
  - [x] **Testes Unitários (xUnit + Moq):**
    - [x] Teste de cálculo de ticket médio com diferentes volumes de OS.
    - [x] Teste de cálculo do tempo médio de permanência.
  - [x] **Testes Integrados (.NET `WebApplicationFactory`):**
    - [x] Teste do endpoint `GET /api/v1/dashboard` validando a estrutura e integridade do JSON retornado.

---

## 13. Frontend: Dashboard e Gráficos

- [x] **13.1 Interface e Integração Visual**
  - _Obs.: gráficos desenhados com SVG/CSS próprio (sem biblioteca); período, tempo no pátio e tabela de pátio foram removidos para seguir o contrato de Arquitetura.md §9.3._
  - [x] ~~Instalar biblioteca de gráficos~~ — dispensado: gráficos em SVG/CSS próprio.
  - [x] Criar `DashboardService` para consumo do endpoint de métricas.
  - [x] Criar cards de KPI com destaque visual (Faturamento Total, Ticket Médio, Lead Time, Total de OS).
  - [x] Renderizar gráfico de evolução financeira mensal (barras/linhas).
  - [x] Renderizar gráfico de distribuição percentual de status (rosca/donut).
  - [x] Renderizar gráfico de barras horizontal com as Top 5 Marcas atendidas.
- [x] **13.2 Testes Automatizados (Frontend)**
  - [x] **Testes Unitários (Vitest):**
    - [x] Teste de renderização dos valores nos cards de KPI.
    - [x] Teste de tratamento de dashboard vazio (sem dados cadastrados).
  - [x] **Testes E2E (Playwright / Cypress):**
    - [x] Teste de carregamento do dashboard e visibilidade dos gráficos após o login.

---

## 14. Acessibilidade e Design System

- [ ] **14.1 Semântica e Navegabilidade por Teclado**
  - [ ] Revisar semântica HTML5 em todas as telas (`<main>`, `<nav>`, `<header>`, `<footer>`, `<section>`).
  - [ ] Garantir que todos os inputs tenham `<label>` associado via `for`/`id`.
  - [ ] Implementar atributos `aria-label`, `aria-describedby` e `role` em modais e botões de ação.
  - [ ] Validar ciclo de foco com tecla `Tab` e fechamento de modais com `Esc`.
- [ ] **14.2 Contraste e Responsividade**
  - [ ] Validar taxa mínima de contraste de cores (4.5:1) nas classes Tailwind.
  - [ ] Garantir responsividade completa para dispositivos móveis e desktops.

---

## 15. Validação de CI/CD e Documentação

- [ ] **15.1 Pipeline de Integração Contínua (CI)**
  - [ ] Criar workflow `.github/workflows/ci.yml`.
  - [ ] Job de linting e verificação de formato de código (.NET e Angular).
  - [ ] Job de build e execução de **todos os testes unitários e de integração** a cada Pull Request.
- [ ] **15.2 Pipeline de Entrega Contínua (CD / Docker)**
  - [ ] Configurar job de build das imagens Docker do backend e frontend.
  - [ ] Validar compilação limpa dos contêineres.
- [ ] **15.3 Documentação Final**
  - [ ] Documentar execução local via `docker compose up -d` no `README.md`.
  - [ ] Validar documentação Swagger interativa em `/swagger`.
