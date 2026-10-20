# 🎮 GameHub – Plataforma de Jogos Web

> **GameHub** é uma plataforma modular para hospedagem e execução de jogos **HTML5** diretamente no navegador. O projeto segue o padrão de **microsserviços**, permitindo escalabilidade independente, alta disponibilidade e manutenção facilitada.

---

## 📋 Sumário
- [Arquitetura do Sistema](#arquitetura-do-sistema)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Como Executar Localmente](#como-executar-localmente)
- [API Gateway & Endpoints Principais](#api-gateway--endpoints-principais)
- [Contribuição](#contribuição)
- [Licença](#licença)

---

## 🏗️ Arquitetura do Sistema
```text
                   +-----------------------+ 
                   |  Frontend (React)    |
                   +-----------+-----------+
                               |
                               v
                   +-----------------------+
                   |      API Gateway      |
                   +-----------+-----------+
                               |
   +---------------------------+---------------------------+---------------------------+---------------------------+
   |                           |                           |                           |
   v                           v                           v                           v
+-------+                 +-------+                 +-------+                 +-------+
| User  |                 | Game  |                 | Rank  |                 |Support|
|Service|                 |Service|                 |Service|                 |Service|
+---+---+                 +---+---+                 +---+---+                 +---+---+
    |                         |                         |                         |
    v                         v                         v                         v
(PostgreSQL)            (MongoDB)               (Redis)                 (PostgreSQL)
```

- **Frontend** – React + Vite (TypeScript) – UI responsiva para navegar, buscar e jogar.
- **API Gateway** – Node.js + Express (TypeScript) – roteia chamadas para os microsserviços.
- **User Service** – Gerencia usuários, autenticação JWT e persiste dados no **PostgreSQL**.
- **Game Service** – Catálogo de jogos, busca e criação de jogos; utiliza **MongoDB**.
- **Rank Service** – (pendente) gerencia rankings e utiliza **Redis** como cache.
- **Support Service** – (pendente) suporte ao cliente.

---

## 🛠️ Tecnologias Utilizadas
| Camada | Tecnologia | Motivo |
|--------|------------|--------|
| Frontend | React + Vite (TS) | UI moderna, hot‑reload, bundle pequeno |
| Gateway | Node.js, Express, http‑proxy‑middleware | Simplicidade, fácil integração com TS |
| User Service | Node.js, Express, PostgreSQL, bcrypt, JWT | Segurança e consistência relacional |
| Game Service | Node.js, Express, MongoDB | Flexibilidade de documentos para catálogos |
| Containerização | Docker & Docker‑Compose | Isolamento de dependências e ambiente reproducível |
| CI/CD (future) | GitHub Actions | Automatização de builds e testes |

---

## 📁 Estrutura de Pastas
```
GameHub/
├─ .gitignore
├─ .env.example          # modelo de variáveis de ambiente
├─ docker-compose.yml    # orquestração de containers
├─ gateway/              # API Gateway
│   ├─ src/
│   ├─ Dockerfile
│   └─ package.json
├─ services/            
│   ├─ user-service/    # CRUD de usuários
│   │   ├─ src/
│   │   ├─ Dockerfile
│   │   └─ package.json
│   ├─ game-service/    # catálogo de jogos
│   │   ├─ src/
│   │   ├─ Dockerfile
│   │   └─ package.json
│   └─ ... (rank‑service, support‑service)
└─ frontend/            # aplicação React
    ├─ src/
    ├─ Dockerfile
    └─ package.json
```

---

## 🔐 Variáveis de Ambiente
Um arquivo **.env.example** já está presente na raiz com todas as variáveis necessárias. Copie‑o para **.env** e ajuste conforme seu ambiente:
```dotenv
# Porta do Gateway
GATEWAY_PORT=8000
# Portas dos microsserviços
USER_SERVICE_PORT=8001
GAME_SERVICE_PORT=8002
# URLs internas para o Gateway
USER_SERVICE_URL=http://localhost:8001
GAME_SERVICE_URL=http://localhost:8002
# Banco de Dados PostgreSQL (User & Support)
POSTGRES_USER=gamehub
POSTGRES_PASSWORD=gamehub_secret
POSTGRES_DB=gamehub_user_db
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
# MongoDB (Game Service)
MONGO_URI=mongodb://localhost:27017/gamehub_games
# Redis (Rank Service)
REDIS_HOST=localhost
REDIS_PORT=6379
# JWT Secret
JWT_SECRET=super_secret_gamehub_jwt_key
```
> **Dica:** ao usar Docker‑Compose, as variáveis são propagadas automaticamente para cada container.

---

## ▶️ Como Executar Localmente
### 1️⃣ Via Docker‑Compose (recomendado)
```bash
# Crie o .env a partir do exemplo
cp .env.example .env

# Inicie todos os containers
docker compose up --build
```
Os serviços ficarão disponíveis em:
- Gateway: http://localhost:8000
- Frontend: http://localhost:3000 (quando adicionado)
- User Service API: http://localhost:8001/users
- Game Service API: http://localhost:8002/games

### 2️⃣ Desenvolvimento sem Docker
Para cada serviço, entre na pasta, instale dependências e rode em modo *dev*:
```bash
cd gateway
npm install
npm run dev   # escuta na porta 8000
```
Repita o mesmo para `services/user-service` e `services/game-service`.

---

## 🔗 API Gateway & Endpoints Principais
| Método | Rota | Serviço Destino | Descrição |
|--------|------|-----------------|-----------|
| `GET` | `/health` | Gateway | Healthcheck da camada de entrada |
| `GET` | `/api/users` | User Service | Lista de usuários (máx 50) |
| `POST`| `/api/users/register` | User Service | Cria usuário e retorna JWT |
| `POST`| `/api/users/login` | User Service | Autenticação e token |
| `GET` | `/api/games` | Game Service | Busca catálogo (filtros `category`, `search`) |
| `GET` | `/api/games/:id` | Game Service | Detalhes do jogo |
| `POST`| `/api/games` | Game Service | Cria novo jogo (admin) |
| `POST`| `/api/games/:id/play` | Game Service | Incrementa contagem de jogadas |

> **Obs.:** os demais serviços (Rank, Support) ainda serão implementados.

---

## 🤝 Contribuição
1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b minha-feature`)
3. Commit suas mudanças (`git commit -am 'Add feature X'`)
4. Push para a branch (`git push origin minha-feature`)
5. Abra um Pull Request

> Siga o padrão de código TypeScript, lint com `npm run lint` (quando configurado) e inclua testes unitários.

---

## 📄 Licença
Este projeto está licenciado sob a **MIT License** – veja o arquivo [LICENSE](LICENSE) para detalhes.
