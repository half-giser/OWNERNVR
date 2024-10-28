/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-30 18:48:06
 * @Description: 人脸库 - 编辑人脸弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-28 14:07:31
 */
import { IntelFaceDBFaceForm, type IntelFaceDBGroupDto, type IntelFaceDBSnapFaceList, type IntelFaceDBFaceInfo } from '@/types/apiType/intelligentAnalysis'
import { type FormInstance } from 'element-plus'
import IntelBaseFaceItem from './IntelBaseFaceItem.vue'
import IntelFaceDBChooseFacePop from './IntelFaceDBChooseFacePop.vue'

export default defineComponent({
    components: {
        IntelFaceDBChooseFacePop,
        IntelBaseFaceItem,
    },
    props: {
        /**
         * @property 人脸信息列表
         */
        list: {
            type: Array as PropType<IntelFaceDBFaceInfo[]>,
            required: true,
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
        const { openLoading, closeLoading } = useLoading()
        const dateTime = useDateTimeStore()

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
            // 是否显示选择人脸弹窗
            isChooseFacePop: false,
            // snap | import
        })

        const formData = ref(new IntelFaceDBFaceForm())

        // 是否编辑多个
        const disabled = computed(() => {
            return prop.list.length !== 1
        })

        let snapData: IntelFaceDBSnapFaceList[]

        /**
         * @description 获取人脸分组
         */
        const getFaceGroup = async () => {
            openLoading()

            const result = await queryFacePersonnalInfoGroupList()
            const $ = queryXml(result)

            closeLoading()

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
         * @description 打开弹窗时 重置表单数据
         */
        const open = async () => {
            formData.value = new IntelFaceDBFaceForm()
            snapData = []
            if (prop.list.length === 1) {
                const item = prop.list[0]
                formData.value.name = item.name
                formData.value.sex = item.sex
                formData.value.birthday = item.birthday
                formData.value.certificateType = item.certificateType
                formData.value.certificateNum = item.certificateNum
                formData.value.mobile = item.mobile
                formData.value.number = item.number
                formData.value.note = item.note
                formData.value.nativePlace = item.nativePlace
                formData.value.pic = item.pic[0]
            }
            await getFaceGroup()
            if (pageData.value.groupList.length) {
                if (prop.groupId) {
                    formData.value.groupId = prop.groupId
                } else {
                    formData.value.groupId = pageData.value.groupList[0].groupId
                }
            }
        }

        /**
         * @description 打开选择人脸弹窗
         */
        const chooseFace = () => {
            pageData.value.isChooseFacePop = true
        }

        /**
         * @description 确认更改人脸
         * @param {IntelFaceDBSnapFaceList[]} e
         */
        const confirmChooseFace = (e: IntelFaceDBSnapFaceList[]) => {
            pageData.value.isChooseFacePop = false
            formData.value.pic = e[0].pic
            snapData = e
        }

        /**
         * @description 验证表单通道后 确认编辑数据
         */
        const verify = async () => {
            if (!disabled.value && !formData.value.name) {
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_PROMPT_FULL_NAME_EMPTY'),
                })
                return
            }

            let errorCode = 0
            if (disabled.value) {
                for (let i = 0; i < prop.list.length; i++) {
                    const item = prop.list[i]
                    errorCode = await editSingleSnapData(
                        {
                            name: item.name,
                            sex: item.sex,
                            birthday: item.birthday,
                            certificateType: item.certificateType,
                            certificateNum: item.certificateNum,
                            mobile: item.mobile,
                            number: item.number,
                            note: item.note,
                            nativePlace: item.nativePlace,
                            pic: '',
                            groupId: formData.value.groupId,
                            success: false,
                            error: false,
                        },
                        item.id,
                    )
                }
            } else {
                errorCode = await editSingleSnapData(formData.value, prop.list[0].id)
            }

            if (errorCode === -1) {
                ctx.emit('confirm')
            } else {
                let errorInfo = ''
                switch (errorCode) {
                    case ErrorCode.USER_ERROR_NO_AUTH:
                        errorInfo = Translate('IDCS_NO_PERMISSION')
                        break
                    case ErrorCode.USER_ERROR_LIVE_RECONNECT:
                        errorInfo = Translate('IDCS_FACE_PIC_TOO_SMALL')
                        break
                    case ErrorCode.USER_ERROR_INVALID_PARAM:
                        errorInfo = Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_FTP_ERROR_INVALID_PARAM')
                        break
                    case ErrorCode.USER_ERROR_SERVER_NO_EXISTS:
                        errorInfo = Translate('IDCS_INVALID_PARAMETER')
                        break
                    default:
                        errorInfo = Translate('IDCS_SAVE_FAIL')
                        break
                }
                openMessageTipBox({
                    type: 'info',
                    message: errorInfo,
                })
            }
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
        }

        /**
         * @description 编辑单个人脸数据
         * @param {IntelFaceDBFaceForm} item
         * @param {string} id
         */
        const editSingleSnapData = async (item: IntelFaceDBFaceForm, id: string) => {
            openLoading()

            const group = pageData.value.groupList.find((current) => current.groupId === item.groupId)!

            const faceXml = snapData.length
                ? rawXml`
                <delFaceImgs type="list">
                    <item>1</item>
                </delFaceImgs>
                <item>
                    <item>
                        <frameTime>${snapData[0].frameTime}</frameTime>
                        <img id="${snapData[0].imgId.toString()}" />
                        <chl id="${snapData[0].chlId}" />
                    </item>
                </item>
            `
                : ''

            const sendXml = rawXml`
                <types>
                    <sex>${wrapEnums(['male', 'female'])}</sex>
                    <certificateType>${wrapEnums(['idCard'])}</certificateType>
                    <property>${wrapEnums(['allow', 'reject', 'limited'])}</property>
                </types>
                <content>
                    <id>${id}</id>
                    <name>${item.name}</name>
                    <sex type="sex">${item.sex}</sex>
                    <birthday>${formatDate(item.birthday, 'YYYY-MM-DD', dateTime.dateFormat)}</birthday>
                    <nativePlace>${item.nativePlace}</nativePlace>
                    <certificateType type="certificateType">${item.certificateType}</certificateType>
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
                    ${faceXml}
                </content>
            `
            const result = await editFacePersonnalInfo(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('//status').text() === 'success') {
                return -1
            } else {
                return Number($('//errorCode').text())
            }
        }

        return {
            dateTime,
            disabled,
            formRef,
            formData,
            pageData,
            open,
            chooseFace,
            confirmChooseFace,
            verify,
            close,
            highlightWeekend,
            formatDigit,
            IntelFaceDBChooseFacePop,
            IntelBaseFaceItem,
        }
    },
})
