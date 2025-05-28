/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-29 16:07:26
 * @Description: 现场预览-云台视图
 */
import LivePtzCruisePanel from './LivePtzCruisePanel.vue'
import LivePtzGroupPanel from './LivePtzGroupPanel.vue'
import LivePtzPresetPanel from './LivePtzPresetPanel.vue'
import LivePtzTracePanel from './LivePtzTracePanel.vue'
import ChannelPtzCtrlPanel from '../channel/ChannelPtzCtrlPanel.vue'

export default defineComponent({
    components: {
        LivePtzCruisePanel,
        LivePtzGroupPanel,
        LivePtzPresetPanel,
        LivePtzTracePanel,
        ChannelPtzCtrlPanel,
    },
    props: {
        /**
         * @property 当前窗口数据
         */
        winData: {
            type: Object as PropType<LiveSharedWinData>,
            required: true,
        },
        /**
         * @property 通道能力映射
         */
        chl: {
            type: Object as PropType<Record<string, LiveChannelList>>,
            required: true,
        },
    },
    emits: {
        trigger() {
            return true
        },
    },
    setup(prop) {
        const { Translate } = useLangStore()
        const userSession = useUserSessionStore()
        const systemCaps = useCababilityStore()

        const pageData = ref({
            // 菜单选项
            menu: [
                {
                    label: Translate('IDCS_PRESET'),
                    value: 'preset',
                },
                {
                    label: Translate('IDCS_CRUISE'),
                    value: 'cruise',
                },
                {
                    label: Translate('IDCS_PTZ_GROUP'),
                    value: 'ptz_group',
                },
                {
                    label: Translate('IDCS_PTZ_TRACE'),
                    value: 'ptz_trace',
                },
            ],
            // 当前选中的菜单
            activeMenu: 0,
            // 当前速度值
            speed: 4,
        })

        // 通道ID
        const chlId = computed(() => {
            return prop.winData.chlID
        })

        // 是否有权限
        const hasAuth = computed(() => {
            return userSession.hasAuth('remoteChlMgr')
        })

        // 是否有巡航线组和轨迹的权限
        const hasTraceAuth = computed(() => {
            return systemCaps.supportPtzGroupAndTrace && prop.chl[prop.winData.chlID]?.supportPTZGroupTraceTask
        })

        /**
         * @description 修改速度
         * @param {Number} speed
         */
        const setSpeed = (speed: number) => {
            pageData.value.speed = speed
        }

        // 最大菜单数量
        const maxMenu = computed(() => {
            return hasTraceAuth.value ? pageData.value.menu.length : pageData.value.menu.length - 2
        })

        /**
         * @description 改变菜单
         * @param {number} index
         */
        const changeMenu = (index: number) => {
            const max = hasTraceAuth.value ? pageData.value.menu.length : pageData.value.menu.length - 2
            if (index >= 0 && index <= max - 1) {
                pageData.value.activeMenu = index
            }
        }

        // 通道切换时，如果该通道没有巡航线组和轨迹权限，即返回预置点
        watch(chlId, () => {
            if (pageData.value.activeMenu > maxMenu.value - 1) {
                pageData.value.activeMenu = 0
            }
        })

        return {
            pageData,
            chlId,
            hasAuth,
            changeMenu,
            setSpeed,
        }
    },
})
