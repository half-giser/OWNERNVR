/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-07 09:15:58
 * @Description: 用户通道权限
 */
export class UserChlAuth {
    // 是否拥有全部权限
    hasAll = false
    // 通道能力和权限的映射，每种能力下的数据格式：key-通道ID, value-布尔值
    accessControl = false
    // 云台
    ptz: Record<string, boolean> = {}
    // 音频
    audio: Record<string, boolean> = {}
    // 搜索和回放
    spr: Record<string, boolean> = {}
    // 预览
    lp: Record<string, boolean> = {}

    bk: Record<string, boolean> = {}

    update: () => Promise<void> = () => Promise.resolve()
}

export const useUserChlAuth = (immediate = true) => {
    const auth = ref(new UserChlAuth())
    const userSession = useUserSessionStore()

    /**
     * @description 获取权限列表
     */
    const getAuth = async () => {
        if (!userSession.authEffective) {
            auth.value.hasAll = true
        }

        if (!userSession.authGroupId) {
            auth.value.hasAll = true
            return
        }

        const sendXml = rawXml`
            <authGroupId>${userSession.authGroupId}</authGroupId>
            <requireField>
                <chlAuth/>
                <systemAuth/>
            </requireField>
        `
        const result = await queryMyAuth(sendXml)
        const $ = queryXml(result)

        $('content/chlAuth/item').forEach((item) => {
            const $item = queryXml(item.element)
            const id = item.attr('id')
            const text = $item('auth').text()
            auth.value.ptz[id] = text.includes('@ptz')
            auth.value.audio[id] = text.includes('@ad')
            auth.value.spr[id] = text.includes('@spr')
            auth.value.bk[id] = text.includes('@bk')
            auth.value.lp[id] = text.includes('@lp')
        })
        auth.value.accessControl = $('content/systemAuth/AccessControlMgr').text().bool()
    }

    auth.value.update = getAuth

    onMounted(() => {
        if (immediate) {
            getAuth()
        }
    })

    return auth
}
