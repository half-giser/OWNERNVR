/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-29 15:43:32
 * @Description: 现场预览-镜头控制视图
 */
export default defineComponent({
    props: {
        /**
         * @description 当前选中窗口的数据
         */
        winData: {
            type: Object as PropType<LiveSharedWinData>,
            required: true,
        },
    },
    emits: {
        updateSupportAz(bool: boolean) {
            return typeof bool === 'boolean'
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()

        const pageData = ref({
            // 焦点选项
            focusOptions: [] as SelectOption<string, string>[],
            // 时间间隔选项
            timeIntervalOptions: [] as SelectOption<number, string>[],
            errorMessage: '',
            errorMessageType: 'ok',
        })

        const formData = ref(new LiveLensForm())

        const cmdQueue = useCmdQueue()

        /**
         * @description 新增命令到命令队列
         * @param {string} cmd
         */
        const addCmd = (cmd: string) => {
            if (!prop.winData.chlID) {
                return
            }

            cmdQueue.add(async () => {
                const sendXml = rawXml`
                    <content>
                        <chlId>${prop.winData.chlID}</chlId>
                        <actionType>${cmd}</actionType>
                    </content>
                `
                await cameraLensCtrlCall(sendXml)
            })
        }

        /**
         * @description 获取聚焦类型选项
         * @param {strng} focusType
         */
        const renderFocusTypeOptions = (focusType: string) => {
            pageData.value.focusOptions = []
            if (/(manual){1}/g.test(focusType)) {
                pageData.value.focusOptions.push({
                    label: Translate('IDCS_MANUAL_FOCUS'),
                    value: 'manual',
                })
            }

            if (/(auto){1}/g.test(focusType)) {
                pageData.value.focusOptions.push({
                    label: Translate('IDCS_AUTO_FOCUS'),
                    value: 'auto',
                })
            }
        }

        /**
         * @description 显示时间间隔文案
         * @param {number} value
         * @returns {string}
         */
        const displayTimeInterval = (value: number) => {
            if (value === 0) {
                return Translate('IDCS_ALWAYS_KEEP')
            }
            return getTranslateForSecond(value)
        }

        /**
         * @description 获取当前通道是否支持镜头控制
         */
        const getSupportAz = async () => {
            if (prop.winData.isPolling) {
                ctx.emit('updateSupportAz', false)
                return
            }

            const chlID = prop.winData.chlID
            const sendXml = rawXml`
                <condition>
                    <chlId>${chlID}</chlId>
                </condition>
            `
            const result = await queryCameraLensCtrlParam(sendXml)
            const $ = queryXml(result)
            if ($('status').text() === 'fail' || !$('content/chl').length) {
                ctx.emit('updateSupportAz', false)
            } else {
                ctx.emit('updateSupportAz', true)

                const focusType = $('types/focusType').text()
                renderFocusTypeOptions(focusType)

                pageData.value.timeIntervalOptions = $('content/chl/timeIntervalNote')
                    .text()
                    .array()
                    .map((item) => {
                        const value = Number(item)
                        return {
                            value,
                            label: displayTimeInterval(value),
                        }
                    })

                formData.value.focusType = $('content/focusType').text() !== 'auto' ? 'manual' : 'auto'
                if (formData.value.focusType === 'auto') {
                    formData.value.focusTime = $('content/timeInterval').text().num()
                }
                formData.value.irchangeFocus = $('content/chl/IrchangeFocus').text().bool()
            }
        }

        const showErrorMessage = (type: string, message: string) => {
            pageData.value.errorMessageType = type
            pageData.value.errorMessage = message
        }

        /**
         * @description 更新镜头控制参数
         */
        const setData = async () => {
            if (!prop.winData.chlID) {
                return
            }

            try {
                const sendXml = rawXml`
                    <content>
                        <chl id="${prop.winData.chlID}">
                            <focusType type="focusType">${formData.value.focusType}</focusType>
                            <IrchangeFocus>${formData.value.irchangeFocus}</IrchangeFocus>
                            <timeInterval>${formData.value.focusType === 'manual' ? 0 : formData.value.focusTime}</timeInterval>
                        </chl>
                    </content>
                `
                const result = await editCameraLensCtrlParam(sendXml)
                const $ = queryXml(result)
                if ($('status').text() === 'success') {
                    showErrorMessage('ok', Translate('IDCS_SAVE_DATA_SUCCESS'))
                } else if ($('errorCode').text().num() === 0) {
                    showErrorMessage('ok', Translate('IDCS_SAVE_DATA_SUCCESS'))
                } else {
                    showErrorMessage('error', Translate('IDCS_SAVE_DATA_FAIL'))
                }
            } catch (e) {
                showErrorMessage('error', Translate('IDCS_SAVE_DATA_FAIL'))
            }
        }

        watch(
            () => prop.winData.chlID,
            (newVal) => {
                if (newVal) {
                    getSupportAz()
                    cmdQueue.clean()
                }
            },
            {
                immediate: true,
            },
        )

        return {
            pageData,
            formData,
            setData,
            addCmd,
        }
    },
})
