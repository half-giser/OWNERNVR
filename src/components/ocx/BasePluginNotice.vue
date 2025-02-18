<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-04 10:17:30
 * @Description: 不支持WebSocket/未安装插件时/插件需升级的占位弹窗
-->
<template>
    <teleport :to="container || 'body'">
        <div
            v-show="showNotice"
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
const plugin = usePlugin()
const router = useRouter()

/**
 * @description 获取语言配置
 * @param {String} langKey
 */
const getPluginLoadLang = (langKey: keyof typeof OCX_Plugin_Notice_Map) => {
    const langId = lang.langId
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
        html: item.downloadUrl ? getPluginLoadLang(langKey).formatForLang(downloadUrl!) : getPluginLoadLang(langKey),
    }
}

const notice = computed(() => {
    if (plugin.pluginNoticeHtml.value) {
        return getHTML(plugin.pluginNoticeHtml.value, plugin.pluginDownloadUrl.value)
    } else {
        return {
            warning: false,
            html: '',
        }
    }
})

const container = computed(() => {
    return plugin.pluginNoticeContainer.value
})

const showNotice = computed(() => {
    return pluginStore.currPluginMode === 'ocx' && container.value && (!plugin.IsInstallPlugin() || !plugin.IsPluginAvailable())
})

router.beforeResolve(() => {
    if (container.value !== '' && container.value !== 'body') {
        plugin.SetPluginNotice('')
    }
})
</script>

<style lang="scss" scoped>
.PluginNotice {
    background-color: var(--main-bg);
    position: absolute;
    top: 0;
    left: 0;
    color: var(--main-text);
    width: 100%;
    min-height: 100%;
    height: 100%;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    padding: 30px;

    a {
        color: var(--plugin-link-text);

        &:hover {
            color: var(--plugin-link-text-hover);
        }
    }

    &.warning {
        font-size: 20px;
        color: var(--color-error-01);
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
