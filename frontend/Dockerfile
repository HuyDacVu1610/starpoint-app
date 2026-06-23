# Build Stage
FROM node:22-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY frontend/package*.json ./frontend/

RUN npm ci

COPY shared/ ./shared/
COPY frontend/ ./frontend/

# Build shared first
RUN npm run build -w @starpointapp/shared

# Build frontend
RUN npm run build -w frontend

# Nginx Stage
FROM nginx:alpine

# Copy built files to nginx public folder
COPY --from=build /usr/src/app/frontend/dist /usr/share/nginx/html

# Copy nginx config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
