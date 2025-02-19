FROM node:20.8.0 AS builder

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json files
COPY ./package*.json ./

# Install only production dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Final stage
FROM node:20.8.0-slim

# Set the working directory
WORKDIR /usr/src/app

# Copy production dependencies from the builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copy only necessary application files
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app ./

# Expose the application port
EXPOSE 5000

# Start the application
CMD ["npm", "run", "start"]
