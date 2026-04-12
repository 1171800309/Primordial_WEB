FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build-time env for Vite (optional override by --build-arg)
ARG VITE_API_BASE_URL
ARG VITE_TOKEN_VALIDATE_PATH
ARG VITE_IDLE_TIMEOUT_MS
ARG VITE_TOKEN_VALIDATE_CACHE_MS
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_TOKEN_VALIDATE_PATH=${VITE_TOKEN_VALIDATE_PATH}
ENV VITE_IDLE_TIMEOUT_MS=${VITE_IDLE_TIMEOUT_MS}
ENV VITE_TOKEN_VALIDATE_CACHE_MS=${VITE_TOKEN_VALIDATE_CACHE_MS}

RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

