# Stage 1: Build the React Application
FROM node:18-alpine as build

WORKDIR /app

# Copy package files first
COPY package.json package-lock.json* ./

# Use 'npm install' instead of 'npm ci' to handle missing/mismatched lockfiles
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the static files
RUN npm run build