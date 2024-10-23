/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-10-23 11:22:10
 * @Description: 地标平台参数
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-10-23 15:30:55
 */

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const formData = ref({
            enable: false,
            proxyId: '',
            ip: '',
            domain: '',
            isDomain: true,
            port: 5901,
            resolution: '',
            level: '',
            holdTime: '',
        })
        const pageData = ref({
            // 获取到的地址
            defaultServerAddress: '',
            serverAddress: '',
            defaultPort: 0,
            defaultResolution: '',
            resolutionList: [] as SelectOption<string, string>[],
            defaultLevel: '',
            levelList: [] as SelectOption<string, string>[],
            defaultHoldTime: '',
            // 时间单位
            unit: '',
            holdTimeList: [] as SelectOption<string, string>[],
        })
        const getData = async () => {
            openLoading(LoadingTarget.FullScreen)
            const res = await querySHDBParam()
            closeLoading(LoadingTarget.FullScreen)
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                formData.value.enable = $('//content/platformParam/switch').text() === 'true'
                formData.value.proxyId = $('//content/platformParam/proxyId').text()
                // 地址
                const defaultServerAddress = $('//content/platformParam/serverAddr').attr('default')
                pageData.value.defaultServerAddress = defaultServerAddress == '' ? '180.166.128.182' : defaultServerAddress
                pageData.value.serverAddress = $('//content/platformParam/serverAddr').text()
                setIpValue(pageData.value.serverAddress)
                // 端口
                const defaultPort = $('//content/platformParam/port').attr('default')
                pageData.value.defaultPort = defaultPort == '' ? 5901 : Number(defaultPort)
                const port = $('//content/platformParam/port').text()
                formData.value.port = port == '' ? pageData.value.defaultPort : Number(port)
                // 分辨率
                const defaultResolution = $('//content/snapParam/resolution').attr('default')
                pageData.value.defaultResolution = defaultResolution == '' ? 'CIF' : defaultResolution
                const resolution = $('//content/snapParam/resolution').text()
                formData.value.resolution = resolution == '' ? pageData.value.defaultResolution : resolution
                const resolutionList = $('//content/snapParam/resolutionNote').text()
                pageData.value.resolutionList =
                    resolutionList !== ''
                        ? resolutionList.split(',').map((item) => ({
                              value: item.trim(),
                              label: item.trim(),
                          }))
                        : [
                              {
                                  value: 'CIF',
                                  label: 'CIF',
                              },
                          ]
                // 画质
                const defaultLevel = $('//content/snapParam/level').attr('default')
                pageData.value.defaultLevel = defaultLevel == '' ? 'medium' : defaultLevel
                const level = $('//content/snapParam/level').text()
                formData.value.level = level == '' ? pageData.value.defaultLevel : level
                const levelList = $('//content/snapParam/levelNote').text()
                pageData.value.levelList =
                    levelList !== ''
                        ? levelList
                              .split(',')
                              .reverse()
                              .map((item) => ({
                                  value: item.trim(),
                                  label: Translate(`IDCS_${item.trim().toUpperCase()}`),
                              }))
                        : [
                              {
                                  value: 'medium',
                                  label: Translate('IDCS_MEDIUM'),
                              },
                          ]
                // 时间间隔
                const defaultHoldTime = $('//content/snapParam/holdTime').attr('default')
                pageData.value.defaultHoldTime = defaultHoldTime == '' ? '3' : defaultHoldTime
                const holdTime = $('//content/snapParam/holdTime').text()
                formData.value.holdTime = holdTime == '' ? pageData.value.defaultHoldTime : holdTime
                const holdTimeList = $('//content/snapParam/holdTimeNote').text()
                // 时间单位,暂无用
                pageData.value.unit = $('//content/snapParam/holdTime').attr('unit')
                pageData.value.holdTimeList =
                    holdTimeList !== ''
                        ? holdTimeList.split(',').map((item) => ({
                              value: item.trim(),
                              label: item.trim() + Translate('IDCS_SECOND'),
                          }))
                        : [{ value: '3', label: '3' + Translate('IDCS_SECOND') }]
            }
        }
        const setDefault = () => {
            formData.value.proxyId = ''
            setIpValue(pageData.value.defaultServerAddress)
            formData.value.port = pageData.value.defaultPort
            formData.value.resolution = pageData.value.defaultResolution
            formData.value.level = pageData.value.defaultLevel
            formData.value.holdTime = pageData.value.defaultHoldTime
        }
        const getSavaData = () => {
            const sendXml = rawXml`
                <content>
                    <platformParam>
                        <switch>${formData.value.enable.toString()}</switch>
                        <proxyId><![CDATA[${formData.value.proxyId}]]></proxyId>
                        <serverAddr default='${pageData.value.defaultServerAddress}'>
                            <![CDATA[${formData.value.isDomain ? formData.value.domain : formData.value.ip}]]>
                        </serverAddr>
                        <port default='${pageData.value.defaultPort.toString()}'>${formData.value.port.toString()}</port>
                    </platformParam>
                    <snapParam>
                        <resolution default='${pageData.value.defaultResolution}'>${formData.value.resolution}</resolution>
                        <level default='${pageData.value.defaultLevel}'>${formData.value.level}</level>
                        <holdTime default='${pageData.value.defaultHoldTime}' unit='${pageData.value.unit}'>${formData.value.holdTime}</holdTime>
                    </snapParam>
                </content>
            `
            return sendXml
        }
        const setData = () => {
            if (!verification()) return
            const sendXml = getSavaData()
            openLoading(LoadingTarget.FullScreen)
            editSHDBParam(sendXml).then((res) => {
                commSaveResponseHadler(res)
                closeLoading(LoadingTarget.FullScreen)
            })
        }
        // 根据获取到的地址设置ip或者域名
        const setIpValue = (value: string) => {
            if (checkIpV4(value)) {
                formData.value.isDomain = false
                formData.value.ip = value
            } else {
                formData.value.isDomain = true
                formData.value.domain = value
            }
        }
        // 校验规则
        const verification = () => {
            if (formData.value.isDomain) {
                if (formData.value.domain === '') {
                    ElMessage({
                        message: Translate('IDCS_DOMAIN_NAME_EMPTY'),
                        type: 'error',
                        customClass: 'errorMsg',
                        duration: 2000,
                    })
                    return false
                } else if (!checkDomain(formData.value.domain)) {
                    ElMessage({
                        message: Translate('IDCS_TEST_DDNS_INVALID_HOSTNAME'),
                        type: 'error',
                        customClass: 'errorMsg',
                        duration: 2000,
                    })
                    return false
                }
            } else {
                if (formData.value.ip === '') {
                    ElMessage({
                        message: Translate('IDCS_PROMPT_IPADDRESS_EMPTY'),
                        type: 'error',
                        customClass: 'errorMsg',
                        duration: 2000,
                    })
                    return false
                } else if (!checkIpV4(formData.value.ip)) {
                    ElMessage({
                        message: Translate('IDCS_PROMPT_IPADDRESS_INVALID'),
                        type: 'error',
                        customClass: 'errorMsg',
                        duration: 2000,
                    })
                    return false
                }
            }
            return true
        }
        const handleIpChange = (value: string) => {
            formData.value.ip = value
        }
        onMounted(() => {
            getData()
        })
        return {
            formData,
            pageData,
            handleIpChange,
            setDefault,
            setData,
        }
    },
})
