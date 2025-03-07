/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-29 16:07:26
 * @Description: 现场预览-云台视图
 */
import LivePtzCruisePanel from './LivePtzCruisePanel.vue'
import LivePtzGroupPanel from './LivePtzGroupPanel.vue'
import LivePtzPresetPanel from './LivePtzPresetPanel.vue'
import LivePtzTracePanel from './LivePtzTracePanel.vue'

export default defineComponent({
    components: {
        LivePtzCruisePanel,
        LivePtzGroupPanel,
        LivePtzPresetPanel,
        LivePtzTracePanel,
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
    setup(prop) {
        type CmdItem = {
            file: string
            type: string
            actionType: string
        }

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
            // 驾驶舱菜单列表
            steer: [
                {
                    file: 'LU',
                    actionType: 'LeftUp',
                    type: 'direction',
                },
                {
                    file: 'U',
                    actionType: 'Up',
                    type: 'direction',
                },
                {
                    file: 'RU',
                    actionType: 'RightUp',
                    type: 'direction',
                },
                {
                    file: 'L',
                    actionType: 'Left',
                    type: 'direction',
                },
                {
                    file: 'stop_ptz',
                    actionType: 'StopAction',
                    type: 'activeStop',
                },
                {
                    file: 'R',
                    actionType: 'Right',
                    type: 'direction',
                },
                {
                    file: 'LD',
                    actionType: 'LeftDown',
                    type: 'direction',
                },
                {
                    file: 'D',
                    actionType: 'Down',
                    type: 'direction',
                },
                {
                    file: 'RD',
                    actionType: 'RightDown',
                    type: 'direction',
                },
            ] as CmdItem[],
            // 控制菜单列表
            controls: [
                {
                    name: Translate('IDCS_ZOOM'),
                    control: [
                        {
                            file: 'ZoomOut',
                            actionType: 'ZoomOut',
                            type: 'control',
                        },
                        {
                            file: 'ZoomIn',
                            actionType: 'ZoomIn',
                            type: 'control',
                        },
                    ],
                },
                {
                    name: Translate('IDCS_FOCUS'),
                    control: [
                        {
                            file: 'FocusIn',
                            actionType: 'Far',
                            type: 'control',
                        },
                        {
                            file: 'FocusOut',
                            actionType: 'Near',
                            type: 'control',
                        },
                    ],
                },
                {
                    name: Translate('IDCS_IRIS'),
                    control: [
                        {
                            file: 'IrisIn',
                            actionType: 'IrisOpen',
                            type: 'control',
                        },
                        {
                            file: 'IrisOut',
                            actionType: 'IrisClose',
                            type: 'control',
                        },
                    ],
                },
            ] as { name: string; control: [CmdItem, CmdItem] }[],
            // 当前速度值
            speed: 4,
            // 最小速度
            minSpeed: 1,
            // 最大速度
            maxSpeed: 8,
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
            return systemCaps.supportPtzGroupAndTrace && prop.chl[prop.winData.chlID]?.supportPtz && prop.chl[prop.winData.chlID]?.supportPTZGroupTraceTask
        })

        // 最大菜单数量
        const maxMenu = computed(() => {
            return hasTraceAuth.value ? pageData.value.menu.length : pageData.value.menu.length - 2
        })

        const cmdQueue = useCmdQueue()

        /**
         * @description 新增命令到命令队列
         * @param {CmdItem} cmd
         */
        const addCmd = (cmd: CmdItem) => {
            if (!chlId.value) {
                return
            }

            cmdQueue.add(async () => {
                const sendXml = rawXml`
                    <content>
                        <chlId>${chlId.value}</chlId>
                        <actionType>${cmd.actionType}</actionType>
                        <speed>${pageData.value.speed}</speed>
                        <type>${cmd.type}</type>
                    </content>
                `
                await ptzMoveCall(sendXml)
            })
        }

        /**
         * @description 新增停止命令到命令队列
         */
        const stopCmd = () => {
            return addCmd({
                file: 'stop_ptz',
                actionType: 'StopAction',
                type: 'stop',
            })
        }

        /**
         * @description 降低速度
         */
        const decreaseSpeed = () => {
            if (pageData.value.speed > pageData.value.minSpeed) {
                pageData.value.speed--
            }
        }

        /**
         * @description 提高速度
         */
        const increaseSpeed = () => {
            if (pageData.value.speed < pageData.value.maxSpeed) {
                pageData.value.speed++
            }
        }

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
            addCmd,
            stopCmd,
            decreaseSpeed,
            increaseSpeed,
            changeMenu,
        }
    },
})
