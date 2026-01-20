import { ApolloServer } from '@apollo/server';
import { typeDefs } from '../../interface-adapters/graphql/types.js';
import { resolvers } from '../../interface-adapters/graphql/resolvers/index.js';

/**
 * Create and configure Apollo Server
 */
export function createApolloServer(): ApolloServer {
  return new ApolloServer({
    typeDefs,
    resolvers,
  });
}

