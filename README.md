# 🎮 GameHub - Plataforma de Jogos Web

O **GameHub** é uma plataforma web para hospedagem e execução de jogos eletrônicos diretamente no navegador. O projeto foi arquitetado e desenvolvido utilizando o paradigma de **Microsserviços**, permitindo alta disponibilidade, escalabilidade independente, desacoplamento e facilidade de manutenção.

---

## 📋 Sumário
- [Arquitetura do Sistema](#-arquitetura-do-sistema)
- [Entidades e Funcionalidades (CRUD)](#-entidades-e-funcionalidades-crud)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Como Configurar e Executar Localmente](#-como-configurar-e-executar-localmente)
- [Rotina Diária de Atualização de Ranque](#-rotina-diária-de-atualização-de-ranque)
- [Histórico de Desenvolvimento](#-histórico-de-desenvolvimento)

---

## 🏗️ Arquitetura do Sistema

O projeto adota o paradigma arquitetural de **Microsserviços**. Todas as requisições do frontend passam por um **API Gateway**, que roteia as chamadas para seus respectivos serviços isolados, onde cada serviço possui e gerencia seu próprio banco de dados.

```text
                  +-----------------------+
                  |  Frontend (Interface) |
                  +-----------+-----------+
                              |
                              v
                  +-----------------------+
                  |      API Gateway      |
                  +-----------+-----------+
                              |
    +-----------------+-------+-------+-----------------+
    |                 |               |                 |
    v                 v               v                 v
+-------+         +-------+       +-------+         +-------+
| User  |         | Game  |       | Rank  |         |Support|
|Service|         |Service|       |Service|         |Service|
+---+---+         +---+---+       +---+---+         +---+---+
    |                 |               |                 |
    v                 v               v                 v
(PostgreSQL)      (MongoDB)       (Redis / DB)      (PostgreSQL)
