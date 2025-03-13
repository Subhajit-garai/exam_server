# docker build command
# docker build -t subhajitgarai04/exam_worker:0.0.3 .

FROM node:22 AS builder

WORKDIR /build

COPY package*.json tsconfig.json  .
RUN npm install 
COPY .  .

RUN npx prisma generate
RUN npm install typescript --save-dev


RUN npm run build

FROM  node:22

ENV NODE_ENV production

WORKDIR /app

COPY  package*.json .
# RUN npm install --production

COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/dist ./dist
COPY --from=builder /build/prisma ./prisma

CMD ["node", "dist/index.js"]

