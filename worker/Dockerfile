# FROM node:lts-alpine AS builder

# WORKDIR /build

# COPY package*.json tsconfig.json  ./
# RUN npm ci
# COPY .  .
# RUN npm install typescript --save-dev

# RUN npm run build

# FROM  node:lts-alpine
# ENV NODE_ENV production
# WORKDIR /app
# COPY  package*.json .
# COPY --from=builder /build/node_modules ./node_modules
# COPY --from=builder /build/dist ./dist

# CMD ["node", "dist/index.js"]


FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

# npm run gen && npm run gen:sql - > removeing sql because now  we are not using any time serise data and we use rawsql in prisam not typed sql 
CMD ["sh", "-c", "npm run gen && npm run build && npm run start" ]

