// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    rules: {
      '@stylistic/quotes': 'off',
      '@stylistic/comma-dangle': 'off',
      '@stylistic/semi': 'off',
      '@stylistic/object-curly-spacing': 'off',
      '@stylistic/operator-linebreak': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'vue/singleline-html-element-content-newline': 'off',
    },
  },
)
