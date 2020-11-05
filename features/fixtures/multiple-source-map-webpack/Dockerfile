FROM node:lts-alpine

WORKDIR /app

COPY build/bugsnag-source-maps.tgz build/bugsnag-source-maps.tgz
COPY src/ src/
COPY package.json package-lock.json ./
COPY webpack.config.js ./

RUN npm ci
RUN npm install -g ./build/bugsnag-source-maps.tgz
RUN npm run build
