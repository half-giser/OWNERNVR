/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-29 16:08:14
 * @Description: 现场预览-底部菜单栏视图
 */
import LiveScreenAlarmOutPop from './LiveScreenAlarmOutPop.vue'

export default defineComponent({
    components: {
        LiveScreenAlarmOutPop,
    },
    props: {
        /**
         * @description 当前窗口数据
         */
        winData: {
            type: Object as PropType<LiveSharedWinData>,
            required: true,
        },
        /**
         * @description 播放模式
         */
        mode: {
            type: String,
            required: true,
        },
        /**
         * @property 当前分屏数
         */
        split: {
            type: Number,
            required: true,
        },
        /**
         * @property 是否开启OSD状态
         */
        osd: {
            type: Boolean,
            required: true,
        },
        /**
         * @property 本地录像按钮状态
         */
        clientRecord: {
            type: Boolean,
            required: true,
        },
        /**
         * @property 远程录像按钮状态
         */
        remoteRecord: {
            type: Boolean,
            required: true,
        },
        /**
         * @property 预览按钮状态
         */
        preview: {
            type: Boolean,
            required: true,
        },
        /**
         * @property 对讲按钮状态
         */
        talk: {
            type: Boolean,
            required: true,
        },
    },
    emits: {
        'update:split': (num: number, type: number) => {
            return typeof num === 'number' && typeof type === 'number'
        },
        'update:osd': (bool: boolean) => {
            return typeof bool === 'boolean'
        },
        'update:clientRecord': (bool: boolean) => {
            return typeof bool === 'boolean'
        },
        'update:remoteRecord': (bool: boolean) => {
            return typeof bool === 'boolean'
        },
        'update:preview': (bool: boolean) => {
            return typeof bool === 'boolean'
        },
        'update:talk': (bool: boolean) => {
            return typeof bool === 'boolean'
        },
        streamType(type: number) {
            return !isNaN(type)
        },
        fullscreen() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const userSession = useUserSessionStore()
        const systemCaps = useCababilityStore()

        const pageData = ref({
            // H5模式分屏
            wasmSeg: [1, 4].map((split) => ({
                split,
                type: 1,
            })),
            // OCX模式分屏
            ocxSeg: [1, 4, 8, 9, 10, 16, 25, 36]
                .filter((split) => systemCaps.previewMaxWin >= split)
                .map((split) => ({
                    split,
                    type: 1,
                    file: 'seg_' + split,
                })),
            // 支持旋转分屏
            ocxRotateSeg: [3, 5, 7, 10]
                .filter((split) => systemCaps.supportImageRotate && systemCaps.previewMaxWin >= split)
                .map((split) => ({
                    split,
                    type: split === 10 ? 2 : 1,
                    file: split === 10 ? 'hallway_seg_10' : 'seg_' + split,
                })),
            splitType: 1,
            // 码流类型1：主码流，2：子码流
            streamMenuOptions: [
                {
                    label: Translate('IDCS_MAIN_STREAM_ALL'),
                    value: 1,
                },
                {
                    label: Translate('IDCS_SUB_STREAM_ALL'),
                    value: 2,
                },
            ] as SelectOption<number, string>[],
        })

        // 是否显示对讲按钮
        const isTalk = computed(() => {
            return prop.mode === 'ocx' && systemCaps.supportTalk
        })

        // 远程录像权限
        const remoteRecordDisabled = computed(() => {
            return !userSession.hasAuth('rec')
        })

        /**
         * @description 远程录像
         * @param {Boolean} bool
         */
        const recordRemote = async (bool: boolean) => {
            const sendXml = rawXml`
                <content>
                    <switch>${bool}</switch>
                </content>
            `
            await editManualRecord(sendXml)

            // 设置完全部录像的时候按通道查询不一定会更新到，延迟一下
            ctx.emit('update:remoteRecord', bool)
        }

        /**
         * @description 获取远程录像状态
         */
        const getRecStatus = async () => {
            const result = await queryRecStatus()
            const $ = queryXml(result)

            let remoteRecord = !!$('content/item').length

            $('content/item').forEach((item) => {
                const $item = queryXml(item.element)
                // 查看当前通道录像类型是否有手动录像
                const recType = $item('recTypes/item').some((rec) => rec.text() === 'manual')
                if (!recType) {
                    remoteRecord = false
                }
            })

            ctx.emit('update:remoteRecord', remoteRecord)
        }

        const changeSplit = (split: number, type: number) => {
            pageData.value.splitType = type
            ctx.emit('update:split', split, type)
        }

        const changeStreamType = (value: string | number | boolean | undefined) => {
            ctx.emit('streamType', value as number)
        }

        const mainStreamDisabled = computed(() => {
            return prop.split > 4
        })

        onMounted(() => {
            getRecStatus()
        })

        return {
            pageData,
            recordRemote,
            remoteRecordDisabled,
            isTalk,
            changeStreamType,
            mainStreamDisabled,
            changeSplit,
        }
    },
})
