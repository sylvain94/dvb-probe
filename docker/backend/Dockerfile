FROM node:18-alpine

# Install curl for healthcheck and docker-cli for docker exec
RUN apk add --no-cache curl docker-cli

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p logs

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", "src/server.js"]


