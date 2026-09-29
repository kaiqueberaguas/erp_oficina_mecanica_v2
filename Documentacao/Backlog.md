# Backlog de Desenvolvimento do Projeto

**Projeto:** Sistema de Gestão de Ordens de Serviço para Oficina Mecânica (ERP Mecânica v2)  
**Versão:** 2.0  
**Data de Atualização:** 20/09/2026  

---

## 📋 Resumo das Funcionalidades e Épicos

| ID | Funcionalidade / Módulo | Camada | Responsável Sugerido | Status |
| :--- | :--- | :--- | :--- | :--- |
| **1** | Infraestrutura | DevOps | Fullstack | [ ] A Fazer |
| **2** | Configurar Docker Compose | DevOps | Fullstack | [ ] A Fazer |
| **3** | Backend: Banco de Dados e Entidades | Backend | Backend | [ ] A Fazer |
| **4** | Backend: Autenticação de Usuário da Aplicação | Backend | Backend / QA | [ ] A Fazer |
| **5** | Frontend: Autenticação e Usuários | Frontend | Frontend / QA | [ ] A Fazer |
| **6** | Backend: CRUD entidade Clientes | Backend | Backend / QA | [ ] A Fazer |
| **7** | Frontend: Gestão de Clientes | Frontend | Frontend / QA | [ ] A Fazer |
| **8** | Backend: CRUD entidade Carros | Backend | Backend / QA | [ ] A Fazer |
| **9** | Frontend: Gestão de Carros | Frontend | Frontend / QA | [ ] A Fazer |
| **10** | Backend: CRUD entidade Ordens de Serviço | Backend | Backend / QA | [ ] A Fazer |
| **11** | Frontend: Gestão de Ordens de Serviço | Frontend | Frontend / QA | [ ] A Fazer |
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
- [ ] **1.3 Setup do Frontend (Angular + Tailwind CSS)**
  - [ ] Inicializar aplicação Angular com Standalone Components.
  - [ ] Instalar e configurar **Tailwind CSS**.
- [ ] **1.4 Configurar CI no GitHub Actions & Branch Protection**
  - [X] Criar workflow de CI acionado exclusivamente na abertura/atualização de Pull Request para a branch principal (`main`/`master`).
  - [ ] Configurar jobs base de validação de compilação (build) e linting do frontend e backend.
  - [X] Configurar regras de proteção de branch (*Branch Protection Rules*):
    - [X] Bloquear push direto para a branch principal (merge apenas via PR).
    - [X] Exigir aprovação do workflow de CI com sucesso no pipeline como critério obrigatório para liberação do merge.

---

## 2. Configurar Docker Compose

- [X] **2.1 Banco de Dados MySQL no Docker**
  - [X] Configurar serviço `database` com imagem MySQL 8.0 no `docker-compose.yml`.
  - [X] Configurar Healthcheck do MySQL para controle de inicialização.
- [ ] **2.2 Dockerfile do Backend (.NET 8)**
  - [ ] Adicionar serviço `backend` no `docker-compose.yml` dependente do healthcheck do MySQL.
- [ ] **2.3 Dockerfile do Frontend (Angular)**
  - [ ] Criar `Dockerfile` multi-stage (Node.js build + Nginx Alpine).
  - [ ] Configurar Nginx para SPA (redirecionamento de rotas para `index.html`).
  - [ ] Adicionar serviço `frontend` no `docker-compose.yml`.
- [ ] **2.4 Rede e Validação**
  - [ ] Configurar rede interna.
  - [ ] Testar subida de todos os serviços via `docker compose up --build -d`.

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

- [ ] **4.1 Implementação de Negócio e Endpoints**
  - [ ] Implementar serviço de hash de senhas seguro com BCrypt.
  - [ ] Implementar serviço de geração e validação de token JWT.
  - [ ] Criar `AuthController` com endpoints:
    - `POST /api/v1/auth/register` (Cadastro de usuário com validação de login único)
    - `POST /api/v1/auth/login` (Validação de credenciais e emissão de JWT)
    - `GET /api/v1/auth/me` (Dados do usuário autenticado)
- [ ] **4.2 Testes Automatizados (Backend)**
  - [ ] **Testes Unitários (xUnit + Moq):**
  - [ ] **Testes Integrados (acessando base de dados do docker-compose):**
    - [ ] Teste do endpoint de registro com dados válidos (HTTP 201).
    - [ ] Teste de tentativa de cadastro com login duplicado (HTTP 400).
    - [ ] Teste de login com credenciais corretas (HTTP 200 + token retornado) e incorretas (HTTP 401).

---

## 5. Frontend: Autenticação e Usuários

- [ ] **5.1 Interface e Serviços**
  - [ ] Criar tela responsiva de **Login** estilizada com Tailwind CSS.
  - [ ] Criar tela responsiva de **Cadastro de Usuário** (com validações de campos e confirmação de senha).
  - [ ] Implementar `AuthService` para requisições HTTP de login/registro e armazenamento seguro do JWT.
  - [ ] Implementar `AuthGuard` para proteção de rotas privadas.
  - [ ] Implementar `AuthInterceptor` para anexar o cabeçalho `Authorization: Bearer <token>`.
  - [ ] Implementar componente de cabeçalho com dados do usuário logado e botão de Logout.
- [ ] **5.2 Testes Automatizados (Frontend)**
  - [ ] **Testes Unitários (Jasmine / Karma):**
    - [ ] Teste de validação de formulário (campos obrigatórios inválidos).
    - [ ] Teste de chamada do `AuthService` ao submeter credenciais.
    - [ ] Teste do `AuthGuard` bloqueando acesso de usuário não logado.
  - [ ] **Testes E2E (Cypress):**
    - [ ] Teste do fluxo completo de Cadastro de novo usuário.
    - [ ] Teste do fluxo de Login com credenciais válidas e redirecionamento para o dashboard.
    - [ ] Teste de exibição de mensagem de erro em caso de senha inválida.

---

## 6. Backend: CRUD entidade Clientes

- [ ] **6.1 Endpoints do CRUD de Clientes**
  - [ ] Implementar endpoints (POST - criar, GET - listar com filtro por nome/CPF, GET by ID - obter por ID, PUT - atualizar e DELETE - deletar).
- [ ] Criar Testes Unitários
- [ ] Criar Testes Integrados

---

## 7. Frontend: Gestão de Clientes

- [ ] **7.1 Interface e Serviços**
  - [ ] Criar `ClienteService` para consumo dos endpoints de clientes.
  - [ ] Criar tela de listagem de clientes (tabela com busca em tempo real, paginação e ações).
  - [ ] Criar modal/formulário de cadastro e edição de cliente com máscaras de CPF e Telefone.
  - [ ] Criar modal de confirmação de exclusão alertando sobre a remoção de veículos vinculados.
  - [ ] Criar Testes Unitários (Jasmine / Karma)
  - [ ] Criar Testes E2E (Cypress)

---

## 8. Backend: CRUD entidade Carros

- [ ] **8.1 Endpoints do CRUD de Carros**
  - [ ] Implementar endpoints (POST - criar, GET - listar com filtro por placa/modelo, GET by ID - obter por ID, PUT - atualizar e DELETE - deletar).
- [ ] Criar Testes Unitários
- [ ] Criar Testes Integrados

---

## 9. Frontend: Gestão de Carros

- [ ] **9.1 Interface e Serviços**
  - [ ] Criar `CarroService` para consumo dos endpoints de carros.
  - [ ] Criar tela de listagem de carros (tabela com busca em tempo real, paginação e ações).
  - [ ] Criar modal/formulário de cadastro e edição de carro com máscara de placa e seleção de cliente.
  - [ ] Criar modal de confirmação de exclusão alertando sobre a remoção de ordens de serviço vinculadas.
  - [ ] Criar Testes Unitários (Jasmine / Karma)
  - [ ] Criar Testes E2E (Cypress)

---

## 10. Backend: CRUD entidade Ordens de Serviço

- [ ] **10.1 Endpoints do CRUD de Ordens de Serviço**
  - [ ] Implementar endpoints (POST - criar, GET - listar com filtro por status/placa, GET by ID - obter por ID, PUT/PATCH - atualizar e transicionar status com datas automáticas, DELETE - deletar).
- [ ] Criar Testes Unitários
- [ ] Criar Testes Integrados

---

## 11. Frontend: Gestão de Ordens de Serviço

- [ ] **11.1 Interface e Serviços**
  - [ ] Criar `OrdemServicoService` para consumo dos endpoints de ordens de serviço.
  - [ ] Criar tela de listagem de ordens de serviço (tabela com busca em tempo real, paginação, filtros de status e ações).
  - [ ] Criar modal/formulário de cadastro e edição de ordem de serviço com seleção de carro, descrição, valores e controle de transição de status.
  - [ ] Criar modal de confirmação de exclusão.
  - [ ] Criar Testes Unitários (Jasmine / Karma)
  - [ ] Criar Testes E2E (Cypress)

---

## 12. Backend: Dashboard e Métricas

- [ ] **12.1 Implementação de Consultas Agregadas**
  - [ ] Criar DTO de resposta consolidada (`DashboardResponseDto`).
  - [ ] Criar `DashboardController` com o endpoint:
    - `GET /api/v1/dashboard`
  - [ ] Implementar queries otimizadas no Entity Framework Core:
    - Faturamento total e faturamento mensal das OS finalizadas (`SumAsync`).
    - Ticket médio das ordens de serviço (`AverageAsync`).
    - Lead Time médio de reparo em dias (`data_fim_servico - data_entrada_carro`).
    - Quantidade de OS agrupadas por status (`GroupBy`).
    - Top 5 marcas de veículos com maior volume de atendimentos (`Join`/`GroupBy`).
- [ ] **12.2 Testes Automatizados (Backend)**
  - [ ] **Testes Unitários (xUnit + Moq):**
    - [ ] Teste de cálculo de ticket médio com diferentes volumes de OS.
    - [ ] Teste de cálculo do tempo médio de permanência.
  - [ ] **Testes Integrados (.NET `WebApplicationFactory`):**
    - [ ] Teste do endpoint `GET /api/v1/dashboard` validando a estrutura e integridade do JSON retornado.

---

## 13. Frontend: Dashboard e Gráficos

- [ ] **13.1 Interface e Integração Visual**
  - [ ] Instalar biblioteca de gráficos (`ng2-charts` com Chart.js ou `ng-apexcharts`).
  - [ ] Criar `DashboardService` para consumo do endpoint de métricas.
  - [ ] Criar cards de KPI com destaque visual (Faturamento Total, Ticket Médio, Lead Time, Total de OS).
  - [ ] Renderizar gráfico de evolução financeira mensal (barras/linhas).
  - [ ] Renderizar gráfico de distribuição percentual de status (rosca/donut).
  - [ ] Renderizar gráfico de barras horizontal com as Top 5 Marcas atendidas.
- [ ] **13.2 Testes Automatizados (Frontend)**
  - [ ] **Testes Unitários (Jasmine / Karma):**
    - [ ] Teste de renderização dos valores nos cards de KPI.
    - [ ] Teste de tratamento de dashboard vazio (sem dados cadastrados).
  - [ ] **Testes E2E (Playwright / Cypress):**
    - [ ] Teste de carregamento do dashboard e visibilidade dos gráficos após o login.

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
