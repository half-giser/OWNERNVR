<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-07 10:40:47
 * @Description: 插件下载按钮
-->
<template>
    <div
        v-show="!isPluginIconHide"
        class="download"
    >
        <span class="download-text">{{ Translate('IDCS_BS_PLUGIN_DOWNLOAD') }}</span>
        <a
            :href="pluginLink"
            :download="pluginName"
        >
            <BaseImgSprite
                file="plugin"
                :index="0"
                :hover-index="1"
                :chunk="2"
            />
        </a>
    </div>
</template>

<script lang="ts" setup>
import { getPluginPath } from '@/utils/ocx/ocxUtil'

const osType = getSystemInfo().platform
const path = getPluginPath()
const userSession = useUserSessionStore()

// UI1-E定制版本的插件与中性版本的插件不同
const pluginLink = ref(path.ClientPluDownLoadPath)
if (import.meta.env.DEV) {
    pluginLink.value = '/plugin' + path.ClientPluDownLoadPath
}
const split = pluginLink.value.split('/')
const pluginName = ref(split[split.length - 1])

// MAC系统本地访问进入登录页面时，不显示插件下载链接
const isPluginIconHide = ref(userSession.appType === 'STANDARD' && osType === 'mac') // ref(osType === 'mac')
</script>

<style lang="scss" scoped>
.download {
    position: absolute;
    left: 0;
    width: 100%;
    bottom: 20px;
    font-size: 18px;
    text-align: center;
    color: var(--login-plugin-text);
    display: flex;
    justify-content: center;
    align-items: center;
    height: 30px;

    &-text {
        line-height: 1;
    }

    a {
        margin-top: -4px;
        margin-left: 5px;
    }
}
</style>
