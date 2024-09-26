<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-04 10:17:30
 * @Description: 不支持WebSocket或未安装插件时的占位弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-25 16:43:10
-->
<template>
    <teleport
        :to="container || 'body'"
        :disabled="!container"
    >
        <div
            v-show="pluginStore.showPluginNoResponse"
            class="PluginNotice"
            :class="{
                warning: notice.warning,
                fixed: container === 'body',
            }"
        >
            <div v-clean-html="notice.html"></div>
            <BaseImgSprite
                file="plugin_error"
                class="PluginNotice-icon"
            />
        </div>
    </teleport>
</template>

<script lang="ts" setup>
const lang = useLangStore()
const pluginStore = usePluginStore()
const Plugin = inject('Plugin') as PluginType

/**
 * @description 获取语言配置
 * @param {String} langKey
 */
const getPluginLoadLang = (langKey: keyof typeof OCX_Plugin_Notice_Map) => {
    const langId = lang.langId // $.webSession('lang_id')
    if (langId in OCX_Plugin_Notice_Map && langKey in OCX_Plugin_Load_Lang[langId]) {
        let langValue = OCX_Plugin_Load_Lang[langId][langKey]
        if (!langValue) langValue = OCX_Plugin_Load_Lang['0x0409'][langKey]
        return langValue
    } else return OCX_Plugin_Load_Lang['0x0409'][langKey]
}

/**
 * @description 获取语言配置
 * @param {String} langKey
 */
const getHTML = (langKey: keyof typeof OCX_Plugin_Notice_Map, downloadUrl?: string) => {
    const item = OCX_Plugin_Notice_Map[langKey]
    return {
        warning: item.warning,
        html: item.downloadUrl ? getPluginLoadLang(langKey).formatForLang(downloadUrl) : getPluginLoadLang(langKey),
    }
}

const notice = computed(() => {
    if (Plugin.pluginNoticeHtml.value) {
        return getHTML(Plugin.pluginNoticeHtml.value, Plugin.pluginDownloadUrl.value)
    } else {
        return {
            warning: false,
            html: '',
        }
    }
})

const container = computed(() => {
    return Plugin.pluginNoticeContainer.value
})
</script>

<style lang="scss" scoped>
.PluginNotice {
    background-color: #fff;
    position: absolute;
    top: 0;
    left: 0;
    color: #000000;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 10px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    padding: 30px;

    a {
        color: #327eee;

        &:hover {
            color: var(--primary--04);
        }
    }

    &.warning {
        font-size: 20px;
        color: var(--error-01);
    }

    &.fixed {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: 9999;
        overflow: hidden;
    }

    &-icon {
        margin-top: 30px;
    }
}
</style>
