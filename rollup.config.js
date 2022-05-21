import { babel } from '@rollup/plugin-babel';

const config = {
  input: 'src/fake-carousel.js',
  output: {
    dir: 'dist',
    format: 'esm'
  },
  plugins: [babel({ babelHelpers: 'bundled' })]
};

export default config;