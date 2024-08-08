/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-29 16:07:26
 * @Description: 现场预览-云台视图
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-08 14:32:14
 */
import { type LiveSharedWinData } from '@/types/apiType/live'
import LivePtzCruise from './LivePtzCruise.vue'
import LivePtzGroup from './LivePtzGroup.vue'
import LivePtzPreset from './LivePtzPreset.vue'
import LivePtzTrace from './LivePtzTrace.vue'

export default defineComponent({
    components: {
        LivePtzCruise,
        LivePtzGroup,
        LivePtzPreset,
        LivePtzTrace,
    },
    props: {
        /**
         * @property 当前窗口数据
         */
        winData: {
            type: Object as PropType<LiveSharedWinData>,
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
                    file: 'Stop (2)',
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

        const cmdQueue: CmdItem[] = []
        let cmdLock = false // 锁定标识：当前命令没有返回时，不能发送新的命令

        /**
         * @description 新增命令到命令队列
         * @param {CmdItem} cmd
         */
        const addCmd = (cmd: CmdItem) => {
            if (!chlId.value) {
                return
            }
            if (cmdQueue.length > 1000) {
                return
            }
            cmdQueue.push(cmd)
            if (cmdQueue.length && !cmdLock) {
                executeCmd()
            }
        }

        /**
         * @description 新增停止命令到命令队列
         */
        const stopCmd = () => {
            return addCmd({
                file: 'Stop (2)',
                actionType: 'StopAction',
                type: 'stop',
            })
        }

        /**
         * @description 执行命令
         */
        const executeCmd = () => {
            if (!chlId.value) {
                return
            }
            if (!cmdQueue.length || cmdLock) {
                return
            }
            cmdLock = true
            const cmdItem = cmdQueue.shift()!
            const sendXml = rawXml`
                <content>
                    <chlId>${chlId.value}</chlId>
                    <actionType>${cmdItem.actionType}</actionType>
                    <speed>${pageData.value.speed.toString()}</speed>
                    <type>${cmdItem.type}</type>
                </content>
            `
            ptzMoveCall(sendXml).finally(() => {
                cmdLock = false
                executeCmd()
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
            if (index >= 0 && index <= pageData.value.menu.length - 1) {
                pageData.value.activeMenu = index
            }
        }

        return {
            pageData,
            chlId,
            hasAuth,
            addCmd,
            stopCmd,
            decreaseSpeed,
            increaseSpeed,
            changeMenu,
            LivePtzCruise,
            LivePtzGroup,
            LivePtzPreset,
            LivePtzTrace,
        }
    },
})
