FROM node:lts-bookworm-slim

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./
RUN npm install --production

# Copy the rest of the code
COPY . .

EXPOSE 3000
CMD ["node", "server.js"]