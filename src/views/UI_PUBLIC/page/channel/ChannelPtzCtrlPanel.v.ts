/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-20 18:24:56
 * @Description: 云台-控制台
 */
export default defineComponent({
    props: {
        /**
         * @property {string} 通道ID
         */
        chlId: {
            type: String,
            required: true,
        },
    },
    emits: {
        speed(speedValue: number) {
            return typeof speedValue === 'number'
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()

        type CmdItem = {
            file: string
            type: string
            actionType: string
        }

        const pageData = ref({
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

        const cmdQueue: CmdItem[] = []
        let cmdLock = false // 锁定标识：当前命令没有返回时，不能发送新的命令

        /**
         * @description 新增命令到命令队列
         * @param {CmdItem} cmd
         */
        const addCmd = (cmd: CmdItem) => {
            if (!prop.chlId) {
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
            if (!prop.chlId) {
                return
            }

            if (!cmdQueue.length || cmdLock) {
                return
            }
            cmdLock = true
            const cmdItem = cmdQueue.shift()!
            const sendXml = rawXml`
                <content>
                    <chlId>${prop.chlId}</chlId>
                    <actionType>${cmdItem.actionType}</actionType>
                    <speed>${pageData.value.speed}</speed>
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

        onMounted(() => {
            ctx.emit('speed', pageData.value.speed)
        })

        watch(
            () => pageData.value.speed,
            () => {
                ctx.emit('speed', pageData.value.speed)
            },
        )

        return {
            pageData,
            addCmd,
            stopCmd,
            decreaseSpeed,
            increaseSpeed,
        }
    },
})
