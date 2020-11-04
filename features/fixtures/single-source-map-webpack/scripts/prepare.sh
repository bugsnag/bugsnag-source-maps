#!/usr/bin/env sh
set -ex
npm ci
npm install -g ./build/bugsnag-source-maps.tgz
npm run build
