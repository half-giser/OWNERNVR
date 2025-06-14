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
        /**
         * @property {boolean} 禁用
         */
        disabled: {
            type: Boolean,
            default: false,
        },
        enableCtrl: {
            type: Boolean,
            default: true,
        },
        enableIris: {
            type: Boolean,
            default: true,
        },
        enableZoom: {
            type: Boolean,
            default: true,
        },
        enableFocus: {
            type: Boolean,
            default: true,
        },
        enableSpeed: {
            type: Boolean,
            default: false,
        },
        minSpeed: {
            type: Number,
            default: 1,
        },
        maxSpeed: {
            type: Number,
            default: 8,
        },
        layout: {
            type: String as PropType<'horizontal' | 'vertical' | 'event'>,
            default: 'horizontal',
        },
    },
    emits: {
        speed(speedValue: number) {
            return typeof speedValue === 'number'
        },
        trigger() {
            return true
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
                    validate() {
                        return !prop.disabled && !!prop.chlId && prop.enableZoom
                    },
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
                    validate() {
                        return !prop.disabled && !!prop.chlId && prop.enableFocus
                    },
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
                    validate() {
                        return !prop.disabled && !!prop.chlId && prop.enableIris
                    },
                },
            ] as { name: string; control: [CmdItem, CmdItem]; validate: () => boolean }[],
            // 当前速度值
            speed: 4,
            // 最小速度
            // minSpeed: 1,
            // 最大速度
            // maxSpeed: 8,
        })

        const cmdQueue = useCmdQueue()

        /**
         * @description 新增命令到命令队列
         * @param {CmdItem} cmd
         */
        const addCmd = (cmd: CmdItem) => {
            ctx.emit('trigger')

            if (!prop.chlId || prop.disabled) {
                return
            }

            cmdQueue.add(async () => {
                const sendXml = rawXml`
                    <content>
                        <chlId>${prop.chlId}</chlId>
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
            if (pageData.value.speed > prop.minSpeed) {
                pageData.value.speed--
            }
        }

        /**
         * @description 提高速度
         */
        const increaseSpeed = () => {
            if (pageData.value.speed < prop.maxSpeed) {
                pageData.value.speed++
            }
        }

        onMounted(() => {
            ctx.emit('speed', pageData.value.speed)
        })

        watch(
            () => pageData.value.speed,
            () => {
                ctx.emit('trigger')
                ctx.emit('speed', pageData.value.speed)
            },
        )

        watch(
            () => prop.maxSpeed,
            () => {
                pageData.value.speed = prop.maxSpeed / 2
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
