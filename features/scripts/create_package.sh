#!/usr/bin/env sh
set -ex
rm -f build/bugsnag-source-maps*.tgz
npm ci
npm run build
PACKAGE=$(npm pack)
mv $PACKAGE build/bugsnag-source-maps.tgz
