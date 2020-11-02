FROM node:lts-alpine

RUN apk add --update bash

WORKDIR /app
COPY scripts/ scripts/
COPY build/ build/
COPY src/ src/
COPY package* ./
COPY webpack.config.js ./

RUN scripts/prepare.sh
