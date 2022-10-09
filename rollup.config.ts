import alias from '@rollup/plugin-alias';
import { babel } from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import { resolve } from 'path';
import { eslint } from 'rollup-plugin-eslint';
import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import { main, module, version } from './package.json';


const plugins = [
  alias({
    entries:[
      {
        find:'js-monitor-sdk',
        replacement: resolve(__dirname, './packages/types')
      }
    ]
  }),
  json(),
  eslint({
    throwOnError: false,
    include: ['packages/**/*.ts'],
    exclude: ['node_modules/**'],
  }),
  typescript({ useTsconfigDeclarationDir: true }),

  commonjs(),
  nodeResolve({
    browser: true,
  }),
  terser({
    compress: {
      // remove console.log
      // pure_funcs: ['console.log'],
    },
    output: {
      // add comment on the top
      preamble: `/* js-monitor-sdk- v${version} - ${new Date()} **/`
    }
  }),
  replace({
    preventAssignment: true,
    'process.env.NODE_ENV': JSON.stringify('production'),
  })

]
const babelPlugin =  babel({
  exclude: 'node_modules',
  extensions: ['.ts'],
  babelHelpers: 'runtime',
  presets: [
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'usage',
        corejs: {
          version: 3,
          proposals: true,
        },
      },
    ],
  ],
  plugins: [
    '@babel/proposal-class-properties',
    '@babel/proposal-object-rest-spread',
    [
      '@babel/plugin-transform-runtime',
      {
        useESModules: true,
        corejs: 3, // 指定 runtime-corejs 的版本，目前有 2 3 两个版本
      },
    ],
  ],
})

const watch =  {
  include: 'packages/**',
}
const external = []

export default [
  {
    input: 'packages/index.ts',
    output:[{
        file: main,
        format: 'umd',
        sourcemap: true,
        inlineDynamicImports: true,
        name: 'JSMonitor',
        exports: 'default',
        globals: {
        },
      },{
        file: module,
        format: 'es',
        inlineDynamicImports: true,
        sourcemap: true,
        exports: 'default',
        globals: {
        },
      },],
      watch,
      external,
      plugins: [
        ...plugins,
        babelPlugin,
      ]
  },
  {
    input: 'packages/index.ts',
    output: {
      file: "dist/js-monitor-sdk.esm.js",
      format: 'es',
      inlineDynamicImports: true,
      sourcemap: true,
      exports: 'default',
      globals: {
      },
    },
    watch,
    external,
    plugins: [
      ...plugins,
    ]
  }
]
