<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-07 10:40:47
 * @Description: 插件下载按钮
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-19 13:40:05
-->
<template>
    <div
        v-show="!isPluginIconHide"
        class="download"
    >
        <span class="download-text">{{ Translate('IDCS_BS_PLUGIN_DOWNLOAD') }}</span>
        <a
            id="dlPlugin"
            :href="pluginLink"
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
import { getSystemInfo } from '@/utils/tools'
import { getPluginPath } from '@/utils/ocx/ocxUtil'
import { APP_TYPE } from '@/utils/constants'

const osType = getSystemInfo().platform
const path = getPluginPath()

// UI1-E定制版本的插件与中性版本的插件不同
const pluginLink = ref(path.ClientPluDownLoadPath)

// MAC系统本地访问进入登录页面时，不显示插件下载链接
const isPluginIconHide = ref(APP_TYPE === 'STANDARD' && osType === 'mac') // ref(osType === 'mac')
</script>

<style lang="scss" scoped>
.download {
    position: absolute;
    left: 0px;
    width: 100%;
    bottom: 20px;
    font-size: 18px;
    text-align: center;
    color: var(--text-menu-05);
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
