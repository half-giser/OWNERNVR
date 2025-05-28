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
            showAlarmTransfer: false,
            alarmList: [] as SelectOption<string, string>[],
            supportAdditionalServerSetting: false,
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
                        if (
                            ((pageData.value.supportAdditionalServerSetting && formData.value.protocol === 'ARISAN') || formData.value.protocol === 'JSON') &&
                            formData.value.enable &&
                            !formData.value.deviceId.trim()
                        ) {
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
                        if (pageData.value.supportAdditionalServerSetting && formData.value.protocol === 'ARISAN' && formData.value.enable && !formData.value.token.trim()) {
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
        const editAlarm = useWatchEditData(tableData)

        const linkedAlarmList = computed(() => {
            return tableData.value.map((item) => item.value)
        })

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
            16: Translate('IDCS_SMART_AOI_ENTRY_DETECTION'), // 区域进入侦测报警
            17: Translate('IDCS_SMART_AOI_LEAVE_DETECTION'), // 区域离开侦测报警
            18: Translate('IDCS_PASS_LINE_COUNT_DETECTION'), // 过线统计报警
            19: Translate('IDCS_FIRE_POINT_DETECTION'), // 火点检测告警
            20: Translate('IDCS_TEMPERATURE_DETECTION'), // 温度检测告警
            21: Translate('IDCS_LOITERING_DETECTION'), // 徘徊检测告警
            22: Translate('IDCS_AUDIO_EXCEPTION_DETECTION'), // 声音异常告警
            23: Translate('IDCS_PARKING_DETECTION'), // 违停检测告警
            25: Translate('IDCS_REGION_STATISTICS'), // 区域统计告警
            26: Translate('IDCS_CROWD_GATHERING'), // 人员聚集告警

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
            const rules = [
                // 排除阵列报警类型
                {
                    keys: ['69', '70', '77', '78'],
                    cap: systemCaps.supportRaid,
                },
                // 排除人脸识别类型
                {
                    keys: ['130'],
                    cap: systemCaps.supportFaceMatch,
                },
                // 排除车牌识别类型
                {
                    keys: ['140'],
                    cap: systemCaps.supportPlateMatch,
                },
                // 排除磁盘故障类型
                {
                    keys: ['79'],
                    cap: systemCaps.supportHDHealth,
                },
            ]

            pageData.value.alarmList = Object.entries(ALARM_SERVER_TYPE)
                .map((item) => {
                    const value = item[0]
                    const label = item[1]
                    return {
                        label: label,
                        value: value,
                    }
                })
                .filter((item) => {
                    const find = rules.find((rule) => rule.keys.includes(item.value))
                    if (find) {
                        return find.cap
                    }
                    return true
                })
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
            editAlarm.reset()

            const result = await queryAlarmServerParam()
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

                tableData.value = $('content/alarmServerAlarmTypes')
                    .text()
                    .array()
                    .map((item) => {
                        return {
                            value: item,
                            label: ALARM_SERVER_TYPE[item],
                        }
                    })

                editAlarm.listen()
            }
        }

        const setAlarmTypes = (e: SelectOption<string, string>[]) => {
            tableData.value = e
            pageData.value.showAlarmTransfer = false
        }

        const formatAddress = (value: string) => {
            const reg = /([\u4e00-\u9fa5]|[^a-zA-Z\d\.\-:\\/])/g
            return value.replace(reg, '')
        }

        const formatUrl = (value: string) => {
            const reg = /([\u4e00-\u9fa5]|[^a-zA-Z\d\.\-:\\/])/g
            return value.replace(reg, '')
        }

        const testData = () => {
            pageData.value.isTestAlarmServer = true
            formRef.value?.validate(async (valid) => {
                if (valid) {
                    openLoading()

                    const sendXML = rawXml`
                        <content>
                            <address>${formData.value.address}</address>
                            <url>${formData.value.url}</url>
                            <switch>${formData.value.enable}</switch>
                            <dataFormat>${formData.value.protocol}</dataFormat>
                            <port>${formData.value.port}</port>
                            <alarmServerSchedule>${pageData.value.scheduleList.find((item) => item.value === formData.value.schedule)?.label || ''}</alarmServerSchedule>
                            ${formData.value.protocol === 'XML' && !editAlarm.disabled.value ? `<alarmServerAlarmTypes>${linkedAlarmList.value.join(',')} </alarmServerAlarmTypes>` : ''}
                            <heartbeat>
                                <switch>${formData.value.heartEnable}</switch>
                                <interval>${formData.value.interval}</interval>
                            </heartbeat>
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
                    const result = await testAlarmServerParam(sendXML)
                    const $ = queryXml(result)

                    closeLoading()

                    if ($('status').text() === 'success') {
                        openMessageBox({
                            type: 'success',
                            message: Translate('IDCS_TEST_ALARM_SERVER_SUCCESS'),
                        })
                    } else {
                        openMessageBox(Translate('IDCS_TEST_ALARM_SERVER_FAILED'))
                    }
                }
            })
        }

        const applyData = async () => {
            pageData.value.isTestAlarmServer = false
            formRef.value?.validate(async (valid) => {
                if (valid) {
                    openLoading()

                    const sendXML = rawXml`
                        <content>
                            <address>${formData.value.address}</address>
                            <url>${formData.value.url}</url>
                            <switch>${formData.value.enable}</switch>
                            <dataFormat>${formData.value.protocol}</dataFormat>
                            <port>${formData.value.port}</port>
                            <alarmServerSchedule>${pageData.value.scheduleList.find((item) => item.value === formData.value.schedule)?.label || ''}</alarmServerSchedule>
                            ${formData.value.protocol === 'XML' && !editAlarm.disabled.value ? `<alarmServerAlarmTypes>${linkedAlarmList.value.join(',')} </alarmServerAlarmTypes>` : ''}
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

                    const result = await editAlarmServerParam(sendXML)
                    const $ = queryXml(result)

                    closeLoading()

                    if ($('status').text() === 'success') {
                        openMessageBox({
                            type: 'success',
                            message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                        })
                        editAlarm.update()
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
                }
            })
        }

        const closeSchedulePop = async () => {
            pageData.value.isSchedulePop = false
            await getScheduleList()
            formData.value.schedule = getScheduleId(pageData.value.scheduleList, formData.value.schedule)
        }

        onMounted(async () => {
            genAlarmList()
            openLoading()
            await getScheduleList()
            await getBasicCfg()
            await getData()
            closeLoading()
        })

        return {
            formData,
            pageData,
            formRef,
            rules,
            tableData,
            setAlarmTypes,
            testData,
            applyData,
            closeSchedulePop,
            formatAddress,
            formatUrl,
            linkedAlarmList,
        }
    },
})
