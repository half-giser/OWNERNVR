<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-24 17:12:55
 * @Description: 
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-11-05 15:46:25
-->
<template>
    <div>
        <el-config-provider :locale="langStore.elLocale">
            <router-view />
        </el-config-provider>
        <transition name="intitial-view">
            <div
                v-show="!layoutStore.isInitial"
                id="InitialView"
            ></div>
        </transition>
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
const dateTime = useDateTimeStore()

const Plugin = usePlugin()
provide('Plugin', Plugin)

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
        } else {
            if (!auInfo) {
                router.replace('/login')
                return
            } else {
                generateAsyncRoutes()
                await dateTime.getTimeConfig(false)
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
}

if (session.appType === 'STANDARD') {
    queryActivationStatus().then((result) => {
        const checkActivationStatus = queryXml(result)('//content/activated').text().toBoolean()
        hanedleActivationStatus(checkActivationStatus)
    })
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
</script>

<style lang="scss">
body {
    width: 100%;
}

#InitialView {
    background: #fff var(--img-initview) center no-repeat;
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

.page-view {
    &-enter-from {
        opacity: 0;
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
    }

    &-leave-to {
        opacity: 0;
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
        z-index: 1;
    }

    &-enter-active {
        width: 100vw;
        transition: opacity 0.3s linear;
    }

    &-leave-active {
        width: 100vw;
        transition: opacity 0.3s linear;
    }
}
</style>
