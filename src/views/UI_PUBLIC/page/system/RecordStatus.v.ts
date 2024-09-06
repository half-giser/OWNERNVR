/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-21 15:12:48
 * @Description: 录像状态
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-05 15:24:33
 */
import { type SystemRecordStatusList } from '@/types/apiType/system'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()

        // 录像状态与显示文案的映射
        const DEFAULT_REC_STATUS_MAPPING: Record<string, string> = {
            on: 'IDCS_RECORD_ING',
            off: 'IDCS_NO_RECORD_NOW',
            abnormal: 'IDCS_RECORD_EXCEPTION',
        }

        // 录像类型与显示文案的映射
        const DEFAULT_REC_TYPE_MAPPING: Record<string, string> = {
            manual: 'IDCS_MANUAL',
            motion: 'IDCS_MOTION_DETECTION',
            schedule: 'IDCS_SCHEDULE',
            sensor: 'IDCS_SENSOR',
            pos: 'IDCS_POS',
            vfd: 'IDCS_FACE_DISPOSE_WAY',
            faceMatc: 'IDCS_FACE_MATCH',
            osc: 'IDCS_WATCH_DETECTION',
            avd: 'IDCS_ABNORMAL_DETECTION',
            tripwire: 'IDCS_BEYOND_DETECTION',
            pea: 'IDCS_INVADE_DETECTION',
            cpc: 'IDCS_PEOPLE_COUNT_DETECTION',
            ipd: 'IDCS_PEOPLE_INSTRUSION_DETECTION',
            cdd: 'IDCS_CROWD_DENSITY_DETECTION',
            vehicle: 'IDCS_PLATE_MATCH',
            fire_point: 'IDCS_FIRE_POINT_DETECTION',
            temperature: 'IDCS_TEMPERATURE_DETECTION',
        }

        // 图像质量与显示文案的映射
        const DEFAULT_IMAGE_LEVEL_MAPPING: Record<string, string> = {
            highest: 'IDCS_HIGHEST',
            higher: 'IDCS_HIGHER',
            medium: 'IDCS_MEDIUM',
            low: 'IDCS_LOW',
            lower: 'IDCS_LOWER',
            lowest: 'IDCS_LOWEST',
        }

        // 码流类型与显示文案的映射
        const DEFAULT_STREAM_TYPE_MAPPING: Record<string, string> = {
            main: 'IDCS_MAIN_STREAM',
            sub: 'IDCS_SUB_STREAM',
        }

        const tableData = ref<SystemRecordStatusList[]>([])

        /**
         * @description 获取表格数据
         */
        const getData = async () => {
            const result = await queryRecStatus()
            commLoadResponseHandler(result, ($) => {
                tableData.value = []
                $('//content/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    const recType: string[] = []
                    $item('recTypes/item').forEach((recTypeItem) => {
                        const text = recTypeItem.text()
                        if (text) recType.push(text.trim())
                    })
                    tableData.value.push({
                        name: $item('chl').text(),
                        resolution: $item('resolution').text(),
                        frameRate: $item('frameRate').text(),
                        quality: $item('quality').text(),
                        bitType: $item('bitType').text(),
                        level: $item('level').text(),
                        recStatus: $item('recStatus').text(),
                        streamType: $item('streamType').text(),
                        recTypes: recType,
                    })
                })
            })
        }

        /**
         * @description 格式化录像类型字段显示
         * @param {SystemRecordStatusList} row
         */
        const formatRecordType = (row: SystemRecordStatusList) => {
            const recTypes = row.recTypes
            if (!recTypes.length) return '--'
            return recTypes
                .sort((a, b) => {
                    const getOrderIndex = (x: string) => {
                        switch (x) {
                            case 'manual':
                                return 0
                            case 'sensor':
                                return 1
                            case 'motion':
                                return 2
                            case 'schedule':
                                return 3
                            case 'pos':
                                return 4
                            default:
                                return 5
                        }
                    }
                    return getOrderIndex(a) - getOrderIndex(b)
                })
                .map((item) => Translate(DEFAULT_REC_TYPE_MAPPING[item]))
                .join('/')
        }

        /**
         * @description 处理右上侧按钮点击刷新
         * @param event
         * @returns
         */
        const handleToolBarEvent = (event: ConfigToolBarEvent<ChannelToolBarEvent>) => {
            if (event.type === 'refresh') {
                getData()
                return
            }
        }

        onMounted(() => {
            getData()
        })

        return {
            handleToolBarEvent,
            tableData,
            formatRecordType,
            DEFAULT_REC_STATUS_MAPPING,
            DEFAULT_STREAM_TYPE_MAPPING,
            DEFAULT_IMAGE_LEVEL_MAPPING,
        }
    },
})
