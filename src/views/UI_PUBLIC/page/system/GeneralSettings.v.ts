/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-24 15:06:48
 * @Description: 基本配置
 */
import { type FormRules } from 'element-plus'
import { SystemGeneralSettingForm } from '@/types/apiType/system'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()

        const formRef = useFormRef()
        const formData = ref(new SystemGeneralSettingForm())

        const decoderCardMap: Record<number, { [index: number]: string; onlineStatus: boolean }> = {}

        const pageData = ref({
            // 是否显示输出配置
            isOutputConfig: systemCaps.supportHdmiVgaSeparate,
            // 输出配置选项
            outputConfigOption: [
                {
                    label: Translate('IDCS_SAME_SOURCE'),
                    value: 0,
                },
                {
                    label: Translate('IDCS_DIFF_SOURCE'),
                    value: 1,
                },
            ],
            // 等待时长选项
            waitTimeOption: [] as SelectOption<number, string>[],
            // 视频格式选项
            videoFormatOption: [] as SelectOption<string, string>[],
            // 当前视频格式
            currrentVideoFormat: '',
            // 当前输入配置
            currentOutputConfig: '',
            // 是否显示零操作添加IPC选项
            isZeroOrAddIpc: systemCaps.supportZeroOprAdd,
            // 分辨率选项
            resolutionOptions: [] as string[][],
            // 分辨率提示
            resolutionTip: '',
            // 分辨率类型
            resolutionType: [] as string[],
            // 语言类型选项
            langType: [] as string[],
            // 解码器选项
            decoderOptions: {} as Record<number, Record<number, string[]>>,
        })

        // 表单验证规则
        const rules = ref<FormRules>({
            deviceName: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (!value.trim()) {
                            callback(new Error(Translate('IDCS_PROMPT_DEVICE_NAME_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            deviceNumber: [
                {
                    validator: (_rule, value: number | undefined | null, callback) => {
                        if (typeof value !== 'number') {
                            callback(new Error(Translate('IDCS_PROMPT_DEVICE_NUMBER_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        // 8k分辨率
        const RES_8K = ['7680x4320(30)', '7680x4320(60)']
        // 4k分辨率
        const RES_4K = ['3840x2160(30)', '3840x2160(60)']

        /**
         * @description 视频制式改变，提示重启
         */
        const hanelChangeVideoFormat = () => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_VIDEO_FORMAT_EDIT_AFTER_REBOOT'),
            })
                .then(() => {
                    setData()
                })
                .catch(() => {
                    formData.value.videoFormat = pageData.value.currrentVideoFormat
                })
        }

        /**
         * @description 输出配置改变，提示重启
         */
        const handleChangeOutputConfig = () => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_EDIT_AFTER_REBOOT').formatForLang(Translate('IDCS_OUTPUT_CONFIG')),
            })
                .then(() => {
                    setData()
                })
                .catch(() => {
                    formData.value.outputConfig = pageData.value.currentOutputConfig
                })
        }

        /**
         * @description 主/副屏Label的格式化文案
         * @param {number} value
         */
        const displayResolutionLabel = (value: number) => {
            if (value === 0) {
                return Translate('IDCS_MAIN_SCREEN')
            }

            if (systemCaps.outputScreensCount === 2) {
                return Translate('IDCS_SECOND_SCREEN')
            }
            return Translate('IDCS_SECOND_SCREEN') + value
        }

        /**
         * @description 获取主副输入的选项卡是否禁用
         * @param {number} value
         */
        const getResolutionDisabled = (value: number) => {
            if (value === 0) {
                return !formData.value.outputAdapt
            }

            if (value === 1) {
                return ['7680x4320(30)', '7680x4320(60)'].includes(formData.value.resolution[0])
            }
            return false
        }

        /**
         * @description 获取主副输入的选项
         * @param {number} value
         */
        const getResolutionOptions = (value: number, options: string[]) => {
            if (value === 2) {
                const mainOutputValue = formData.value.resolution[0] // 获取主输出的值
                const option: string[] = []
                options.forEach((item) => {
                    if (RES_8K.includes(mainOutputValue)) {
                        // 辅输出2移除4K分辨率选项
                        if (!RES_4K.includes(item)) {
                            option.push(item)
                        }
                    } else {
                        option.push(item)
                    }
                })
                return arrayToOptions(option)
            }
            return arrayToOptions(options)
        }

        // 根据主输入选中的值，更新副输出2选中的值
        watch(
            () => formData.value.resolution[0],
            (mainOutputValue) => {
                // 1）若辅输出2当前值为4K分辨率，则移除4K后取值2K分辨率
                // 2）若辅输出2当前值为非4K分辨率，则取值不变
                if (RES_8K.includes(mainOutputValue) && RES_4K.includes(formData.value.resolution[2])) {
                    formData.value.resolution[2] = '1920x1080'
                }
            },
        )

        /**
         * @description 获取解码卡Label
         * @param {number} key
         * @param {number} key2
         */
        const displayDecoderLabel = (key: number, key2: number) => {
            return `${Translate('IDCS_DECODE_CARD')}${Number(key) + 1} ${Translate('IDCS_OUTPUT')}${Number(key2) + 1}`
        }

        /**
         * @description 获取和回显表单数据
         */
        const getData = async () => {
            openLoading()
            const result = await queryBasicCfg()
            const $ = queryXml(result)

            formData.value.deviceName = $('content/name').text()
            formData.value.deviceNumber = $('content/deviceNumber').text().num()
            formData.value.enableAutoDwell = $('content/autoDwell').text().bool()

            formData.value.waitTime = $('content/autoDwellWaitTime').text().num()
            pageData.value.waitTimeOption = $('types/autoDwellWaitTime/enum').map((item) => {
                const value = item.text().num()
                return {
                    label: getTranslateForSecond(value),
                    value,
                }
            })

            formData.value.videoFormat = $('content/videoType').text()
            pageData.value.currrentVideoFormat = formData.value.videoFormat
            pageData.value.videoFormatOption = $('types/videoType/enum').map((item) => {
                return {
                    label: item.text(),
                    value: item.text(),
                }
            })

            formData.value.enableGuide = $('content/bootWizardSwitch').text().bool()
            if (formData.value.enableGuide) {
                formData.value.zeroOrAddIpc = $('content/bootZeroCfgAddSwitch').text().bool()
            } else {
                pageData.value.isZeroOrAddIpc = false
            }

            // NLYC-48：同源异源输出配置
            if (systemCaps.supportHdmiVgaSeparate) {
                formData.value.outputConfig = $('content/hdmivgaParam').text()
                pageData.value.currentOutputConfig = formData.value.outputConfig
            }

            // 显示多路输出分辨率
            $('content/resolution/item').forEach((item) => {
                const index = item.attr('index').num()
                formData.value.resolution[index] = item.text()
                if (index === 0) {
                    formData.value.outputAdapt = item.attr('set').bool()
                    // 主输出分辨率枚举值
                    const mainOutputList = $('types/resolution/output[@index="0"]/enum').map((enumValue) => {
                        return enumValue.text()
                    })
                    // 支持8k,则在主输出后拼接8k提示
                    const findIndex = mainOutputList.findIndex((res) => RES_8K.includes(res))
                    if (findIndex > -1) {
                        pageData.value.resolutionTip = Translate('IDCS_RESOLUTION_8K').formatForLang(Translate('IDCS_MAIN_SCREEN'), '8K', Translate('IDCS_SECOND_SCREEN') + 1)
                    }
                    pageData.value.resolutionOptions[index] = mainOutputList
                } else if (systemCaps.outputScreensCount > 1) {
                    pageData.value.resolutionOptions[index] = $(`types/resolution/output[@index="${index}"]/enum`).map((enumValue) => {
                        return enumValue.text()
                    })
                }
            })

            // TODO 解码卡输出部分需要测试数据才能测试
            // 解码卡输出排序
            const decoderResolutionEnumXml = $('types/DecoderResolution/decoder')
            decoderResolutionEnumXml.sort(($a, $b) => {
                return $a.attr('id').num() - $b.attr('id').num()
            })
            const decoderEnum: Record<number, Record<number, string[]>> = {}

            decoderResolutionEnumXml.forEach((item) => {
                const $item = queryXml(item.element)
                const id = item.attr('id').num()

                if (!decoderEnum[id]) {
                    decoderEnum[id] = {}
                }
                $item('output').forEach((element) => {
                    const $element = queryXml(element.element)
                    const outputIndex = element.attr('index').num()

                    if (!decoderCardMap[id]) {
                        // 用id区分属于哪一解码卡的输出
                        decoderCardMap[id] = {
                            onlineStatus: false,
                        }
                    }
                    decoderCardMap[id][outputIndex] = '1920x1080' // 兼容解码卡未配置的情况，默认分辨率为
                    if (!decoderEnum[id][outputIndex]) {
                        decoderEnum[id][outputIndex] = []
                    }
                    $element('enum').forEach((output) => {
                        decoderEnum[id][outputIndex].push(output.text())
                    })
                })
            })

            $('content/decoderResolution/decoder').forEach((item) => {
                const $item = queryXml(item.element)
                const decoderId = item.attr('id').num()
                const onlineStatus = item.attr('onlineStatus').bool()
                decoderCardMap[decoderId].onlineStatus = onlineStatus

                if (!$item('item').length) {
                    return // 如果解码卡未配置，则取默认值，不更新decoderCardMap
                }

                $item('item').forEach((element) => {
                    const index = element.attr('index').num() // 解码卡的输出序号
                    const value = element.text()
                    decoderCardMap[decoderId][index] = value
                })
            })
            Object.keys(decoderEnum).forEach((key) => {
                const id = Number(key)
                pageData.value.decoderOptions[id] = []
                if (!decoderCardMap[id].onlineStatus) return // 解码卡不在线，则页面不显示解码卡
                Object.keys(decoderEnum[id]).forEach((key2) => {
                    const outputIndex = Number(key2)
                    const element = decoderEnum[id][outputIndex]
                    pageData.value.decoderOptions[id][outputIndex] = element
                    formData.value.decoder[id][outputIndex] = decoderCardMap[id][outputIndex]
                })
            })

            pageData.value.langType = $('types/langType/enum').map((item) => item.text())
            pageData.value.resolutionType = $('types/resolutionType/enum').map((item) => item.text())

            closeLoading()
        }

        /**
         * @description 表单验证
         */
        const verify = () => {
            formRef.value!.validate((valid) => {
                if (valid) {
                    setData()
                }
            })
        }

        /**
         * @description 保存数据
         */
        const setData = async () => {
            openLoading()

            const getDecoderItem = (key: number) => {
                return Object.keys(formData.value.decoder[key])
                    .map((outputIndex) => {
                        if (decoderCardMap[key].onlineStatus) {
                            return `<item index="${outputIndex}">${formData.value.decoder[key][Number(outputIndex)]}</item>`
                        }
                        return ''
                    })
                    .join('')
            }

            const sendXml = rawXml`
                <types>
                    <langType>${pageData.value.langType.map((item) => `<enum>${item}</enum>`).join('')}</langType>
                    <resolutionType>${pageData.value.resolutionType.map((item) => `<enum>${item}</enum>`).join('')}</resolutionType>
                </types>
                <content>
                    <name maxByteLen="63">${wrapCDATA(formData.value.deviceName)}</name>
                    <deviceNumber>${formData.value.deviceNumber}</deviceNumber>
                    <videoType type="videoType">${formData.value.videoFormat}</videoType>
                    <hdmivgaParam type="hdmivgaParam">${formData.value.outputConfig}</hdmivgaParam>
                    <resolution>
                        ${formData.value.resolution.map((item, index) => `<item index="${index}" set="${formData.value.outputAdapt}">${item}</item>`).join('')}
                    </resolution>
                    <bootWizardSwitch>${formData.value.enableGuide}</bootWizardSwitch>
                    <mobileStreamAdaption>${formData.value.mobileStreamAdaption}</mobileStreamAdaption>
                    ${pageData.value.isZeroOrAddIpc ? `<bootZeroCfgAddSwitch>${formData.value.zeroOrAddIpc}</bootZeroCfgAddSwitch>` : ''}
                    <decoderResolution>
                        ${Object.keys(formData.value.decoder)
                            .map((key) => {
                                return `<decoder id="${key}">${getDecoderItem(Number(key))}</decoder>`
                            })
                            .join('')}
                    </decoderResolution>
                    <autoDwell>${formData.value.enableAutoDwell}</autoDwell>
                    <autoDwellWaitTime>${formData.value.waitTime}</autoDwellWaitTime>
                </content>
            `
            const result = await editBasicCfg(sendXml)

            closeLoading()
            commSaveResponseHandler(result)
        }

        onMounted(() => {
            getData()
        })

        return {
            RES_8K,
            RES_4K,
            rules,
            formRef,
            formData,
            pageData,
            displayResolutionLabel,
            hanelChangeVideoFormat,
            handleChangeOutputConfig,
            getResolutionDisabled,
            getResolutionOptions,
            displayDecoderLabel,
            formatInputMaxLength,
            verify,
            arrayToOptions,
        }
    },
})
