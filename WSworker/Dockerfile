FROM node:lts-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

# Build the application
RUN npm run build

# Start the application
CMD ["npm", "start"]
