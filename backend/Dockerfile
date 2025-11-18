FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

CMD ["sh", "-c", "npm run gen && npm run gen:sql && npm run build && npm run start" ]


# docker build -t subhajitgarai04/backend:0.0.7 .
# docker build --progress=plain -t subhajitgarai04/backend:0.0.8 .

# FROM node:lts-alpine AS builder

# WORKDIR /build

# COPY package.json package-lock.json ./

# RUN npm i

# COPY . .
# RUN npm run gen 
# RUN npm run gen:sql 


# RUN npm run build 

# FROM node:lts-alpine As runner

# WORKDIR /usr/src/app

# COPY package.json package-lock.json ./
# COPY --from=builder /build/node_modules ./node_modules
# COPY --from=builder /build/dist ./dist
# RUN cp node_modules/@prisma/engines/libquery_engine-linux-musl-openssl-3.0.x.so.node  ./dist/prisma/generated/prisma/

# CMD ["sh", "-c", "npm run start"]