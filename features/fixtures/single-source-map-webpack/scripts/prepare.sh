#!/usr/bin/env bash
rm -rf node_modules
npm install
npm install -g ./build/bugsnag-source-maps.tgz
npm run build
