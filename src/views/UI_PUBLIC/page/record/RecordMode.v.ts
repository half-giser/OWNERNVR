/*
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-07-17 15:44:13
 * @Description: 录像-模式配置
 */
import RecordModeAdvancePop from './RecordModeAdvancePop.vue'
import RecordModeStreamPop from './RecordModeStreamPop.vue'
import ScheduleManagPop from '../../components/schedule/ScheduleManagPop.vue'

export default defineComponent({
    components: {
        RecordModeAdvancePop,
        RecordModeStreamPop,
        ScheduleManagPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const { supportPOS, CustomerID } = useCababilityStore()

        const MODE_MAPPING: Record<string, string> = {
            manually: Translate('IDCS_REPLAY_CUSTOMIZE'),
            auto: Translate('IDCS_AUTO'),
        }

        // icon信息映射
        const ICON_MAPPING: { icon: string; event: string }[] = [
            {
                icon: 'record_all',
                event: 'INTENSIVE',
            },
            {
                icon: 'motion',
                event: 'MOTION',
            },
            {
                icon: 'alarm_1',
                event: 'ALARM',
            },
            {
                icon: 'intelligent',
                event: 'INTELLIGENT',
            },
            {
                icon: 'pos_2',
                event: 'POS',
            },
        ]

        const formData = ref(new RecordDistributeInfoDto())
        const watchEdit = useWatchEditData(formData)

        const tableData = ref<RecordScheduleDto[]>([])
        const watchRows = useWatchEditRows<RecordScheduleDto>()

        const pageData = ref({
            //录像模式下拉列表
            recModeTypeList: [] as SelectOption<string, string>[],
            //排程列表
            scheduleList: [] as SelectOption<string, string>[],
            //手动录像时长
            urgencyRecDurationList: [] as SelectOption<number, string>[],
            //排程管理弹窗显示状态
            isSchedulePop: false,
            // 高级模式配置弹窗打开状态
            isAdvancePop: false,
            // 自动模式通道码流参数配置打开状态
            isRecModeStreamPop: false,

            //当前生效的高级模式选项（只支持一个）
            advanceModeCurrent: null as RecordModeDto | null,
            // 记录上一次选择的自动模式ID，取消时回退用
            autoModeIdOld: '',
            // 高级模式详细信息
            advanceRecModes: [
                {
                    id: 'MOTION',
                    text: Translate('IDCS_MOTION_RECORD'),
                    type: REC_MODE_TYPE.EVENT,
                    events: ['MOTION'],
                    index: 1,
                },
                {
                    id: 'ALARM',
                    text: Translate('IDCS_ALARM_RECORD'),
                    type: REC_MODE_TYPE.EVENT,
                    events: ['ALARM'],
                    index: 2,
                },
                {
                    id: 'INTENSIVE',
                    text: Translate('IDCS_INTENSIVE_RECORD'),
                    type: REC_MODE_TYPE.INTENSIVE,
                    events: [REC_MODE_TYPE.INTENSIVE],
                    icon: [''],
                    index: 0,
                },
                {
                    id: 'INTELLIGENT',
                    text: Translate('IDCS_AI_RECORD'),
                    type: REC_MODE_TYPE.EVENT,
                    events: ['INTELLIGENT'],
                    index: 3,
                },
            ] as RecordModeDto[],
            basicRecModes: [
                {
                    id: 'MOTION',
                    text: Translate('IDCS_MOTION_RECORD'),
                    type: REC_MODE_TYPE.EVENT,
                    events: ['MOTION'],
                    index: 1,
                },
                {
                    id: 'ALARM',
                    text: Translate('IDCS_ALARM_RECORD'),
                    type: REC_MODE_TYPE.EVENT,
                    events: ['ALARM'],
                    index: 2,
                },
                {
                    id: 'MOTION_ALARM',
                    text: Translate('IDCS_MOTION_RECORD') + '+' + Translate('IDCS_ALARM_RECORD'),
                    type: REC_MODE_TYPE.EVENT,
                    events: ['MOTION', 'ALARM'],
                    index: 3,
                },
                {
                    id: 'INTENSIVE_MOTION',
                    text: Translate('IDCS_INTENSIVE_RECORD') + '+' + Translate('IDCS_MOTION_RECORD'),
                    type: REC_MODE_TYPE.INTENSIVE_EVENT,
                    events: ['MOTION'],
                    index: 4,
                },
                {
                    id: 'INTENSIVE_ALARM',
                    text: Translate('IDCS_INTENSIVE_RECORD') + '+' + Translate('IDCS_ALARM_RECORD'),
                    type: REC_MODE_TYPE.INTENSIVE_EVENT,
                    events: ['ALARM'],
                    index: 5,
                },
                {
                    id: 'INTENSIVE_MOTION_ALARM',
                    text: Translate('IDCS_INTENSIVE_RECORD') + '+' + Translate('IDCS_MOTION_RECORD') + '+' + Translate('IDCS_ALARM_RECORD'),
                    type: REC_MODE_TYPE.INTENSIVE_EVENT,
                    events: ['MOTION', 'ALARM'],
                    index: 6,
                },
                {
                    id: 'INTENSIVE_MOTION_ALARM_INTELLIGENT',
                    text: Translate('IDCS_INTENSIVE_RECORD') + '+' + Translate('IDCS_MOTION_RECORD') + '+' + Translate('IDCS_ALARM_RECORD') + '+' + Translate('IDCS_AI_RECORD'),
                    type: REC_MODE_TYPE.INTENSIVE_EVENT,
                    events: ['MOTION', 'ALARM', 'INTELLIGENT'],
                    index: 7,
                },
            ] as RecordModeDto[],
            // icons: {} as Record<string, string[]>,
            // 根据UI选择是否显示icon
            showIcon: import.meta.env.VITE_UI_TYPE === 'UI1-E',
            // 特定客户的需求
            isInw48: CustomerID === 100,
            advanceRecModeId: '',
        })

        // 如果支持POS，才在高级模式选项列表中加入POS
        if (supportPOS) {
            pageData.value.advanceRecModes.push({
                id: 'POS',
                text: Translate('IDCS_POS_RECORD'),
                type: REC_MODE_TYPE.EVENT,
                events: ['POS'],
                index: 4,
            })
        }

        /**
         * 缓存初始化查询时的列表数据，保存时对比变化了的行
         */
        // let recordScheduleListInit: RecordScheduleDto[] = []

        //高级录像模式列表转MAP
        const advanceRecModeMap: Record<string, RecordModeDto> = {}
        pageData.value.advanceRecModes.forEach((item) => {
            advanceRecModeMap[item.id] = item
        })

        const getIcons = (mode: RecordModeDto) => {
            return ICON_MAPPING.filter((icon) => mode.type.includes(icon.event) || mode.events.includes(icon.event)).map((icon) => icon.icon)
        }

        const changeAllSchedule = (value: string, field: 'alarmRec' | 'motionRec' | 'intelligentRec' | 'posRec' | 'scheduleRec') => {
            tableData.value.forEach((item) => {
                item[field] = value
            })
        }

        const openSchedulePop = () => {
            pageData.value.isSchedulePop = true
        }

        const getRecModeData = async () => {
            openLoading()

            const result = await queryRecordDistributeInfo()
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() !== 'success') return

            formData.value.mode = $('content/recMode/mode').text()
            formData.value.autoMode = $('content/recMode/autoMode').text()
            formData.value.autoModeEvents = $('content/recMode/autoMode').attr('eventType').array()
            formData.value.urgencyRecDuration = $('content/urgencyRecDuration').text().num()

            //TODO: CustomerID为100代表inw48客户,要求隐藏智能侦测
            if (pageData.value.isInw48) {
                pageData.value.advanceRecModes = pageData.value.advanceRecModes.filter((item) => item.id !== 'INTELLIGENT')
                pageData.value.basicRecModes.pop()
            }

            //TODO: CustomerID为351代表USE44客户,要求将manual翻译为schedule
            if (CustomerID === 351) {
                MODE_MAPPING.manually = Translate('IDCS_REC_MODE_MANUAL')
            }

            //绑定录像模式下拉
            pageData.value.recModeTypeList = $('types/recModeType/enum').map((item) => {
                return {
                    value: item.text(),
                    label: MODE_MAPPING[item.text()],
                }
            })

            //绑定手动录像时长下拉
            $('content/urgencyRecDurationNote')
                .text()
                .array()
                .forEach((item) => {
                    const value = Number(item)
                    if (Number.isNaN(value)) return
                    if (value === 0) {
                        pageData.value.urgencyRecDurationList.push({
                            value: 0,
                            label: Translate('IDCS_MANUAL'),
                        })
                        return
                    }

                    pageData.value.urgencyRecDurationList.push({
                        value: value,
                        label: getTranslateForMin(value),
                    })
                })

            // 选择自动模式列表

            for (let index = 0; index < pageData.value.basicRecModes.length; index++) {
                const item = pageData.value.basicRecModes[index]
                //如果当前返回的事件列表和基础模式的事件列表相同，则表示选中基础事件模式
                if (
                    formData.value.autoModeEvents.length === item.events.length &&
                    formData.value.autoMode === item.type &&
                    formData.value.autoModeEvents.filter((o) => item.events.includes(o)).length === formData.value.autoModeEvents.length
                ) {
                    formData.value.autoModeId = item.id
                    break
                }
            }

            // 基本模式不匹配说明是高级
            if (formData.value.autoModeId === '') {
                const autoModeEvents = formData.value.autoModeEvents.slice(0)
                if (formData.value.autoMode === REC_MODE_TYPE.INTENSIVE_EVENT) {
                    autoModeEvents.push(REC_MODE_TYPE.INTENSIVE)
                }
                genAdvanceMode(autoModeEvents)
                formData.value.autoModeId = pageData.value.advanceModeCurrent!.id
            } else {
                pageData.value.advanceModeCurrent = null
            }

            // 如果返回数据中没有高级模式，查看本次会话中是否有已构建好的高级模式
            if (pageData.value.advanceModeCurrent === null) {
                if (pageData.value.advanceRecModeId) {
                    genAdvanceMode(pageData.value.advanceRecModeId.split('_'))
                }
            }
        }

        /**
         * 生成当前的高级模式项对象
         * @param events 事件列表（其中可能包含INTENSIVE）
         * @returns true 添加成功，false 添加失败
         */
        const genAdvanceMode = (events: string[]) => {
            // 如果选择的项为空，表示删除高级模式项
            if (!events.length) {
                pageData.value.advanceModeCurrent = null
                return true
            }

            const intensiveIndex = events.indexOf(REC_MODE_TYPE.INTENSIVE)
            // 不能只选一直录像
            if (events.length === 1 && intensiveIndex > -1) {
                openMessageBox(Translate('IDCS_ONLY_INTENSIVE_TIP'))
                return false
            }

            let autoModeIsIntensive = false
            if (intensiveIndex > -1) {
                autoModeIsIntensive = true
                events.splice(intensiveIndex, 1)
            } else {
                autoModeIsIntensive = false
            }
            events.sort((a, b) => {
                return advanceRecModeMap[a].index - advanceRecModeMap[b].index
            })

            const advanceModeCurrent: RecordModeDto = {
                id: events.join('_'),
                text: events
                    .map((item) => {
                        return advanceRecModeMap[item].text
                    })
                    .join('+'),
                type: '',
                events: [],
                index: 0,
            }

            if (autoModeIsIntensive) {
                advanceModeCurrent.id = `${REC_MODE_TYPE.INTENSIVE}_${advanceModeCurrent.id}`
                advanceModeCurrent.text = `${advanceRecModeMap[REC_MODE_TYPE.INTENSIVE].text}+${advanceModeCurrent.text}`
            }

            // 检查高级模式组合是否已经在基础组合中存在，各事件出现的顺序是固定的，保证了不同组合的id唯一性
            if (
                pageData.value.basicRecModes.find((item) => {
                    return item.id === advanceModeCurrent.id
                })
            ) {
                openMessageBox(Translate('IDCS_RECORD_MODE_EXIST'))
                return false
            }

            advanceModeCurrent.events = events
            advanceModeCurrent.type = autoModeIsIntensive ? REC_MODE_TYPE.INTENSIVE_EVENT : REC_MODE_TYPE.EVENT

            pageData.value.advanceModeCurrent = advanceModeCurrent

            pageData.value.advanceRecModeId = advanceModeCurrent.id
            // genIconMap(recAutoModeList.value.concat([advanceModeCurrent]))

            return true
        }

        /**
         * 动态计算自动模式列表：基础模式和高级选项的并集
         */
        const recAutoModeList = computed(() => {
            return pageData.value.advanceModeCurrent === null ? pageData.value.basicRecModes : pageData.value.basicRecModes.concat(pageData.value.advanceModeCurrent)
        })

        /**
         * 初始化通道的录像排程表格
         */
        const getRecordScheduleList = async () => {
            openLoading()

            pageData.value.scheduleList = await buildScheduleList()

            const result = await queryRecordScheduleList()
            const $ = queryXml(result)

            if ($('status').text() !== 'success') {
                return
            }

            // 通道的录像排程表格数据
            tableData.value = $('content/item').map((item) => {
                const $item = queryXml(item.element)
                const getRecScheduleSelectValue = (str: string) => {
                    const switchType = $item(str + '/switch')
                        .text()
                        .bool()
                    return switchType ? $item(str + '/schedule').text() : DEFAULT_EMPTY_ID
                }
                return {
                    id: item.attr('id'),
                    name: $item('name').text(),
                    alarmRec: getRecScheduleSelectValue('alarmRec'),
                    motionRec: getRecScheduleSelectValue('motionRec'),
                    intelligentRec: getRecScheduleSelectValue('intelligentRec'),
                    posRec: getRecScheduleSelectValue('posRec'),
                    scheduleRec: getRecScheduleSelectValue('scheduleRec'),
                    status: '',
                    statusTip: '',
                    disabled: false,
                }
            })

            tableData.value.forEach((item) => {
                watchRows.listen(item)
            })

            closeLoading()
        }

        /**
         * 高级弹窗确认事件
         * @param selectedEvents 选择的事件列表
         */
        const confirmAdvancePop = (selectedEvents: string[]) => {
            if (genAdvanceMode(selectedEvents)) pageData.value.isAdvancePop = false
        }

        const closeStreamPop = (isConfirm: boolean) => {
            if (!isConfirm) {
                formData.value.autoModeId = pageData.value.autoModeIdOld
            } else {
                pageData.value.autoModeIdOld = formData.value.autoModeId
            }
            pageData.value.isRecModeStreamPop = false
        }

        /**
         * @description 提交录像模式配置数据
         */
        const setRecModeInfo = () => {
            const curAutoMode = recAutoModeList.value.find((item) => {
                return item.id === formData.value.autoModeId
            })

            formData.value.autoMode = curAutoMode!.type
            formData.value.autoModeEvents = curAutoMode!.events
            const events = formData.value.autoModeEvents.join(',')

            const sendXml = rawXml`
                <types>
                    <recModeType>
                        <enum>manually</enum>
                        <enum>auto</enum>
                    </recModeType>
                    <autoRecModeType>
                        <enum>ALWAYS_HIGH</enum>
                        <enum>MOTION</enum>
                        <enum>ALARM</enum>
                        <enum>MOTION_ALARM</enum>
                        <enum>INTENSIVE_MOTION</enum>
                        <enum>INTENSIVE_ALARM</enum>
                        <enum>INTENSIVE_MOTION_ALARM</enum>
                        <enum>EVENT</enum>
                        <enum>INTENSIVE_EVENT</enum>
                    </autoRecModeType>
                    <eventType>
                        <enum>MOTION</enum>
                        <enum>ALARM</enum>
                        <enum>INTELLIGENT</enum>
                        <enum>POS</enum>
                    </eventType>
                </types>
                <content>
                    <recMode>
                        <mode type="recModeType">${formData.value.mode}</mode>
                        <autoMode type="autoRecModeType" eventType="${events}">${formData.value.autoMode}</autoMode>
                    </recMode>
                    <urgencyRecDuration unit="m">${formData.value.urgencyRecDuration}</urgencyRecDuration>
                </content>`
            return editRecordDistributeInfo(sendXml)
        }

        /**
         * @description 提交通道录像排程信息
         */
        const setRecScheduleInfo = (editRows: RecordScheduleDto[]) => {
            const getSwitch = (scheduleId: string) => {
                return scheduleId !== DEFAULT_EMPTY_ID
            }
            const sendXml = rawXml`
                <content type="list" total="${editRows.length}">
                    ${editRows
                        .map((row) => {
                            return rawXml`
                                <item id="${row.id}">
                                    <name>${wrapCDATA(row.name)}</name>
                                    <scheduleRec>
                                        <switch>${getSwitch(row.scheduleRec)}</switch>
                                        <schedule id="${row.scheduleRec}"></schedule>
                                    </scheduleRec>
                                    <motionRec>
                                        <switch>${getSwitch(row.motionRec)}</switch>
                                        <schedule id="${row.motionRec}"></schedule>
                                    </motionRec>
                                    <alarmRec>
                                        <switch>${getSwitch(row.alarmRec)}</switch>
                                        <schedule id="${row.alarmRec}"></schedule>
                                    </alarmRec>
                                    <intelligentRec>
                                        <switch>${getSwitch(row.intelligentRec)}</switch>
                                        <schedule id="${row.intelligentRec}"></schedule>
                                    </intelligentRec>
                                    <posRec>
                                        <switch>${getSwitch(row.posRec)}</switch>
                                        <schedule id="${row.posRec}"></schedule>
                                    </posRec>
                                </item>`
                        })
                        .join('')}
                </content>
            `
            return editRecordScheduleList(sendXml)
        }

        /**
         * 保存
         */
        const setData = async (isPopMessage: boolean) => {
            openLoading()

            const requestList = [setRecModeInfo()]

            if (formData.value.mode === 'manually') {
                const diffRows = watchRows.toArray()
                if (diffRows.length) requestList.push(setRecScheduleInfo(diffRows))
            }
            const resultList = await Promise.all(requestList)

            closeLoading()
            if (isPopMessage) commMutiSaveResponseHandler(resultList)
        }

        watch(
            () => {
                return formData.value.autoModeId
            },
            (newValue, oldValue) => {
                if (!watchEdit.ready.value) return
                const isBack = pageData.value.autoModeIdOld === newValue
                pageData.value.autoModeIdOld = oldValue

                if (!isBack) {
                    pageData.value.isRecModeStreamPop = true
                } else {
                    pageData.value.autoModeIdOld = formData.value.autoModeId
                }
            },
        )

        onMounted(async () => {
            await getRecModeData()
            await getRecordScheduleList()
            watchEdit.listen()
        })

        return {
            formData,
            tableData,
            pageData,
            watchEdit,
            watchRows,
            recAutoModeList,
            advanceRecModeMap,
            supportPOS,
            openSchedulePop,
            changeAllSchedule,
            confirmAdvancePop,
            closeStreamPop,
            setData,
            getIcons,
        }
    },
})
