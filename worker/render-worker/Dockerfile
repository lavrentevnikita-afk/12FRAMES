FROM node:18-bullseye AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:18-bullseye AS runner
WORKDIR /app
ENV NODE_ENV=production

# Устанавливаем Chromium для Puppeteer
RUN apt-get update \
  && apt-get install -y chromium \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/index.js"]
