# docker build command
# docker build -t subhajitgarai04/backend:0.0.4 .

FROM node:22 AS builder

WORKDIR /build

COPY package*.json tsconfig.json  .
RUN npm ci
COPY .  .

RUN npm install typescript --save-dev
RUN npx prisma generate
RUN npx prisma generate --sql


RUN npm run build

FROM  node:22

ENV NODE_ENV production

WORKDIR /app

COPY  package*.json .


COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/dist ./dist
COPY --from=builder /build/prisma ./prisma

# # RUN npm ci --production
# RUN npm ci 

CMD ["node", "dist/src/surver.js"]




