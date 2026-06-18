<h1 align="center">📋 Todo List API</h1>

<p align="center">
  API REST de lista de tarefas com autenticação de usuários, construída com <strong>NestJS</strong>, <strong>Prisma</strong> e <strong>PostgreSQL</strong>.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-11-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/Jest-Tests-C21325?style=for-the-badge&logo=jest&logoColor=white" alt="Jest" />
</p>

---

## 📑 Sumário

- [Sobre](#-sobre)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura do projeto](#-arquitetura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Variáveis de ambiente](#-variáveis-de-ambiente)
- [Instalação e execução](#-instalação-e-execução)
- [Banco de dados](#-banco-de-dados)
- [Documentação da API](#-documentação-da-api)
- [Endpoints](#-endpoints)
- [Autenticação](#-autenticação)
- [Testes](#-testes)
- [Qualidade de código](#-qualidade-de-código)
- [Autor](#-autor)
- [Licença](#-licença)

---

## 📖 Sobre

API para gerenciamento de tarefas pessoais. Cada usuário se cadastra, autentica via **JWT** e gerencia **apenas as suas próprias tarefas** — o escopo de propriedade é garantido em todas as rotas a partir do token, nunca por parâmetros da URL.

---

## ✨ Funcionalidades

- 🔐 **Autenticação JWT** com `Guard` global e decorator `@Public()` para rotas abertas
- 👤 **Usuários** — cadastro público, perfil e atualização do próprio usuário
- ✅ **Tarefas** — CRUD completo, escopado ao usuário autenticado, com fluxo de status (`PENDING → IN_PROGRESS → COMPLETED`)
- 🧱 **Validação de ambiente** no boot (a aplicação não sobe com env inválido)
- 🔑 **Hashing de senha** isolado em um `HashingService` (bcrypt)
- 🧩 **Exception Filter global** com formato de erro padronizado
- 📝 **Logging Interceptor** de cada requisição
- 🚦 **Rate limiting** (com limite estrito no login)
- 📚 **Documentação interativa** via Scalar + OpenAPI

---

## 🛠 Tecnologias

| Categoria | Stack                                                                                                        |
| --------- | ------------------------------------------------------------------------------------------------------------ |
| Framework | [NestJS 11](https://nestjs.com/)                                                                             |
| Linguagem | [TypeScript](https://www.typescriptlang.org/)                                                                |
| ORM       | [Prisma 7](https://www.prisma.io/)                                                                           |
| Banco     | [PostgreSQL 15](https://www.postgresql.org/)                                                                 |
| Auth      | [@nestjs/jwt](https://github.com/nestjs/jwt) + [Passport](https://www.passportjs.org/)                       |
| Validação | [class-validator](https://github.com/typestack/class-validator)                                              |
| Docs      | [@nestjs/swagger](https://docs.nestjs.com/openapi/introduction) + [Scalar](https://github.com/scalar/scalar) |
| Testes    | [Jest](https://jestjs.io/)                                                                                   |

---

## 🗂 Arquitetura do projeto

```text
src/
├── common/
│   ├── filters/          # HttpExceptionFilter (resposta de erro padronizada)
│   └── interceptors/     # LoggingInterceptor
├── config/
│   └── env.validation.ts # Validação das variáveis de ambiente no boot
├── database/
│   └── prisma/           # PrismaService + módulo
├── helps/
│   ├── messages/         # Mensagens fixas centralizadas (auth/task/user)
│   └── swagger/          # Helpers de resposta para a documentação
├── modules/
│   ├── auth/             # Login, JWT strategy, guard, decorators
│   ├── tasks/            # CRUD de tarefas (escopado ao usuário)
│   └── users/            # Cadastro, perfil e atualização
├── shared/
│   └── hashing/          # HashingService (bcrypt)
└── main.ts               # Bootstrap, CORS, ValidationPipe, Scalar
```

---

## ✅ Pré-requisitos

- [Node.js](https://nodejs.org/) 20+
- [Yarn](https://yarnpkg.com/)
- [Docker](https://www.docker.com/) (para o PostgreSQL) ou um PostgreSQL local

---

## 🔧 Variáveis de ambiente

Copie o arquivo de exemplo e ajuste os valores:

```bash
$ cp .env.example .env
```

| Variável            | Obrigatória | Descrição                                           | Exemplo                                                       |
| ------------------- | :---------: | --------------------------------------------------- | ------------------------------------------------------------- |
| `DATABASE_URL`      |     ✅      | String de conexão usada pelo Prisma                 | `postgresql://postgres:postgres@localhost:5432/todo-list-api` |
| `PORT`              |     ❌      | Porta da aplicação (padrão `3000`)                  | `3000`                                                        |
| `POSTGRES_USER`     |     ✅      | Usuário do PostgreSQL (docker-compose)              | `postgres`                                                    |
| `POSTGRES_PASSWORD` |     ✅      | Senha do PostgreSQL (docker-compose)                | `postgres`                                                    |
| `POSTGRES_DB`       |     ✅      | Nome do banco (docker-compose)                      | `todo-list-api`                                               |
| `POSTGRES_HOST`     |     ✅      | Host do banco                                       | `localhost`                                                   |
| `POSTGRES_PORT`     |     ✅      | Porta exposta do banco                              | `5432`                                                        |
| `SECRET`            |     ✅      | Segredo usado para assinar o JWT                    | `your-super-secret-key`                                       |
| `EXPIRES`           |     ✅      | Tempo de expiração do token                         | `1d`                                                          |
| `CORS_ORIGIN`       |     ❌      | Origem permitida no CORS (padrão: reflete a origem) | `http://localhost:5173`                                       |

> O `docker-compose` provisiona o banco a partir das variáveis `POSTGRES_*`, e o `DATABASE_URL` (consumido pelo Prisma) deve apontar para esse mesmo banco.

---

## 🚀 Instalação e execução

```bash
# 1. Instale as dependências
$ yarn install

# 2. Suba o banco (PostgreSQL via Docker)
$ docker compose up -d

# 3. Aplique as migrations
$ npx prisma migrate deploy

# 4. Rode a aplicação
$ yarn start:dev
```

A API ficará disponível em `http://localhost:3000` e a documentação em `http://localhost:3000/docs`.

<details>
<summary><strong>Outros modos de execução</strong></summary>

```bash
# desenvolvimento
$ yarn start

# watch mode
$ yarn start:dev

# produção
$ yarn start:prod
```

</details>

---

## 🗄 Banco de dados

O projeto usa **Prisma** com **PostgreSQL**. Modelos principais:

- **User** — `id`, `name`, `email` (único), `password`
- **Task** — `id`, `title`, `description`, `status`, `userId` — com `@@unique([userId, title])` (título único **por usuário**)

<details>
<summary><strong>Comandos úteis do Prisma</strong></summary>

```bash
# gerar o client
$ npx prisma generate

# criar/aplicar migration em desenvolvimento
$ npx prisma migrate dev --name nome_da_migration

# aplicar migrations em produção
$ npx prisma migrate deploy

# abrir o Prisma Studio
$ npx prisma studio
```

</details>

---

## 📚 Documentação da API

A documentação interativa é servida com **Scalar** a partir do OpenAPI gerado.

| Recurso                                 | URL                               |
| --------------------------------------- | --------------------------------- |
| Referência interativa (Scalar)          | `http://localhost:3000/docs`      |
| OpenAPI JSON (Postman/Insomnia/codegen) | `http://localhost:3000/docs-json` |

> Use o botão **Authorize** no Scalar para colar o token retornado pelo `POST /auth/login` — ele fica persistido entre as chamadas.

---

## 🔗 Endpoints

> 🌐 = público &nbsp;|&nbsp; 🔒 = requer JWT (`Authorization: Bearer <token>`)

### Auth

| Método | Rota          | Acesso | Descrição                           |
| ------ | ------------- | :----: | ----------------------------------- |
| `POST` | `/auth/login` |   🌐   | Autentica e retorna o `accessToken` |

### Users

| Método  | Rota        | Acesso | Descrição                                   |
| ------- | ----------- | :----: | ------------------------------------------- |
| `POST`  | `/users`    |   🌐   | Cadastra um novo usuário                    |
| `GET`   | `/users/me` |   🔒   | Retorna o perfil do usuário autenticado     |
| `PATCH` | `/users/me` |   🔒   | Atualiza nome e/ou senha do próprio usuário |

<details>
<summary><strong>Exemplos — Users</strong></summary>

```bash
# Cadastrar usuário (público)
curl -X POST http://localhost:3000/users \
  -H 'Content-Type: application/json' \
  -d '{ "name": "John Doe", "email": "johndoe@email.com", "password": "P@ssw0rd" }'
# 201 -> { "id": "uuid", "name": "John Doe", "email": "johndoe@email.com" }

# Perfil do usuário autenticado
curl http://localhost:3000/users/me \
  -H 'Authorization: Bearer <token>'
# 200 -> { "id": "uuid", "name": "John Doe", "email": "johndoe@email.com", "tasks": [ ... ] }

# Atualizar nome e/ou senha
curl -X PATCH http://localhost:3000/users/me \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{ "name": "John Updated", "currentPassword": "P@ssw0rd", "newPassword": "N3wP@ssw0rd" }'
# 200 -> { "id": "uuid", "name": "John Updated", "email": "johndoe@email.com" }
```

</details>

### Tasks

| Método   | Rota                | Acesso | Descrição                   |
| -------- | ------------------- | :----: | --------------------------- |
| `POST`   | `/tasks`            |   🔒   | Cria uma tarefa             |
| `GET`    | `/tasks`            |   🔒   | Lista as tarefas do usuário |
| `GET`    | `/tasks/:id`        |   🔒   | Busca uma tarefa por id     |
| `PATCH`  | `/tasks/:id`        |   🔒   | Atualiza uma tarefa         |
| `PATCH`  | `/tasks/:id/status` |   🔒   | Avança o status da tarefa   |
| `DELETE` | `/tasks/:id`        |   🔒   | Remove uma tarefa           |

<details>
<summary><strong>Exemplos — Tasks</strong></summary>

```bash
# Criar tarefa
curl -X POST http://localhost:3000/tasks \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{ "title": "Buy groceries", "description": "Milk, eggs and bread" }'
# 201 -> { "id": "uuid", "title": "Buy groceries", "status": "PENDING", "userId": "uuid", ... }

# Listar tarefas do usuário
curl http://localhost:3000/tasks \
  -H 'Authorization: Bearer <token>'
# 200 -> [ { "id": "uuid", "title": "Buy groceries", "status": "PENDING", ... } ]

# Buscar tarefa por id
curl http://localhost:3000/tasks/<id> \
  -H 'Authorization: Bearer <token>'

# Atualizar tarefa
curl -X PATCH http://localhost:3000/tasks/<id> \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{ "title": "Buy groceries today", "status": "IN_PROGRESS" }'

# Avançar status (PENDING -> IN_PROGRESS -> COMPLETED)
curl -X PATCH http://localhost:3000/tasks/<id>/status \
  -H 'Authorization: Bearer <token>'

# Remover tarefa
curl -X DELETE http://localhost:3000/tasks/<id> \
  -H 'Authorization: Bearer <token>'
# 200 -> { "message": "Task successfully deleted" }
```

</details>

---

## 🔐 Autenticação

Todas as rotas são protegidas por padrão (Guard JWT global). Apenas `POST /auth/login` e `POST /users` são públicas.

<details>
<summary><strong>Exemplo de fluxo completo</strong></summary>

```bash
# 1. Cadastrar usuário
curl -X POST http://localhost:3000/users \
  -H 'Content-Type: application/json' \
  -d '{ "name": "John Doe", "email": "johndoe@email.com", "password": "P@ssw0rd" }'

# 2. Fazer login e obter o token
curl -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{ "email": "johndoe@email.com", "password": "P@ssw0rd" }'
# -> { "accessToken": "eyJ...", "user": { ... } }

# 3. Acessar uma rota protegida
curl http://localhost:3000/users/me \
  -H 'Authorization: Bearer eyJ...'
```

</details>

> 🚦 **Rate limit:** 100 requisições/min globais e **5 tentativas/min** no `POST /auth/login` (anti brute-force).

---

## 🧪 Testes

```bash
# todos os testes unitários
$ yarn test

# cobertura
$ yarn test:cov

# testes e2e (requer um banco de teste — veja abaixo)
$ yarn test:e2e
```

> Os testes **e2e** sobem a aplicação real e batem no banco. Aponte o `DATABASE_URL` para um **banco de teste dedicado** (com as migrations aplicadas) antes de rodar — a suíte limpa as tabelas no início e no fim:
>
> ```bash
> $ DATABASE_URL="postgresql://.../todo-list-test" npx prisma migrate deploy
> $ DATABASE_URL="postgresql://.../todo-list-test" yarn test:e2e
> ```

<details>
<summary><strong>Testes por módulo</strong></summary>

```bash
$ yarn test:auth      # auth (service + controller)
$ yarn test:user      # users (service + controller)
$ yarn test:task      # tasks (service + controller)
$ yarn test:prisma    # prisma service
```

</details>

---

## 🧹 Qualidade de código

Antes de cada commit, o hook `pre-commit` (Husky + lint-staged) executa:

- `eslint --fix` nos arquivos TypeScript staged
- `prettier --write` nos arquivos suportados

O hook `commit-msg` valida o padrão **Conventional Commits**:

```text
feat: adiciona endpoint de tarefas
fix(prisma): corrige conexão no bootstrap
chore: atualiza configuração do husky
```

```bash
# comandos manuais
$ yarn lint
$ yarn lint:fix
$ yarn format
```

---

## 👤 Autor

<p>
  <a href="https://www.linkedin.com/in/cristiano-da-silva-ferreira/" target="_blank">
    <img src="https://img.shields.io/badge/LinkedIn-Cristiano%20Ferreira-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" />
  </a>
  <a href="https://github.com/CristianoSFMothe" target="_blank">
    <img src="https://img.shields.io/badge/GitHub-CristianoSFMothe-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
  </a>
</p>

---

## 📄 Licença

Distribuído sob a licença **MIT**.
