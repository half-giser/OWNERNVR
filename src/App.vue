<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-05-24 17:12:55
 * @Description: 
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-05 09:20:01
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
import { isMobile, watchResize } from '@bassist/utils'
import { getXmlWrapData } from './api/api'
import { queryActivationStatus, querySystemCaps } from './api/system'
import { queryXml } from './utils/xmlParse'
import { APP_TYPE } from './utils/constants'
import { useUserSessionStore } from './stores/userSession'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const layoutStore = useLayoutStore()
const langStore = useLangStore()
const session = useUserSessionStore()

const Plugin = usePlugin()
provide('Plugin', Plugin)

watchResize(() => {
    document.body.className = `platform-${isMobile() ? 'mobile' : 'desktop'}`
})

const hanedleActivationStatus = async (checkActivationStatus: boolean, isUserAuth: boolean) => {
    try {
        layoutStore.isInitial = true
        const auInfo = session.auInfo_N9K
        if (!checkActivationStatus) {
            router.replace('/guide')
        } else {
            if (!auInfo) {
                router.replace('/login')
                return
            } else if (isUserAuth) {
                if (route.name === 'login') {
                    router.replace('/live')
                }
            }
        }
    } catch (e) {
        console.error(e)
    }
}

if (APP_TYPE === 'STANDARD') {
    let isUserAuth = false

    querySystemCaps(getXmlWrapData(''))
        .then(() => {
            isUserAuth = true
        })
        .finally(() => {
            queryActivationStatus().then((result) => {
                const checkActivationStatus = queryXml(result)('//content/activated').text().toBoolean()
                hanedleActivationStatus(checkActivationStatus, isUserAuth)
            })
        })
}

onMounted(() => {
    Plugin.DisposePlugin()
    Plugin.StartV2Process()
})

onBeforeUnmount(() => {
    Plugin.DisposePlugin()
})

watch(
    () => session.sessionId,
    (val) => {
        if (val === '') {
            Plugin.DisposePlugin()
        }
    },
)

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
    background: #fff center url(/initview.gif) no-repeat;
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
