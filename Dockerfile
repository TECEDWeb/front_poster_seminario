# =========================
# 1. BUILD STAGE
# =========================
FROM node:20-alpine AS build

WORKDIR /app

# instalar dependencias
COPY package*.json ./
RUN npm install

# copiar proyecto
COPY . .

# build Angular (TU PROJECT SE LLAMA "app")
RUN npx ng build app --configuration production

# DEBUG (IMPORTANTE para evitar errores de ruta)
RUN ls -R www


# =========================
# 2. NGINX STAGE
# =========================
FROM nginx:alpine

# limpiar nginx default
RUN rm -rf /usr/share/nginx/html/*

# copiar build generado
# ⚠️ TU angular.json genera output en "www"
COPY --from=build /app/www /usr/share/nginx/html

# nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# puerto
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]