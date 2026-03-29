FROM node:lts-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

# Start the application
CMD ["sh", "-c", "npm run gen && npm run build && npm run start" ]

