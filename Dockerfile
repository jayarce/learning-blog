CMD ["node", "server.js"]FROM node:18-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --production
RUN npm install mongoose
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]