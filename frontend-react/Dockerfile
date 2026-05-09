# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json trước để cache node_modules
COPY package*.json ./
RUN npm ci

# Copy source và build
COPY . .
RUN npm run build

# ─────────────────────────────────────────
# Stage 2: Serve với Nginx
FROM nginx:alpine

# Copy file build ra từ stage 1
COPY --from=builder /app/dist /usr/share/nginx/html

# Config nginx để React Router hoạt động đúng
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]