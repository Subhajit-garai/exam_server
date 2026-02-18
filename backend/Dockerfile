FROM node:lts-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .
# npm run gen && npm run gen:sql - > removeing sql because now  we are not using any time serise data and we use rawsql in prisam not typed sql 
CMD ["sh", "-c", "npm run gen && npm run build && npm run start" ]

