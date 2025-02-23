# Stage 1: Build
FROM node:20.8.0 AS builder

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve with Node.js
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install 'serve' globally to serve static files
RUN npm install -g serve

# Copy the built files from the builder stage
COPY --from=builder /app/dist /app

# Expose the port
EXPOSE 3000

# Serve the application
CMD ["serve", "-s", ".", "-l", "3000"]

