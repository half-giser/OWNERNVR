/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-11 19:59:06
 * @Description: 配置全局组件
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-12 11:32:09
 */

import BaseImgSprite from '@/views/UI_PUBLIC/components/sprite/BaseImgSprite.vue'
import BaseVideoPlayer from '@/views/UI_PUBLIC/components/player/BaseVideoPlayer.vue'
import BasePluginPlayer from '@/views/UI_PUBLIC/components/ocx/BasePluginPlayer.vue'
import BaseIpInput from '@/views/UI_PUBLIC/components/form/BaseIpInput.vue'
import BaseMacInput from '@/views/UI_PUBLIC/components/form/BaseMacInput.vue'
import BasePasswordStrength from '@/views/UI_PUBLIC/components/form/BasePasswordStrength.vue'
import BaseSensitiveEmailInput from '@/views/UI_PUBLIC/components/form/BaseSensitiveEmailInput.vue'
import BaseSensitiveTextInput from '@/views/UI_PUBLIC/components/form/BaseSensitiveTextInput.vue'
import type { App } from 'vue'

export default {
    install: (app: App<Element>) => {
        app.component('BaseImgSprite', BaseImgSprite)
        app.component('BaseVideoPlayer', BaseVideoPlayer)
        app.component('BasePluginPlayer', BasePluginPlayer)
        app.component('BaseIpInput', BaseIpInput)
        app.component('BaseMacInput', BaseMacInput)
        app.component('BasePasswordStrength', BasePasswordStrength)
        app.component('BaseSensitiveEmailInput', BaseSensitiveEmailInput)
        app.component('BaseSensitiveTextInput', BaseSensitiveTextInput)
    },
}
