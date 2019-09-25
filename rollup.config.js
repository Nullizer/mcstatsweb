// @ts-check
// import vue from 'rollup-plugin-vue'
import typescript from 'rollup-plugin-typescript2'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import replace from 'rollup-plugin-replace'
import { terser } from 'rollup-plugin-terser'
// import css from 'rollup-plugin-css-only'
import path from 'path'

const isProd = process.env.NODE_ENV === 'production'
const outputDir = 'dist/web'

export default {
  input: ['src/web/app.ts'],
  output: [
    {
      dir: outputDir,
      format: 'esm',
    }
  ],

  /**
   * @param {string} id
   */
  manualChunks (id) {
    if (id.includes('node_modules/')) {
      const dirs = id.split(path.sep)
      const moduleName = dirs[dirs.lastIndexOf('node_modules') + 1]
      if (moduleName) return `vendor/${moduleName}`
      return 'vendor/other'
    }
  },

  plugins: [
    resolve(),
    commonjs(),
    typescript({
      tsconfig: 'src/web/tsconfig.json',
      // objectHashIgnoreUnknownHack: true
    }),
    // css({ output: `${outputDir}/bundle.css` }),
    // vue({ css: false }),
    replace({
      'process.env.NODE_ENV': isProd ? JSON.stringify('production') : JSON.stringify('development')
    }),
    isProd && terser(),
  ]
}
