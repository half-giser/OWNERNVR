/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-30 18:47:04
 * @Description: 人脸库 - 添加人脸
 */
import IntelBaseFaceItem from './IntelBaseFaceItem.vue'
import IntelFaceDBChooseFacePop from './IntelFaceDBChooseFacePop.vue'

export default defineComponent({
    components: {
        IntelFaceDBChooseFacePop,
        IntelBaseFaceItem,
    },
    props: {
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
        close(isRefresh: boolean) {
            return typeof isRefresh === 'boolean'
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        // const dateTime = useDateTimeStore()

        // 错误码与显示文本的映射
        const ERROR_TIP_MAPPING: Record<number, string> = {
            [ErrorCode.USER_ERROR_CANNOT_DEL_CUR_USER]: Translate('IDCS_TARGET_LIBRARY_GROUP_DATABASE_FULL'),
            [ErrorCode.USER_ERROR_NO_AUTH]: Translate('IDCS_NO_PERMISSION'),
            [ErrorCode.USER_ERROR_LIVE_RECONNECT]: Translate('IDCS_PICTURE_SIZE_LIMIT_TIP'),
            [ErrorCode.USER_ERROR_LICENSEPLATE_EXISTS]: Translate('IDCS_PICTURE_SIZE_LIMIT_TIP'),
            [ErrorCode.USER_ERROR_MDU_HAVEDEVICE]: Translate('IDCS_OUT_FILE_SIZE'),
            [ErrorCode.USER_ERROR_FILE_MISMATCHING]: Translate('IDCS_NO_DISK'),
            [ErrorCode.USER_ERROR_WALL_HAVEDECODER]: Translate('IDCS_UNQUALIFIED_PICTURE'),
        }

        const formRef = useFormRef()

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
            // 选中的图片索引
            swiperIndex: 0,
        })

        const formData = ref<IntelFaceDBFaceForm[]>([new IntelFaceDBFaceForm()])

        let isAddedFace = false

        // 图片分页数
        const swiperSize = computed(() => {
            return Math.ceil(formData.value.length / 6)
        })

        // 当前分页的图片列表
        const picList = computed(() => {
            return formData.value.slice(pageData.value.swiperIndex * 7, (pageData.value.swiperIndex + 1) * 7)
        })

        // 成功上传总数
        const successCount = computed(() => {
            return formData.value.filter((item) => item.success).length
        })

        // 上传总数
        const totalCount = computed(() => {
            return formData.value.length === 1 ? (formData.value[0].pic ? 1 : 0) : formData.value.length
        })

        // 当前进度文本
        const progress = computed(() => {
            return Translate('IDCS_ENTRYED_AND_TOTALITY').formatForLang(successCount.value, totalCount.value)
        })

        /**
         * @description 获取人脸分组
         */
        const getFaceGroup = async () => {
            openLoading()

            const result = await queryFacePersonnalInfoGroupList()
            const $ = queryXml(result)

            closeLoading()

            pageData.value.groupList = $('content/item').map((item) => {
                const $item = queryXml(item.element)
                return {
                    id: item.attr('id'),
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
            data.birthday = formatGregoryDate(new Date(), DEFAULT_YMD_FORMAT)
            data.errorTip = Translate('IDCS_WAITING_ADD')
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
            isAddedFace = false
            snapData = []
            importData = []
            formData.value = [new IntelFaceDBFaceForm()]
            formData.value[0].birthday = formatGregoryDate(new Date(), DEFAULT_YMD_FORMAT)
            await getFaceGroup()
            pageData.value.formIndex = 0
            pageData.value.formType = 'choose'
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
            pageData.value.swiperIndex--
            pageData.value.formIndex = pageData.value.swiperIndex * 7
        }

        /**
         * @description 图片列表下一页
         */
        const handleNext = () => {
            pageData.value.swiperIndex++
            pageData.value.formIndex = pageData.value.swiperIndex * 7
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
            pageData.value.swiperIndex = 0
            pageData.value.formIndex = 0

            const data = renderFormData()
            data.pic = e[0].pic
            data.errorTip = Translate('IDCS_WAITING_ADD')
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
            pageData.value.swiperIndex = 0
            pageData.value.formIndex = 0

            formData.value = e.map((item) => {
                const data = renderFormData()
                data.birthday = formatGregoryDate(item.birthday, DEFAULT_YMD_FORMAT, 'YYYY/MM/DD')
                data.number = item.number
                data.mobile = item.mobile
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
                openMessageBox(Translate('IDCS_PROMPT_FULL_NAME_EMPTY'))
                return
            }

            openLoading()

            const importItem = importData[index]
            const group = pageData.value.groupList.find((current) => current.groupId === item.groupId)!

            const sendXml = rawXml`
                <content>
                    <force>${force}</force>
                    <name>${item.name}</name>
                    <sex>${item.sex}</sex>
                    <birthday>${item.birthday}</birthday>
                    <nativePlace>${item.nativePlace}</nativePlace>
                    <certificateType>${item.certificateType}</certificateType>
                    <certificateNum>${item.certificateNum}</certificateNum>
                    <mobile>${item.mobile}</mobile>
                    <number>${item.number}</number>
                    <note>${item.note}</note>
                    <groups>
                        <item id="${group.id}">
                            <groupId>${group.groupId}</groupId>
                            <name>${group.name}</name>
                        </item>
                    </groups>
                    <faceImg>
                        <imgData>${wrapCDATA(item.pic.split(',')[1])}</imgData>
                        <imgWidth>${importItem.width}</imgWidth>
                        <imgHeight>${importItem.height}</imgHeight>
                    </faceImg>
                </content>
            `
            const result = await createFacePersonnalInfo(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                formData.value[index].success = true
                formData.value[index].errorTip = Translate('IDCS_FACE_ADD_SUCCESS')
                isAddedFace = true
            } else {
                const errorCode = $('errorCode').text().num()
                switch (errorCode) {
                    case ErrorCode.USER_ERROR_CANNOT_DEL_CUR_USER:
                    case ErrorCode.USER_ERROR_NO_AUTH:
                    case ErrorCode.USER_ERROR_LIVE_RECONNECT:
                    case ErrorCode.USER_ERROR_LICENSEPLATE_EXISTS:
                    case ErrorCode.USER_ERROR_FILE_MISMATCHING:
                    case ErrorCode.USER_ERROR_WALL_HAVEDECODER:
                    case ErrorCode.USER_ERROR_MDU_HAVEDEVICE:
                        formData.value[index].error = true
                        formData.value[index].errorTip = Translate('IDCS_ADD_FACE_FAIL') + ',' + ERROR_TIP_MAPPING[errorCode]
                        break
                    case ErrorCode.USER_ERROR_NODE_ID_EXISTS:
                        if (!force) {
                            const name = $('content/name').text()
                            const similarity = $('content/similarity').text() + '%'
                            return openMessageBox({
                                type: 'question',
                                message: Translate('IDCS_TARGET_LIBRARY_FACE_HAS_EXIST').formatForLang(name, similarity),
                            }).then(() => {
                                setSingleImportData(item, index, true)
                            })
                        }
                        break
                    default:
                        formData.value[index].errorTip = Translate('IDCS_ADD_FACE_FAIL')
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
            if (!item.name) {
                openMessageBox(Translate('IDCS_PROMPT_FULL_NAME_EMPTY'))
                return
            }

            openLoading()

            const snapItem = snapData[0]
            const group = pageData.value.groupList.find((current) => current.groupId === item.groupId)!

            const sendXml = rawXml`
                <types>
                    <sex>${wrapEnums(['male', 'female'])}</sex>
                    <certificateType>${wrapEnums(['idCard'])}</certificateType>
                    <property>${wrapEnums(['allow', 'reject', 'limited'])}</property>
                </types>
                <content>
                    ${force ? '<force>true</force>' : ''}
                    <name>${item.name}</name>
                    <sex type="sex">${item.sex}</sex>
                    <birthday>${item.birthday}</birthday>
                    <nativePlace>${item.nativePlace}</nativePlace>
                    <certificateType type="certificateType">${item.certificateType}</certificateType>
                    <certificateNum>${item.certificateNum}</certificateNum>
                    <mobile>${item.mobile}</mobile>
                    <number>${item.number}</number>
                    <note>${item.note}</note>
                    <groups>
                        <item id="${group.id}">
                            <groupId>${group.groupId}</groupId>
                            <name>${group.name}</name>
                        </item>
                    </groups>
                    <faceImgs type="list" maxCount="5">
                        <item>
                            <frameTime>${snapItem.frameTime}</frameTime>
                            <img id="${snapItem.imgId}" />
                            <chl id="${snapItem.chlId}" />
                        </item>
                    </faceImgs>
                </content>
            `
            const result = await createFacePersonnalInfo(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                formData.value[index].success = true
                formData.value[index].errorTip = Translate('IDCS_FACE_ADD_SUCCESS')
                isAddedFace = true
            } else {
                const errorCode = $('errorCode').text().num()
                switch (errorCode) {
                    case ErrorCode.USER_ERROR_CANNOT_DEL_CUR_USER:
                    case ErrorCode.USER_ERROR_NO_AUTH:
                    case ErrorCode.USER_ERROR_LIVE_RECONNECT:
                    case ErrorCode.USER_ERROR_LICENSEPLATE_EXISTS:
                    case ErrorCode.USER_ERROR_FILE_MISMATCHING:
                    case ErrorCode.USER_ERROR_WALL_HAVEDECODER:
                    case ErrorCode.USER_ERROR_MDU_HAVEDEVICE:
                        formData.value[index].errorTip = Translate('IDCS_ADD_FACE_FAIL') + ',' + ERROR_TIP_MAPPING[errorCode]
                        formData.value[index].error = true
                        break
                    case ErrorCode.USER_ERROR_NODE_ID_EXISTS:
                        if (!force) {
                            const name = $('content/name').text()
                            const similarity = $('content/similarity').text() + '%'
                            return openMessageBox({
                                type: 'question',
                                message: Translate('IDCS_TARGET_LIBRARY_FACE_HAS_EXIST').formatForLang(name, similarity),
                            }).then(() => {
                                setSingleSnapData(item, index, true)
                            })
                        }
                        break
                    default:
                        formData.value[index].errorTip = Translate('IDCS_ADD_FACE_FAIL')
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
            let startFlag = false
            for (let i = 0; i < formData.value.length; i++) {
                if (!formData.value[i].success) {
                    if (!startFlag) {
                        pageData.value.formIndex = i
                        startFlag = true
                    }
                    await setSingleImportData(formData.value[i], i, !single)
                    pageData.value.formIndex = i
                    pageData.value.swiperIndex = Math.floor(pageData.value.formIndex / 7)
                }
            }
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close', isAddedFace)
        }

        return {
            formRef,
            formData,
            pageData,
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
