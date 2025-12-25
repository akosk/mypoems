# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production
FROM node:20-slim

WORKDIR /app

# Copy the build output from the builder stage
COPY --from=builder /app/.output ./.output

# Expose the port (Railway typically sets PORT env var, Nitro defaults to 3000)
ENV PORT=3000
EXPOSE 3000

# Start the server
CMD ["node", ".output/server/index.mjs"]
