/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-16 13:47:54
 * @Description:
 */
import { defineFlatConfig, prettier, vue, typescript } from '@bassist/eslint'

// https://github.com/chengpeiquan/bassist/tree/main/packages/eslint
// 使用 defineFlatConfig 方法，拓展/重写 第三方库 @bassist/eslint 的相关配置
export default defineFlatConfig([
    ...vue,
    ...typescript,
    {
        rules: {
            'vue/html-indent': ['error', 4],
            'vue/no-v-html': 'error',
            'vue/component-tags-order': [
                'error',
                {
                    order: ['template', 'script[setup]', 'script:not([setup])', 'style'],
                },
            ],
            'vue/max-attributes-per-line': [
                'error',
                {
                    singleline: {
                        max: 1,
                    },
                    multiline: {
                        max: 1,
                    },
                },
            ],
            'vue/no-static-inline-styles': [
                'error',
                {
                    allowBinding: true,
                },
            ],
            'arrow-body-style': 'off',
            'prefer-arrow-callback': 'off',
            'vue/no-unused-refs': 'off',
            '@typescript-eslint/unified-signatures': 'off',
            'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
            'padding-line-between-statements': [
                'error',
                { blankLine: 'always', prev: 'multiline-block-like', next: 'multiline-block-like' },
                { blankLine: 'always', prev: 'export', next: 'multiline-block-like' },
                { blankLine: 'always', prev: 'multiline-block-like', next: 'export' },
                { blankLine: 'always', prev: 'class', next: 'class' },
            ],
            'dot-notation': 'error',
            eqeqeq: 'error',
        },
    },
    ...prettier,
    {
        rules: {
            'vue/html-self-closing': [
                'error',
                {
                    html: {
                        void: 'always',
                        normal: 'never',
                        component: 'always',
                    },
                    svg: 'always',
                },
            ],
            quotes: ['error', 'single', { avoidEscape: true }],
            'prettier/prettier': [
                'off',
                {
                    endOfLine: 'lf',
                },
            ],
        },
    },
    {
        ignores: ['dist/*', 'public/*', 'src/components/sprite/sprites.ts'],
    },
])
