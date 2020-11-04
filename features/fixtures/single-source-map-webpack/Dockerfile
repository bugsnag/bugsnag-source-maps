FROM node:lts-alpine

WORKDIR /app
COPY scripts/ scripts/
COPY build/ build/
COPY src/ src/
COPY package* ./
COPY webpack.config.js ./

RUN scripts/prepare.sh
