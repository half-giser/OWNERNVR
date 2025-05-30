/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-21 14:31:40
 * @Description: 通道状态
 */
export default defineComponent({
    setup(_prop, ctx) {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()

        // 状态值与显示文案的映射
        const TRANS_MAPPING: Record<string, string> = {
            noSupport: Translate('IDCS_NONSUPPORT'),
            alarmOff: Translate('IDCS_NO_ALARM'),
            alarming: Translate('IDCS_NOW_ALARM'),
            noAlarming: Translate('IDCS_NO_ALARM'),
            recordingOff: Translate('IDCS_NO_RECORD_NOW'),
            recording: Translate('IDCS_RECORD_ING'),
            noRecording: Translate('IDCS_NO_RECORD_NOW'),
            recordingAbnormal: Translate('IDCS_RECORD_EXCEPTION'),
            oscAlarming: Translate('IDCS_WATCH_DETECTION'),
            avdAlarming: Translate('IDCS_ABNORMAL_DETECTION'),
            tripwireAlarming: Translate('IDCS_BEYOND_DETECTION'),
            peaAlarming: Translate('IDCS_INVADE_DETECTION'),
            sanAlarming: Translate('IDCS_SMART_AOI_ENTRY_DETECTION'),
            salAlarming: Translate('IDCS_SMART_AOI_LEAVE_DETECTION'),
            vfdAlarming: Translate('IDCS_FACE_DETECTION'),
            cpcAlarming: Translate('IDCS_PEOPLE_COUNT_DETECTION'),
            ipdAlarming: Translate('IDCS_PEOPLE_INSTRUSION_DETECTION'),
            cddAlarming: Translate('IDCS_CROWD_DENSITY_DETECTION'),
            plateMatchAlarming: Translate('IDCS_PLATE_MATCH'),
            faceMatchAlarming: Translate('IDCS_FACE_MATCH'),
            smartFirePointAlarming: Translate('IDCS_FIRE_POINT_DETECTION'),
            temperatureAlarming: Translate('IDCS_TEMPERATURE_DETECTION'),
            asdAlarming: Translate('IDCS_AUDIO_EXCEPTION_DETECTION'),
            pvdAlarming: Translate('IDCS_PARKING_DETECTION'),
            loiteringAlarming: Translate('IDCS_LOITERING_DETECTION'),
            LineStatisticsAlarming: Translate('IDCS_PASS_LINE_COUNT_DETECTION'),
            crowdGatherAlarming: Translate('IDCS_CROWD_GATHERING'),
            srsAlarming: Translate('IDCS_REGION_STATISTICS'),
        }

        const tableData = ref<SystemChannelStatusList[]>([])

        /**
         * @description 获取列表数据
         */
        const getData = async () => {
            const result = await queryChlStatus()
            commLoadResponseHandler(result, ($) => {
                tableData.value = $('content/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        name: $item('chl').text(),
                        online: $item('online').text().bool(),
                        motionStatus: $item('motionStatus').text(),
                        intelligentStatus: $item('intelligentStatus').text(),
                        recStatus: $item('recStatus').text(),
                    }
                })
            })
        }

        /**
         * @description 格式化移动侦测字段数据
         * @param {SystemChannelStatusList} row
         * @returns {string}
         */
        const formatMotionStatus = (row: SystemChannelStatusList) => {
            if (!row.online || !row.motionStatus) {
                return '--'
            } else return TRANS_MAPPING[row.motionStatus === 'off' ? 'alarmOff' : row.motionStatus]
        }

        /**
         * @description 格式化AI字段数据
         * @param {SystemChannelStatusList} row
         * @returns {string}
         */
        const formatIntelligentStatus = (row: SystemChannelStatusList) => {
            if (!row.online || !row.intelligentStatus) {
                return '--'
            } else return TRANS_MAPPING[row.intelligentStatus === 'off' ? 'alarmOff' : row.intelligentStatus]
        }

        /**
         * @description 格式化录像字段数据
         * @param {SystemChannelStatusList} row
         * @returns {string}
         */
        const formatRecStatus = (row: SystemChannelStatusList) => {
            if (!row.online || !row.recStatus) {
                return '--'
            } else return TRANS_MAPPING[row.recStatus === 'off' ? 'recordingOff' : row.recStatus]
        }

        /**
         * 处理右上侧按钮点击刷新
         * @param event
         * @returns
         */
        const handleToolBarEvent = (event: ConfigToolBarEvent<SearchToolBarEvent>) => {
            if (event.type === 'refresh') {
                getData()
                return
            }
        }

        onMounted(() => {
            getData()
        })

        ctx.expose({
            handleToolBarEvent,
        })

        return {
            systemCaps,
            tableData,
            formatMotionStatus,
            formatIntelligentStatus,
            formatRecStatus,
        }
    },
})
