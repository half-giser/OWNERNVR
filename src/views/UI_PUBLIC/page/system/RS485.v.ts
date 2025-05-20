/**
 * @Date: 2025-05-04 16:02:54
 * @Description: RS485
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
import type { FormRules } from 'element-plus'
import RS485AddPop from './RS485AddPop.vue'

export default defineComponent({
    components: {
        RS485AddPop,
    },
    setup() {
        const { Translate } = useLangStore()

        const OPERATE_TYPE_MAP: Record<string, string> = {
            Up: Translate('IDCS_OP_UP'),
            Down: Translate('IDCS_OP_DOWN'),
            Left: Translate('IDCS_OP_LEFT'),
            Right: Translate('IDCS_OP_RIGHT'),
            LeftUp: Translate('IDCS_OP_LEFTUP'),
            LeftDown: Translate('IDCS_OP_LEFTDOWN'),
            RightUp: Translate('IDCS_OP_RIGHTUP'),
            RightDown: Translate('IDCS_OP_RIGHTDOWN'),
            Stop: Translate('IDCS_OP_STOP'),
        }

        const pageData = ref({
            isAddPop: false,
            addPopType: 'add',
            protocolTypeList: [] as SelectOption<string, string>[],
            operateTypeList: [] as SelectOption<string, string>[],
            forbiddenCharsList: [] as string[], // 提示信息用
            // forbiddenCharsListFormat: [] as string[], // 转换正则表达式用
            baudRateTypeList: [] as SelectOption<number, string>[],
            maxCount: 0,
            count: 0,
            switch: false,
            popData: new SystemRS485Dto(),
            isNameOutOfRange: false,
            isNameIllegal: false,
        })

        const tableData = ref<SystemRS485Dto[]>([])

        const formData = ref(new SystemRS485Form())

        const formRef = useFormRef()

        const formRules = ref<FormRules>({
            name: [
                {
                    validator(_rule, value: string, callback) {
                        if (!value.trim()) {
                            callback(new Error(Translate('IDCS_NAME_EMPTY')))
                            return
                        }

                        if (pageData.value.isNameOutOfRange) {
                            callback(new Error(Translate('IDCS_CHARACTER_LENGTH_FORMAT').formatForLang(32)))
                            pageData.value.isNameOutOfRange = false
                            return
                        }

                        if (pageData.value.isNameIllegal) {
                            callback(new Error(Translate('IDCS_RS485_INVALID_NAME')))
                            pageData.value.isNameIllegal = false
                            return
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        const add = () => {
            pageData.value.isAddPop = true
            pageData.value.addPopType = 'add'
            pageData.value.popData = new SystemRS485Dto()
        }

        const edit = (row: SystemRS485Dto) => {
            pageData.value.isAddPop = true
            pageData.value.addPopType = 'edit'
            pageData.value.popData = row
        }

        const delAll = () => {
            if (!tableData.value.length) {
                return
            }

            openMessageBox({
                type: 'question',
                message: Translate('IDCS_SURE_DEL_ALL_OP'),
            }).then(() => {
                const ids = tableData.value.map((item) => item.id)
                delOperate(ids)
            })
        }

        const del = (row: SystemRS485Dto) => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_SURE_DELETE_OP').formatForLang(row.name),
            }).then(() => {
                delOperate([row.id])
            })
        }

        const getCustomOperateInfo = async () => {
            openLoading()

            const result = await queryCustomOperateInfo()
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                formData.value.switch = $('content/switch').text().bool()
                formData.value.name = $('content/name').text() || Translate('IDCS_RS485_SET')
                pageData.value.switch = formData.value.switch

                pageData.value.protocolTypeList = $('types/protocolType/enum').map((item) => {
                    return {
                        label: item.text() === 'CUSTOMIZE' ? Translate('IDCS_CUSTOMIZED') : item.text(),
                        value: item.text(),
                    }
                })

                pageData.value.operateTypeList = $('types/operateType/enum').map((item) => {
                    return {
                        label: OPERATE_TYPE_MAP[item.text()],
                        value: item.text(),
                    }
                })

                pageData.value.baudRateTypeList = $('types/baudRateType/enum').map((item) => {
                    return {
                        label: item.text(),
                        value: item.text().num(),
                    }
                })

                pageData.value.forbiddenCharsList = $('types/forbiddenChars/item').map((item) => {
                    return item.text()
                })

                // pageData.value.forbiddenCharsListFormat = pageData.value.forbiddenCharsList.map((item) => {
                //     return `\\${item}`
                // })

                pageData.value.maxCount = $('content/operateInfos').attr('maxCount').num()
                pageData.value.count = $('content/operateInfos').attr('count').num()
                tableData.value = $('content/operateInfos/item').map((item) => {
                    const $item = queryXml(item.element)
                    const baudrate = $item('baudrate').text().num()
                    const addrID = $item('addrID').text().num()
                    const protocol = $item('protocol').text()
                    const code = $item('code').text()
                    const operate = $item('operate').text()

                    return {
                        id: item.attr('id'),
                        name: $item('name').text(),
                        baudrate: baudrate,
                        addrID: addrID,
                        protocol: $item('protocol').text(),
                        code: code,
                        operate: operate,
                        settingInfos: protocol === 'CUSTOMIZE' ? `${baudrate}_${addrID}_${code}` : `${baudrate}_${addrID}_${protocol}_${OPERATE_TYPE_MAP[operate]}`,
                    }
                })
            }
        }

        const delOperate = async (ids: string[]) => {
            openLoading()

            const sendXml = rawXml`
                <content>
                    <operateInfos>
                        ${ids.map((item) => `<item id="${item}"></item>`).join('')}
                    </operateInfos>
                </content>
            `
            const result = await removeCustomOperateList(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                getCustomOperateInfo()
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_DELETE_SUCCESS'),
                })
            } else {
                const errorCode = $('errorCode').text().num()
                if (errorCode === 536870941) {
                    openMessageBox(Translate('IDCS_DELETED'))
                } else {
                    openMessageBox(Translate('IDCS_DELETE_FAIL'))
                }
            }
        }

        const test = async (id: string) => {
            const sendXml = rawXml`
                <content>
                    <id>${id}</id>
                </content>
            `
            const result = await executeCustomOperate(sendXml)
            const $ = queryXml(result)

            if ($('status').text() === 'success') {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_TEST_SUCCESS'),
                })
            } else {
                const errorCode = $('errorCode').text().num()
                let errorMsg = Translate('IDCS_TEST_FAIL')
                if (errorCode === 536870922) {
                    errorMsg = Translate('IDCS_SELECT_INVALID_OP')
                }
                openMessageBox(errorMsg)
            }
        }

        const setData = () => {
            formRef.value?.validate(async (valid) => {
                if (valid) {
                    openLoading()

                    const sendXml = rawXml`
                        <content>
                            <switch>${formData.value.switch}</switch>
                            <name>${wrapCDATA(formData.value.name)}</name>
                        </content>
                    `
                    const result = await editCustomOperateInfo(sendXml)
                    const $ = queryXml(result)

                    closeLoading()

                    if ($('status').text() === 'success') {
                        pageData.value.switch = formData.value.switch
                    }
                }
            })
        }

        const handleNameOutOfRange = () => {
            pageData.value.isNameOutOfRange = true
            formRef.value?.validateField('name')
        }

        const formatName = (str: string) => {
            const regexp = new RegExp(`[${pageData.value.forbiddenCharsList.map((item) => `\\${item}`).join('')}]`)
            if (regexp.test(str.trim())) {
                pageData.value.isNameIllegal = true
                formRef.value?.validateField('name')
                return str.replace(regexp, '')
            }
            return str
        }

        const confirmAdd = () => {
            pageData.value.isAddPop = false
            getCustomOperateInfo()
        }

        onMounted(() => {
            getCustomOperateInfo()
        })

        return {
            add,
            setData,
            delAll,
            edit,
            test,
            del,
            formData,
            tableData,
            formRules,
            formRef,
            pageData,
            handleNameOutOfRange,
            formatName,
            confirmAdd,
        }
    },
})
