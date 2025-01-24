/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-30 18:47:36
 * @Description: 人脸库 - 选择人脸
 */
import IntelFaceDBChooseFaceSnapPanel from './IntelFaceDBChooseFaceSnapPanel.vue'
import IntelFaceDBChooseFaceImportPanel from './IntelFaceDBChooseFaceImportPanel.vue'
import { type IntelFaceDBSnapFaceList, type IntelFaceDBImportFaceDto } from '@/types/apiType/intelligentAnalysis'

export default defineComponent({
    components: {
        IntelFaceDBChooseFaceSnapPanel,
        IntelFaceDBChooseFaceImportPanel,
    },
    props: {
        /**
         * @property 弹窗类型 both（两种模式） | snap（只显示抓拍） | import（只显示导入）
         */
        type: {
            type: String,
            default: 'both',
        },
    },
    emits: {
        close() {
            return true
        },
        choose(e: IntelFaceDBSnapFaceList[]) {
            return Array.isArray(e)
        },
        importFiles(e: IntelFaceDBImportFaceDto[]) {
            return Array.isArray(e)
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()

        const pageData = ref({
            // 当前类型
            type: 'snap',
            // 类型选项
            typeOptions: [
                {
                    label: Translate('IDCS_HISTORY_LIBRARY'),
                    value: 'snap',
                },
                {
                    label: Translate('IDCS_EXTERNAL_LIBRARY'),
                    value: 'import',
                },
            ],
            // 当前选中的抓怕数据
            currentSnap: [] as IntelFaceDBSnapFaceList[],
            // 是否显示导入说明弹窗
            isDescPop: false,
            // 导入说明的文本
            descTitle: [
                '(01)' + Translate('IDCS_NAME_PERSON'),
                '(02)' + Translate('IDCS_SEX'),
                '(03)' + Translate('IDCS_BIRTHDAY'),
                '(04)' + Translate('IDCS_ID_TYPE'),
                '(05)' + Translate('IDCS_ID_NUMBER'),
                '(08)' + Translate('IDCS_PHONE_NUMBER'),
                '(12)' + Translate('IDCS_IMAGE_NAME'),
                '(13)' + Translate('IDCS_NUMBER'),
                '(14)' + Translate('IDCS_REMARK'),
            ],
            // 导入说明的文本
            descBody: ['user', '0', '2023/01/01', Translate('IDCS_ID_CARD'), '123456', '18888888888', 'user.jpg', '88', 'doctor'],
        })

        /**
         * @description 打开弹窗时的一些初始化操作
         */
        const open = () => {
            pageData.value.type = prop.type === 'both' ? 'snap' : prop.type
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
         * @description 确认抓图，关闭弹窗
         */
        const confirmSnap = () => {
            if (pageData.value.currentSnap.length) {
                ctx.emit('choose', pageData.value.currentSnap)
            } else {
                openMessageBox(Translate('IDCS_SELECT_PIC_UNQUALIFIED'))
            }
        }

        /**
         * @description 导入图片成功，关闭弹窗
         * @param {IntelFaceDBImportFaceDto[]} e
         */
        const importImg = (e: IntelFaceDBImportFaceDto[]) => {
            ctx.emit('importFiles', e)
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
        }

        return {
            open,
            pageData,
            changeType,
            close,
            chooseSnap,
            confirmSnap,
            importImg,
        }
    },
})
