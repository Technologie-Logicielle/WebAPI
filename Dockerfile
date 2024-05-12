FROM node:20-alpine

WORKDIR /app

COPY . .
RUN npm ci
ENV PORT 8080
EXPOSE 8080
ENTRYPOINT npm start
