/*
 * @Date: 2025-05-08 13:44:22
 * @Description: 客流量配置
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const userSession = useUserSessionStore()

        const RESET_MODE_MAPPING: Record<string, string> = {
            DAY: Translate('IDCS_TIME_DAY'),
            WEEK: Translate('IDCS_TIME_WEEK'),
            MONTH: Translate('IDCS_TIME_MOUNTH'),
            OFF: Translate('IDCS_OFF'),
        }

        const formData = ref(new BusinessPassengerFlowConfigForm())

        const pageData = ref({
            isPop: false,
            resetModeOptions: [] as SelectOption<string, string>[],
            weekOption: objectToOptions(getTranslateMapping(DEFAULT_WEEK_MAPPING), 'number'),
            monthOption: Array(31)
                .fill(0)
                .map((_, index) => {
                    const i = (index + 1).toString()
                    return {
                        value: i,
                        label: i + Translate('IDCS_TIMING_SEND_EMAIL_DAY'),
                    }
                }),
            chlList: [] as SelectOption<string, string>[],
            startStatisticalTime: '',
        })

        const getData = async () => {
            const result = await queryPassengerFlowStatisticsConfig()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                formData.value.switch = $('content/resetCfg/autoReset/switch').text().bool()
                formData.value.resetMode = $('content/resetCfg/autoReset/resetMode').text()
                formData.value.resetDay = $('content/resetCfg/autoReset/resetDay').text().num()
                formData.value.resetTime = $('content/resetCfg/autoReset/resetTime').text()
                // 统计开始时间
                pageData.value.startStatisticalTime = $('content/startStatisticalTime').text()

                if (formData.value.resetDay === 7 && formData.value.resetMode === 'WEEK') {
                    formData.value.resetDay = 0
                }

                pageData.value.resetModeOptions = $('types/resetMode/enum')
                    .map((item) => {
                        return {
                            label: RESET_MODE_MAPPING[item.text()],
                            value: item.text(),
                        }
                    })
                    .reverse()

                formData.value.chlList = $('content/chls/item').map((item) => {
                    return {
                        value: item.attr('id'),
                        label: item.attr('name'),
                    }
                })
            } else {
                const errorCode = $('errorCode').text().num()
                if (errorCode === ErrorCode.USER_ERROR_NO_AUTH) {
                    openMessageBox(Translate('IDCS_NO_PERMISSION'))
                }
            }
        }

        const linkedChlList = computed(() => {
            return formData.value.chlList.map((item) => item.value)
        })

        const changeResetMode = () => {
            formData.value.resetDay = 1
            formData.value.resetTime = '00:00:00'
        }

        const getChannelList = async () => {
            const result = await getChlList({
                nodeType: 'chls',
                requireField: ['supportBinocularCountConfig'],
            })
            const $ = queryXml(result)

            if ($('status').text() === 'success') {
                $('content/item').forEach((item) => {
                    const $item = queryXml(item.element)

                    if (!$item('supportBinocularCountConfig').text().bool()) {
                        return
                    }

                    pageData.value.chlList.push({
                        value: item.attr('id'),
                        label: $item('name').text(),
                    })
                })
            }
        }

        const hasAuth = () => {
            if (!userSession.hasAuth('businessCfg')) {
                openMessageBox(Translate('IDCS_NO_PERMISSION'))
                return false
            }

            return true
        }

        const reset = () => {
            if (!hasAuth()) {
                return
            }

            openMessageBox({
                type: 'question',
                message: Translate('IDCS_RESET_TIP'),
            }).then(async () => {
                openLoading()
                const result = await resetPassengerFlowStatistics()
                const $ = queryXml(result)

                if ($('status').text() === 'success') {
                    openMessageBox(Translate('IDCS_RESET_SUCCESSED'))
                } else {
                    openMessageBox(Translate('IDCS_SAVE_DATA_FAIL'))
                }
            })
        }

        const setData = async () => {
            if (!hasAuth()) {
                return
            }

            openLoading()

            const sendXml = rawXml`
                <content>
                    <startStatisticalTime>${pageData.value.startStatisticalTime}</startStatisticalTime>
                    <resetCfg>
                        <autoReset>
                            <switch>${formData.value.switch}</switch>
                            <resetMode>${formData.value.resetMode}</resetMode>
                            <resetTime>${formData.value.resetTime}</resetTime>
                            ${['WEEK', 'MONTH'].includes(formData.value.resetMode) ? `<resetDay>${formData.value.resetMode === 'WEEK' && formData.value.resetDay === 0 ? 7 : formData.value.resetDay}</resetDay>` : ''}
                        </autoReset>
                    </resetCfg>
                    <chls>
                        ${formData.value.chlList.map((item) => `<item id="${item.value}" />`).join('')}
                    </chls>
                </content>
            `
            const result = await editPassengerFlowStatisticsConfig(sendXml)
            const $ = queryXml(result)

            if ($('status').text() === 'success') {
                openMessageBox(Translate('IDCS_SAVE_DATA_SUCCESS'))
            } else {
                const errorCode = $('errorCode').text().num()
                let errorMsg = Translate('IDCS_SAVE_DATA_FAIL')
                switch (errorCode) {
                    case ErrorCode.USER_ERROR_INVALID_PARAM:
                        errorMsg = Translate('IDCS_FTP_ERROR_INVALID_PARAM')
                        break
                    case ErrorCode.USER_ERROR_NO_AUTH:
                        errorMsg = Translate('IDCS_NO_PERMISSION')
                        break
                    default:
                        break
                }
                openMessageBox(errorMsg)
            }
        }

        const openChlPop = () => {
            if (!hasAuth()) {
                return
            }

            pageData.value.isPop = true
        }

        const changeChl = (option: SelectOption<string, string>[]) => {
            formData.value.chlList = option
        }

        onMounted(async () => {
            openLoading()

            await getData()
            await getChannelList()

            closeLoading()
        })

        return {
            pageData,
            formData,
            changeResetMode,
            reset,
            linkedChlList,
            openChlPop,
            changeChl,
            setData,
        }
    },
})
