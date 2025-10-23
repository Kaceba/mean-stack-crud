# Backend Dockerfile
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for TypeScript types)
RUN npm ci

# Copy backend source code
COPY backend/ ./backend/
COPY server.ts ./
COPY tsconfig.server.json ./

# Expose backend port
EXPOSE 3000

# Start the server with ts-node from local node_modules
CMD ["npx", "ts-node", "--project", "tsconfig.server.json", "server.ts"]
