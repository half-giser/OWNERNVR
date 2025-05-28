/*
 * @Date: 2025-05-15 09:30:51
 * @Description: HTTP Post
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
import { type FormRules } from 'element-plus'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const userSession = useUserSessionStore()

        const CONNECT_TYPE_MAPPING: Record<string, string> = {
            longConnection: Translate('IDCS_LONG_CONNECTION'),
            shortConnection: Translate('IDCS_SHORT_CONNECTION'),
        }

        const EVENT_TYPE_LANG_MAP: Record<string, string> = {
            illegalAccess: Translate('IDCS_ILLEIGAL_ACCESS'), // 非法访问事件
            tripwire: Translate('IDCS_BEYOND_DETECTION'), // 越界报警事件
            intrusion: Translate('IDCS_INVADE_DETECTION'), // 区域入侵报警事件
            smartEntry: Translate('IDCS_SMART_AOI_ENTRY_DETECTION'), // 进入区域
            smartLeave: Translate('IDCS_SMART_AOI_LEAVE_DETECTION'), // 离开区域
            passLine: Translate('IDCS_PASS_LINE_COUNT_DETECTION'), // 过线统计
            fireDetection: Translate('IDCS_FIRE_POINT_DETECTION'), // 火点检测事件
            temperatureAlarm: Translate('IDCS_TEMPERATURE_DETECTION'), // 温度检测事件
            smartLoitering: Translate('IDCS_LOITERING_DETECTION'), // 徘徊检测事件
            audioException: Translate('IDCS_AUDIO_EXCEPTION_DETECTION'), // 声音异常事件
            smartPvd: Translate('IDCS_PARKING_DETECTION'), // 违停检测事件
            regionStatistics: Translate('IDCS_REGION_STATISTICS'), // 区域统计事件
            personGather: Translate('IDCS_CROWD_GATHERING'), // 人员聚集事件
            watchDetection: Translate('IDCS_WATCH_DETECTION'), // 物品看护事件
            crowdDensityDetection: Translate('IDCS_CROWD_DENSITY_DETECTION'), // 人群密度检测
            faceDetection: Translate('IDCS_FACE_DETECTION'), // 人脸侦测
            faceMatch: Translate('IDCS_FACE_MATCH'), // 人脸识别
            plateDetection: Translate('IDCS_PLATE_DETECTION'), // 车牌侦测
            plateMatch: Translate('IDCS_PLATE_MATCH'), // 车牌比对
            videoMetadata: Translate('IDCS_VSD_DETECTION'), // 视频结构化
            videoException: Translate('IDCS_ABNORMAL_DISPOSE_WAY'), // 视频异常事件
            motion: Translate('IDCS_MOTION_DETECT_ALARM'), // 移动侦测
            sensor: Translate('IDCS_SENSOR_ALARM'), // 传感器
            alarmOut: Translate('IDCS_ALARM_OUT'), // 报警输出
            channelOffline: Translate('IDCS_FRONT_OFFLINE'), // 前端掉线
            combinationAlarm: Translate('IDCS_COMBINATION_ALARM'), // 组合报警
            ipConflict: Translate('IDCS_IP_CONFLICT'), // IP地址冲突
            diskRWError: Translate('IDCS_DISK_IO_ERROR'), // 读写硬盘出错
            diskFull: Translate('IDCS_DISK_FULL'), // 磁盘满
            raidSubhealthAlarm: Translate('IDCS_RAID_SUBHEALTH'), // 阵列降级
            raidUnavaliableAlarm: Translate('IDCS_RAID_UNAVAILABLE'), // 阵列不可用
            networkBreak: Translate('IDCS_NETWORK_DISCONNECT'), // 网络断开
            noDisk: Translate('IDCS_NO_DISK'), // 无磁盘
            hddPullOut: Translate('IDCS_HDD_PULL_OUT'), // 磁盘拔出
            alarmServerOffline: Translate('IDCS_ALARM_SERVER_OFFLINE'), // 报警服务器掉线
            raidHotErrorAlarm: Translate('IDCS_RAID_HOT_EXCEPTION'), // 热备异常
            diskFailureAlarm: Translate('IDCS_DISK_FAILURE'), // 磁盘故障
        }

        const pageData = ref({
            eventList: [] as SelectOption<string, string>[],
            isSchedulePop: false,
            isEventPop: false,
            scheduleList: [] as SelectOption<string, string>[],
            connectionTypeList: [] as SelectOption<string, string>[],
            protocolTypeList: [] as SelectOption<string, string>[],
            postPicList: [
                {
                    label: Translate('IDCS_FACE_SNAP_IMAGE'),
                    value: 'enablePostTargetPic',
                },
                {
                    label: Translate('IDCS_ORIGINAL'),
                    value: 'enablePostScenePic',
                },
            ],
            isTestAlarmServer: false,
        })

        const rules = reactive<FormRules>({
            host: [
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
            userName: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (formData.value.switch && !formData.value.userInfoDsiabled) {
                            if (!value.trim()) {
                                callback(new Error(Translate('IDCS_PROMPT_USERNAME_EMPTY')))
                                return
                            }

                            if (!cutStringByByte(value, formData.value.userNameMaxByteLen)) {
                                callback(new Error(Translate('IDCS_INVALID_CHAR')))
                                return
                            }
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
            password: [
                {
                    validator: (_rule, value: string, callback) => {
                        if (formData.value.switch && !formData.value.userInfoDsiabled && formData.value.passwordSwitch) {
                            if (!value.trim()) {
                                callback(new Error(Translate('IDCS_PROMPT_PASSWORD_EMPTY')))
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
        const watchEditEvent = useWatchEditData(tableData)

        const eventLinkedList = computed(() => {
            return tableData.value.map((item) => item.value)
        })

        const formRef = useFormRef()
        const formData = ref(new NetHttpPostForm())

        const getScheduleList = async () => {
            pageData.value.scheduleList = await buildScheduleList()
        }

        const getData = async () => {
            watchEditEvent.reset()

            const result = await queryHTTPPostConfig()
            const $ = await commLoadResponseHandler(result)
            const $item = queryXml($('content/httpPostConfigList/item')[0].element)

            pageData.value.connectionTypeList = $('types/connectionType/enum').map((item) => {
                return {
                    value: item.text(),
                    label: CONNECT_TYPE_MAPPING[item.text()],
                }
            })

            pageData.value.protocolTypeList = $('types/protocolType/enum').map((item) => {
                return {
                    value: item.text(),
                    label: item.text(),
                }
            })

            pageData.value.eventList = $('types/eventType/enum')
                .map((item) => {
                    return {
                        value: item.text(),
                        label: EVENT_TYPE_LANG_MAP[item.text()],
                    }
                })
                .filter((item) => !!item.label)

            formData.value.switch = $('content/switch').text().bool()
            formData.value.host = $item('host').text()
            formData.value.hostMaxByteLen = $item('host').attr('maxByteLen').num()
            formData.value.port = $item('port').text().num()
            formData.value.portMin = $item('port').attr('min').num()
            formData.value.portMax = $item('port').attr('max').num()
            formData.value.path = $item('path').text()
            formData.value.pathMaxByteLen = $item('path').attr('maxByteLen').num()
            formData.value.protocolType = $item('protocolType').text()
            formData.value.userInfoDsiabled = !$item('userInfo/enable').text().bool()
            formData.value.userNameMaxByteLen = $item('userInfo').attr('maxByteLen').num()
            formData.value.userName = $item('userInfo/username').text()
            const securityVer = $item('userInfo/password').attr('securityVer')
            const password = $item('userInfo/password').text()
            formData.value.password = securityVer === '1' ? AES_decrypt(password, userSession.sesionKey) : password
            formData.value.connectType = $item('connectType').text()
            formData.value.schedule = $item('schedule').attr('id')
            formData.value.keepAliveInfoEnable = $item('keepAliveInfo/enable').text().bool()
            formData.value.heartbeatInterval = $item('keepAliveInfo/heartbeatInterval').text().num()
            formData.value.heartbeatIntervalMin = $item('keepAliveInfo/heartbeatInterval').attr('min').num()
            formData.value.heartbeatIntervalMax = $item('keepAliveInfo/heartbeatInterval').attr('max').num()
            formData.value.heartbeatIntervalDefault = $item('keepAliveInfo/heartbeatInterval').attr('default').num()
            if (!$item('keepAliveInfo/heartbeatInterval').text()) {
                formData.value.heartbeatInterval = formData.value.heartbeatIntervalDefault
            }

            if ($item('enablePostTargetPic').text().bool()) {
                formData.value.enablePostPic.push('enablePostTargetPic')
            }

            if ($item('enablePostScenePic').text().bool()) {
                formData.value.enablePostPic.push('enablePostScenePic')
            }

            tableData.value = $item('eventList/item')
                .map((item) => {
                    return {
                        value: item.text(),
                        label: EVENT_TYPE_LANG_MAP[item.text()],
                    }
                })
                .filter((item) => !!item.label)

            watchEditEvent.listen()
        }

        const testData = () => {
            pageData.value.isTestAlarmServer = true
            formRef.value?.validate(async (valid) => {
                if (valid) {
                    openLoading()

                    const sendXml = rawXml`
                        <content>
                            <host>${wrapCDATA(formData.value.host)}</host>
                            <port>${formData.value.port}</port>
                            <path>${wrapCDATA(formData.value.path)}</path>
                            <protocolType>${formData.value.protocolType}</protocolType>
                            <userInfo>
                                <enable>${!formData.value.userInfoDsiabled}</enable>
                                <username>${formData.value.userName}</username>
                                ${formData.value.passwordSwitch ? `<password ${getSecurityVer()}>${wrapCDATA(AES_encrypt(formData.value.password, userSession.sesionKey))}</password>` : ''}
                            </userInfo>
                        </content>
                    `
                    const result = await testHTTPPost(sendXml)
                    const $ = queryXml(result)

                    closeLoading()

                    if ($('status').text() === 'success') {
                        openMessageBox({
                            type: 'success',
                            message: Translate('IDCS_TEST_ALARM_SERVER_SUCCESS'),
                        })
                    } else {
                        const errorCode = $('errorCode').text().num()
                        let msg = Translate('IDCS_TEST_ALARM_SERVER_FAILED')
                        switch (errorCode) {
                            case 536870948:
                                msg = Translate('IDCS_DEVICE_PWD_ERROR')
                                break
                            default:
                                break
                        }
                        openMessageBox(msg)
                    }
                }
            })
        }

        const setData = () => {
            pageData.value.isTestAlarmServer = false
            formRef.value?.validate(async (valid) => {
                if (valid) {
                    openLoading()

                    const sendXml = rawXml`
                        <content>
                            <switch></switch>
                            <httpPostConfigList>
                                <item>
                                    <host>${wrapCDATA(formData.value.host)}</host>
                                    <port>${formData.value.port}</port>
                                    <path>${wrapCDATA(formData.value.path)}</path>
                                    <protocolType>${formData.value.protocolType}</protocolType>
                                    <userInfo>
                                        <enable>${!formData.value.userInfoDsiabled}</enable>
                                        <username>${formData.value.userName}</username>
                                        ${formData.value.passwordSwitch ? `<password ${getSecurityVer()}>${wrapCDATA(AES_encrypt(formData.value.password, userSession.sesionKey))}</password>` : ''}
                                    </userInfo>
                                    <connectType>${formData.value.connectType}</connectType>
                                    <enablePostTargetPic>${formData.value.enablePostPic.includes('enablePostTargetPic')}</enablePostTargetPic>
                                    <enablePostScenePic>${formData.value.enablePostPic.includes('enablePostScenePic')}</enablePostScenePic>
                                    <schedule id="${formData.value.schedule}">${formData.value.schedule === DEFAULT_EMPTY_ID ? '' : pageData.value.scheduleList.find((item) => item.value === formData.value.schedule)!.label}</schedule>
                                    <keepAliveInfo>
                                        <enable>${formData.value.keepAliveInfoEnable}</enable>
                                        <heartbeatInterval>${formData.value.heartbeatInterval}</heartbeatInterval>
                                    </keepAliveInfo>
                                    ${
                                        !watchEditEvent.disabled.value
                                            ? rawXml`
                                                <eventList type="list">
                                                    ${tableData.value.map((item) => `<item>${item.value}</item>`).join('')}
                                                </eventList>
                                            `
                                            : ''
                                    }
                                </item>
                            </httpPostConfigList>
                        </content>
                    `
                    const result = await editHTTPPostConfig(sendXml)
                    const $ = queryXml(result)

                    closeLoading()

                    if ($('status').text() === 'success') {
                        openMessageBox({
                            type: 'success',
                            message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                        })
                        watchEditEvent.update()
                    } else {
                        const errorCode = $('errorCode').text().num()
                        let msg = ''
                        switch (errorCode) {
                            case 536870934:
                                msg = Translate('IDCS_LOGIN_OVERTIME')
                                break
                            case 536870951:
                                msg = Translate('IDCS_LOGIN_FAIL_USER_LOCKED')
                                break
                            case 536870943:
                                msg = Translate('IDCS_USER_ERROR_INVALID_PARAM')
                                break
                            case 536870948:
                                msg = Translate('IDCS_DEVICE_PWD_ERROR')
                                break
                            default:
                                break
                        }
                        openMessageBox(Translate('IDCS_SAVE_DATA_FAIL') + msg)
                    }
                }
            })
        }

        const setEvent = (data: SelectOption<string, string>[]) => {
            tableData.value = data
            pageData.value.isEventPop = false
        }

        const closeSchedulePop = async () => {
            pageData.value.isSchedulePop = false
            await getScheduleList()
            formData.value.schedule = getScheduleId(pageData.value.scheduleList, formData.value.schedule)
        }

        const formatPath = (str: string) => {
            return str.replace(/([\u4e00-\u9fa5]|[^a-zA-Z\d\.\-:\\/])/g, '')
        }

        const changeUserInfoSwitch = () => {
            if (formData.value.userInfoDsiabled) {
                formData.value.userName = ''
                formData.value.password = ''
            }
        }

        const changePasswordSwitch = () => {
            if (!formData.value.passwordSwitch) {
                formData.value.password = ''
            }
        }

        onMounted(async () => {
            openLoading()
            await getScheduleList()
            await getData()
            closeLoading()
        })

        return {
            pageData,
            formData,
            tableData,
            formRef,
            rules,
            closeSchedulePop,
            testData,
            setData,
            eventLinkedList,
            setEvent,
            formatPath,
            changeUserInfoSwitch,
            changePasswordSwitch,
        }
    },
})
