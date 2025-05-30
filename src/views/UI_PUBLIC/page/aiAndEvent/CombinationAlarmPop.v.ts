/*
 * @Description: 普通事件——组合报警弹窗
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-23 15:03:09
 */
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
            required: false,
        },
    },
    emits: {
        confirm(currId: string, combinedAlarmItems: AlarmCombinedItemDto[], entity: string, obj?: AlarmCombinedFaceMatchDto) {
            return typeof currId === 'string' && Array.isArray(combinedAlarmItems) && typeof entity === 'string' && (typeof obj === 'object' || obj === undefined)
        },
        close(id: string) {
            return id
        },
    },
    setup(prop, ctx) {
        const router = useRouter()
        const { Translate } = useLangStore()
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

        const DETECT_TYPE_MAPPING: Record<string, string> = {
            Sensor: Translate('IDCS_SENSOR'),
            Motion: Translate('IDCS_MOTION_DETECTION'),
            FaceMatch: Translate('IDCS_FACE_DETECTION'),
            InvadeDetect: Translate('IDCS_INVADE_DETECTION'),
            Tripwire: Translate('IDCS_BEYOND_DETECTION'),
        }

        const DETECT_BTN_MAPPING: Record<string, string> = {
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

        /**
         * @description 获取通道列表
         */
        const getChls = () => {
            getChlList({
                requireField: ['protocolType'],
            }).then((result) => {
                commLoadResponseHandler(result, ($) => {
                    $('content/item').forEach((item) => {
                        const $item = queryXml(item.element)
                        const protocolType = $item('protocolType').text()
                        const factoryName = $item('productModel').attr('factoryName')
                        const accessType = $item('AccessType').text()

                        if (protocolType === 'RTSP') return

                        pageData.value.chlsMap.push({
                            value: item.attr('id'),
                            label: $item('name').text(),
                        })

                        if (factoryName === 'Recorder') return

                        pageData.value.chlsFilterMapForThermal.push({
                            value: item.attr('id'),
                            label: $item('name').text(),
                        })

                        // 过滤掉热成像通道
                        if (accessType === '1') return

                        pageData.value.chlsFilterMap.push({
                            value: item.attr('id'),
                            label: $item('name').text(),
                        })
                    })
                })
            })
        }

        /**
         * @description 获取传感器通道列表
         */
        const getSensors = () => {
            getChlList({
                nodeType: 'sensors',
            }).then((result) => {
                commLoadResponseHandler(result, ($) => {
                    pageData.value.sensorsMap = $('content/item').map((item) => {
                        const $item = queryXml(item.element)
                        let name = $item('name').text()
                        if ($item('devDesc').text()) {
                            name = $item('devDesc').text() + '_' + name
                        }
                        return {
                            value: item.attr('id'),
                            label: name,
                        }
                    })
                })
            })
        }

        /**
         * @description 获取支持人脸比对的通道
         */
        const getFaceMatchData = () => {
            getChlList({
                nodeType: 'chls',
                isSupportVfd: true,
                requireField: ['protocolType'],
            }).then((result) => {
                commLoadResponseHandler(result, ($) => {
                    $('content/item').forEach((item) => {
                        const $item = queryXml(item.element)
                        const protocolType = $item('protocolType').text()
                        const factoryName = $item('productModel').attr('factoryName')
                        const accessType = $item('AccessType').text()

                        // 过滤掉rtsp和cms添加的通道以及热成像通道
                        if (accessType === '1') return
                        if (factoryName === 'Recorder') return
                        if (protocolType === 'RTSP') return

                        pageData.value.faceMap.push({
                            value: item.attr('id'),
                            label: $('name').text(),
                        })
                    })
                })
            })
        }

        /**
         * @description 配置支持区域入侵的通道
         */
        const getPeaData = () => {
            getChlList({
                nodeType: 'chls',
                isSupportPea: true,
                requireField: ['protocolType'],
            }).then((result) => {
                commLoadResponseHandler(result, ($) => {
                    $('content/item').forEach((item) => {
                        const $item = queryXml(item.element)
                        const protocolType = $item('protocolType').text()
                        const factoryName = $item('productModel').attr('factoryName')

                        // 过滤掉rtsp和cms添加的通道
                        if (factoryName === 'Recorder') return
                        if (protocolType === 'RTSP') return
                        pageData.value.peaMap.push({
                            value: item.attr('id'),
                            label: $item('name').text(),
                        })
                    })
                })
            })
        }

        /**
         * @description 配置支持越界的通道
         */
        const getTripwireData = () => {
            getChlList({
                nodeType: 'chls',
                isSupportTripwire: true,
                requireField: ['protocolType'],
            }).then((result) => {
                commLoadResponseHandler(result, ($) => {
                    $('content/item').forEach((item) => {
                        const $item = queryXml(item.element)
                        const protocolType = $item('protocolType').text()
                        const factoryName = $item('productModel').attr('factoryName')

                        // 过滤掉rtsp和cms添加的通道
                        if (factoryName === 'Recorder') return
                        if (protocolType === 'RTSP') return
                        pageData.value.tripwireMap.push({
                            value: item.attr('id'),
                            label: $item('name').text(),
                        })
                    })
                })
            })
        }

        /**
         * @description 打开弹窗 初始化数据
         */
        const open = async () => {
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
            prop.linkedList.forEach((item, index) => {
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
                if (item.alarmSourceType !== 'InvadeDetect' && item.alarmSourceType !== 'Tripwire') isInvadeAndTrip = false
                if (item.alarmSourceType === 'FaceMatch' || item.alarmSourceType === 'InvadeDetect' || item.alarmSourceType === 'Tripwire') dataIndex = index.toString()
            })

            tableData.value.forEach((item, index) => {
                alarmSourceType = supportFaceMatch ? COMBINED_ALARM_TYPES_MAPPING : IntelAndFaceConfigHide ? COMMON_ALARM_TYPES_MAPPING : NO_FACE_ALARM_TYPES_MAPPING
                // 支持人车非+人车非，不支持人脸+人脸、人脸+人车非
                if (isInvadeAndTrip) {
                    alarmSourceType = NO_FACE_ALARM_TYPES_MAPPING
                    // 0 && true 为false;dataIndex转为字符串(dataIndex不作为number类型，还因为其有为空的可能，数字类型初始化为0会影响判断)
                } else if (dataIndex && dataIndex !== index.toString()) {
                    const currType = tableData.value[Number(dataIndex)].alarmSourceType
                    alarmSourceType = currType === 'FaceMatch' ? COMMON_ALARM_TYPES_MAPPING : NO_FACE_ALARM_TYPES_MAPPING
                }

                pageData.value.alarmSourceTypeList[index] = getTypeMap(alarmSourceType)
                pageData.value.alarmSourceEntityList[index] = getEntityMap(item.alarmSourceType)
            })

            pageData.value.faceMatchObj = prop?.currRowFaceObj || {}

            changeDescription()

            // NTA1-458 修改方案如下：
            // 1、若当前组合报警未配置，打开配置窗口，无需查询通道/传感器开启/未开启状态，选择具体通道/传感器时查询
            // 2、若当前组合报警已配置，打开配置窗口，查询当前报警源1和报警源2的状态，若两个均未开启，显示报警源1未开启提示；若其中1个未开启，显示对应的报警源未开启提示；
            await checkDetect(tableData.value[0])

            if (!pageData.value.isDetectShow) {
                await checkDetect(tableData.value[1])
            }
        }

        /**
         * @description 类型的映射对象转换为选择器数组列表
         * @param {Record<string, string>} typeMap
         * @returns {SelectOption<string, string>[]}
         */
        const getTypeMap = (typeMap: Record<string, string>) => {
            return Object.entries(typeMap).map((item) => {
                return {
                    value: item[0],
                    label: item[1],
                }
            })
        }

        /**
         * @description 改变类型对应选择的报警源数据列表
         * @param {string} currType
         * @returns {SelectOption<string, string>[]}
         */
        const getEntityMap = (currType: string) => {
            switch (currType) {
                // 传感器
                case 'Sensor':
                    return pageData.value.sensorsMap
                // 移动侦测
                case 'Motion':
                    return pageData.value.chlsFilterMap
                // 人脸比对
                case 'FaceMatch':
                    // 支持人脸后侦测，放上全部通道
                    return localFaceDectMaxCount ? pageData.value.chlsFilterMap : pageData.value.faceMap
                // 区域入侵
                case 'InvadeDetect':
                    return localTargetDectMaxCount ? pageData.value.chlsFilterMapForThermal : pageData.value.peaMap
                // 越界
                case 'Tripwire':
                    return localTargetDectMaxCount ? pageData.value.chlsFilterMapForThermal : pageData.value.tripwireMap
                default:
                    return pageData.value.chlsMap
            }
        }

        const changeRow = (row: AlarmCombinedItemDto) => {
            changeDescription()
            checkDetect(row)
        }

        const changeType = (row: AlarmCombinedItemDto, index: number) => {
            let optionMap = supportFaceMatch ? COMBINED_ALARM_TYPES_MAPPING : IntelAndFaceConfigHide ? COMMON_ALARM_TYPES_MAPPING : NO_FACE_ALARM_TYPES_MAPPING
            const type = row.alarmSourceType

            if (type === 'FaceMatch') {
                optionMap = COMMON_ALARM_TYPES_MAPPING
            } else if (type === 'InvadeDetect' || type === 'Tripwire') {
                optionMap = NO_FACE_ALARM_TYPES_MAPPING
            }

            if (index === 0) {
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
            checkDetect(row)
        }

        const changeEntity = (row: AlarmCombinedItemDto) => {
            const entityList = getEntityMap(row.alarmSourceType)
            entityList.some((item) => {
                if (item.value === row.alarmSourceEntity.value) {
                    row.alarmSourceEntity.label = item.label
                    return true
                }
            })
            changeDescription()
            checkDetect(row)
        }

        const changeDescription = () => {
            pageData.value.description = []
            tableData.value.forEach((item) => {
                if (item.alarmSourceType === 'FaceMatch') {
                    let str = COMBINED_ALARM_TYPES_MAPPING[item.alarmSourceType] + ' ' + (item.alarmSourceEntity.label || '')

                    if (pageData.value.faceMatchObj[item.alarmSourceEntity.value]) {
                        const obj = pageData.value.faceMatchObj[item.alarmSourceEntity.value].obj
                        const ruleMap: Record<string, string> = {
                            '1': Translate('IDCS_SUCCESSFUL_RECOGNITION'),
                            '0': Translate('IDCS_GROUP_STRANGER'),
                            '2': Translate('IDCS_WORKTIME_MISS_HIT'),
                        }
                        const faceStr = obj.faceDataBase.map((item) => item || '').join('')
                        str += `, ${Translate('IDCS_FACE_MATCH_RESULT')} ${ruleMap[obj.rule]}${faceStr}; ${Translate('IDCS_PREALARM_BEFORE')} ${displaySecondWithUnit(obj.duration)}; ${Translate('IDCS_PREALARM_AFTER')} ${displaySecondWithUnit(obj.delay)}`
                    }
                    pageData.value.description.push(str)
                } else {
                    const str = COMBINED_ALARM_TYPES_MAPPING[item.alarmSourceType] + ' ' + (item.alarmSourceEntity.label || '')
                    pageData.value.description.push(str)
                }
            })
        }

        const checkDetect = async (row: AlarmCombinedItemDto) => {
            const id = row.alarmSourceEntity.value
            // 在没有报警源时不进行后续处理
            if (!id) return false

            const sendXml = rawXml`
                <condition>
                    <chlId>${id}</chlId>
                </condition>
                <requireField>
                    <param/>
                </requireField>
            `

            let detectSwitch = true
            if (row.alarmSourceType === 'Sensor') {
                const sendXml = rawXml`
                    <condition>
                        <alarmInId>${id}</alarmInId>
                    </condition>
                `
                const result = await queryAlarmIn(sendXml)
                const $ = queryXml(result)
                if ($('status').text() === 'success') {
                    detectSwitch = $('content/param/switch').text().bool()
                }
            }
            // 区域入侵
            else if (row.alarmSourceType === 'InvadeDetect') {
                const typeMap = localTargetDectMaxCount ? pageData.value.chlsFilterMapForThermal : pageData.value.peaMap
                if (!typeMap.some((el) => el.value === id)) {
                    return false
                }
                const result = await queryIntelAreaConfig(sendXml)
                const $ = queryXml(result)
                if ($('status').text() === 'success') {
                    // 开关包含区域入侵、区域进入、区域离开
                    const perimeterSwitch = $('content/chl/perimeter/param/switch').text().bool()
                    const entrySwitch = $('content/chl/entry/param/switch').text().bool()
                    const leaveSwitch = $('content/chl/leave/param/switch').text().bool()
                    detectSwitch = perimeterSwitch || entrySwitch || leaveSwitch
                } else {
                    detectSwitch = false
                }
            }
            // 人脸比对
            else if (row.alarmSourceType === 'FaceMatch') {
                const typeMap = localTargetDectMaxCount ? pageData.value.chlsFilterMap : pageData.value.faceMap
                if (!typeMap.some((el) => el.value === id)) {
                    return false
                }
                let isVfdChl = false // 当前通道是否为前侦测通道
                pageData.value.faceMap.forEach((item) => {
                    if (item.value === id) {
                        isVfdChl = true
                    }
                })

                if (isVfdChl) {
                    const result = await queryVfd(sendXml)
                    const $ = queryXml(result)
                    if ($('status').text() === 'success') {
                        detectSwitch = $('content/chl/param/switch').text().bool()
                    }
                } else {
                    const result = await queryBackFaceMatch()
                    const $ = queryXml(result)
                    detectSwitch = false
                    $('content/param/chls/item').forEach((item) => {
                        if (item.attr('guid') === id) {
                            detectSwitch = queryXml(item.element)('switch').text().bool()
                        }
                    })
                }
            }
            // 越界
            else if (row.alarmSourceType === 'Tripwire') {
                const typeMap = localTargetDectMaxCount ? pageData.value.chlsFilterMapForThermal : pageData.value.tripwireMap
                if (!typeMap.some((el) => el.value === id)) {
                    return false
                }
                const result = await queryTripwire(sendXml)
                const $ = queryXml(result)
                if ($('status').text() === 'success') {
                    detectSwitch = $('content/chl/param/switch').text().bool()
                }
            }
            // 移动侦测
            else if (row.alarmSourceType === 'Motion') {
                const result = await queryMotion(sendXml)
                const $ = queryXml(result)
                if ($('status').text() === 'success') {
                    detectSwitch = $('content/chl/param/switch').text().bool()
                }
            }

            if (!detectSwitch) {
                pageData.value.isDetectShow = true
                pageData.value.detectChlId = row.alarmSourceEntity.value
                pageData.value.detectEntity = row.alarmSourceEntity.label
                pageData.value.detectType = DETECT_TYPE_MAPPING[row.alarmSourceType]
                pageData.value.detectBtn.value = row.alarmSourceType
                pageData.value.detectBtn.label = DETECT_BTN_MAPPING[row.alarmSourceType]
            } else {
                pageData.value.isDetectShow = false
            }
        }

        /**
         * @description 跳转到相应页面
         */
        const changeDetect = () => {
            switch (pageData.value.detectBtn.value) {
                case 'Motion':
                    router.push({
                        path: '/config/channel/settings/motion',
                    })
                    break
                case 'Sensor':
                    router.push({
                        path: '/config/alarm/sensor',
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

        /**
         * @description 打开人脸匹配弹窗
         * @param {string} entity
         */
        const editFaceMatch = (entity: string) => {
            pageData.value.linkedEntity = entity
            pageData.value.linkedObj = pageData.value.faceMatchObj[entity]
            pageData.value.isFaceMatchPopShow = true
        }

        /**
         * @description 更新人脸识别联动
         * @param {string} entity
         * @param {AlarmCombinedFaceMatchDto} obj
         */
        const handleFaceMatchLinkedObj = (entity: string, obj: AlarmCombinedFaceMatchDto) => {
            pageData.value.faceMatchObj[entity] = {}
            pageData.value.faceMatchObj[entity].obj = obj
            changeDescription()
        }

        /**
         * @description 确认修改
         */
        const save = () => {
            let isSameId = false
            let isAlarmSourceNull = false
            tableData.value.some((item) => {
                if (!item.alarmSourceEntity.value) {
                    openMessageBox(Translate('IDCS_ALARM_SOURCE_NULL'))
                    isAlarmSourceNull = true
                    return true
                }
            })
            if (isAlarmSourceNull) return false

            const sameSource: string[] = []
            for (let i = 0; i < tableData.value.length; i++) {
                if (i === 0) {
                    sameSource[i] = tableData.value[i].alarmSourceEntity.value
                } else {
                    if (!sameSource.includes(tableData.value[i].alarmSourceEntity.value)) {
                        sameSource[i] = tableData.value[i].alarmSourceEntity.value
                    } else {
                        openMessageBox(Translate('IDCS_ALARM_SOURCE_SAME_ERROR'))
                        isSameId = true
                        break
                    }
                }
            }
            if (isSameId) return false

            const flag = tableData.value.some((item) => {
                if (item.alarmSourceType === 'FaceMatch' && pageData.value.faceMatchObj[item.alarmSourceEntity.value]) {
                    if (pageData.value.faceMatchObj[item.alarmSourceEntity.value]) {
                        const entity = item.alarmSourceEntity.value
                        const obj = pageData.value.faceMatchObj[item.alarmSourceEntity.value].obj
                        ctx.emit('confirm', prop.linkedId, tableData.value, entity, obj)
                        ctx.emit('close', prop.linkedId)
                        return true
                    }
                }
                return false
            })

            if (!flag) {
                ctx.emit('confirm', prop.linkedId, tableData.value, '')
                ctx.emit('close', prop.linkedId)
            }
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close', prop.linkedId)
        }

        onMounted(() => {
            getChls()
            getSensors()
            getFaceMatchData()
            getPeaData()
            getTripwireData()
        })

        return {
            tableData,
            pageData,
            open,
            changeRow,
            changeType,
            changeEntity,
            changeDetect,
            editFaceMatch,
            handleFaceMatchLinkedObj,
            save,
            close,
        }
    },
})
