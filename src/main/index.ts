import { createApolloServer } from '../infrastructure/web/server.js';
import { startStandaloneServer } from '@apollo/server/standalone';
import { disconnectPrisma } from '../infrastructure/database/PrismaClientFactory.js';
import 'dotenv/config';

/**
 * Application entry point
 */
async function main() {
  const port = Number(process.env.PORT) || 4000;

  try {
    const server = createApolloServer();

    const { url } = await startStandaloneServer(server, {
      listen: { port },
    });

    console.log(`Server ready at: ${url}`);
    console.log(`GraphQL Playground available at: ${url}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    await disconnectPrisma();
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await disconnectPrisma();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down gracefully...');
  await disconnectPrisma();
  process.exit(0);
});

// Execute application
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
