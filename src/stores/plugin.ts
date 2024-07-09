/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-11 16:57:24
 * @Description: 插件全局存储
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-06-20 16:46:52
 */

export const usePluginStore = defineStore('plugin', () => {
    const currPluginMode = ref<null | 'h5' | 'ocx'>(null)
    const ocxPort = ref(0)
    const p2pSessionId = ref<string | null>(null)
    const authCodeIndex = ref('')
    const sn = ref('')
    const pluginPort = ref(0)
    const showPluginNoResponse = ref(false)
    const manuaClosePlugin = ref(false)
    const ready = ref(false)
    const isReconn = ref(false) // 登录是否为重连

    return {
        currPluginMode,
        ocxPort,
        p2pSessionId,
        authCodeIndex,
        pluginPort,
        showPluginNoResponse,
        manuaClosePlugin,
        sn,
        ready,
        isReconn,
    }
})
