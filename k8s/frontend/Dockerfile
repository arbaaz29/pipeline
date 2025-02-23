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

# Stage 2: Serve with Nginx
FROM node:20.8.0-slim

# Copy built files from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 3000

# Start Nginx server
CMD ["npx", "serve", "-s", "build", "-l", "3000"]
