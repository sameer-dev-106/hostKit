FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache git

COPY package*.json ./
RUN npm install

RUN apk add --no-cache docker-cli

COPY . .

CMD ["node", "src/workers/deployment.worker.js"]