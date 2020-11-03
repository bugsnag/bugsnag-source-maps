#!/usr/bin/env sh
set -ex
rm -f build/bugsnag-source-maps*.tgz
npm i
npm run build
PACKAGE=$(npm pack)
mkdir -p build
mv $PACKAGE build/bugsnag-source-maps.tgz
