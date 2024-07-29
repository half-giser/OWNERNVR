/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-29 16:08:14
 * @Description: 现场预览-底部菜单栏视图
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-29 16:49:43
 */
import LiveScreenAlarmOut from './LiveScreenAlarmOut.vue'
import { LiveSharedWinData } from '@/types/apiType/live'

export default defineComponent({
    components: {
        LiveScreenAlarmOut,
    },
    props: {
        /**
         * @description 当前窗口数据
         */
        winData: {
            type: Object as PropType<LiveSharedWinData>,
            required: true,
            default: () => new LiveSharedWinData(),
        },
        /**
         * @description 播放模式
         */
        mode: {
            type: String,
            required: true,
            default: '',
        },
        /**
         * @property 当前分屏数
         */
        split: {
            type: Number,
            required: true,
            default: 0,
        },
        /**
         * @property 是否开启OSD状态
         */
        osd: {
            type: Boolean,
            required: true,
            default: false,
        },
        /**
         * @property 本地录像按钮状态
         */
        clientRecord: {
            type: Boolean,
            required: true,
            default: false,
        },
        /**
         * @property 远程录像按钮状态
         */
        remoteRecord: {
            type: Boolean,
            required: true,
            default: false,
        },
        /**
         * @property 预览按钮状态
         */
        preview: {
            type: Boolean,
            required: true,
            default: true,
        },
        /**
         * @property 对讲按钮状态
         */
        talk: {
            type: Boolean,
            required: true,
            default: false,
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

        const WASM_SEG = [1, 4].map((split) => ({
            split,
            type: 1,
        }))

        // 支持旋转分屏
        const ROTATE_SEG = [3, 5, 7, 10]
            .filter((split) => systemCaps.supportImageRotate && systemCaps.previewMaxWin >= split)
            .map((split) => ({
                split,
                type: split === 10 ? 2 : 1,
                file: split === 10 ? 'hallway_seg_10' : 'seg_' + split,
            }))

        const OCX_SEG = [1, 4, 8, 9, 10, 16, 25, 36]
            .filter((split) => systemCaps.previewMaxWin >= split)
            .map((split) => ({
                split,
                type: 1,
                file: 'seg_' + split,
            }))
            .concat(ROTATE_SEG)

        const pageData = ref({
            // H5模式分屏
            wasmSeg: WASM_SEG,
            // OCX模式分屏
            ocxSeg: OCX_SEG,
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
            if (remoteRecordDisabled.value) {
                return
            }
            const sendXml = rawXml`
                <content>
                    <switch>${bool.toString()}</switch>
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

            let remoteRecord = !!$('/response/content/item').length

            $('/response/content/item').forEach((item) => {
                const $item = queryXml(item.element)
                // 查看当前通道录像类型是否有手动录像
                const recType = $item('recTypes/item').some((rec) => rec.text() === 'manual')
                if (!recType) {
                    remoteRecord = false
                }
            })

            ctx.emit('update:remoteRecord', remoteRecord)
        }

        onMounted(() => {
            getRecStatus()
        })

        return {
            pageData,
            recordRemote,
            remoteRecordDisabled,
            isTalk,
            LiveScreenAlarmOut,
        }
    },
})
