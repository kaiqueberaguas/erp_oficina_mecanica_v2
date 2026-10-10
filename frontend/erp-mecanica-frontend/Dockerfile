# Estágio de build: compila o Angular
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx ng build --configuration production

# Estágio final: serve os arquivos estáticos com Nginx
FROM nginx:alpine AS final
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/erp-mecanica-frontend/browser /usr/share/nginx/html
EXPOSE 80
