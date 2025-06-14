/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-12 16:04:15
 * @Description: 智能分析 - 人脸搜索 - 选择人脸弹窗
 */
import IntelFaceDBChooseFaceSnapPanel from './IntelFaceDBChooseFaceSnapPanel.vue'
import IntelFaceDBChooseFaceImportPanel from './IntelFaceDBChooseFaceImportPanel.vue'
import IntelFaceDBChooseFaceFacePanel from './IntelFaceDBChooseFaceFacePanel.vue'
import IntelBaseFaceItem from './IntelBaseFaceItem.vue'

export default defineComponent({
    components: {
        IntelFaceDBChooseFaceFacePanel,
        IntelFaceDBChooseFaceSnapPanel,
        IntelFaceDBChooseFaceImportPanel,
        IntelBaseFaceItem,
    },
    props: {
        /**
         * @property 弹窗是否打开
         */
        modelValue: {
            type: Boolean,
            required: true,
        },
        /**
         * @property 回显的人脸抓拍数据
         */
        snapFace: {
            type: Array as PropType<IntelFaceDBSnapFaceList[]>,
            default: () => [],
        },
        /**
         * @property 回显的人体抓拍数据
         */
        snapBody: {
            type: Array as PropType<IntelBodyDBSnapBodyList[]>,
            default: () => [],
        },
        /**
         * @property 回显的人脸数据
         */
        face: {
            type: Array as PropType<IntelFaceDBFaceInfo[]>,
            default: () => [],
        },
        /**
         * @property 回显类型
         */
        type: {
            type: String,
            default: 'face',
        },
        /**
         * @property 打开弹窗类型：人脸/人体
         * @description byFace: 人脸，byBody: 人体
         */
        openType: {
            type: String,
            default: 'byFace',
        },
    },
    emits: {
        'update:modelValue'(e: boolean) {
            return typeof e === 'boolean'
        },
        close() {
            return true
        },
        chooseFaceSnap(e: IntelFaceDBSnapFaceList[]) {
            return Array.isArray(e)
        },
        chooseBodySnap(e: IntelBodyDBSnapBodyList[]) {
            return Array.isArray(e)
        },
        chooseFace(e: IntelFaceDBFaceInfo[]) {
            return Array.isArray(e)
        },
        importFiles(e: IntelFaceDBImportFaceDto[]) {
            return Array.isArray(e)
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const dateTime = useDateTimeStore()

        const pageData = ref({
            // 当前类型
            type: 'face',
            // 弹窗打开类型
            openType: 'byFace',
            // 类型选项
            typeOptions: [
                {
                    label: Translate('IDCS_FEATURE_LIBRARY'),
                    value: 'face',
                },
                {
                    label: Translate('IDCS_HISTORY_LIBRARY'),
                    value: 'snap',
                },
            ],
            // 当前选中的人脸
            currentFace: [] as IntelFaceDBFaceInfo[],
            // 当前选中的人脸抓怕数据
            currentFaceSnap: [] as IntelFaceDBSnapFaceList[],
            // 当前选中的人体抓拍数据
            currentBodySnap: [] as IntelBodyDBSnapBodyList[],
            // 是否打开人脸库（防止从人体打开时仍请求人脸库数据）
            isFaceOpen: false,
        })

        /**
         * @description 打开弹窗时的一些初始化操作
         */
        const open = () => {
            pageData.value.openType = prop.openType
            if (pageData.value.openType === 'byBody') {
                pageData.value.typeOptions = [
                    {
                        label: Translate('IDCS_HISTORY_LIBRARY'),
                        value: 'snap',
                    },
                ]
                pageData.value.type = 'snap'
                pageData.value.isFaceOpen = false
            } else {
                pageData.value.typeOptions = [
                    {
                        label: Translate('IDCS_FEATURE_LIBRARY'),
                        value: 'face',
                    },
                    {
                        label: Translate('IDCS_HISTORY_LIBRARY'),
                        value: 'snap',
                    },
                ]
                pageData.value.type = 'face'
                pageData.value.isFaceOpen = true
            }
        }

        /**
         * @description 切换类型
         * @param {string} type
         */
        const changeType = (type: string) => {
            pageData.value.type = type
        }

        /**
         * @description 选中抓图
         * @param {IntelFaceDBSnapFaceList[]} list
         */
        const chooseSnap = (list: IntelFaceDBSnapFaceList[] | IntelBodyDBSnapBodyList[]) => {
            if (pageData.value.openType === 'byFace') {
                pageData.value.currentFaceSnap = list as IntelFaceDBSnapFaceList[]
            } else {
                pageData.value.currentBodySnap = list as IntelBodyDBSnapBodyList[]
            }
        }

        /**
         * @description 选中人脸库人脸
         * @param {IntelFaceDBFaceInfo[]} list
         */
        const chooseFace = (list: IntelFaceDBFaceInfo[]) => {
            pageData.value.currentFace = list
        }

        /**
         * @description 格式化日期
         * @param {number} timestamp
         * @returns {string}
         */
        const displayDateTime = (timestamp: number) => {
            return formatDate(timestamp, dateTime.dateTimeFormat)
        }

        /**
         * @description 确认抓图，关闭弹窗
         */
        const confirmSnap = () => {
            if (pageData.value.openType === 'byFace') {
                ctx.emit('chooseFaceSnap', pageData.value.currentFaceSnap)
                close()
            } else if (pageData.value.openType === 'byBody') {
                ctx.emit('chooseBodySnap', pageData.value.currentBodySnap)
                close()
            } else {
                openMessageBox(Translate('IDCS_SELECT_FACE_EMPTY'))
            }
        }

        /**
         * @description 确认人脸库人脸，关闭弹窗
         */
        const confirmFace = () => {
            if (pageData.value.currentFace.length) {
                ctx.emit('chooseFace', pageData.value.currentFace)
                close()
            } else {
                openMessageBox(Translate('IDCS_SELECT_FACE_EMPTY'))
            }
        }

        /**
         * @description 导入图片成功，关闭弹窗
         * @param {IntelFaceDBImportFaceDto[]} e
         */
        const importImg = (e: IntelFaceDBImportFaceDto[]) => {
            ctx.emit('importFiles', e)
            close()
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('update:modelValue', false)
            ctx.emit('close')
        }

        /**
         * @description 确认人脸数据（人脸库/抓拍）
         */
        const confirm = () => {
            if (pageData.value.type === 'snap') {
                confirmSnap()
            } else {
                confirmFace()
            }
        }

        // 回显数据的数量
        const currentSelected = computed(() => {
            let len = 0
            switch (prop.type) {
                case 'face':
                    len = prop.face.length
                    break
                case 'snapFace':
                    len = prop.snapFace.length
                    break
                // 临时，后续已选定项要删除
                case 'snap':
                    len = prop.snapFace.length
                    break
                case 'snapBody':
                    len = prop.snapBody.length
                    break
                default:
                    break
            }
            return Translate('IDCS_SELECTED_NUM_D').formatForLang(len)
        })

        return {
            pageData,
            confirm,
            open,
            changeType,
            close,
            chooseSnap,
            importImg,
            chooseFace,
            displayDateTime,
            currentSelected,
        }
    },
})
