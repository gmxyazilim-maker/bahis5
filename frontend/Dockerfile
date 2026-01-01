FROM node:18-alpine as build

WORKDIR /app

# Package dosyaları
COPY package.json ./

# Bağımlılıkları yükle
RUN yarn install --frozen-lockfile

# Kaynak kodları kopyala
COPY . .

# Build argümanı
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

# Production build
RUN yarn build

# Nginx ile serve et
FROM nginx:alpine

# Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Build dosyalarını kopyala
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
