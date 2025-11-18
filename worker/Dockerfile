FROM node:lts-alpine AS builder

WORKDIR /build

COPY package*.json tsconfig.json  ./
RUN npm ci
COPY .  .
RUN npm install typescript --save-dev

RUN npm run build

FROM  node:lts-alpine
ENV NODE_ENV production
WORKDIR /app
COPY  package*.json .
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/dist ./dist

CMD ["node", "dist/index.js"]

