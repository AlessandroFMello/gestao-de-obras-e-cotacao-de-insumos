FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma Client
# Prisma needs DATABASE_URL for validation during generation, but doesn't actually connect
# Use a dummy URL here and override it at runtime via docker-compose
ARG DATABASE_URL="mysql://root:password@localhost:3306/dummy_db"
ENV DATABASE_URL=${DATABASE_URL}
RUN npx prisma generate

# Expose port
EXPOSE 4000

# Start application
CMD ["yarn", "run", "dev"]

