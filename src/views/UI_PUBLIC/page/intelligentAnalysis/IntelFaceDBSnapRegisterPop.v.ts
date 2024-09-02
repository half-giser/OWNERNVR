/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-29 16:10:39
 * @Description: 抓拍注册弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-02 19:45:41
 */
import type { FormInstance, FormRules } from 'element-plus'
import IntelFaceDBEditPop from './IntelFaceDBEditPop.vue'
import { type IntelFaceDBGroupDto, IntelFaceDBSnapRegisterForm } from '@/types/apiType/intelligentAnalysis'

export default defineComponent({
    components: {
        IntelFaceDBEditPop,
    },
    props: {
        pic: {
            type: String,
            required: true,
            default: '',
        },
        dateFormat: {
            type: String,
            required: true,
            default: 'YYYY-MM-DD',
        },
        highlight: {
            type: Function,
            required: true,
            default: () => () => '',
        },
    },
    emits: {
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()

        const pageData = ref({
            // 人脸数据库选项
            faceDatabaseList: [] as IntelFaceDBGroupDto[],
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
            // 是否显示新增人脸组弹窗
            isAddGroupPop: false,
            // 抓拍图像宽
            imgWidth: 0,
            // 抓拍图像高
            imgHeight: 0,
            // 是否强制创建
            forceCreate: false,
        })

        const formRef = ref<FormInstance>()
        const formData = ref(new IntelFaceDBSnapRegisterForm())
        const formRule = ref<FormRules>({
            name: [
                {
                    validator(rule, value, callback) {
                        if (!value.trim().length) {
                            callback(new Error(Translate('IDCS_PROMPT_FULL_NAME_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'blur',
                },
            ],
        })

        /**
         * @description 显示Base64图像
         * @param {String} src
         * @returns {String}
         */
        const displayBase64Img = (src: string) => {
            if (src) {
                return 'data:image/png;base64,' + src
            }
            return ''
        }

        /**
         * @description 获取人脸数据库列表
         */
        const getFaceDatabaseList = async () => {
            openLoading(LoadingTarget.FullScreen)

            const result = await queryFacePersonnalInfoGroupList()
            const $ = queryXml(result)

            closeLoading(LoadingTarget.FullScreen)

            pageData.value.faceDatabaseList = $('//content/item').map((item) => {
                const $item = queryXml(item.element)
                return {
                    id: item.attr('id')!,
                    groupId: $item('groupId').text(),
                    name: $item('name').text(),
                }
            })
            if (pageData.value.faceDatabaseList.length) {
                formData.value.groupId = pageData.value.faceDatabaseList[0].groupId
            }
        }

        /**
         * @description 打开新增人脸组弹窗
         */
        const addGroup = () => {
            pageData.value.isAddGroupPop = true
        }

        /**
         * @description 确认新增人脸组 刷新数据
         */
        const confirmAddGroup = () => {
            pageData.value.isAddGroupPop = false
            getFaceDatabaseList()
        }

        /**
         * @description 表单验证
         */
        const verify = () => {
            formRef.value!.validate(async (valid) => {
                if (!valid) {
                    return
                }
                register()
            })
        }

        /**
         * @description 注册
         */
        const register = async () => {
            openLoading(LoadingTarget.FullScreen)

            const groupItemId = pageData.value.faceDatabaseList.find((item) => item.groupId === formData.value.groupId)!.id
            const sendXml = rawXml`
                <content>
                    ${ternary(pageData.value.forceCreate, `<force>true</force>`)}
                    <name>${formData.value.name}</name>
                    <sex>${formData.value.sex}</sex>
                    <birthday>${formatDate(formData.value.birthday, prop.dateFormat, 'YYYY-MM-DD')}</birthday>
                    <nativePlace></nativePlace>
                    <certificateType type="certificateType">${formData.value.certificateType}</certificateType>
                    <mobile>${formData.value.mobile?.toString() || ''}</mobile>
                    <number>${formData.value.number?.toString() || ''}</number>
                    <note>${formData.value.note}</note>
                    <groups>
                        <item id="${groupItemId}">
                            <groupId>${formData.value.groupId}</groupId>
                        </item>
                    </groups>
                    <faceImg>
                        <imgData>${wrapCDATA(prop.pic)}</imgData>
                        <imgWidth>${pageData.value.imgWidth.toString()}</imgWidth>
                        <imgHeight>${pageData.value.imgHeight.toString()}</imgHeight>
                    </faceImg>
                </content>
            `
            const result = await createFacePersonnalInfo(sendXml)
            const $ = queryXml(result)

            closeLoading(LoadingTarget.FullScreen)
            pageData.value.forceCreate = false

            if ($('/response/status').text() === 'success') {
                openMessageTipBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                }).finally(() => {
                    close()
                })
            } else {
                const errorCode = Number($('/response/errorCode').text())
                let errorInfo = ''
                switch (errorCode) {
                    case ErrorCode.USER_ERROR_WALL_HAVEDECODER:
                        errorInfo = Translate('IDCS_UNQUALIFIED_PICTURE')
                        break
                    case ErrorCode.USER_ERROR_LIVE_RECONNECT:
                        errorInfo = Translate('IDCS_PICTURE_SIZE_LIMIT_TIP')
                        break
                    case ErrorCode.USER_ERROR_HOT_POINT_EXISTS:
                        errorInfo = Translate('IDCS_TARGET_LIBRARY_GROUP_NOT_EXIST')
                        break
                    case ErrorCode.USER_ERROR_CANNOT_DEL_CUR_USER:
                        errorInfo = Translate('IDCS_TARGET_LIBRARY_GROUP_DATABASE_FULL')
                        break
                    case ErrorCode.USER_ERROR_NO_AUTH:
                        errorInfo = Translate('IDCS_NO_PERMISSION')
                        break
                    case ErrorCode.USER_ERROR_FILE_MISMATCHING:
                        errorInfo = Translate('IDCS_NO_DISK')
                        break
                    case ErrorCode.USER_ERROR_SERVER_NO_EXISTS:
                        errorInfo = Translate('IDCS_INVALID_PARAMETER')
                        break
                    case ErrorCode.USER_ERROR_NODE_ID_EXISTS:
                        const name = $('/response/content/name').text()
                        const similarity = $('/response/content/similarity').text() + '%'
                        openMessageTipBox({
                            type: 'question',
                            message: Translate('IDCS_TARGET_LIBRARY_FACE_HAS_EXIST').formatForLang(name, similarity),
                        }).then(() => {
                            pageData.value.forceCreate = true
                            register()
                        })
                        break
                    default:
                        errorInfo = 'IDCS_ADD_FACE_FAIL'
                        break
                }
                if (errorInfo) {
                    openMessageTipBox({
                        type: 'info',
                        message: errorInfo,
                    })
                }
            }
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
        }

        /**
         * @description 获取抓拍图像宽高
         */
        const loadImg = () => {
            const img = new Image()
            img.onload = () => {
                pageData.value.imgWidth = img.width
                pageData.value.imgHeight = img.height
            }
            img.src = displayBase64Img(prop.pic)
        }

        /**
         * @description 打开弹窗时 初始化数据
         */
        const open = async () => {
            formRef.value?.resetFields()
            formRef.value?.clearValidate()
            if (!pageData.value.faceDatabaseList.length) {
                await getFaceDatabaseList()
            }
            formData.value.birthday = formatDate(new Date(), prop.dateFormat)
            loadImg()
        }

        return {
            pageData,
            open,
            close,
            formRef,
            formData,
            formRule,
            addGroup,
            getFaceDatabaseList,
            displayBase64Img,
            confirmAddGroup,
            verify,
            IntelFaceDBEditPop,
        }
    },
})
