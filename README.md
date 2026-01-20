# API GraphQL — Gestão de Obras e Cotações de Insumos

Este projeto implementa uma API GraphQL para gestão de obras e suprimentos, com foco em **performance**, **modelagem de dados correta**, **arquitetura limpa** e **testabilidade**.

O principal desafio abordado é a capacidade de consultar obras considerando o **menor preço de cotação dos insumos associados**, garantindo eficiência mesmo em cenários com alto volume de dados.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Como Usar](#-como-usar)
  - [Pré-requisitos](#pré-requisitos)
  - [Iniciando o Projeto](#iniciando-o-projeto)
  - [Acessando o GraphQL Playground](#acessando-o-graphql-playground)
  - [Exemplos de Queries](#exemplos-de-queries)
  - [Exemplos de Mutations](#exemplos-de-mutations)
- [Objetivos Técnicos](#objetivos-técnicos)
- [Abordagem Arquitetural](#abordagem-arquitetural)
  - [Clean Architecture](#clean-architecture)
  - [CQRS](#cqrs)
  - [TDD](#tdd)
- [Modelagem do Banco de Dados](#modelagem-do-banco-de-dados)
  - [Entidades Principais](#entidades-principais)
  - [Histórico de Cotações](#histórico-de-cotações)
- [Performance e Índices](#performance-e-índices)
- [Testes](#-testes)
- [Desenvolvimento Local](#-desenvolvimento-local-fora-do-docker)
- [Troubleshooting](#-troubleshooting)
- [Escopo e Evoluções Futuras](#escopo-e-evoluções-futuras)

## Visão Geral

A API foi desenvolvida como resposta a um desafio técnico que exige não apenas um CRUD funcional, mas uma solução que demonstre:

- Clareza arquitetural
- Separação de responsabilidades
- Modelagem de dados normalizada
- Performance em consultas agregadas
- Decisões conscientes de escopo

## Objetivos Técnicos

- Demonstrar domínio de **Clean Architecture**
- Aplicar **CQRS (Command Query Responsibility Segregation)** de forma pragmática
- Utilizar **TDD (Test-Driven Development)** para garantir regras de negócio
- Modelar banco de dados seguindo **1FN, 2FN e 3FN**
- Resolver consultas complexas com **SQL otimizado e índices**
- Evitar overengineering, mantendo simplicidade e clareza

## Abordagem Arquitetural

### Clean Architecture

A aplicação segue os princípios da Clean Architecture, garantindo que:

- O **domínio** não dependa de frameworks
- As regras de negócio sejam o núcleo do sistema
- Infraestrutura, banco de dados e GraphQL sejam detalhes externos

### Camadas principais

- **Domain**  
  Entidades e regras de negócio

- **Application**  
  Casos de uso (Commands) e Queries

- **Interface Adapters**  
  Controllers GraphQL, presenters e gateways

- **Infrastructure**  
  Banco de dados, ORM, servidor e configurações

### CQRS

Foi adotado **CQRS leve**, com separação lógica entre leitura e escrita.

#### Commands (Write Model)

- Alteram o estado do sistema
- Utilizam entidades de domínio
- Aplicam regras de negócio

#### Queries (Read Model)

- Apenas leitura
- Retornam DTOs
- Utilizam SQL otimizado para agregações

Essa separação permite otimizar consultas críticas sem comprometer o domínio.

### TDD

O desenvolvimento segue **TDD orientado ao domínio**, priorizando testes onde existe regra de negócio real.

### Estratégia de testes

- **Domain**  
  Testes unitários puros, sem mocks, banco ou framework

- **Use Cases (Commands)**  
  Testes unitários com mocks de repositórios

- **Queries (Read Model)**  
  Testes de contrato validando o resultado esperado

- **Infra / GraphQL**  
  Testes de integração mínimos, focados no fluxo completo

Frameworks e detalhes técnicos **não são testados isoladamente**.

## Modelagem do Banco de Dados

O banco de dados foi modelado seguindo rigorosamente as **três formas normais (1FN, 2FN e 3FN)**, evitando redundância e facilitando manutenção.

### Entidades Principais

- **Obra** - Projetos de construção
- **Insumo** - Materiais utilizados nas obras
- **Categoria** - Classificação dos insumos (Cimento, Ferro, Madeira, etc.)
- **Fornecedor** - Empresas que fornecem cotações
- **Cotação** - Preços e condições de fornecimento
- **Inspeção** - Inspeções realizadas nas obras

### Relacionamentos principais

- Uma obra utiliza vários insumos (**N:N** via `obras_insumos`)
- Um insumo pertence a uma categoria
- Um insumo possui várias cotações
- Uma cotação pertence a um fornecedor
- Uma obra possui várias inspeções

### Histórico de Cotações

As cotações são versionadas utilizando:

- `valid_from`
- `valid_to`

A cotação vigente é identificada por:

```sql

valid_to IS NULL

```

O histórico está modelado desde o início, porém a API expõe apenas a cotação vigente, mantendo o escopo do desafio controlado e evitando retrabalho futuro.

## Performance e Índices

A principal consulta do sistema — obras filtradas pelo **menor preço de cotação dos insumos associados** — é resolvida diretamente no banco de dados.

### Estratégias adotadas

- Agregações via SQL (`MIN(preco_unitario)`)
- Cálculo feito no banco, não em memória
- Uso de índices direcionados para consultas críticas

### Índices principais

```sql
-- Índices para otimizar busca de cotações
CREATE INDEX idx_cotacao_vigente
ON cotacoes (insumo_id, valid_to);

CREATE INDEX idx_cotacao_preco
ON cotacoes (insumo_id, preco_unitario);

-- Índices para relacionamento obra-insumo
CREATE INDEX idx_obra_insumo
ON obras_insumos (obra_id, insumo_id);

CREATE INDEX idx_insumo_categoria
ON insumos (categoria_id);

-- Índices para inspeções
CREATE INDEX idx_inspecao_obra_data
ON inspecoes (obra_id, created_at);
```

Esses índices garantem performance nas consultas principais:
- Busca de menor preço por insumo
- Busca de cotações vigentes
- Busca de inspeções por obra ordenadas por data

## Escopo e Evoluções Futuras

Para manter o escopo adequado ao desafio:

- As cotações são globais por insumo e fornecedor
- Não variam por obra ou região

O modelo foi pensado para permitir futuras extensões, como:

- Cotações específicas por região
- Cotações específicas por obra
- Estratégias mais avançadas de precificação

Essas evoluções podem ser implementadas sem quebra estrutural do domínio.

---

## Como Usar

### Pré-requisitos

- **Docker** e **Docker Compose** instalados
  - Docker: https://docs.docker.com/get-docker/
  - Docker Compose: Geralmente vem com Docker Desktop
- **Node.js 18+** (apenas para desenvolvimento local, testes ou execução fora do Docker)

### Iniciando o Projeto

```bash
# Clone o repositório
git clone git@github.com:AlessandroFMello/gestao-de-obras-e-cotacao-de-insumos.git 
cd gestao-de-obras-e-cotacao-de-insumos

# Inicie os containers (banco de dados e API)
docker-compose up

# O servidor GraphQL estará disponível em:
# http://localhost:4000
```

**O que acontece ao executar `docker-compose up`:**

1. O banco de dados MySQL é iniciado
2. O schema do banco é criado automaticamente (`database/sql_schema.sql`)
3. Os dados de seed são inseridos automaticamente (`database/sql_seeds.sql`)
4. A API GraphQL é iniciada e conectada ao banco
5. O GraphQL Playground fica disponível em `http://localhost:4000`

**Nota:** Na primeira execução, pode levar alguns segundos para o banco estar pronto. Aguarde até ver a mensagem "Server ready at: http://localhost:4000/".

### Acessando o GraphQL Playground

1. Abra `http://localhost:4000` no navegador
2. O GraphQL Playground será exibido automaticamente
3. Use a documentação interativa (aba "Schema" ou "Docs") para explorar a API

### Parando os Containers

```bash
# Parar os containers
docker-compose down

# Parar e remover volumes (limpa o banco de dados)
docker-compose down -v
```

### Resetando o Banco de Dados

Se precisar resetar o banco de dados com os dados iniciais:

```bash
# Parar e remover tudo
docker-compose down -v

# Iniciar novamente (os seeds serão executados automaticamente)
docker-compose up
```

### Exemplos de Queries

#### Listar Obras (Query Principal do Desafio)

```graphql
query {
  works(limit: 20) {
    id
    name
    cheapestQuote {
      unitPrice
      sku
      supplier {
        name
      }
    }
    categories {
      name
    }
    inspections(last: 5) {
      status
      note
    }
  }
}
```

**Exemplo de Resposta:**

```json
{
  "data": {
    "works": [
      {
        "id": "1",
        "name": "Obra Residencial - Condominio Sol Nascente",
        "cheapestQuote": {
          "unitPrice": 0.78,
          "sku": "TIJ-CERAMICO-C",
          "supplier": {
            "name": "Fornecedor C - Atacado"
          }
        },
        "categories": [
          { "name": "Cimento" },
          { "name": "Ferro" },
          { "name": "Madeira" },
          { "name": "Tijolo" }
        ],
        "inspections": [
          {
            "status": "APPROVED",
            "note": "Impermeabilizacao corrigida e aprovada."
          },
          {
            "status": "REJECTED",
            "note": "Necessario ajuste na impermeabilizacao."
          }
        ]
      }
    ]
  }
}
```

**Notas sobre a Query:**
- `cheapestQuote` retorna a cotação mais barata de **todas** as cotações dos insumos da obra (singular, não array)
- `cheapestQuote` pode ser `null` se a obra não tiver cotações ativas
- `categories` retorna as categorias únicas dos insumos utilizados na obra
- `inspections(last: 5)` retorna as últimas N inspeções ordenadas por data (mais recente primeiro)

#### Listar Obras com Limite Personalizado

```graphql
query {
  works(limit: 5) {
    id
    name
    cheapestQuote {
      unitPrice
      sku
      supplier {
        name
      }
    }
    categories {
      name
    }
    inspections(last: 3) {
      status
      note
    }
  }
}
```

### Exemplos de Mutations

#### Criar Nova Cotação

```graphql
mutation {
  createCotacao(input: {
    sku: "CIM-001"
    unitPrice: 50.0
    deliveryDays: 5
    supplyId: "1"
    supplierId: "1"
  }) {
    id
    sku
    unitPrice
    deliveryDays
    validFrom
    validTo
    supplyId
    supplierId
  }
}
```

**Nota:** Ao criar uma nova cotação, ela automaticamente se torna a cotação vigente (a anterior terá `valid_to` atualizado).

### Scripts Disponíveis

```bash
# Desenvolvimento (watch mode)
yarn dev

# Build
yarn build

# Testes
yarn test

# Testes com coverage
yarn test:coverage

# Seed do banco de dados
yarn seed

# Lint
yarn lint

# Format
yarn format
```

---

### Dados de Seed

O banco de dados é populado automaticamente com dados de exemplo:

- **3 Obras**: Residencial, Comercial e Industrial
- **13 Insumos**: Cimentos, Ferros, Madeiras, Tijolos e Tintas
- **20+ Cotações**: Múltiplas cotações por insumo com preços diferentes
- **5 Fornecedores**: Diferentes fornecedores com cotações variadas
- **11 Inspeções**: Inspeções de exemplo para todas as obras

Esses dados permitem testar a query principal do desafio imediatamente após iniciar o projeto.

---

## Estrutura do Projeto

```
src/
├── domain/                    # Entidades e regras de negócio
│   ├── entities/              # Entidades de domínio (Work, Supply, Quote, etc.)
│   ├── errors/                 # Erros de domínio
│   └── utils/                  # Utilitários (normalização de strings, etc.)
├── application/                # Use cases e queries
│   ├── use-cases/             # Commands (escrita) - CreateCotacaoUseCase
│   ├── queries/                # Queries (leitura) - ListarObrasComMenorPrecoQuery
│   ├── dtos/                   # Data Transfer Objects
│   ├── errors/                 # Erros de aplicação
│   └── ports/                   # Interfaces (repositórios)
│       ├── queries/            # Interfaces para queries (read)
│       └── repositories/        # Interfaces para repositórios (write)
├── interface-adapters/          # Adaptadores de interface
│   ├── graphql/                # Schema e resolvers GraphQL
│   │   └── resolvers/          # WorksResolver, CotacaoResolver
│   ├── presenters/             # Formatação de dados para GraphQL
│   └── gateways/                # Implementação de repositórios (Prisma)
├── infrastructure/              # Detalhes técnicos
│   ├── database/               # Prisma Client Factory e seeds
│   └── web/                     # Servidor Apollo
└── main/                        # Composição e entry point
    ├── factories/               # Injeção de dependências
    └── index.ts                 # Entry point da aplicação
```

---

## Testes

O projeto possui **158 testes** com **100% de cobertura** cobrindo:

- Entidades de domínio (validações e regras de negócio)
- Use cases (lógica de aplicação)
- Queries (contratos de leitura)
- Repositórios (integração com banco)
- Presenters (formatação de dados)
- Resolvers GraphQL (integração)

### Executando os Testes

```bash
# Executar todos os testes
yarn test

# Executar testes em modo watch
yarn test:watch

# Executar testes com cobertura
yarn test:coverage
```

**Nota:** Para executar os testes localmente (fora do Docker), você precisará:
- Node.js 18+ instalado
- Banco de dados MySQL rodando (ou configurar `DATABASE_URL` no `.env`)
- Executar `yarn install` e `yarn prisma:generate`

---

## Tecnologias Utilizadas

- **TypeScript**: Linguagem principal
- **GraphQL**: API query language
- **Apollo Server**: Servidor GraphQL
- **Prisma 7.2+**: ORM para MySQL (com adapter MariaDB)
- **MySQL 8.0**: Banco de dados relacional
- **Vitest**: Framework de testes
- **Docker**: Containerização
- **Docker Compose**: Orquestração de containers

## Troubleshooting

### Erro de conexão com banco de dados

Se você ver erros de conexão ao iniciar:

1. Verifique se o container do MySQL está rodando: `docker ps`
2. Aguarde alguns segundos após iniciar (o MySQL precisa de tempo para inicializar)
3. Verifique os logs: `docker-compose logs mysql`

### Porta 4000 já em uso

Se a porta 4000 estiver ocupada:

1. Pare outros serviços na porta 4000, ou
2. Altere a porta no `docker-compose.yml`:
   ```yaml
   ports:
     - '4001:4000'  # Use 4001 no host
   ```

### Resetar banco de dados

Para limpar completamente e recriar o banco:

```bash
docker-compose down -v
docker-compose up
```

### Ver logs da aplicação

```bash
# Logs de todos os serviços
docker-compose logs

# Logs apenas da API
docker-compose logs api

# Logs em tempo real
docker-compose logs -f api
```

---

## Desenvolvimento Local (Fora do Docker)

Se preferir desenvolver sem Docker:

```bash
# Instalar dependências
yarn install

# Gerar Prisma Client
yarn prisma:generate

# Configurar variáveis de ambiente
# Crie um arquivo .env com:
# DATABASE_URL="mysql://root:password@localhost:3306/obras_insumos_db"
# PORT=4000
# NODE_ENV=development

# Executar migrations (se necessário)
# Nota: O projeto usa SQL direto em database/sql_schema.sql
# Se usar Prisma migrations, execute: yarn prisma:migrate

# Popular banco com seeds
yarn seed

# Iniciar servidor em modo desenvolvimento
yarn dev
```

**Nota:** Você precisará ter o MySQL rodando localmente na porta 3306 (ou ajustar a `DATABASE_URL`).


