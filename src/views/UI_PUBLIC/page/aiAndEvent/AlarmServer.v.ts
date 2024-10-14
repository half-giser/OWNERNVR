/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-14 17:06:11
 * @Description: 报警服务器
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-30 15:01:59
 */
import ScheduleManagPop from '@/views/UI_PUBLIC/components/schedule/ScheduleManagPop.vue'
import { type FormInstance, type FormRules } from 'element-plus'
import { type AlarmTypeInfo } from '@/types/apiType/aiAndEvent'
export default defineComponent({
    components: {
        ScheduleManagPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()
        const openMessageTipBox = useMessageBox().openMessageTipBox
        const { openLoading, closeLoading } = useLoading()
        const formRef = ref<FormInstance>()
        const formData = ref({
            enable: false,
            address: '',
            url: '',
            port: 0,
            heartEnable: false,
            protocol: '',
            interval: 0,
            schedule: '',

            deviceId: '',
            token: '',
        })
        const pageData = ref({
            protocolOptions: [] as SelectOption<string, string>[],
            scheduleManagePopOpen: false,
            scheduleList: [] as SelectOption<string, string>[],
            showAlarmTypeCfg: true,
            showAlarmTransfer: false,
            alarmList: [] as { id: string; value: string }[],
            linkedAlarmList: [] as string[],
            // 多UI
            CustomerID: '',
            maxDeviceIdLength: 6,
            isAnothorUI: false,
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
                    validator: (rule, value, callback) => {
                        if (pageData.value.isTestAlarmServer == true && !value) {
                            callback(new Error(Translate('IDCS_DDNS_SERVER_ADDR_EMPTY')))
                            return
                        }
                        callback()
                    },
                    trigger: 'manual',
                },
                {
                    validator: (rule, value, callback) => {
                        const reg = /(^$|[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+.?$)/g
                        formData.value.address = checkRule(formData.value.address, /([\u4e00-\u9fa5]|[^a-zA-Z\d\.\-:\\/])/g)
                        value = formData.value.address
                        if (value && value.length > 0) {
                            if (!value.trim().match(reg)) {
                                callback(new Error(Translate('IDCS_PROMPT_INVALID_SERVER')))
                                return
                            }
                            callback()
                        }
                        callback()
                    },
                    trigger: 'blur',
                },
            ],
            deviceId: [
                {
                    validator: (rule, value, callback) => {
                        if ((pageData.value.isAnothorUI || pageData.value.deviceIdShow) && formData.value.enable && !formData.value.deviceId.trim()) {
                            if (value.length == 0) {
                                callback(new Error(Translate('IDCS_PROMPT_ID_OR_TOKEN_EMPTY')))
                                return
                            }
                            callback()
                        }
                        callback()
                    },
                    trigger: 'blur',
                },
            ],
            token: [
                {
                    validator: (rule, value, callback) => {
                        if (pageData.value.isAnothorUI && formData.value.enable && !formData.value.token.trim()) {
                            if (value.length == 0) {
                                callback(new Error(Translate('IDCS_PROMPT_ID_OR_TOKEN_EMPTY')))
                                return
                            }
                            callback()
                        }
                        callback()
                    },
                    trigger: 'blur',
                },
            ],
        })
        const tableData = ref<AlarmTypeInfo[]>([])
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
            const linkedIds: string[] = []
            pageData.value.linkedAlarmList.forEach((item) => {
                linkedIds.push(item)
            })
            for (const key in ALARM_SERVER_TYPE) {
                const k = Number(key)
                if (supportRaidArr.includes(k) && !systemCaps.supportRaid) return
                if (supportFaceMatchArr.includes(k) && !systemCaps.supportFaceMatch) return
                if (supportPlateMatchArr.includes(k) && !systemCaps.supportPlateMatch) return
                alarmList.push({ id: key, value: ALARM_SERVER_TYPE[key] })
            }
            pageData.value.alarmList = alarmList
        }
        const getBasicCfg = async () => {
            const result = await queryBasicCfg()
            const res = queryXml(result)
            pageData.value.CustomerID = res('//content/CustomerID').text()
            if (pageData.value.CustomerID == '6') {
                pageData.value.supportAdditionalServerSetting = true
                pageData.value.maxDeviceIdLength = 16
            }
        }
        const getScheduleList = async () => {
            pageData.value.scheduleList = await buildScheduleList()
        }
        const getData = async () => {
            getScheduleList().then(() => {
                pageData.value.scheduleList.forEach((item) => {
                    if (item.value == '') {
                        item.value = ' '
                    }
                })
            })
            queryAlarmServerParam().then(async (resb) => {
                const res = queryXml(resb)
                if (res('status').text() === 'success') {
                    formData.value.enable = res('//content/switch').text() == 'true'
                    formData.value.deviceId = res('//content/deviceId').text()
                    formData.value.token = res('//content/token').text()
                    formData.value.address = res('//content/address').text()
                    formData.value.url = res('//content/url').text()
                    formData.value.port = Number(res('//content/port').text())
                    formData.value.heartEnable = res('//content/heartbeat/switch').text() == 'true'
                    formData.value.protocol = res('//content/dataFormat').text()
                    res('//types/dataFormat/enum').forEach((ele) => {
                        pageData.value.protocolOptions.push({ value: ele.text(), label: ele.text() })
                    })
                    formData.value.interval = Number(res('//content/heartbeat/interval').text())
                    formData.value.schedule = res('//content/alarmServerSchedule').text() == '{00000000-0000-0000-0000-000000000000}' ? ' ' : res('//content/alarmServerSchedule').text()

                    const alarmServerAlarmTypeValue = res('//content/alarmServerAlarmTypes').text()
                    const alarmTypes = alarmServerAlarmTypeValue ? alarmServerAlarmTypeValue.split(',') : []
                    alarmTypes.forEach((item: string) => {
                        tableData.value.push({ id: item, value: ALARM_SERVER_TYPE[item] })
                        pageData.value.linkedAlarmList.push(item)
                    })
                    genAlarmList()

                    setFormByProtocol()
                }
            })
        }
        const setFormByProtocol = () => {
            pageData.value.isProtocolXML = formData.value.protocol == 'XML'
            pageData.value.isArisanProtocol = formData.value.protocol == 'ARISAN'
            pageData.value.isJSONProtocol = formData.value.protocol == 'JSON' || Trim(formData.value.protocol, 'g') == Trim('VIDEO GUARD', 'g')
            pageData.value.showAlarmTypeCfg = pageData.value.isProtocolXML ? true : false
            pageData.value.urlDisabled = pageData.value.isProtocolXML ? false : true
            pageData.value.heartEnableDisabled = pageData.value.isArisanProtocol ? true : false
            if (pageData.value.heartEnableDisabled === true) {
                formData.value.heartEnable = false
            }
            pageData.value.isAnothorUI = pageData.value.supportAdditionalServerSetting == true && pageData.value.isArisanProtocol ? true : false
            pageData.value.deviceIdShow = pageData.value.isJSONProtocol ? true : false
        }
        const setAlarmTypes = () => {
            if (pageData.value.linkedAlarmList.length === 0) {
                tableData.value = []
                pageData.value.showAlarmTransfer = false
            } else {
                tableData.value = []
                pageData.value.linkedAlarmList.forEach((item) => {
                    tableData.value.push({ id: item, value: ALARM_SERVER_TYPE[item] })
                    pageData.value.showAlarmTransfer = false
                })
            }
        }
        const checkRule = (value: string, reg: RegExp) => {
            if (reg.test(value)) {
                return value.replace(reg, '')
            } else {
                return value
            }
        }
        const Trim = (str: string, is_global: string) => {
            if (!str) return ''
            let result
            result = str.replace(/(^\s+)|(\s+$)/g, '')
            if (is_global.toLowerCase() == 'g') {
                result = result.replace(/\s/g, '')
            }
            return result
        }
        const getSavaData = (url: string) => {
            const schedule = formData.value.schedule == ' ' ? '{00000000-0000-0000-0000-000000000000}' : formData.value.schedule
            let scheduleLabel = ''
            pageData.value.scheduleList.forEach((item) => {
                if (item.value == schedule) {
                    scheduleLabel = item.label
                }
            })
            let sendXml = rawXml`<content>
                                <address>${formData.value.address}</address>
                                <url>${formData.value.url}</url>
                                <switch>${formData.value.enable.toString()}</switch>
                                <dataFormat>${formData.value.protocol}</dataFormat>
                                <port>${formData.value.port.toString()}</port>
                                <alarmServerSchedule>${scheduleLabel}</alarmServerSchedule>`
            if (pageData.value.isProtocolXML) {
                sendXml += rawXml`<alarmServerAlarmTypes>${pageData.value.linkedAlarmList.join(',')} </alarmServerAlarmTypes>`
            }
            if (url == 'editAlarmServerParam') {
                sendXml += rawXml`<heartbeat>
                                <switch>${formData.value.heartEnable.toString()}</switch>
                                <interval>${formData.value.interval.toString()}</interval>
                            </heartbeat>`
            }
            if (pageData.value.supportAdditionalServerSetting) {
                sendXml += rawXml`<deviceId><![CDATA[${formData.value.deviceId}]]></deviceId>`
            }
            sendXml += rawXml`</content>`
            return sendXml
        }
        const setData = (url: string) => {
            if (!formRef.value) return
            if (url == 'testAlarmServerParam') {
                pageData.value.isTestAlarmServer = true
            }
            formRef.value.validate((valid) => {
                if (valid) {
                    if (url == 'testAlarmServerParam') {
                        openLoading()
                        testAlarmServerParam(getSavaData(url)).then((resb) => {
                            closeLoading()
                            const res = queryXml(resb)
                            if (res('status').text() == 'success') {
                                openMessageTipBox({
                                    type: 'success',
                                    message: Translate('IDCS_TEST_ALARM_SERVER_SUCCESS'),
                                })
                            } else {
                                openMessageTipBox({
                                    type: 'info',
                                    message: Translate('IDCS_TEST_ALARM_SERVER_FAILED'),
                                })
                            }
                        })
                        pageData.value.isTestAlarmServer = false
                    } else if (url == 'editAlarmServerParam') {
                        pageData.value.isTestAlarmServer = false
                        openLoading()
                        editAlarmServerParam(getSavaData(url)).then((resb) => {
                            closeLoading()
                            const res = queryXml(resb)
                            if (res('status').text() == 'success') {
                                openMessageTipBox({
                                    type: 'success',
                                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                                })
                            } else {
                                let msg = ''
                                const errorCode = Number(res('errorCode').text())
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
                                openMessageTipBox({
                                    type: 'info',
                                    message: Translate('IDCS_SAVE_DATA_FAIL') + msg,
                                })
                            }
                        })
                    }
                }
            })
        }
        const testAlarmServer = () => {
            setData('testAlarmServerParam')
        }
        const applyAlarmSever = () => {
            setData('editAlarmServerParam')
        }
        const handleProtocolChange = () => {
            setFormByProtocol()
        }
        onMounted(async () => {
            pageData.value.scheduleList = await buildScheduleList()
            await getBasicCfg()
            await getData()
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
            testAlarmServer,
            applyAlarmSever,
            handleProtocolChange,
            ScheduleManagPop,
        }
    },
})
