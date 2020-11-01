#!/usr/bin/env bash
rm -f build/bugsnag-source-maps*.tgz
npm i
npm run build
PACKAGE=$(npm pack)
mkdir -p build
mv $PACKAGE build/bugsnag-source-maps.tgz
