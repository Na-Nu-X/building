# syntax=docker/dockerfile:1
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci
COPY . .
RUN npx ng build --configuration production

FROM nginx:1.29-alpine
# The official nginx image renders /etc/nginx/templates/*.template with envsubst on start-up.
ENV BACKEND_UPSTREAM=backend:8000
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY nginx/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
EXPOSE 80
