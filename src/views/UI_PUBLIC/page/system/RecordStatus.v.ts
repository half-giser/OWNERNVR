/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-21 15:12:48
 * @Description: 录像状态
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-16 13:54:23
 */
import { type SystemRecordStatusList } from '@/types/apiType/system'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()

        // 录像状态与显示文案的映射
        const DEFAULT_REC_STATUS_MAPPING: Record<string, string> = {
            on: Translate('IDCS_RECORD_ING'),
            off: Translate('IDCS_NO_RECORD_NOW'),
            abnormal: Translate('IDCS_RECORD_EXCEPTION'),
        }

        // 录像类型与显示文案的映射
        const DEFAULT_REC_TYPE_MAPPING: Record<string, string> = {
            manual: Translate('IDCS_MANUAL'),
            motion: Translate('IDCS_MOTION_DETECTION'),
            schedule: Translate('IDCS_SCHEDULE'),
            sensor: Translate('IDCS_SENSOR'),
            pos: Translate('IDCS_POS'),
            vfd: Translate('IDCS_FACE_DISPOSE_WAY'),
            faceMatc: Translate('IDCS_FACE_MATCH'),
            osc: Translate('IDCS_WATCH_DETECTION'),
            avd: Translate('IDCS_ABNORMAL_DETECTION'),
            tripwire: Translate('IDCS_BEYOND_DETECTION'),
            pea: Translate('IDCS_INVADE_DETECTION'),
            cpc: Translate('IDCS_PEOPLE_COUNT_DETECTION'),
            ipd: Translate('IDCS_PEOPLE_INSTRUSION_DETECTION'),
            cdd: Translate('IDCS_CROWD_DENSITY_DETECTION'),
            vehicle: Translate('IDCS_PLATE_MATCH'),
            fire_point: Translate('IDCS_FIRE_POINT_DETECTION'),
            temperature: Translate('IDCS_TEMPERATURE_DETECTION'),
        }

        // 图像质量与显示文案的映射
        const DEFAULT_IMAGE_LEVEL_MAPPING: Record<string, string> = {
            highest: Translate('IDCS_HIGHEST'),
            higher: Translate('IDCS_HIGHER'),
            medium: Translate('IDCS_MEDIUM'),
            low: Translate('IDCS_LOW'),
            lower: Translate('IDCS_LOWER'),
            lowest: Translate('IDCS_LOWEST'),
        }

        // 码流类型与显示文案的映射
        const DEFAULT_STREAM_TYPE_MAPPING: Record<string, string> = {
            main: Translate('IDCS_MAIN_STREAM'),
            sub: Translate('IDCS_SUB_STREAM'),
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
        const handleToolBarEvent = (event: ConfigToolBarEvent<SearchToolBarEvent>) => {
            if (event.type === 'refresh') {
                getData()
                return
            }
        }

        /**
         * @description 录像状态文本
         * @param {SystemRecordStatusList} row
         * @returns {string}
         */
        const displayRecStatus = (row: SystemRecordStatusList) => {
            return DEFAULT_REC_STATUS_MAPPING[row.recStatus]
        }

        /**
         * @description 码率类型文本
         * @param {SystemRecordStatusList} row
         * @returns {string}
         */
        const displayStreamType = (row: SystemRecordStatusList) => {
            return row.streamType ? DEFAULT_STREAM_TYPE_MAPPING[row.streamType] : '--'
        }

        /**
         * @description 图片质量文本
         * @param {SystemRecordStatusList} row
         * @returns {string}
         */
        const displayLevel = (row: SystemRecordStatusList) => {
            return row.level && row.bitType === 'VBR' ? DEFAULT_IMAGE_LEVEL_MAPPING[row.level] : '--'
        }

        onMounted(() => {
            getData()
        })

        return {
            handleToolBarEvent,
            tableData,
            formatRecordType,
            displayRecStatus,
            displayStreamType,
            displayLevel,
        }
    },
})
