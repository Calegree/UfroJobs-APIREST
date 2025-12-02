
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --ignore-scripts

COPY tsconfig*.json ./
COPY nest-cli.json ./
COPY src ./src
COPY eslint.config.mjs ./

RUN npm run build

RUN npm prune --omit=dev

FROM node:20-alpine AS production

RUN addgroup -S -g 1001 app && \
    adduser -S -u 1001 app -G app

WORKDIR /app

COPY --from=builder --chown=root:root --chmod=755 /app/package*.json ./
COPY --from=builder  --chown=root:root --chmod=755 /app/node_modules ./node_modules
COPY --from=builder --chown=root:root --chmod=755 /app/dist ./dist

EXPOSE 3000
USER app

CMD ["node", "dist/main"]
