/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-12 16:04:15
 * @Description: 智能分析 - 人脸搜索 - 选择人脸弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-12 20:30:40
 */
import IntelFaceDBChooseFaceSnapPanel from './IntelFaceDBChooseFaceSnapPanel.vue'
import IntelFaceDBChooseFaceImportPanel from './IntelFaceDBChooseFaceImportPanel.vue'
import IntelFaceDBChooseFaceFacePanel from './IntelFaceDBChooseFaceFacePanel.vue'
import IntelBaseFaceItem from './IntelBaseFaceItem.vue'
import { type IntelFaceDBSnapFaceList, type IntelFaceDBImportFaceDto, type IntelFaceDBFaceInfo, type IntelFaceDBGroupList } from '@/types/apiType/intelligentAnalysis'

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
         * @property 回显的抓拍数据
         */
        snap: {
            type: Array as PropType<IntelFaceDBSnapFaceList[]>,
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
         * @property 回显的人脸组数据
         */
        group: {
            type: Array as PropType<IntelFaceDBGroupList[]>,
            default: () => [],
        },
        /**
         * @property 回显的外部导入人脸数据
         */
        external: {
            type: Array as PropType<IntelFaceDBImportFaceDto[]>,
            default: () => [],
        },
        /**
         * @property 回显类型
         */
        type: {
            type: String,
            default: 'face',
        },
    },
    emits: {
        'update:modelValue'(e: boolean) {
            return typeof e === 'boolean'
        },
        close() {
            return true
        },
        chooseSnap(e: IntelFaceDBSnapFaceList[]) {
            return Array.isArray(e)
        },
        chooseGroup(e: IntelFaceDBGroupList[]) {
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
        const { openMessageTipBox } = useMessageBox()
        const dateTime = useDateTimeStore()

        const pageData = ref({
            // 当前类型
            type: 'face',
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
                {
                    label: Translate('IDCS_EXTERNAL_LIBRARY'),
                    value: 'import',
                },
            ],
            // 当前选中的人脸
            currentFace: [] as IntelFaceDBFaceInfo[],
            // 当前选中的人脸组
            currentFaceGroup: [] as IntelFaceDBGroupList[],
            // 当前选中的抓怕数据
            currentSnap: [] as IntelFaceDBSnapFaceList[],
        })

        /**
         * @description 打开弹窗时的一些初始化操作
         */
        const open = () => {
            pageData.value.type = 'face'
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
        const chooseSnap = (list: IntelFaceDBSnapFaceList[]) => {
            pageData.value.currentSnap = list
        }

        /**
         * @description 选中人脸库人脸
         * @param {IntelFaceDBFaceInfo[]} list
         */
        const chooseFace = (list: IntelFaceDBFaceInfo[]) => {
            pageData.value.currentFace = list
        }

        /**
         * @description 选中人脸组
         * @param {IntelFaceDBGroupList[]} list
         */
        const chooseFaceGroup = (list: IntelFaceDBGroupList[]) => {
            pageData.value.currentFaceGroup = list
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
            if (pageData.value.currentSnap.length) {
                ctx.emit('chooseSnap', pageData.value.currentSnap)
                close()
            } else {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_SELECT_FACE_EMPTY'),
                })
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
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_SELECT_FACE_EMPTY'),
                })
            }
        }

        /**
         * @description 导入图片成功，关闭弹窗
         * @param {IntelFaceDBImportFaceDto[]} e
         */
        const importImg = (e: IntelFaceDBImportFaceDto[]) => {
            // pageData.value.currentImport = e
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

        /**
         * @description 确认人脸组数据，关闭弹窗
         */
        const confirmGroup = () => {
            const count = pageData.value.currentFaceGroup.reduce((a, b) => {
                return a + b.count
            }, 0)
            if (count >= 200) {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_GROUP_FACE_NUM_IS_TOO_MANY').formatForLang(5),
                })
                return
            } else {
                ctx.emit('chooseGroup', pageData.value.currentFaceGroup)
                close()
            }
        }

        // 回显数据的数量
        const currentSelected = computed(() => {
            let len = 0
            switch (prop.type) {
                case 'face':
                    len = prop.face.length
                    break
                case 'snap':
                    len = prop.snap.length
                    break
                case 'group':
                    len = prop.group.length
                    break
                default:
                    break
            }
            return Translate('IDCS_SELECTED_NUM_D').formatForLang(len)
        })

        return {
            pageData,
            confirmGroup,
            confirm,
            open,
            changeType,
            close,
            chooseSnap,
            importImg,
            chooseFace,
            chooseFaceGroup,
            displayDateTime,
            currentSelected,
        }
    },
})
