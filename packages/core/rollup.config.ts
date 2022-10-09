import { terser } from 'rollup-plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';

export default {
  input: 'index.ts',
  output: [
    {
      file: pkg.main,
      name: '121',
      format: 'umd',
      sourcemap: true,
      exports: 'named'
    },
    {
      file: pkg.module,
      format: 'es',
      sourcemap: true,
      exports: 'named',
      globals: {
        pako: 'pako'
      }
    }
  ],
  plugins: [
    terser({
      compress: {
        // remove console.log
        pure_funcs: ['console.log']
      }
    }),
    typescript({ useTsconfigDeclarationDir: true }),
  ]
};
