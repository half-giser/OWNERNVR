/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-04-16 13:47:54
 * @Description:
 */
// @ts-check
import { defineFlatConfig, prettier, unocss, vue, typescript } from '@bassist/eslint'

// https://github.com/chengpeiquan/bassist/tree/main/packages/eslint
export default defineFlatConfig([
    ...vue,
    ...typescript,
    // ...unocss
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
                    allowBinding: false,
                },
            ],
            'arrow-body-style': 'off',
            'prefer-arrow-callback': 'off',
            'vue/no-unused-refs': 'off',
            '@typescript-eslint/unified-signatures': 'off',
        },
        ignores: ['dist'],
    },
    ...prettier,
])
