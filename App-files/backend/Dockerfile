# Use a minimal and secure base image
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json separately to leverage Docker caching
COPY package*.json ./

# Install dependencies with security considerations
RUN npm ci --omit=dev --ignore-scripts \
    && npm audit --production --audit-level=high || true

# Copy only necessary application files to minimize attack surface
COPY node_modules ./
COPY index.js ./

# Remove unnecessary files to reduce image size and vulnerabilities
RUN rm -rf /tmp/* /var/tmp/* \
    && rm -rf node_modules/.cache \
    && chown -R node:node /app

# Switch to a non-root user for security
USER node

# Expose only the required port
EXPOSE 5000

# Use a safer command to start the application
CMD ["node", "index.js"]
