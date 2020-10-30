FROM node:lts-alpine

WORKDIR /app
COPY bugsnag-source-maps.tgz ./
COPY ./package* ./
COPY ./webpack.config.js ./
COPY ./src ./src

RUN npm install
RUN npm install -g bugsnag-source-maps.tgz
RUN npm run build
