const { src, dest, parallel, watch } = require('gulp')
const TOML = require('@iarna/toml')
const fs = require('fs')

const configFile = 'config.toml'

exports.genWebConfig = function genWebConfig (done) {
  const config = TOML.parse(fs.readFileSync(configFile, { encoding: 'utf-8' }))
  const webConfig = config.web
  fs.writeFileSync('dist/web/config.json', JSON.stringify(webConfig))
  done()
}

const sources = ['src/web/*.+(html|css)']

exports.copy = function copy () {
  return src(sources)
    .pipe(dest('dist/web/'))
}

exports.watch = function auto () {
  watch(sources, exports.copy)
  watch(configFile, exports.genWebConfig)
}

exports.default = parallel(exports.copy, exports.genWebConfig)
