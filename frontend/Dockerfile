# Stage 1: Build the React Application
FROM node:18-alpine as build

WORKDIR /app

# Copy package files first
COPY package.json package-lock.json* ./
RUN npm install

# Copy source and build
COPY . .
# NOTE: Ensure REACT_APP_API_URL is available at build time if using Railway Variables
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy the custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built React assets from Stage 1
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 (standard for Nginx)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]