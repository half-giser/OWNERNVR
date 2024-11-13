/*
 * @Description: 普通事件——组合报警弹窗
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-23 15:03:09
 */
import { type AlarmCombinedItemDto, type AlarmCombinedFaceMatchDto } from '@/types/apiType/aiAndEvent'
import CombinationAlarmFaceMatchPop from './CombinationAlarmFaceMatchPop.vue'

export default defineComponent({
    components: {
        CombinationAlarmFaceMatchPop,
    },
    props: {
        linkedId: {
            type: String,
            required: true,
        },
        linkedList: {
            type: Array as PropType<AlarmCombinedItemDto[]>,
            required: true,
        },
        currRowFaceObj: {
            type: Object as PropType<Record<string, Record<string, AlarmCombinedFaceMatchDto>>>,
            required: true,
        },
    },
    emits: {
        confirm(currId: string, combinedAlarmItems: AlarmCombinedItemDto[], entity: string, obj: AlarmCombinedFaceMatchDto) {
            return typeof currId === 'string' && Array.isArray(combinedAlarmItems) && typeof entity === 'string' && typeof obj === 'object'
        },
        close(id: string) {
            return id
        },
    },
    setup(prop, ctx) {
        const router = useRouter()
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()
        const systemCaps = useCababilityStore()

        const supportFaceMatch = systemCaps.supportFaceMatch
        const IntelAndFaceConfigHide = systemCaps.IntelAndFaceConfigHide
        const localFaceDectMaxCount = systemCaps.localFaceDectMaxCount
        const localTargetDectMaxCount = systemCaps.localTargetDectMaxCount

        const COMBINED_ALARM_TYPES_MAPPING: Record<string, string> = {
            Motion: Translate('IDCS_MOTION_DETECTION'), //移动侦测
            Sensor: Translate('IDCS_SENSOR'), //传感器
            FaceMatch: Translate('IDCS_FACE_MATCH'), //人脸识别
            InvadeDetect: Translate('IDCS_INVADE_DETECTION'), //区域入侵
            Tripwire: Translate('IDCS_BEYOND_DETECTION'), //越界
        }

        // motion和sensor类型一定会有
        const COMMON_ALARM_TYPES_MAPPING: Record<string, string> = {
            Motion: Translate('IDCS_MOTION_DETECTION'),
            Sensor: Translate('IDCS_SENSOR'),
        }

        // 能力集不支持人脸的map类型（支持人车非+人车非，不支持人脸+人脸、人脸+人车非）
        const NO_FACE_ALARM_TYPES_MAPPING: Record<string, string> = {
            Motion: Translate('IDCS_MOTION_DETECTION'),
            Sensor: Translate('IDCS_SENSOR'),
            InvadeDetect: Translate('IDCS_INVADE_DETECTION'),
            Tripwire: Translate('IDCS_BEYOND_DETECTION'),
        }

        const detectTypeMap: Record<string, string> = {
            Sensor: Translate('IDCS_SENSOR'),
            Motion: Translate('IDCS_MOTION_DETECTION'),
            FaceMatch: Translate('IDCS_FACE_DETECTION'),
            InvadeDetect: Translate('IDCS_INVADE_DETECTION'),
            Tripwire: Translate('IDCS_BEYOND_DETECTION'),
        }

        const detectBtnMap: Record<string, string> = {
            Sensor: Translate('IDCS_CHANGE_SENSOR'),
            Motion: Translate('IDCS_CHANGE_MOTION'),
            FaceMatch: Translate('IDCS_CHANGE_FACE'),
            InvadeDetect: Translate('IDCS_CHANGE_INVADE'),
            Tripwire: Translate('IDCS_CHANGE_TRIPWIRE'),
        }

        const pageData = ref({
            alarmSourceTypeList: [[] as SelectOption<string, string>[]],
            alarmSourceEntityList: [[] as SelectOption<string, string>[]],
            chlsMap: [] as SelectOption<string, string>[],
            chlsFilterMapForThermal: [] as SelectOption<string, string>[],
            chlsFilterMap: [] as SelectOption<string, string>[],
            sensorsMap: [] as SelectOption<string, string>[],
            faceMap: [] as SelectOption<string, string>[],
            peaMap: [] as SelectOption<string, string>[],
            tripwireMap: [] as SelectOption<string, string>[],
            description: [] as string[],
            isDetectShow: false,
            detectChlId: '',
            detectEntity: '',
            detectType: '',
            detectBtn: { value: '', label: '' },
            isFaceMatchPopShow: false,
            linkedEntity: '',
            linkedObj: {} as Record<string, AlarmCombinedFaceMatchDto>,
            faceMatchObj: {} as Record<string, Record<string, AlarmCombinedFaceMatchDto>>,
        })

        const tableData = ref<AlarmCombinedItemDto[]>([])

        const getChls = () => {
            getChlList({ requireField: ['protocolType'] }).then((result) => {
                commLoadResponseHandler(result, ($) => {
                    $('//content/item').forEach((item) => {
                        const $item = queryXml(item.element)
                        const protocolType = $item('protocolType').text()
                        const factoryName = $item('productModel').attr('factoryName')
                        const accessType = $item('AccessType').text()
                        if (protocolType === 'RTSP') return
                        pageData.value.chlsMap.push({
                            value: item.attr('id')!,
                            label: $item('name').text(),
                        })
                        if (factoryName === 'Recorder') return
                        pageData.value.chlsFilterMapForThermal.push({
                            value: item.attr('id')!,
                            label: $item('name').text(),
                        })
                        // 过滤掉热成像通道
                        if (accessType == '1') return
                        pageData.value.chlsFilterMap.push({
                            value: item.attr('id')!,
                            label: $item('name').text(),
                        })
                    })
                })
            })
        }

        const getSensors = () => {
            getChlList({ nodeType: 'sensors' }).then((result) => {
                commLoadResponseHandler(result, ($) => {
                    $('//content/item').forEach((item) => {
                        const $item = queryXml(item.element)
                        let name = $item('name').text()
                        if ($item('devDesc').text()) {
                            name = $item('devDesc').text() + '_' + name
                        }
                        pageData.value.sensorsMap.push({
                            value: item.attr('id')!,
                            label: name,
                        })
                    })
                })
            })
        }

        // 获取支持人脸比对的通道
        const getFaceMatchData = () => {
            getChlList({
                nodeType: 'chls',
                isSupportVfd: true,
                requireField: ['protocolType'],
            }).then((result) => {
                commLoadResponseHandler(result, ($) => {
                    $('//content/item').forEach((item) => {
                        const $item = queryXml(item.element)
                        const protocolType = $item('protocolType').text()
                        const factoryName = $item('productModel').attr('factoryName')
                        const accessType = $item('AccessType').text()

                        // 过滤掉rtsp和cms添加的通道以及热成像通道
                        if (accessType == '1') return
                        if (factoryName === 'Recorder') return
                        if (protocolType === 'RTSP') return

                        pageData.value.faceMap.push({
                            value: item.attr('id')!,
                            label: $('name').text(),
                        })
                    })
                })
            })
        }

        // 配置支持区域入侵的通道
        const getPeaData = () => {
            getChlList({
                nodeType: 'chls',
                isSupportPea: true,
                requireField: ['protocolType'],
            }).then((result) => {
                commLoadResponseHandler(result, ($) => {
                    $('//content/item').forEach((item) => {
                        const $item = queryXml(item.element)
                        const protocolType = $item('protocolType').text()
                        const factoryName = $item('productModel').attr('factoryName')

                        // 过滤掉rtsp和cms添加的通道
                        if (factoryName === 'Recorder') return
                        if (protocolType === 'RTSP') return
                        pageData.value.peaMap.push({
                            value: item.attr('id')!,
                            label: $item('name').text(),
                        })
                    })
                })
            })
        }

        // 配置支持越界的通道
        const getTripwireData = () => {
            getChlList({
                nodeType: 'chls',
                isSupportTripwire: true,
                requireField: ['protocolType'],
            }).then((result) => {
                commLoadResponseHandler(result, ($) => {
                    $('//content/item').forEach((item) => {
                        const $item = queryXml(item.element)
                        const protocolType = $item('protocolType').text()
                        const factoryName = $item('productModel').attr('factoryName')

                        // 过滤掉rtsp和cms添加的通道
                        if (factoryName === 'Recorder') return
                        if (protocolType === 'RTSP') return
                        pageData.value.tripwireMap.push({
                            value: item.attr('id')!,
                            label: $item('name').text(),
                        })
                    })
                })
            })
        }

        const open = () => {
            tableData.value = [
                {
                    alarmSourceType: 'Motion',
                    alarmSourceEntity: { value: '', label: '' },
                },
                {
                    alarmSourceType: 'Sensor',
                    alarmSourceEntity: { value: '', label: '' },
                },
            ]
            prop.linkedList?.forEach((item, index) => {
                tableData.value[index] = {
                    alarmSourceType: item.alarmSourceType,
                    alarmSourceEntity: {
                        value: item.alarmSourceEntity.value,
                        label: item.alarmSourceEntity.label,
                    },
                }
            })

            let alarmSourceType = supportFaceMatch ? COMBINED_ALARM_TYPES_MAPPING : IntelAndFaceConfigHide ? COMMON_ALARM_TYPES_MAPPING : NO_FACE_ALARM_TYPES_MAPPING

            let dataIndex = '' // 标记数据中是否是人脸比对类型
            let isInvadeAndTrip = true // 是否类型全是越界和区域入侵（先假设是）
            tableData.value.forEach((item, index) => {
                if (item.alarmSourceType != 'InvadeDetect' && item.alarmSourceType != 'Tripwire') isInvadeAndTrip = false
                if (item.alarmSourceType == 'FaceMatch' || item.alarmSourceType == 'InvadeDetect' || item.alarmSourceType == 'Tripwire') dataIndex = index.toString()
            })

            tableData.value.forEach((item, index) => {
                alarmSourceType = supportFaceMatch ? COMBINED_ALARM_TYPES_MAPPING : IntelAndFaceConfigHide ? COMMON_ALARM_TYPES_MAPPING : NO_FACE_ALARM_TYPES_MAPPING
                // 支持人车非+人车非，不支持人脸+人脸、人脸+人车非
                if (isInvadeAndTrip) {
                    alarmSourceType = NO_FACE_ALARM_TYPES_MAPPING
                    // 0 && true 为false;dataIndex转为字符串(dataIndex不作为number类型，还因为其有为空的可能，数字类型初始化为0会影响判断)
                } else if (dataIndex && dataIndex != index.toString()) {
                    const currType = tableData.value[Number(dataIndex)].alarmSourceType
                    alarmSourceType = currType == 'FaceMatch' ? COMMON_ALARM_TYPES_MAPPING : NO_FACE_ALARM_TYPES_MAPPING
                }

                pageData.value.alarmSourceTypeList[index] = getTypeMap(alarmSourceType)
                pageData.value.alarmSourceEntityList[index] = getEntityMap(item.alarmSourceType)
            })

            pageData.value.faceMatchObj = prop.currRowFaceObj || {}

            changeDescription()
            CheckDetect(tableData.value[1])
        }

        // 类型的映射对象转换为选择器数组列表
        const getTypeMap = (typeMap: Record<string, string>) => {
            const mapList = []
            for (const key in typeMap) {
                mapList.push({
                    value: key,
                    label: typeMap[key],
                })
            }
            return mapList
        }

        // 改变类型对应选择的报警源数据列表
        const getEntityMap = (currType: string) => {
            let mapList = pageData.value.chlsMap

            if (currType === 'Sensor') {
                // 传感器
                mapList = pageData.value.sensorsMap
            } else if (currType === 'Motion') {
                // 移动侦测
                mapList = pageData.value.chlsFilterMap
            } else if (currType === 'FaceMatch') {
                // 人脸比对
                mapList = localFaceDectMaxCount ? pageData.value.chlsFilterMap : pageData.value.faceMap // 支持人脸后侦测，放上全部通道
            } else if (currType === 'InvadeDetect') {
                // 区域入侵
                mapList = localTargetDectMaxCount ? pageData.value.chlsFilterMapForThermal : pageData.value.peaMap
            } else if (currType === 'Tripwire') {
                // 越界
                mapList = localTargetDectMaxCount ? pageData.value.chlsFilterMapForThermal : pageData.value.tripwireMap
            }
            return mapList
        }

        const rowChange = (row: AlarmCombinedItemDto) => {
            changeDescription()
            CheckDetect(row)
        }

        const typeChange = (row: AlarmCombinedItemDto, index: number) => {
            let optionMap = supportFaceMatch ? COMBINED_ALARM_TYPES_MAPPING : IntelAndFaceConfigHide ? COMMON_ALARM_TYPES_MAPPING : NO_FACE_ALARM_TYPES_MAPPING
            const type = row.alarmSourceType

            if (type == 'FaceMatch') {
                optionMap = COMMON_ALARM_TYPES_MAPPING
            } else if (type == 'InvadeDetect' || type == 'Tripwire') {
                optionMap = NO_FACE_ALARM_TYPES_MAPPING
            }

            if (index == 0) {
                pageData.value.alarmSourceTypeList[1] = getTypeMap(optionMap)
            } else {
                pageData.value.alarmSourceTypeList[0] = getTypeMap(optionMap)
            }
            const entityList = getEntityMap(type)

            pageData.value.alarmSourceEntityList[index] = entityList

            if (!entityList.includes(tableData.value[index].alarmSourceEntity)) {
                tableData.value[index].alarmSourceEntity.value = entityList[0].value
                tableData.value[index].alarmSourceEntity.label = entityList[0].label
            }

            changeDescription()
            CheckDetect(row)
        }

        const entityChange = (row: AlarmCombinedItemDto) => {
            const entityList = getEntityMap(row.alarmSourceType)
            entityList.some((item) => {
                if (item.value == row.alarmSourceEntity.value) {
                    row.alarmSourceEntity.label = item.label
                    return true
                }
            })
            changeDescription()
            CheckDetect(row)
        }

        const changeDescription = () => {
            pageData.value.description = []
            tableData.value.forEach((item) => {
                if (item.alarmSourceType == 'FaceMatch') {
                    let str = COMBINED_ALARM_TYPES_MAPPING[item.alarmSourceType] + ' ' + (item.alarmSourceEntity.label || '')

                    if (pageData.value.faceMatchObj[item.alarmSourceEntity.value]) {
                        const obj = pageData.value.faceMatchObj[item.alarmSourceEntity.value].obj
                        const ruleMap: Record<string, string> = {
                            '1': Translate('IDCS_SUCCESSFUL_RECOGNITION'),
                            '0': Translate('IDCS_GROUP_STRANGER'),
                            '2': Translate('IDCS_WORKTIME_MISS_HIT'),
                        }
                        let faceStr = ''
                        obj.faceDataBase.forEach((item) => {
                            if (item) faceStr += item
                        })

                        str +=
                            '，' +
                            Translate('IDCS_FACE_MATCH_RESULT') +
                            ' ' +
                            ruleMap[obj.rule] +
                            faceStr +
                            '；' +
                            Translate('IDCS_PREALARM_BEFORE') +
                            ' ' +
                            -obj.duration +
                            Translate('IDCS_SECOND') +
                            '；' +
                            Translate('IDCS_PREALARM_AFTER') +
                            ' ' +
                            obj.delay +
                            Translate('IDCS_SECOND')
                    }

                    pageData.value.description.push(str)
                } else {
                    const str = COMBINED_ALARM_TYPES_MAPPING[item.alarmSourceType] + ' ' + (item.alarmSourceEntity.label || '')
                    pageData.value.description.push(str)
                }
            })
        }

        const CheckDetect = async (row: AlarmCombinedItemDto) => {
            const id = row?.alarmSourceEntity.value
            // 在没有报警源时不进行后续处理
            if (!id) return false

            let isShowDetect = ''
            if (row.alarmSourceType == 'Sensor') {
                const sendXml = rawXml`
                    <condition>
                        <alarmInId>${id}</alarmInId>
                    </condition>
                `
                const result = await queryAlarmIn(sendXml)
                commLoadResponseHandler(result, ($) => {
                    isShowDetect = $('//content/param/switch').text()
                })
                // 以下几种类型的请求头是一样的
            } else {
                const sendXml = rawXml`
                    <condition>
                        <chlId>${id}</chlId>
                    </condition>
                    <requireField>
                        <param/>
                    </requireField>
                `
                // 区域入侵
                if (row.alarmSourceType == 'InvadeDetect') {
                    const typeMap = localTargetDectMaxCount ? pageData.value.chlsFilterMapForThermal : pageData.value.peaMap
                    if (!typeMap.some((el) => el.value == id)) {
                        return false
                    }
                    const result = await queryIntelAreaConfig(sendXml)
                    const $ = queryXml(result)
                    // 开关包含区域入侵、区域进入、区域离开
                    const perimeterSwitch = $('//content/chl/perimeter/param/switch').text() == 'true'
                    const entrySwitch = $('//content/chl/entry/param/switch').text() == 'true'
                    const leaveSwitch = $('//content/chl/leave/param/switch').text() == 'true'
                    isShowDetect = perimeterSwitch || entrySwitch || leaveSwitch ? 'true' : 'false'
                    // 人脸比对
                } else if (row.alarmSourceType == 'FaceMatch') {
                    const typeMap = localTargetDectMaxCount ? pageData.value.chlsFilterMap : pageData.value.faceMap
                    if (!typeMap.some((el) => el.value == id)) {
                        return false
                    }
                    let isVfdChl = false // 当前通道是否为前侦测通道
                    pageData.value.faceMap.forEach((item) => {
                        if (item.value == id) {
                            isVfdChl = true
                        }
                    })

                    if (isVfdChl) {
                        const result = await queryIntelAreaConfig(sendXml)
                        const $ = queryXml(result)
                        isShowDetect = $('//content/chl/param/switch').text()
                    } else {
                        const result = await queryBackFaceMatch()
                        const $ = queryXml(result)
                        isShowDetect = 'false'
                        $('//content/param/chls/item').forEach((item) => {
                            if (item.attr('guid') == id) {
                                isShowDetect = queryXml(item.element)('switch').text()
                            }
                        })
                    }
                } else if (row.alarmSourceType == 'Tripwire') {
                    const typeMap = localTargetDectMaxCount ? pageData.value.chlsFilterMapForThermal : pageData.value.tripwireMap
                    if (!typeMap.some((el) => el.value == id)) {
                        return false
                    }
                    const result = await queryTripwire(sendXml)
                    const $ = queryXml(result)

                    isShowDetect = $('//content/chl/param/switch').text()
                } else if (row.alarmSourceType == 'Motion') {
                    const result = await queryMotion(sendXml)
                    const $ = queryXml(result)

                    isShowDetect = $('//content/chl/param/switch').text()
                }
            }

            if (isShowDetect == 'false') {
                pageData.value.isDetectShow = true
                pageData.value.detectChlId = row.alarmSourceEntity.value
                pageData.value.detectEntity = row.alarmSourceEntity.label
                pageData.value.detectType = detectTypeMap[row.alarmSourceType]
                pageData.value.detectBtn.value = row.alarmSourceType
                pageData.value.detectBtn.label = detectBtnMap[row.alarmSourceType]
            } else {
                pageData.value.isDetectShow = false
            }
        }

        // 跳转到相应页面
        const clickChangeDetect = () => {
            const urlMap: Record<string, string> = {
                Motion: '/config/channel/settings/motion',
                Sensor: '/config/alarm/sensor',
                FaceMatch: '/config/alarm/faceRecognition',
                InvadeDetect: '/config/alarm/boundary',
                Tripwire: '/config/alarm/boundary',
            }
            switch (pageData.value.detectBtn.value) {
                case 'Motion':
                case 'Sensor':
                    router.push({
                        path: urlMap[pageData.value.detectBtn.value],
                    })
                    break
                case 'FaceMatch':
                    router.push({
                        path: '/config/alarm/faceRecognition',
                        state: {
                            chlId: pageData.value.detectChlId,
                        },
                    })
                    break
                case 'InvadeDetect':
                    router.push({
                        path: '/config/alarm/boundary',
                        state: {
                            type: 'Pea',
                            chlId: pageData.value.detectChlId,
                        },
                    })
                    break
                case 'Tripwire':
                    router.push({
                        path: '/config/alarm/boundary',
                        state: {
                            type: 'Tripwire',
                            chlId: pageData.value.detectChlId,
                        },
                    })
                    break
            }
        }

        const handleEdit = (entity: string) => {
            pageData.value.linkedEntity = entity
            pageData.value.linkedObj = pageData.value.faceMatchObj[entity]
            pageData.value.isFaceMatchPopShow = true
        }

        const handleFaceMatchLinkedObj = (entity: string, obj: AlarmCombinedFaceMatchDto) => {
            pageData.value.faceMatchObj[entity] = {}
            pageData.value.faceMatchObj[entity].obj = obj
            changeDescription()
        }

        const save = () => {
            let isSameId = false
            let isAlarmSourceNull = false
            tableData.value.some((item) => {
                if (!item.alarmSourceEntity.value) {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_ALARM_SOURCE_NULL'),
                    })
                    isAlarmSourceNull = true
                    return true
                }
            })
            if (isAlarmSourceNull) return false

            const sameSource = [] as string[]
            for (let i = 0; i < tableData.value.length; i++) {
                if (i == 0) {
                    sameSource[i] = tableData.value[i].alarmSourceEntity.value
                } else {
                    if (!sameSource.includes(tableData.value[i].alarmSourceEntity.value)) {
                        sameSource[i] = tableData.value[i].alarmSourceEntity.value
                    } else {
                        openMessageBox({
                            type: 'info',
                            message: Translate('IDCS_ALARM_SOURCE_SAME_ERROR'),
                        })
                        isSameId = true
                        break
                    }
                }
            }
            if (isSameId) return false

            let entity = ''
            let obj = {} as AlarmCombinedFaceMatchDto
            tableData.value.forEach((item) => {
                if (item.alarmSourceType == 'FaceMatch' && pageData.value.faceMatchObj[item.alarmSourceEntity.value]) {
                    if (pageData.value.faceMatchObj[item.alarmSourceEntity.value]) {
                        entity = item.alarmSourceEntity.value
                        obj = pageData.value.faceMatchObj[item.alarmSourceEntity.value].obj
                    }
                }
            })
            ctx.emit('confirm', prop.linkedId!, tableData.value, entity, obj)
            ctx.emit('close', prop.linkedId!)
        }

        const close = () => {
            ctx.emit('close', prop.linkedId!)
        }

        onMounted(async () => {
            getChls()
            getSensors()
            getFaceMatchData()
            getPeaData()
            getTripwireData()
        })

        return {
            CombinationAlarmFaceMatchPop,
            tableData,
            pageData,
            open,
            rowChange,
            typeChange,
            entityChange,
            CheckDetect,
            clickChangeDetect,
            handleEdit,
            handleFaceMatchLinkedObj,
            save,
            close,
        }
    },
})
