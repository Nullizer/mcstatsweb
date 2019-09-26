#!/bin/bash
set -v

PATH="$PATH:./node_modules/.bin"
NODE_ENV=production

name=mcapi

npm run build
tmp_dir=$(mktemp -d)
cp -r dist package.json $tmp_dir
cwd=$(pwd)
cd $tmp_dir
npm i --production
target=${name}_node-$(node -v)_$(date "+%Y%m%d%H%M%S%Z").tar.xz
#XZ_OPT="-T0 -9e" tar -caf $target *
XZ_OPT="-T0 -9e" tar -caf $target dist/api node_modules
mv $target $cwd
rm -r $tmp_dir
