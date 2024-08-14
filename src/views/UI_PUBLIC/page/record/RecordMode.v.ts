import { type RecMode, RecordDistributeInfo, type RecordSchedule } from '@/types/apiType/record'
import { defineComponent } from 'vue'
import RecordModeAdvancePop from './RecordModeAdvancePop.vue'
import RecordModeStreamPop from './RecordModeStreamPop.vue'
import ScheduleManagPop from '../../components/schedule/ScheduleManagPop.vue'
import { type ApiResult } from '@/api/api'
import { type XmlElement } from '@/utils/xmlParse'
import { getArrayDiffRows } from '@/utils/tools'

export default defineComponent({
    components: {
        RecordModeAdvancePop,
        RecordModeStreamPop,
        ScheduleManagPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const userSessionStore = useUserSessionStore()
        const { supportPOS } = useCababilityStore()
        const openMessageTipBox = useMessageBox().openMessageTipBox
        const { openLoading, closeLoading, LoadingTarget } = useLoading()

        const MODE_MAPPING: Record<string, string> = {
            manually: Translate('IDCS_REPLAY_CUSTOMIZE'),
            auto: Translate('IDCS_AUTO'),
        }

        const formData = ref(new RecordDistributeInfo())
        const pageData = ref({
            //录像模式下拉列表
            recModeTypeList: [] as SelectOption<string, string>[],
            //排程列表
            scheduleList: [] as SelectOption<string, string>[],
            //手动录像时长
            urgencyRecDurationList: [] as SelectOption<number, string>[],
            //排程管理弹窗显示状态
            scheduleManagPopOpen: false,
            // 高级模式配置弹窗打开状态
            advancePopOpen: false,
            // 自动模式通道码流参数配置打开状态
            recModeStreamPopOpen: false,

            //当前生效的高级模式选项（只支持一个）
            advanceModeCurrent: null as RecMode | null,
            // 应用按钮是否禁用
            applyDisabled: true,
            // 页面初始化完成
            initComplated: false,
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
                    index: 0,
                },
                {
                    id: 'INTELLIGENT',
                    text: Translate('IDCS_AI_RECORD'),
                    type: REC_MODE_TYPE.EVENT,
                    events: ['INTELLIGENT'],
                    index: 3,
                },
            ] as RecMode[],
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
            ] as RecMode[],
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
        let recordScheduleListInit = [] as RecordSchedule[]

        //高级录像模式列表转MAP
        const advanceRecModeMap = {} as Record<string, RecMode>
        pageData.value.advanceRecModes.forEach((item) => {
            advanceRecModeMap[item.id] = item
        })

        onMounted(async () => {
            await getRecModeData()
            await initChlScheduldTb()
            pageData.value.initComplated = true
        })

        watch(
            formData,
            () => {
                if (pageData.value.initComplated) pageData.value.applyDisabled = false
            },
            {
                deep: true,
            },
        )

        watch(
            () => {
                return formData.value.autoModeId
            },
            (newValue: string, oldValue: string) => {
                if (!pageData.value.initComplated) return

                const isBack = pageData.value.autoModeIdOld === newValue
                pageData.value.autoModeIdOld = oldValue

                if (!isBack) {
                    // TODO 码流配置设置
                    pageData.value.recModeStreamPopOpen = true
                } else {
                    pageData.value.autoModeIdOld = ''
                }
            },
        )

        const recModeChange = async (params: string) => {
            console.log(params)
        }

        const changeAllSchedule = (value: string, field: string) => {
            formData.value.recordScheduleList.forEach((item) => {
                ;(item as any)[field] = value
            })
        }

        const getRecModeData = async () => {
            openLoading(LoadingTarget.FullScreen)

            const result = await queryRecordDistributeInfo()
            const $ = queryXml(result)

            closeLoading(LoadingTarget.FullScreen)

            if ($('/response/status').text() !== 'success') return

            formData.value.mode = $('/response/content/recMode/mode').text()
            formData.value.autoMode = $('/response/content/recMode/autoMode').text()
            formData.value.autoModeEvents = $('/response/content/recMode/autoMode').attr('eventType').split(',')
            formData.value.urgencyRecDuration = Number($('/response/content/urgencyRecDuration').text())

            //TODO: CustomerID为351代表USE44客户,要求将manual翻译为schedule
            //  if(CustomerID=="351"){
            //     recModeTypeMapping.manually = "IDCS_REC_MODE_MANUAL"
            // }
            //绑定录像模式下拉
            $('/response/types/recModeType/enum').forEach((item) => {
                pageData.value.recModeTypeList.push({
                    value: item.text(),
                    label: MODE_MAPPING[item.text()],
                })
            })

            //绑定手动录像时长下拉
            $('/response/content/urgencyRecDurationNote')
                .text()
                .split(',')
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
                        label: getTimeTranslateString(value),
                    })
                })

            // 选择自动模式列表

            for (let index = 0; index < pageData.value.basicRecModes.length; index++) {
                const item = pageData.value.basicRecModes[index]
                //如果当前返回的事件列表和基础模式的事件列表相同，则表示选中基础事件模式
                if (
                    formData.value.autoModeEvents.length == item.events.length &&
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
                if (userSessionStore.advanceRecModeId) {
                    genAdvanceMode(userSessionStore.advanceRecModeId.split('_'))
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
            if (events.length === 0) {
                pageData.value.advanceModeCurrent = null
                return true
            }

            const intensiveIndex = events.indexOf(REC_MODE_TYPE.INTENSIVE)
            // 不能只选一直录像
            if (events.length === 1 && intensiveIndex > -1) {
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_ONLY_INTENSIVE_TIP'),
                })
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
            const advanceModeCurrent = {} as RecMode
            advanceModeCurrent.id = events.join('_')
            advanceModeCurrent.text = events
                .map((item) => {
                    return advanceRecModeMap[item].text
                })
                .join('+')

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
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_RECORD_MODE_EXIST'),
                })
                return false
            }

            advanceModeCurrent.events = events
            advanceModeCurrent.type = autoModeIsIntensive ? REC_MODE_TYPE.INTENSIVE_EVENT : REC_MODE_TYPE.EVENT

            pageData.value.advanceModeCurrent = advanceModeCurrent

            // 存入Store
            userSessionStore.advanceRecModeId = advanceModeCurrent.id
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
        const initChlScheduldTb = async () => {
            openLoading(LoadingTarget.FullScreen)
            const resultArr = await Promise.all([queryScheduleList(), queryRecordScheduleList()])

            const scheduleXml = queryXml(resultArr[0] as ApiResult)
            const recScheduleXml = queryXml(resultArr[1] as ApiResult)
            if (scheduleXml('/response/status').text() !== 'success' || recScheduleXml('/response/status').text() !== 'success') {
                console.error('initChlScheduldTb failed')
                return
            }

            // 组装表格中的排程下拉列表
            pageData.value.scheduleList = scheduleXml('/response/content/item').map((item) => {
                return {
                    label: item.text(),
                    value: item.attr('id') as string,
                }
            })
            pageData.value.scheduleList.push({
                label: `<${Translate('IDCS_NULL')}>`,
                value: EmptyId,
            })

            const getRecScheduleSelectValue = (item: XmlElement, path: string) => {
                const scheduleElement = xmlParse(path, item.element)[0].element
                return xmlParse('./switch', scheduleElement).text() === 'false' ? EmptyId : xmlParse('./schedule', scheduleElement).attr('id')
            }

            const parseTableData = () => {
                return recScheduleXml('/response/content/item').map((item) => {
                    return {
                        id: item.attr('id') as string,
                        name: xmlParse('./name', item.element).text(),
                        alarmRec: getRecScheduleSelectValue(item, './alarmRec'),
                        motionRec: getRecScheduleSelectValue(item, './motionRec'),
                        intelligentRec: getRecScheduleSelectValue(item, './intelligentRec'),
                        posRec: getRecScheduleSelectValue(item, './posRec'),
                        scheduleRec: getRecScheduleSelectValue(item, './scheduleRec'),
                    }
                })
            }

            // 通道的录像排程表格数据
            formData.value.recordScheduleList = parseTableData()
            recordScheduleListInit = parseTableData()

            closeLoading(LoadingTarget.FullScreen)
        }

        /**
         * 高级弹窗确认事件
         * @param selectedEvents 选择的事件列表
         */
        const advancePopConfirm = (selectedEvents: string[]) => {
            if (genAdvanceMode(selectedEvents)) pageData.value.advancePopOpen = false
        }

        const streamPopClose = (isConfirm: boolean) => {
            if (!isConfirm) {
                formData.value.autoModeId = pageData.value.autoModeIdOld
            } else {
                pageData.value.autoModeIdOld = ''
            }
            pageData.value.recModeStreamPopOpen = false
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
                <urgencyRecDuration unit="m">${formData.value.urgencyRecDuration.toString()}</urgencyRecDuration>
            </content>`
            return editRecordDistributeInfo(sendXml)
        }

        /**
         * @description 提交通道录像排程信息
         */
        const setRecScheduleInfo = (editRows: RecordSchedule[]) => {
            const getSwitch = (scheduleId: string) => {
                return scheduleId === EmptyId ? 'false' : 'true'
            }
            let sendXml = rawXml`
            <content type="list" total="${editRows.length.toString()}">`
            editRows.forEach((row) => {
                sendXml += `
                <item id="${row.id}">
                    <name><![CDATA[IPCamera]]></name>
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

            sendXml += `</content>`
            return editRecordScheduleList(sendXml)
        }

        /**
         * 保存
         */
        const setData = async (isPopMessage: boolean) => {
            openLoading(LoadingTarget.FullScreen)

            const requestList = [setRecModeInfo()]

            if (formData.value.mode === 'manually') {
                const diffRows = getArrayDiffRows(formData.value.recordScheduleList, recordScheduleListInit)
                if (diffRows.length > 0) requestList.push(setRecScheduleInfo(diffRows as RecordSchedule[]))
            }
            const resultList = await Promise.all(requestList)

            closeLoading(LoadingTarget.FullScreen)
            if (isPopMessage) commMutiSaveResponseHadler(resultList)
        }

        return {
            formData,
            pageData,
            recAutoModeList,
            advanceRecModeMap,
            supportPOS,
            recModeChange,
            changeAllSchedule,
            advancePopConfirm,
            streamPopClose,
            setData,

            RecordModeAdvancePop,
        }
    },
})
