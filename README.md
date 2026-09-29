# ERP Oficina Mecânica v2

Sistema web para controle de uma oficina mecânica: cadastro de **clientes**, **carros** e **ordens de serviço** (OS), da entrada do veículo até a retirada.

Projeto acadêmico (Projeto Integrador / Engenharia de Software).

---

## Estrutura do projeto

```
Frontend (Angular)  ──►  Backend (API em C#)  ──►  Banco de dados (MySQL)
```

| Pasta / arquivo       | Descrição                                            |
| :-------------------- | :--------------------------------------------------- |
| `Backend/`            | API em C# / .NET                                     |
| `Frontend/`           | Aplicação Angular                                    |
| `Infra/scripts/`      | Scripts SQL de criação das tabelas e dados de teste  |
| `docker-compose.yaml` | Sobe o banco de dados MySQL                          |
| `Documentacao/`       | Arquitetura e Backlog                                |

---

## Como rodar o projeto

### 1. Instalar os programas

| Programa | Download | Observação |
| :------- | :------- | :--------- |
| **Git** | https://git-scm.com/downloads | |
| **Docker Desktop** | https://www.docker.com/products/docker-desktop/ | Precisa estar aberto para o banco funcionar. Reinicie o computador se o instalador pedir. |
| **Visual Studio Community** (gratuito) | https://visualstudio.microsoft.com/pt-br/vs/community/ | Na instalação, marque a carga de trabalho **ASP.NET e desenvolvimento para a Web**. |

O projeto usa **.NET 10**, então use a versão mais recente do Visual Studio Community.

### 2. Baixar o código

No Prompt de Comando ou PowerShell, na pasta onde ficam seus projetos:

```
git clone https://github.com/kaiqueberaguas/erp_oficina_mecanica_v2.git
cd erp_oficina_mecanica_v2
```

### 3. Ligar o banco de dados

Com o Docker Desktop aberto, na pasta do projeto:

```
docker compose up -d
```

Na primeira execução o MySQL é baixado, o que pode levar alguns minutos. Ao final, o banco `oficina_mecanica` estará criado com as tabelas e os dados de teste.

Para conferir, abra o Docker Desktop, aba **Containers**: o `mysql` deve estar com status *Running*.

Dados de conexão:

| Campo   | Valor              |
| :------ | :----------------- |
| Host    | `localhost`        |
| Porta   | `3306`             |
| Banco   | `oficina_mecanica` |
| Usuário | `root`             |
| Senha   | `root`             |

### 4. Rodar o backend

1. Abra o Visual Studio e clique em **Abrir um projeto ou solução**.
2. Selecione `Backend/Erp_Oficina_Mecanica_v2.slnx`.
3. Na barra superior, ao lado do botão ▶, escolha o perfil **http**.
4. Clique em ▶ (ou pressione **F5**).

O navegador abre na documentação da API:

| O que                        | Endereço                                |
| :--------------------------- | :-------------------------------------- |
| Documentação da API (Scalar) | http://localhost:5234/scalar/v1         |
| Especificação OpenAPI        | http://localhost:5234/openapi/v1.json   |

Para parar a API, clique em ■ no Visual Studio (ou **Shift + F5**).

---

## Usuário de teste

| Login               | Senha       |
| :------------------ | :---------- |
| `admin@oficina.com` | `Admin@123` |

---

## Comandos do dia a dia

Executar no terminal, dentro da pasta do projeto.

| Objetivo                              | Comando                                               |
| :------------------------------------ | :---------------------------------------------------- |
| Ligar o banco                         | `docker compose up -d`                                |
| Desligar o banco (mantém os dados)    | `docker compose stop`                                 |
| Apagar e recriar o banco do zero      | `docker compose down` e depois `docker compose up -d` |
| Ver os logs do banco                  | `docker compose logs mysql`                           |

> `docker compose down` apaga todos os dados e recria o banco a partir dos scripts em `Infra/scripts/`. Use também quando esses scripts forem alterados, pois só são executados na criação do banco.

---

## Problemas comuns

**`docker compose` não funciona / "Cannot connect to the Docker daemon"**
O Docker Desktop não está aberto. Abra-o, aguarde terminar de iniciar e tente novamente.

**"port is already allocated" (porta 3306)**
Há outro MySQL rodando no computador. Pare-o (ou pare o serviço MySQL do Windows) e execute `docker compose up -d` novamente.

**Erro de conexão com o banco ao chamar a API (`Unable to connect to any of the specified MySQL hosts`)**
O banco não está ligado. Execute o passo 3.

**Visual Studio não encontra o .NET 10**
Abra o **Visual Studio Installer** e clique em **Atualizar**.

---

## Documentação

- [Documentacao/Arquitetura.md](Documentacao/Arquitetura.md): tabelas, rotas da API e decisões técnicas.
- [Documentacao/Backlog.md](Documentacao/Backlog.md): lista de tarefas.

## Como contribuir

1. Não trabalhe direto na `master`. Crie uma branch para cada tarefa (ex.: `feature/cadastro-clientes`).
2. Faça commits pequenos e com mensagens claras (ex.: `Feat: cadastro de clientes`).
3. Envie a branch ao GitHub e abra um Pull Request. Ele precisa de revisão de outra pessoa da equipe antes de entrar na `master`.
