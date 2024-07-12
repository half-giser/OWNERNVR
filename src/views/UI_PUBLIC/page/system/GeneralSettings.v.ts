/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-24 15:06:48
 * @Description: 基本配置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-12 17:46:50
 */
import { type FormInstance, type FormRules } from 'element-plus'
import { SystemGeneralSettingForm } from '@/types/apiType/system'
import { ref } from 'vue'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const systemCaps = useCababilityStore()

        const formRef = ref<FormInstance>()
        const formData = ref(new SystemGeneralSettingForm())

        const decoderCardMap: Record<number, { [index: number]: string; onlineStatus: boolean }> = {}

        const pageData = ref({
            isOutputConfig: systemCaps.supportHdmiVgaSeparate,
            outputConfigOption: [
                {
                    name: Translate('IDCS_SAME_SOURCE'),
                    value: 0,
                },
                {
                    name: Translate('IDCS_DIFF_SOURCE'),
                    value: 1,
                },
            ],
            waitTimeOption: [] as number[],
            videoFormatOption: [] as string[],
            currrentVideoFormat: '',
            currentOutputConfig: '',
            isZeroOrAddIpc: systemCaps.supportZeroOprAdd,
            resolutionOptions: [] as string[][],
            resolutionTip: '',
            resolutionType: [] as string[],
            langType: [] as string[],
            decoderOptions: {} as Record<number, Record<number, string[]>>,
        })

        // 表单验证规则
        const rules = ref<FormRules>({
            deviceName: [
                {
                    validator: (rule, value: string, callback) => {
                        if (!value.length) {
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
                    validator: (rule, value: string, callback) => {
                        if (String(value).length === 0) {
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
            openMessageTipBox({
                type: 'question',
                title: Translate('IDCS_INFO_TIP'),
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
            openMessageTipBox({
                type: 'question',
                title: Translate('IDCS_INFO_TIP'),
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
         * @description 等待时长选项的格式化文案
         * @param {number} value 秒
         */
        const displayWaitTimeOption = (value: number) => {
            if (value > 60) {
                return value / 60 + Translate('IDCS_MINUTE')
            }
            return value + Translate('IDCS_SECONDS')
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
                return option
            }
            return options
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
         * @param key
         * @param key2
         */
        const displayDecoderLabel = (key: number, key2: number) => {
            return `${Translate('IDCS_DECODE_CARD')}${key + 1} ${Translate('IDCS_OUTPUT')}${key2 + 1}`
        }

        /**
         * @description 获取和回显表单数据
         */
        const getData = async () => {
            openLoading(LoadingTarget.FullScreen)
            const result = await queryBasicCfg(getXmlWrapData(''))
            const $ = queryXml(result)

            formData.value.deviceName = $('/response/content/name').text()
            formData.value.deviceNumber = Number($('/response/content/deviceNumber').text())
            formData.value.enableAutoDwell = $('/response/content/autoDwell').text().toBoolean()

            formData.value.waitTime = Number($('/response/content/autoDwellWaitTime').text())
            pageData.value.waitTimeOption = []
            $('/response/types/autoDwellWaitTime/enum').forEach((item) => {
                pageData.value.waitTimeOption.push(Number(item.text()))
            })

            formData.value.videoFormat = $('/response/content/videoType').text()
            pageData.value.currrentVideoFormat = formData.value.videoFormat
            pageData.value.videoFormatOption = []
            $('/response/types/videoType/enum').forEach((item) => {
                pageData.value.videoFormatOption.push(item.text())
            })

            formData.value.enableGuide = $('/response/content/bootWizardSwitch').text().toBoolean()
            if (formData.value.enableGuide) {
                formData.value.zeroOrAddIpc = $('/response/content/bootZeroCfgAddSwitch').text().toBoolean()
            } else {
                pageData.value.isZeroOrAddIpc = false
            }

            // NLYC-48：同源异源输出配置
            if (systemCaps.supportHdmiVgaSeparate) {
                formData.value.outputConfig = $('/response/content/hdmivgaParam').text()
                pageData.value.currentOutputConfig = formData.value.outputConfig
            }

            // 显示多路输出分辨率
            $('/response/content/resolution/item').forEach((item) => {
                const index = Number(item.attr('index'))
                formData.value.resolution[index] = item.text()
                if (index === 0) {
                    formData.value.outputAdapt = item.attr('set') === 'true'
                    const mainOutputList: string[] = [] // 主输出分辨率枚举值
                    $('/response/types/resolution/output[@index="0"]/enum').forEach((enumValue) => {
                        mainOutputList.push(enumValue.text())
                    })
                    // 支持8k,则在主输出后拼接8k提示
                    const findIndex = mainOutputList.findIndex((res) => RES_8K.includes(res))
                    if (findIndex > -1) {
                        pageData.value.resolutionTip = Translate('IDCS_RESOLUTION_8K').formatForLang(Translate('IDCS_MAIN_SCREEN'), '8K', Translate('IDCS_SECOND_SCREEN') + 1)
                    }
                    pageData.value.resolutionOptions[index] = mainOutputList
                } else if (systemCaps.outputScreensCount > 1) {
                    const outputList: string[] = []
                    $(`/response/types/resolution/output[@index="${index}"]/enum`).forEach((enumValue) => {
                        outputList.push(enumValue.text())
                    })
                    pageData.value.resolutionOptions[index] = outputList
                }
            })

            // TODO 解码卡输出部分需要测试数据才能测试
            // 解码卡输出排序
            const decoderResolutionEnumXml = $('/response/types/DecoderResolution/decoder')
            const decoderEnumXml = decoderResolutionEnumXml.sort(($a, $b) => {
                return Number($a.attr('id')) - Number($b.attr('id'))
            })
            const decoderEnum: Record<number, Record<number, string[]>> = {}

            decoderEnumXml.forEach((item) => {
                const $item = queryXml(item.element)
                const id = Number(item.attr('id'))

                if (!decoderEnum[id]) {
                    decoderEnum[id] = {}
                }
                $item('output').forEach((element) => {
                    const $element = queryXml(element.element)
                    const outputIndex = Number(element.attr('index'))

                    if (!decoderCardMap[id]) {
                        // 用id区分属于哪一解码卡的输出
                        decoderCardMap[id] = {
                            onlineStatus: false,
                        } as { [index: number]: string; onlineStatus: boolean }
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

            const decodeResolutionXml = $('/response/content/decoderResolution/decoder')
            decodeResolutionXml.forEach((item) => {
                const $item = queryXml(item.element)
                const decoderId = Number(item.attr('id'))
                const onlineStatus = item.attr('onlineStatus') === 'true'
                decoderCardMap[decoderId].onlineStatus = onlineStatus

                if (!$item('item').length) {
                    return // 如果解码卡未配置，则取默认值，不更新decoderCardMap
                }

                $item('item').forEach((element) => {
                    const index = Number(element.attr('index')) // 解码卡的输出序号
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

            pageData.value.langType = $('/response/types/langType/enum').map((item) => item.text())
            pageData.value.resolutionType = $('/response/types/resolutionType/enum').map((item) => item.text())

            closeLoading(LoadingTarget.FullScreen)
        }

        /**
         * @description 表单验证
         */
        const verify = () => {
            formRef.value?.validate((valid) => {
                if (valid) {
                    setData()
                }
            })
        }

        const setData = async () => {
            openLoading(LoadingTarget.FullScreen)

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

            const decoderXml = Object.keys(formData.value.decoder)
                .map((key) => {
                    return `<decoder id="${key}">${getDecoderItem(Number(key))}</decoder>`
                    // formData.value.decoder[number]
                })
                .join('')

            const sendXml = rawXml`
                <types>
                    <langType>${pageData.value.langType.map((item) => `<enum>${item}</enum>`).join('')}</langType>
                    <resolutionType>${pageData.value.resolutionType.map((item) => `<enum>${item}</enum>`).join('')}</resolutionType>
                </types>
                <content>
                    <name>${wrapCDATA(formData.value.deviceName)}</name>
                    <deviceNumber>${String(formData.value.deviceNumber)}</deviceNumber>
                    <videoType type="videoType">${formData.value.videoFormat}</videoType>
                    <hdmivgaParam type="hdmivgaParam">${formData.value.outputConfig}</hdmivgaParam>
                    <resolution>
                        ${formData.value.resolution.map((item, index) => `<item index="${index}" set="${formData.value.outputAdapt}">${item}</item>`).join('')}
                    </resolution>
                    <bootWizardSwitch>${String(formData.value.enableGuide)}</bootWizardSwitch>
                    <mobileStreamAdaption>${String(formData.value.mobileStreamAdaption)}</mobileStreamAdaption>
                    ${pageData.value.isZeroOrAddIpc ? `<bootZeroCfgAddSwitch>${String(formData.value.zeroOrAddIpc)}</bootZeroCfgAddSwitch>` : ''}
                    <decoderResolution>${decoderXml}</decoderResolution>
                    <autoDwell>${String(formData.value.enableAutoDwell)}</autoDwell>
                    <autoDwellWaitTime>${String(formData.value.waitTime)}</autoDwellWaitTime>
                </content>
            `
            const result = await editBasicCfg(sendXml)

            closeLoading(LoadingTarget.FullScreen)
            commSaveResponseHadler(result)
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
            nameByteMaxLen,
            pageData,
            displayWaitTimeOption,
            displayResolutionLabel,
            hanelChangeVideoFormat,
            handleChangeOutputConfig,
            getResolutionDisabled,
            getResolutionOptions,
            displayDecoderLabel,
            formatInputMaxLength,
            verify,
        }
    },
})
