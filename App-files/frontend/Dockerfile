FROM node:20.8.0 AS builder
WORKDIR /usr/src/app
COPY ./package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20.8.0-slim

WORKDIR /app

#Copy Everything from build
COPY --from=builder /usr/src/app/build /app/build

# Expose port 3000
EXPOSE 3000

# Serve the built files
CMD ["npx", "serve", "-s", "build", "-l", "3000"]