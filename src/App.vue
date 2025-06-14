<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-24 17:12:55
 * @Description: 
-->
<template>
    <div>
        <el-config-provider :locale="langStore.elLocale">
            <router-view />
        </el-config-provider>
        <transition name="intitial-view">
            <div
                v-show="!layoutStore.isInitial && !plugin.pluginNoticeContainer"
                id="InitialView"
            ></div>
        </transition>
        <BaseNotification
            :model-value="layoutStore.notifications"
            @update:model-value="layoutStore.notifications = $event"
        />
        <BasePluginNotice />
    </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { generateAsyncRoutes } from './router'

const route = useRoute()
const router = useRouter()
const layoutStore = useLayoutStore()
const langStore = useLangStore()
const session = useUserSessionStore()
const plugin = usePlugin()
const systemCaps = useCababilityStore()
const popperObserver = usePopperObserver()

popperObserver.create()

/**
 * @description 如果未激活，跳转开机向导，否则，根据登录状态，跳转登录或现场预览
 * @param {boolean} checkActivationStatus
 */
const hanedleActivationStatus = async (checkActivationStatus: boolean) => {
    try {
        layoutStore.isInitial = true
        const auInfo = session.auInfo_N9K
        if (!checkActivationStatus) {
            router.replace('/guide')
            session.urlLoginAuth = ''
        } else {
            if (!auInfo) {
                if (session.urlLoginAuth) {
                    router.replace('/urllogin')
                } else {
                    router.replace('/login')
                }
                return
            } else {
                await systemCaps.updateCabability()
                await systemCaps.updateDiskMode()
                await systemCaps.updateBaseConfig()
                await systemCaps.updateHotStandbyMode()
                generateAsyncRoutes()
                if (route.name === 'login') {
                    router.replace('/live')
                } else {
                    router.replace(route.fullPath)
                }
            }
        }
    } catch (e) {
        console.error(e)
    }

    // layoutStore.isInitial = true
    // generateAsyncRoutes()
    // router.replace('/live')
}

if (session.appType === 'STANDARD') {
    if (getLoginInfoByURL()) {
        // DO nothing
    } else {
        // 标准登录此处请求语言翻译和时间日期配置，P2P登录则延后至插件连接成功后请求
        langStore
            .getLangTypes()
            .then(() => langStore.getLangItems(true))
            .then(() => queryActivationStatus())
            .then((result) => {
                const checkActivationStatus = queryXml(result)('content/activated').text().bool()
                hanedleActivationStatus(checkActivationStatus)
            })
    }
} else {
    session.getP2PSessionInfo()
}

watch(
    () => session.calendarType,
    (val) => {
        if (val === 'Persian') {
            dayjs.calendar('jalali')
            dayjs.locale('fa')
        } else {
            dayjs.calendar('gregory')
            dayjs.locale('en')
        }
    },
    {
        immediate: true,
    },
)

if (import.meta.env.PROD) {
    onBeforeUnmount(() => {
        plugin.DisposePlugin()
    })
}
</script>

<style lang="scss">
body {
    width: 100%;
}

#InitialView {
    background: var(--color-white) var(--img-initview) center no-repeat;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 10000;
}

.intitial-view-leave-active {
    opacity: 0;
    transition: opacity 0.5s ease 0.5s;
}
</style>
