module.exports = {
  root: true, // 作用的目录是根目录
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  overrides: [
    {
      // https://stackoverflow.com/questions/58510287/parseroptions-project-has-been-set-for-typescript-eslint-parser
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.eslint.json'],
        sourceType: 'module',
      },
    },
  ],
  rules: {
    'prettier/prettier': [
      'error',
      {
        trailingComma: 'all',
        singleQuote: true,
        usePrettierrc: false,
      },
    ],
    'linebreak-style': [0, 'error', 'windows'],
    'no-new': 0,
    'no-debugger': 2,
    'no-console': ['error', { allow: ['warn'] }],
    'spaced-comment': 0,
    'vue/attribute-hyphenation': 0,
    'vue/html-self-closing': 0,
    'no-param-reassign': 0,
    'prefer-destructuring': 0,
    semi: 0,
    'import/extensions': 0,
    'no-plusplus': 0,
    radix: 0,
    'arrow-body-style': 0,
    'class-methods-use-this': 0,
    'func-names': 0,
    'import/no-unresolved': 0,
    'no-unused-expressions': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/no-explicit-any': 0,
    '@typescript-eslint/ban-ts-comment': 0,
    '@typescript-eslint/ban-types': 0,
  },
  env: {
    browser: true,
    es6: true,
  },
  globals: {
    document: true,
    localStorage: true,
    window: true,
    jQuery: true,
    $: true,
    workbox: true,
    importScripts: true,
  },
};
