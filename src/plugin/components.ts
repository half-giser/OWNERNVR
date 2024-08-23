/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-11 19:59:06
 * @Description: 配置全局组件
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-22 19:50:08
 */

import BaseImgSprite from '@/views/UI_PUBLIC/components/sprite/BaseImgSprite.vue'
import BaseVideoPlayer from '@/views/UI_PUBLIC/components/player/BaseVideoPlayer.vue'
import BasePluginPlayer from '@/views/UI_PUBLIC/components/ocx/BasePluginPlayer.vue'
import type { App } from 'vue'

export default {
    install: (app: App<Element>) => {
        app.component('BaseImgSprite', BaseImgSprite)
        app.component('BaseVideoPlayer', BaseVideoPlayer)
        app.component('BasePluginPlayer', BasePluginPlayer)
    },
}
