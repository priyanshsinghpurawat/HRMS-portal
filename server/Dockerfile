FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Production Build Stage
FROM node:20-alpine

WORKDIR /usr/src/app

# Define production environment
ENV NODE_ENV=production

# Copy built node_modules and app source
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app .

# Optimize for production execution
EXPOSE 8000

# Start the application
CMD ["npm", "start"]
