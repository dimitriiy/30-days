
ARG NODE_VERSION=24.13.0-slim

FROM node:${NODE_VERSION} AS dependencies


WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "start"]