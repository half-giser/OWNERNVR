/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-30 18:47:04
 * @Description: 人脸库 - 添加人脸
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-02 17:51:53
 */
import { IntelFaceDBFaceForm, type IntelFaceDBGroupDto, type IntelFaceDBSnapFaceList, type IntelFaceDBImportFaceDto } from '@/types/apiType/intelligentAnalysis'
import { type FormInstance } from 'element-plus'
import IntelFaceItem from './IntelFaceItem.vue'
import IntelFaceDBChooseFacePop from './IntelFaceDBChooseFacePop.vue'

export default defineComponent({
    components: {
        IntelFaceDBChooseFacePop,
        IntelFaceItem,
    },
    props: {
        /**
         * @property 日期格式
         */
        dateFormat: {
            type: String,
            required: true,
            default: 'YYYY-MM-DD',
        },
        /**
         * @property 日期高亮函数
         */
        highlight: {
            type: Function,
            required: true,
            default: () => () => '',
        },
        /**
         * @property 分组ID
         */
        groupId: {
            type: String,
            default: '',
        },
    },
    emits: {
        confirm() {
            return true
        },
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()

        // 错误码与显示文本的映射
        const ERROR_TIP_MAPPING: Record<number, string> = {
            536871032: Translate('IDCS_TARGET_LIBRARY_GROUP_DATABASE_FULL'),
            536870953: Translate('IDCS_NO_PERMISSION'),
            536871043: Translate('IDCS_PICTURE_SIZE_LIMIT_TIP'),
            536871044: Translate('IDCS_PICTURE_SIZE_LIMIT_TIP'),
            536871025: Translate('IDCS_OUT_FILE_SIZE'),
            536871030: Translate('IDCS_NO_DISK'),
            536871026: Translate('IDCS_UNQUALIFIED_PICTURE'),
        }

        const formRef = ref<FormInstance>()

        const pageData = ref({
            // 性别选项
            genderOptions: [
                {
                    label: Translate('IDCS_MALE'),
                    value: 'male',
                },
                {
                    label: Translate('IDCS_FEMALE'),
                    value: 'female',
                },
            ] as SelectOption<string, string>[],
            // ID类型选项
            idTypeOptions: [
                {
                    label: Translate('IDCS_ID_CARD'),
                    value: 'idCard',
                },
            ],
            // 人脸组选项
            groupList: [] as IntelFaceDBGroupDto[],
            // 打开选择人脸弹窗
            isChooseFacePop: false,
            // 表单索引
            formIndex: 0,
            // 表单类型 snap | import
            formType: 'snap',
            // 错误文本
            errorTip: ' ',
            // 选中的图片索引
            swiperIndex: 0,
        })

        const formData = ref<IntelFaceDBFaceForm[]>([new IntelFaceDBFaceForm()])

        // 图片分页数
        const swiperSize = computed(() => {
            return Math.ceil(formData.value.length / 6)
        })

        // 当前分页的图片列表
        const picList = computed(() => {
            return formData.value.slice(pageData.value.swiperIndex * 6, (pageData.value.swiperIndex + 1) * 6)
        })

        // 成功上传总数
        const successCount = computed(() => {
            return formData.value.filter((item) => item.success).length
        })

        // 上传总数
        const totalCount = computed(() => {
            return formData.value.length
        })

        // 当前进度文本
        const progress = computed(() => {
            return Translate('IDCS_ENTRYED_AND_TOTALITY').formatForLang(successCount.value, totalCount.value)
        })

        /**
         * @description 获取人脸分组
         */
        const getFaceGroup = async () => {
            openLoading(LoadingTarget.FullScreen)

            const result = await queryFacePersonnalInfoGroupList()
            const $ = queryXml(result)

            closeLoading(LoadingTarget.FullScreen)

            pageData.value.groupList = $('//content/item').map((item) => {
                const $item = queryXml(item.element)
                return {
                    id: item.attr('id')!,
                    groupId: $item('groupId').text(),
                    name: $item('name').text(),
                }
            })
        }

        /**
         * @description 生成初始化的表单数据
         * @returns {IntelFaceDBFaceForm}
         */
        const renderFormData = () => {
            const data = new IntelFaceDBFaceForm()
            data.birthday = formatDate(new Date(), prop.dateFormat)
            if (pageData.value.groupList.length) {
                if (prop.groupId) {
                    data.groupId = prop.groupId
                } else {
                    data.groupId = pageData.value.groupList[0].groupId
                }
            }
            return data
        }

        /**
         * @description 打开弹窗时重置数据
         */
        const open = async () => {
            snapData = []
            importData = []
            formData.value = [new IntelFaceDBFaceForm()]
            formData.value[0].birthday = formatDate(new Date(), prop.dateFormat)
            await getFaceGroup()
            pageData.value.formIndex = 0
            pageData.value.formType = 'choose'
            pageData.value.errorTip = ' ' // Translate('IDCS_WAITING_ADD')
            if (pageData.value.groupList.length) {
                if (prop.groupId) {
                    formData.value[0].groupId = prop.groupId
                } else {
                    formData.value[0].groupId = pageData.value.groupList[0].groupId
                }
            }
        }

        /**
         * @description 图片列表上一页
         */
        const handlePrev = () => {
            if (pageData.value.swiperIndex === 0) {
                return
            }
            pageData.value.swiperIndex--
        }

        /**
         * @description 图片列表下一页
         */
        const handleNext = () => {
            if (pageData.value.swiperIndex === swiperSize.value - 1) {
                return
            }
            pageData.value.swiperIndex++
        }

        /**
         * @description 打开选择人脸照片弹窗
         */
        const chooseFace = () => {
            pageData.value.isChooseFacePop = true
        }

        let snapData: IntelFaceDBSnapFaceList[]

        /**
         * @description 确认选择人脸 更新表单
         * @param {IntelFaceDBSnapFaceList[]} e
         */
        const confirmChooseFace = (e: IntelFaceDBSnapFaceList[]) => {
            pageData.value.isChooseFacePop = false
            pageData.value.formType = 'snap'
            pageData.value.errorTip = Translate('IDCS_WAITING_ADD')
            pageData.value.swiperIndex = 0
            pageData.value.formIndex = 0

            const data = renderFormData()
            data.pic = e[0].pic
            formData.value = [data]
            snapData = e
        }

        let importData: IntelFaceDBImportFaceDto[] = []

        /**
         * @description 确认导入人脸 更新表单
         * @param {IntelFaceDBImportFaceDto[]} e
         */
        const confirmImportFace = (e: IntelFaceDBImportFaceDto[]) => {
            pageData.value.isChooseFacePop = false
            pageData.value.formType = 'import'
            pageData.value.errorTip = Translate('IDCS_WAITING_ADD')
            pageData.value.swiperIndex = 0
            pageData.value.formIndex = 0

            formData.value = e.map((item) => {
                console.log(item)
                const data = renderFormData()
                data.birthday = formatDate(item.birthday, prop.dateFormat, 'YYYY/MM/DD')
                console.log(data.birthday)
                if (item.number) {
                    data.number = Number(item.number)
                }
                if (item.mobile) {
                    data.mobile = Number(item.mobile)
                }
                data.name = item.name ? item.name : item.imgName.split('.')[0]
                data.sex = item.sex
                data.certificateType = item.certificateType
                data.certificateNum = item.certificateNum
                data.note = item.note
                data.pic = item.pic
                return data
            })
            importData = e
        }

        /**
         * @description 名字失去焦点时 还原名字显示
         * @param {number} formIndex
         */
        const handleNameBlur = (formIndex: number) => {
            if (!formData.value[formIndex].name && pageData.value.formType === 'import') {
                const name = importData[formIndex].name || importData[formIndex].imgName.split('.')[0]
                formData.value[formIndex].name = name
            }
        }

        /**
         * @description 上传导入的人脸数据
         * @param {IntelFaceDBFaceForm} item
         * @param {number} index
         * @param {boolean} force 是否无视相似度警告，强制上传
         */
        const setSingleImportData = async (item: IntelFaceDBFaceForm, index: number, force = false) => {
            if (!item.name) {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_PROMPT_FULL_NAME_EMPTY'),
                })
                return
            }

            openLoading(LoadingTarget.FullScreen)

            const importItem = importData[index]
            const group = pageData.value.groupList.find((current) => current.groupId === item.groupId)!

            const sendXml = rawXml`
                <content>
                    <force>${force.toString()}</force>
                    <name>${item.name}</name>
                    <sex>${item.sex}</sex>
                    <birthday>${formatDate(item.birthday, 'YYYY-MM-DD', prop.dateFormat)}</birthday>
                    <nativePlace>${item.nativePlace}</nativePlace>
                    <certificateType>${item.certificateType}</certificateType>
                    <certificateNum>${item.certificateNum}</certificateNum>
                    <mobile>${item.mobile?.toString() || ''}</mobile>
                    <number>${item.number?.toString() || ''}</number>
                    <note>${item.note}</note>
                    <groups>
                        <item id="${group.id}">
                            <groupId>${group.groupId}</groupId>
                            <name>${group.name}</name>
                        </item>
                    </groups>
                    <faceImg>
                        <imgData>${wrapCDATA(item.pic.split(',')[1])}</imgData>
                        <imgWidth>${importItem.width.toString()}</imgWidth>
                        <imgHeight>${importItem.height.toString()}</imgHeight>
                    </faceImg>
                </content>
            `
            const result = await createFacePersonnalInfo(sendXml)
            const $ = queryXml(result)

            closeLoading(LoadingTarget.FullScreen)

            if ($('//status').text() === 'success') {
                pageData.value.errorTip = Translate('IDCS_FACE_ADD_SUCCESS')
                formData.value[index].success = true
            } else {
                const errorCode = Number($('//errorCode').text())
                switch (errorCode) {
                    case ErrorCode.USER_ERROR_CANNOT_DEL_CUR_USER:
                    case ErrorCode.USER_ERROR_NO_AUTH:
                    case ErrorCode.USER_ERROR_LIVE_RECONNECT:
                    case ErrorCode.USER_ERROR_LICENSEPLATE_EXISTS:
                    case ErrorCode.USER_ERROR_FILE_MISMATCHING:
                    case ErrorCode.USER_ERROR_WALL_HAVEDECODER:
                    case ErrorCode.USER_ERROR_MDU_HAVEDEVICE:
                        pageData.value.errorTip = Translate('IDCS_ADD_FACE_FAIL') + ',' + ERROR_TIP_MAPPING[errorCode]
                        formData.value[index].error = true
                        break
                    case ErrorCode.USER_ERROR_NODE_ID_EXISTS:
                        if (!force) {
                            const name = $('//content/name').text()
                            const similarity = $('//content/similarity').text() + '%'
                            return openMessageTipBox({
                                type: 'question',
                                message: Translate('IDCS_TARGET_LIBRARY_FACE_HAS_EXIST').formatForLang(name, similarity),
                            }).then(() => {
                                setSingleImportData(item, index, true)
                            })
                        }
                        break
                    default:
                        pageData.value.errorTip = Translate('IDCS_ADD_FACE_FAIL')
                        formData.value[index].error = true
                        break
                }
            }
        }

        /**
         * @description 上传选中的抓拍图数据
         * @param {IntelFaceDBFaceForm} item
         * @param {number} index
         * @param {boolean} force 是否无视相似度警告，强制上传
         */
        const setSingleSnapData = async (item: IntelFaceDBFaceForm, index: number, force = false) => {
            openLoading(LoadingTarget.FullScreen)

            const snapItem = snapData[0]
            const group = pageData.value.groupList.find((current) => current.groupId === item.groupId)!

            const sendXml = rawXml`
                <types>
                    <sex>${wrapEnums(['male', 'female'])}</sex>
                    <certificateType>${wrapEnums(['idCard'])}</certificateType>
                    <property>${wrapEnums(['allow', 'reject', 'limited'])}</property>
                </types>
                <content>
                    ${ternary(force, `<force>true</force>`, '')}
                    <name>${item.name}</name>
                    <sex type="sex">${item.sex}</sex>
                    <birthday>${formatDate(item.birthday, 'YYYY-MM-DD', prop.dateFormat)}</birthday>
                    <nativePlace>${item.nativePlace}</nativePlace>
                    <certificateType type="certificateType">${item.certificateType}</certificateType>
                    <certificateNum>${item.certificateNum}</certificateNum>
                    <mobile>${item.mobile?.toString() || ''}</mobile>
                    <number>$cons{item.number?.toString() || ''}</number>
                    <note>${item.note}</note>
                    <groups>
                        <item id="${group.id}">
                            <groupId>${group.groupId}</groupId>
                            <name>${group.name}</name>
                        </item>
                    </groups>
                    <faceImgs type="list" maxCount="5">
                        <item>
                            <frameTime>${localToUtc(snapItem.timestamp)}:${snapItem.timeNS}</frameTime>
                            <img id="${snapItem.imgId.toString()}" />
                            <chl id="${snapItem.chlId}" />
                        </item>
                    </faceImgs>
                </content>
            `
            const result = await createFacePersonnalInfo(sendXml)
            const $ = queryXml(result)

            closeLoading(LoadingTarget.FullScreen)

            if ($('//status').text() === 'success') {
                formData.value[index].success = true
                pageData.value.errorTip = Translate('IDCS_FACE_ADD_SUCCESS')
            } else {
                const errorCode = Number($('//errorCode').text())
                switch (errorCode) {
                    case ErrorCode.USER_ERROR_CANNOT_DEL_CUR_USER:
                    case ErrorCode.USER_ERROR_NO_AUTH:
                    case ErrorCode.USER_ERROR_LIVE_RECONNECT:
                    case ErrorCode.USER_ERROR_LICENSEPLATE_EXISTS:
                    case ErrorCode.USER_ERROR_FILE_MISMATCHING:
                    case ErrorCode.USER_ERROR_WALL_HAVEDECODER:
                    case ErrorCode.USER_ERROR_MDU_HAVEDEVICE:
                        pageData.value.errorTip = Translate('IDCS_ADD_FACE_FAIL') + ',' + ERROR_TIP_MAPPING[errorCode]
                        formData.value[index].error = true
                        break
                    case ErrorCode.USER_ERROR_NODE_ID_EXISTS:
                        if (!force) {
                            const name = $('//content/name').text()
                            const similarity = $('//content/similarity').text() + '%'
                            return openMessageTipBox({
                                type: 'question',
                                message: Translate('IDCS_TARGET_LIBRARY_FACE_HAS_EXIST').formatForLang(name, similarity),
                            }).then(() => {
                                setSingleSnapData(item, index, true)
                            })
                        }
                        break
                    default:
                        pageData.value.errorTip = Translate('IDCS_ADD_FACE_FAIL')
                        formData.value[index].error = true
                        break
                }
            }
        }

        /**
         * @description 更新当个表单
         */
        const setCurrentData = () => {
            if (pageData.value.formType === 'import') {
                setSingleImportData(formData.value[pageData.value.formIndex], pageData.value.formIndex)
            } else {
                setSingleSnapData(formData.value[pageData.value.formIndex], pageData.value.formIndex)
            }
        }

        /**
         * @description 更新所有表单
         */
        const setAllData = async () => {
            const single = totalCount.value - successCount.value === 1
            for (let i = 0; i < formData.value.length; i++) {
                if (!formData.value[i].success) {
                    await setSingleImportData(formData.value[i], i, !single)
                }
            }
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
        }

        return {
            formRef,
            formData,
            pageData,
            IntelFaceItem,
            open,
            handlePrev,
            handleNext,
            chooseFace,
            confirmChooseFace,
            confirmImportFace,
            setCurrentData,
            setAllData,
            progress,
            handleNameBlur,
            close,
            totalCount,
            successCount,
            picList,
            swiperSize,
        }
    },
})
