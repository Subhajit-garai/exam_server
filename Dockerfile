# --- Build Stage ---
FROM node:lts-alpine AS builder

WORKDIR /usr/src/app

# Copy package files for dependency installation
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies for building)
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the application (runs tsc && tsc-alias as per package.json)
RUN npm run build

# --- Production Stage ---
FROM node:lts-alpine

WORKDIR /usr/src/app

# Set environment to production
ENV NODE_ENV=production

# Copy package files for production dependency installation
COPY package.json package-lock.json ./

# Install only production dependencies to keep the image slim
RUN npm ci --omit=dev

# Copy the compiled code from the builder stage
# We only copy 'dist/src' as 'seeds', 'tsconfig.tsbuildinfo', and 'drizzle.config.js' are not needed in production.
COPY --from=builder /usr/src/app/dist/src ./dist/src

# Expose the port the app runs on (default 3000)
EXPOSE 3000

# Start the application
# We use node directly for better signal handling (SIGTERM, etc.)
CMD ["node", "dist/src/server.js"]
