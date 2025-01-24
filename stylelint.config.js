/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-11-11 09:11:30
 * @Description:
 */
/** @type {import('stylelint').Config} */
export default {
    overrides: [
        {
            files: ['*.vue', '**/*.vue'],
            customSyntax: 'postcss-html',
        },
    ],
    extends: ['stylelint-config-standard-scss', 'stylelint-config-recommended-vue/scss', 'stylelint-prettier/recommended'],
    rules: {
        'custom-property-empty-line-before': null,
        'no-empty-source': null,
        'selector-class-pattern': '^[a-zA-Z][-_a-zA-Z0-9]*$',
        'selector-id-pattern': '^[a-zA-Z][a-zA-Z0-9]*$',
        'custom-property-pattern': '^[a-z][-a-zA-Z0-9]*$',
        'scss/dollar-variable-pattern': '^[a-z][-a-zA-Z0-9]*$',
        'scss/double-slash-comment-empty-line-before': null,
        'no-descending-specificity': null,
        'declaration-block-no-redundant-longhand-properties': [
            true,
            {
                ignoreShorthands: ['grid-template'],
            },
        ],
    },
}
