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
    typescript({ useTsconfigDeclarationDir: false }),
    // alias({
    //   entries: [
    //     {
    //       find: 'js-monitor-sdk',
    //       replacement: path.resolve(__dirname, './packages/types'),
    //     },
    //   ],
    // }),
  ]
};
