/*
 * @Description: 普通事件——传感器
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-23 10:58:27
 */
import AlarmBasePresetPop from './AlarmBasePresetPop.vue'
import ScheduleManagPop from '../../components/schedule/ScheduleManagPop.vue'
import AlarmBaseSnapPop from './AlarmBaseSnapPop.vue'
import AlarmBaseRecordPop from './AlarmBaseRecordPop.vue'
import AlarmBaseAlarmOutPop from './AlarmBaseAlarmOutPop.vue'

export default defineComponent({
    components: {
        AlarmBasePresetPop,
        AlarmBaseSnapPop,
        AlarmBaseRecordPop,
        AlarmBaseAlarmOutPop,
        ScheduleManagPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()

        // 名称被修改时保存原始名称
        const originalName = ref('')

        const pageData = ref({
            // 分页有关变量
            pageIndex: 1,
            pageSize: 10,
            totalCount: 0,
            // 排程列表
            scheduleList: [] as SelectOption<string, string>[],
            isSchedulePop: false,
            // 类型
            typeList: getTranslateOptions(DEFAULT_ALWAYS_OPTIONS),
            // 启用、推送、蜂鸣器、消息框弹出、email
            switchList: getTranslateOptions(DEFAULT_SWITCH_OPTIONS),
            // 持续时间列表
            durationList: [] as SelectOption<string, string>[],
            // 是否支持声音
            supportAudio: systemCaps.supportAlarmAudioConfig,
            // 声音列表
            audioList: [] as SelectOption<string, string>[],
            // 视频弹出列表
            videoPopupChlList: [] as SelectOption<string, string>[],
            isRecordPop: false,
            isSnapPop: false,
            isAlarmOutPop: false,
            // 当前打开dialog行的index
            triggerDialogIndex: 0,
            // 预置点名称配置
            isPresetPop: false,
        })

        // 表格数据
        const tableData = ref<AlarmSensorEventDto[]>([])
        const editRows = useWatchEditRows<AlarmSensorEventDto>()

        // 改变页码，刷新数据
        const changePagination = () => {
            getData()
        }

        //  改变每页显示条数，刷新数据
        const changePaginationSize = () => {
            const totalPage = Math.ceil(pageData.value.totalCount / pageData.value.pageSize)
            if (pageData.value.pageIndex > totalPage) {
                pageData.value.pageIndex = totalPage
            }
            getData()
        }

        // 获取声音数据
        const getAudioData = async () => {
            pageData.value.audioList = await buildAudioList()
        }

        // 获取chl通道数据
        const getVideoPopupChlList = () => {
            getChlList().then((result) => {
                commLoadResponseHandler(result, ($) => {
                    pageData.value.videoPopupChlList.push({
                        value: '',
                        label: Translate('IDCS_OFF'),
                    })
                    $('content/item').forEach((item) => {
                        const $item = queryXml(item.element)

                        pageData.value.videoPopupChlList.push({
                            value: item.attr('id'),
                            label: $item('name').text(),
                        })
                    })
                })
            })
        }

        const getScheduleList = async () => {
            pageData.value.scheduleList = await buildScheduleList({
                isManager: true,
                defaultValue: '',
            })
        }

        const getData = async () => {
            editRows.clear()
            tableData.value = []

            // 获取列表数据
            getChlList({
                pageIndex: pageData.value.pageIndex,
                pageSize: pageData.value.pageSize,
                nodeType: 'sensors',
            }).then((result) => {
                commLoadResponseHandler(result, ($) => {
                    pageData.value.totalCount = $('content').attr('total').num()
                    tableData.value = $('content/item').map((item) => {
                        const row = new AlarmSensorEventDto()
                        row.id = item.attr('id')
                        row.alarmInType = item.attr('alarmInType')
                        row.nodeIndex = item.attr('index')
                        row.status = 'loading'
                        row.disabled = true
                        return row
                    })
                    tableData.value.forEach(async (item) => {
                        await getDataById(item)

                        if (!tableData.value.some((row) => row === item)) {
                            return
                        }

                        editRows.listen(item)
                    })
                })
            })
        }

        const getDataById = async (rowData: AlarmSensorEventDto) => {
            const sendXml = rawXml`
                <condition>
                    <alarmInId>${rowData.id}</alarmInId>
                </condition>
            `
            const result = await queryAlarmIn(sendXml)
            rowData.status = ''
            commLoadResponseHandler(result, ($) => {
                const $param = queryXml($('content/param')[0].element)
                const $trigger = queryXml($('content/trigger')[0].element)

                rowData.disabled = false
                if (!pageData.value.durationList.length && $param('holdTimeNote').length) {
                    pageData.value.durationList = $param('holdTimeNote')
                        .text()
                        .array()
                        .map((item) => {
                            const itemNum = Number(item)
                            return {
                                value: item,
                                label: getTranslateForSecond(itemNum),
                            }
                        })
                }

                const index = $param('index').text().num() + 1
                const devDescTemp = $param('devDesc').text()
                const isEditable = $param('devDesc').attr('isEditable') ? $param('devDesc').attr('isEditable').bool() : true
                let serialNum = ''
                if (rowData.alarmInType === 'local') {
                    serialNum = Translate('IDCS_LOCAL') + '-' + rowData.nodeIndex
                } else if (rowData.alarmInType === 'virtual') {
                    serialNum = Translate('IDCS_VIRTUAL') + '-' + rowData.nodeIndex
                } else {
                    serialNum = devDescTemp + '-' + index
                }

                rowData.isEditable = isEditable
                rowData.serialNum = serialNum
                rowData.name = $param('name').text()
                rowData.originalName = $param('name').text()
                rowData.type = $param('voltage').text()
                rowData.switch = $param('switch').text()
                rowData.holdTimeNote = $param('holdTimeNote').text()
                rowData.holdTime = $param('holdTime').text()
                rowData.schedule = $trigger('triggerSchedule/schedule').attr('id')
                rowData.oldSchedule = rowData.schedule
                rowData.record = {
                    switch: $trigger('sysRec/switch').text().bool(),
                    chls: $trigger('sysRec/chls/item').map((item) => {
                        return {
                            value: item.attr('id'),
                            label: item.text(),
                        }
                    }),
                }
                rowData.sysAudio = getSystemAudioID(pageData.value.audioList, $trigger('sysAudio').attr('id'))
                rowData.snap = {
                    switch: $trigger('sysSnap/switch').text().bool(),
                    chls: $trigger('sysSnap/chls/item').map((item) => {
                        return {
                            value: item.attr('id'),
                            label: item.text(),
                        }
                    }),
                }
                rowData.alarmOut = {
                    switch: $trigger('alarmOut/switch').text().bool(),
                    alarmOuts: $trigger('alarmOut/alarmOuts/item').map((item) => {
                        return {
                            value: item.attr('id'),
                            label: item.text(),
                        }
                    }),
                }
                rowData.popVideo = $trigger('popVideo/switch').text() === 'false' ? '' : $trigger('popVideo/chl').attr('id')
                rowData.preset = {
                    switch: $trigger('preset/switch').text().bool(),
                    presets: [],
                }
                rowData.msgPushSwitch = $trigger('msgPushSwitch').text()
                rowData.buzzerSwitch = $trigger('buzzerSwitch').text()
                rowData.emailSwitch = $trigger('emailSwitch').text()
                rowData.popMsgSwitch = $trigger('popMsgSwitch').text()

                $trigger('preset/presets/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    rowData.preset.presets.push({
                        index: $item('index').text(),
                        name: $item('name').text(),
                        chl: {
                            value: $item('chl').attr('id'),
                            label: $item('chl').text(),
                        },
                    })
                })
            })
        }

        // 名称修改时的处理
        const focusName = (name: string) => {
            originalName.value = name
        }

        const blurName = (row: AlarmSensorEventDto) => {
            const name = row.name
            if (!checkChlName(name)) {
                openMessageBox(Translate('IDCS_PROMPT_NAME_ILLEGAL_CHARS'))
                row.name = originalName.value
            } else {
                if (!name) {
                    openMessageBox(Translate('IDCS_PROMPT_NAME_EMPTY'))
                    row.name = originalName.value
                }

                for (const item of tableData.value) {
                    if (item.id !== row.id && name === item.name) {
                        openMessageBox(Translate('IDCS_NAME_SAME'))
                        row.name = originalName.value
                        break
                    }
                }
            }
        }

        const switchRecord = (index: number) => {
            const row = tableData.value[index].record
            if (row.switch) {
                openRecord(index)
            } else {
                row.chls = []
            }
        }

        const openRecord = (index: number) => {
            tableData.value[index].record.switch = true
            pageData.value.triggerDialogIndex = index
            pageData.value.isRecordPop = true
        }

        const changeRecord = (index: number, data: SelectOption<string, string>[]) => {
            if (tableData.value[index].disabled) {
                return
            }
            pageData.value.isRecordPop = false
            tableData.value[index].record = {
                switch: !!data.length,
                chls: cloneDeep(data),
            }
        }

        const switchSnap = (index: number) => {
            const row = tableData.value[index].snap
            if (row.switch) {
                openSnap(index)
            } else {
                row.chls = []
            }
        }

        const openSnap = (index: number) => {
            tableData.value[index].snap.switch = true
            pageData.value.triggerDialogIndex = index
            pageData.value.isSnapPop = true
        }

        const changeSnap = (index: number, data: SelectOption<string, string>[]) => {
            if (tableData.value[index].disabled) {
                return
            }
            pageData.value.isSnapPop = false
            tableData.value[index].snap = {
                switch: !!data.length,
                chls: cloneDeep(data),
            }
        }

        const switchAlarmOut = (index: number) => {
            const row = tableData.value[index].alarmOut
            if (row.switch) {
                openAlarmOut(index)
            } else {
                row.alarmOuts = []
            }
        }

        const openAlarmOut = (index: number) => {
            tableData.value[index].alarmOut.switch = true
            pageData.value.triggerDialogIndex = index
            pageData.value.isAlarmOutPop = true
        }

        const changeAlarmOut = (index: number, data: SelectOption<string, string>[]) => {
            if (tableData.value[index].disabled) {
                return
            }
            pageData.value.isAlarmOutPop = false
            tableData.value[index].alarmOut = {
                switch: !!data.length,
                alarmOuts: cloneDeep(data),
            }
        }

        const switchPreset = (index: number) => {
            const row = tableData.value[index].preset
            if (row.switch) {
                openPreset(index)
            } else {
                row.presets = []
            }
        }

        const openPreset = (index: number) => {
            tableData.value[index].alarmOut.switch = true
            pageData.value.triggerDialogIndex = index
            pageData.value.isPresetPop = true
        }

        const changePreset = (index: number, data: AlarmPresetItem[]) => {
            pageData.value.isPresetPop = false
            tableData.value[index].preset = {
                switch: !!data.length,
                presets: cloneDeep(data),
            }
        }

        const changeScheduleAll = (value: string) => {
            if (value === 'scheduleMgr') {
                pageData.value.isSchedulePop = true
            } else {
                tableData.value.forEach((item) => {
                    if (!item.disabled) {
                        item.schedule = value
                        item.oldSchedule = value
                    }
                })
            }
        }

        const changeSchedule = (row: AlarmSensorEventDto) => {
            if (row.schedule === 'scheduleMgr') {
                pageData.value.isSchedulePop = true
                nextTick(() => {
                    row.schedule = row.oldSchedule
                })
            } else {
                nextTick(() => {
                    row.oldSchedule = row.schedule
                })
            }
        }

        /**
         * @description 改变所有项的值
         * @param {string} value 值
         * @param {string} field 字段名
         */
        const changeAllValue = (value: string, field: string) => {
            tableData.value.forEach((item) => {
                if (field === 'type') {
                    if (item.type && item.alarmInType !== 'virtual' && item.isEditable) {
                        item.type = value
                    }
                } else {
                    ;(item as any)[field] = value
                }
            })
        }

        const getSavaData = (row: AlarmSensorEventDto) => {
            const sendXml = rawXml`
                <types>
                    <alarmInVoltage>
                        <enum>NO</enum>
                        <enum>NC</enum>
                    </alarmInVoltage>
                </types>
                <content id='${row.id}'>
                    <param>
                        <name>${wrapCDATA(row.name)}</name>
                        <voltage type='alarmInVoltage'>${row.type}</voltage>
                        <switch>${row.switch}</switch>
                        <holdTime unit='s'>${row.holdTime}</holdTime>
                    </param>
                    <trigger>
                        <sysRec>
                            <switch>${row.record.switch}</switch>
                            <chls type='list'>
                                ${row.record.chls.map((item) => `<item id='${item.value}'>${wrapCDATA(item.label)}</item>`).join('')}
                            </chls>
                        </sysRec>
                        <sysSnap>
                            <switch>${row.snap.switch}</switch>
                            <chls type='list'>
                                ${row.snap.chls.map((item) => `<item id='${item.value}'>${wrapCDATA(item.label)}</item>`).join('')}
                            </chls>
                        </sysSnap>
                        <alarmOut>
                            <switch>${row.alarmOut.switch}</switch>
                            <alarmOuts type='list'>
                                ${row.alarmOut.alarmOuts.map((item) => `<item id='${item.value}'>${wrapCDATA(item.label)}</item>`).join('')}
                            </alarmOuts>
                        </alarmOut>
                        <preset>
                            <switch>${row.preset.switch}</switch>
                            <presets type='list'>
                                ${row.preset.presets
                                    .map((item) => {
                                        return rawXml`
                                            <item>
                                                <index>${item.index}</index>
                                                <name>${wrapCDATA(item.name)}</name>
                                                <chl id='${item.chl.value}'>${wrapCDATA(item.chl.label)}</chl>
                                            </item>
                                        `
                                    })
                                    .join('')}
                            </presets>
                        </preset>
                        <buzzerSwitch>${row.buzzerSwitch}</buzzerSwitch>
                        <popVideo>
                            <switch>${row.popVideo !== ''}</switch>
                            <chl id='${row.popVideo}'></chl>
                        </popVideo>
                        <popMsgSwitch>${row.popMsgSwitch}</popMsgSwitch>
                        <sysAudio id='${row.sysAudio}'></sysAudio>
                        <triggerSchedule>
                            <switch>${row.schedule !== ''}</switch>
                            <schedule id='${row.schedule}'></schedule>
                        </triggerSchedule>
                        <emailSwitch>${row.emailSwitch}</emailSwitch>
                        <msgPushSwitch>${row.msgPushSwitch}</msgPushSwitch>
                    </trigger>
                </content>
            `
            return sendXml
        }

        const setData = async () => {
            openLoading()

            tableData.value.forEach((ele) => (ele.status = ''))

            for (const item of editRows.toArray()) {
                try {
                    const sendXml = getSavaData(item)
                    const result = await editAlarmIn(sendXml)
                    const $ = queryXml(result)
                    if ($('status').text() === 'success') {
                        item.status = 'success'
                        editRows.remove(item)
                    } else {
                        item.status = 'error'
                    }
                } catch {
                    item.status = 'error'
                }
            }

            closeLoading()
        }

        const closeSchedulePop = async () => {
            pageData.value.isSchedulePop = false
            await getScheduleList()
            tableData.value.forEach((item) => {
                if (!item.disabled) {
                    item.schedule = getScheduleId(pageData.value.scheduleList, item.schedule, '')
                    item.oldSchedule = item.schedule
                }
            })
        }

        onMounted(async () => {
            await getAudioData()
            await getVideoPopupChlList()
            await getScheduleList()
            getData()
        })

        return {
            editRows,
            pageData,
            tableData,
            changePaginationSize,
            changePagination,
            focusName,
            blurName,
            changeScheduleAll,
            changeSchedule,
            switchRecord,
            openRecord,
            changeRecord,
            switchAlarmOut,
            openAlarmOut,
            changeAlarmOut,
            switchSnap,
            openSnap,
            changeSnap,
            switchPreset,
            openPreset,
            changePreset,
            changeAllValue,
            setData,
            closeSchedulePop,
        }
    },
})
