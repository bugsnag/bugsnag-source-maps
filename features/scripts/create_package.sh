#!
rm -f bugsnag-source-maps*.tgz
npm i
npm run build
PACKAGE=$(npm pack)
mv $PACKAGE bugsnag-source-maps.tgz
