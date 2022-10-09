import { babel } from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import typescript from 'rollup-plugin-typescript2';

export default {
  input: './hybrid.ts',
  output: [
    {
      file: 'dist/hybrid.js',
      format: 'iife',
      inlineDynamicImports: true,
      sourcemap: false,
      exports: 'named',
      globals: {
        pako: 'pako'
      }
    }
  ],
  external: [],
  watch: {},
  plugins: [
    babel({
      exclude: 'node_modules',
      babelHelpers: 'runtime',
      presets: [
        [
          '@babel/preset-env',
          {
            useBuiltIns: 'usage',
            corejs: {
              version: 3,
              proposals: true
            }
          }
        ]
      ],
      plugins: [
        [
          '@babel/plugin-transform-runtime',
          {
            useESModules: true,
            corejs: 3 // 指定 runtime-corejs 的版本，目前有 2 3 两个版本
          }
        ]
      ]
    }),
    json(),
    // terser({
    //   compress: {
    //     // remove console.log
    //     pure_funcs: ['console.log'],
    //   },
    //   output: {
    //     // add comment on the top
    //   },
    // }),
    typescript({ useTsconfigDeclarationDir: true })
  ]
};
