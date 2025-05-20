/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-14 17:06:11
 * @Description: 报警服务器
 */
import { type FormRules } from 'element-plus'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()

        const formRef = useFormRef()
        const formData = ref(new AlarmServerForm())

        const pageData = ref({
            protocolOptions: [] as SelectOption<string, string>[],
            isSchedulePop: false,
            scheduleList: [] as SelectOption<string, string>[],
            showAlarmTypeCfg: true,
            showAlarmTransfer: false,
            alarmList: [] as SelectOption<string, string>[],
            linkedAlarmList: [] as string[],
            showAdditionalServerSetting: false,
            supportAdditionalServerSetting: false,
            deviceIdShow: false,
            isProtocolXML: false,
            isArisanProtocol: false,
            isJSONProtocol: false,
            // 根据协议用户变化的disabled
            urlDisabled: false,
            heartEnableDisabled: false,
            // 将进行的事件
            isTestAlarmServer: false,
        })

        const rules = reactive<FormRules>({
            address: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (pageData.value.isTestAlarmServer && !value) {
                            callback(new Error(Translate('IDCS_DDNS_SERVER_ADDR_EMPTY')))
                            return
                        }

                        if (value.trim()) {
                            if (!/(^$|[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+.?$)/g.test(value.trim())) {
                                callback(new Error(Translate('IDCS_PROMPT_INVALID_SERVER')))
                                return
                            }
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            deviceId: [
                {
                    validator: (_rule, value: string, callback) => {
                        if ((pageData.value.showAdditionalServerSetting || pageData.value.deviceIdShow) && formData.value.enable && !formData.value.deviceId.trim()) {
                            if (!value.trim()) {
                                callback(new Error(Translate('IDCS_PROMPT_ID_OR_TOKEN_EMPTY')))
                                return
                            }
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            token: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (pageData.value.showAdditionalServerSetting && formData.value.enable && !formData.value.token.trim()) {
                            if (!value.trim()) {
                                callback(new Error(Translate('IDCS_PROMPT_ID_OR_TOKEN_EMPTY')))
                                return
                            }
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        const tableData = ref<SelectOption<string, string>[]>([])

        const ALARM_SERVER_TYPE: Record<string, string> = {
            1: Translate('IDCS_MOTION_DETECT_ALARM'), // 移动侦测报警输入
            2: Translate('IDCS_SENSOR_ALARM'), // 传感器报警输入
            4: Translate('IDCS_FRONT_OFFLINE'), // 前端设备掉线报警
            5: Translate('IDCS_WATCH_DETECTION'), // 物品看护侦测报警
            6: Translate('IDCS_ABNORMAL_DISPOSE_WAY'), // 视频异常侦测报警
            7: Translate('IDCS_BEYOND_DETECTION'), // 越界侦测报警
            8: Translate('IDCS_INVADE_DETECTION'), // 区域入侵侦测报警
            10: Translate('IDCS_FACE_DETECTION'), // 人脸侦测报警
            13: Translate('IDCS_CROWD_DENSITY_DETECTION'), // 人群密度报警
            15: Translate('IDCS_COMBINATION_ALARM'), // 复合报警类型
            19: Translate('IDCS_FIRE_POINT_DETECTION'), // 火点检测告警
            20: Translate('IDCS_TEMPERATURE_DETECTION'), // 温度检测告警

            66: Translate('IDCS_IP_CONFLICT'), // IP地址冲突
            67: Translate('IDCS_DISK_IO_ERROR'), // 磁盘IO错误
            68: Translate('IDCS_DISK_FULL'), // 磁盘满
            69: Translate('IDCS_RAID_SUBHEALTH'), // 阵列降级
            70: Translate('IDCS_RAID_UNAVAILABLE'), // 阵列不可用
            71: Translate('IDCS_ILLEIGAL_ACCESS'), // 非法访问
            72: Translate('IDCS_NETWORK_DISCONNECT'), // 网络断开
            73: Translate('IDCS_NO_DISK'), // 盘组下没有磁盘
            75: Translate('IDCS_HDD_PULL_OUT'), // 前面板硬盘拔出
            76: Translate('IDCS_ALARM_SERVER_OFFLINE'), // 报警服务器掉线
            77: Translate('IDCS_RAID_HOT_EXCEPTION'), // 热备异常
            // 78: Translate("IDCS_RAID_EXCEPTION"), // 阵列异常
            79: Translate('IDCS_DISK_FAILURE'), // 磁盘故障

            97: Translate('IDCS_ALARM_OUT'), // 报警输出

            130: Translate('IDCS_FACE_MATCH'), // 人脸识别
            140: Translate('IDCS_PLATE_MATCH'), // 车牌比对
        }

        const genAlarmList = () => {
            // 排除阵列报警类型
            const supportRaidArr = [69, 70, 77, 78]
            // 排除人脸识别类型
            const supportFaceMatchArr = [130]
            // 排除车牌识别类型
            const supportPlateMatchArr = [140]
            const alarmList = []

            for (const key in ALARM_SERVER_TYPE) {
                const k = Number(key)
                if (supportRaidArr.includes(k) && !systemCaps.supportRaid) return
                if (supportFaceMatchArr.includes(k) && !systemCaps.supportFaceMatch) return
                if (supportPlateMatchArr.includes(k) && !systemCaps.supportPlateMatch) return
                alarmList.push({
                    value: key,
                    label: ALARM_SERVER_TYPE[key],
                })
            }
            pageData.value.alarmList = alarmList
        }

        const getBasicCfg = async () => {
            const result = await queryBasicCfg()
            const $ = queryXml(result)
            const CustomerID = $('content/CustomerID').text()
            if (CustomerID === '6') {
                pageData.value.supportAdditionalServerSetting = true
            }
        }

        const getScheduleList = async () => {
            pageData.value.scheduleList = await buildScheduleList()
        }

        const getData = async () => {
            await getScheduleList()
            queryAlarmServerParam().then((result) => {
                const $ = queryXml(result)
                if ($('status').text() === 'success') {
                    formData.value.enable = $('content/switch').text().bool()
                    formData.value.deviceId = $('content/deviceId').text()
                    formData.value.token = $('content/token').text()
                    formData.value.address = $('content/address').text()
                    formData.value.url = $('content/url').text()
                    formData.value.port = $('content/port').text().num()
                    formData.value.heartEnable = $('content/heartbeat/switch').text().bool()
                    formData.value.protocol = $('content/dataFormat').text()
                    pageData.value.protocolOptions = $('types/dataFormat/enum').map((ele) => {
                        return {
                            value: ele.text(),
                            label: ele.text(),
                        }
                    })
                    formData.value.interval = $('content/heartbeat/interval').text().num()
                    formData.value.schedule = $('content/alarmServerSchedule').text()

                    pageData.value.linkedAlarmList = $('content/alarmServerAlarmTypes').text().array()
                    tableData.value = pageData.value.linkedAlarmList.map((item) => {
                        return {
                            value: item,
                            label: ALARM_SERVER_TYPE[item],
                        }
                    })

                    genAlarmList()

                    setFormByProtocol()
                }
            })
        }

        const setFormByProtocol = () => {
            pageData.value.isProtocolXML = formData.value.protocol === 'XML'
            pageData.value.isArisanProtocol = formData.value.protocol === 'ARISAN'
            pageData.value.isJSONProtocol = formData.value.protocol === 'JSON' || trimAllSpace(formData.value.protocol) === trimAllSpace('VIDEO GUARD')
            pageData.value.showAlarmTypeCfg = pageData.value.isProtocolXML ? true : false
            pageData.value.urlDisabled = pageData.value.isProtocolXML ? false : true
            pageData.value.heartEnableDisabled = pageData.value.isArisanProtocol ? true : false
            if (pageData.value.heartEnableDisabled === true) {
                formData.value.heartEnable = false
            }
            pageData.value.showAdditionalServerSetting = pageData.value.supportAdditionalServerSetting === true && pageData.value.isArisanProtocol
            pageData.value.deviceIdShow = pageData.value.isJSONProtocol ? true : false
        }

        const setAlarmTypes = (e: SelectOption<string, string>[]) => {
            tableData.value = e
            pageData.value.showAlarmTransfer = false
            pageData.value.linkedAlarmList = e.map((item) => item.value)
        }

        const checkRule = (value: string, reg: RegExp) => {
            if (reg.test(value)) {
                return value.replace(reg, '')
            } else {
                return value
            }
        }

        const checkAddress = (value: string) => {
            const reg1 = /([\u4e00-\u9fa5]|[^a-zA-Z\d\.\-:\\/])/g
            const address = checkRule(value, reg1)
            formData.value.address = address
        }

        const checkUrl = (value: string) => {
            const reg = /([\u4e00-\u9fa5]|[^a-zA-Z\d\.\-:\\/])/g
            const url = checkRule(value, reg)
            formData.value.url = url
        }

        const getSavaData = (url: string) => {
            const scheduleLabel = formData.value.schedule === DEFAULT_EMPTY_ID ? '' : pageData.value.scheduleList.find((item) => item.value === formData.value.schedule)!.label
            const sendXml = rawXml`
                <content>
                    <address>${formData.value.address}</address>
                    <url>${formData.value.url}</url>
                    <switch>${formData.value.enable}</switch>
                    <dataFormat>${formData.value.protocol}</dataFormat>
                    <port>${formData.value.port}</port>
                    <alarmServerSchedule>${scheduleLabel}</alarmServerSchedule>
                    ${pageData.value.isProtocolXML ? `<alarmServerAlarmTypes>${pageData.value.linkedAlarmList.join(',')} </alarmServerAlarmTypes>` : ''}
                    ${
                        url === 'editAlarmServerParam'
                            ? rawXml`
                                <heartbeat>
                                    <switch>${formData.value.heartEnable}</switch>
                                    <interval>${formData.value.interval}</interval>
                                </heartbeat>
                                `
                            : ''
                    }
                    ${
                        pageData.value.supportAdditionalServerSetting
                            ? rawXml`
                                <deviceId>${wrapCDATA(formData.value.deviceId)}</deviceId>
                                <token>${wrapCDATA(formData.value.token)}</token>
                            `
                            : `<deviceId>${wrapCDATA(formData.value.deviceId)}</deviceId>`
                    }
                </content>
            `

            return sendXml
        }

        const setData = (url: string) => {
            if (!formRef.value) return
            if (url === 'testAlarmServerParam') {
                pageData.value.isTestAlarmServer = true
            } else {
                pageData.value.isTestAlarmServer = false
            }
            formRef.value.validate((valid) => {
                if (valid) {
                    if (url === 'testAlarmServerParam') {
                        openLoading()
                        testAlarmServerParam(getSavaData(url)).then((result) => {
                            closeLoading()
                            const $ = queryXml(result)
                            if ($('status').text() === 'success') {
                                openMessageBox({
                                    type: 'success',
                                    message: Translate('IDCS_TEST_ALARM_SERVER_SUCCESS'),
                                })
                            } else {
                                openMessageBox(Translate('IDCS_TEST_ALARM_SERVER_FAILED'))
                            }
                        })
                    } else if (url === 'editAlarmServerParam') {
                        openLoading()
                        editAlarmServerParam(getSavaData(url)).then((result) => {
                            closeLoading()
                            const $ = queryXml(result)
                            if ($('status').text() === 'success') {
                                openMessageBox({
                                    type: 'success',
                                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                                })
                            } else {
                                let msg = ''
                                const errorCode = $('errorCode').text().num()
                                switch (errorCode) {
                                    case ErrorCode.USER_ERROR_FAIL:
                                        msg = Translate('IDCS_LOGIN_OVERTIME')
                                        return
                                    case ErrorCode.USER_ERROR_USER_LOCKED:
                                        msg = Translate('IDCS_LOGIN_FAIL_USER_LOCKED')
                                        return
                                    case ErrorCode.USER_ERROR_INVALID_PARAM:
                                        msg = Translate('IDCS_USER_ERROR_INVALID_PARAM')
                                }
                                openMessageBox(Translate('IDCS_SAVE_DATA_FAIL') + msg)
                            }
                        })
                    }
                }
            })
        }

        const testData = () => {
            setData('testAlarmServerParam')
        }

        const applyData = () => {
            setData('editAlarmServerParam')
        }

        const changeProtocol = () => {
            setFormByProtocol()
        }

        const closeSchedulePop = async () => {
            pageData.value.isSchedulePop = false
            await getScheduleList()
            formData.value.schedule = getScheduleId(pageData.value.scheduleList, formData.value.schedule)
        }

        onMounted(async () => {
            await getBasicCfg()
            getData()
        })

        watch(
            () => formData.value.enable,
            (newValue) => {
                if (newValue) {
                    // 当 enable 变为 true 时执行的操作
                    setFormByProtocol()
                }
            },
        )

        return {
            formData,
            pageData,
            formRef,
            rules,
            tableData,
            setAlarmTypes,
            testData,
            applyData,
            changeProtocol,
            closeSchedulePop,
            checkAddress,
            checkUrl,
        }
    },
})
