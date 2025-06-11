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
const pluginStore = usePluginStore()
const plugin = usePlugin()
const router = useRouter()
const ocxLang = useOCXLang()

const OCX_Plugin_Notice_Map: Record<string, { warning: boolean; downloadUrl: boolean }> = {
    IDCS_PLUGIN_VERSION_UPDATE: {
        warning: false,
        downloadUrl: true,
    },
    IDCS_NO_PLUGIN_FOR_WINDOWS: {
        warning: false,
        downloadUrl: true,
    },
    IDCS_NO_PLUGIN_FOR_MAC: {
        warning: false,
        downloadUrl: true,
    },
    IDCS_NPAPI_NOT_SUPPORT: {
        warning: true,
        downloadUrl: false,
    },
    IDCS_IE_VERSION_WARNING: {
        warning: true,
        downloadUrl: true,
    },
    IDCS_CHROME_VERSION_WARNING: {
        warning: true,
        downloadUrl: false,
    },
    IDCS_FIREFOX_VERSION_WARNING: {
        warning: true,
        downloadUrl: false,
    },
    IDCS_OPERA_VERSION_WARNING: {
        warning: true,
        downloadUrl: false,
    },
    IDCS_SAFARI_VERSION_WARNING: {
        warning: true,
        downloadUrl: false,
    },
    IDCS_EDGE_VERSION_WARNING: {
        warning: true,
        downloadUrl: false,
    },
    IDCS_OTHER_VERSION_WARNING: {
        warning: true,
        downloadUrl: false,
    },
    IDCS_SAFARI_VERSION_FOR_P2P: {
        warning: true,
        downloadUrl: false,
    },
}

/**
 * @description 获取语言配置
 * @param {String} langKey
 */
const getHTML = (langKey: string, downloadUrl?: string) => {
    const item = OCX_Plugin_Notice_Map[langKey]
    const downloadName = downloadUrl ? downloadUrl.split('/').at(-1)! : ''
    return {
        warning: item.warning,
        html: item.downloadUrl ? ocxLang.Translate(langKey).formatForLang(downloadUrl!).replace('<a href=', `<a download="${downloadName}" href=`) : ocxLang.Translate(langKey),
    }
}

const notice = computed(() => {
    if (plugin.pluginNoticeHtml.value) {
        let path = getPluginPath()
        if (import.meta.env.DEV) {
            path = '/plugin/' + path
        }
        return getHTML(plugin.pluginNoticeHtml.value, path)
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
    z-index: 99;
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
