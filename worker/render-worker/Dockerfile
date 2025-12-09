FROM node:18-bullseye AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:18-bullseye AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --only=production

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/index.js"]
