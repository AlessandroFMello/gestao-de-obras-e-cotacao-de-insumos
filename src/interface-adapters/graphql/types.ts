/**
 * GraphQL type definitions
 */
export const typeDefs = `
  type Work {
    id: ID!
    name: String!
    cheapestQuote: CheapestQuote
    categories: [Category!]!
    inspections(last: Int): [Inspection!]!
  }

  type CheapestQuote {
    unitPrice: Float!
    sku: String!
    supplier: Supplier!
  }

  type Supplier {
    name: String!
  }

  type Category {
    name: String!
  }

  type Inspection {
    status: String!
    note: String
  }

  type Cotacao {
    id: ID!
    sku: String!
    unitPrice: Float!
    deliveryDays: Int!
    validFrom: String!
    validTo: String
    supplyId: ID!
    supplierId: ID!
  }

  input CreateCotacaoInput {
    sku: String!
    unitPrice: Float!
    deliveryDays: Int!
    supplyId: ID!
    supplierId: ID!
  }

  type Query {
    works(limit: Int): [Work!]!
  }

  type Mutation {
    createCotacao(input: CreateCotacaoInput!): Cotacao!
  }
`;

