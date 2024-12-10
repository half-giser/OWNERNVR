/*
 * @Description: 普通事件——传感器
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-23 10:58:27
 */
import { type AlarmPresetItem, AlarmSensorEventDto } from '@/types/apiType/aiAndEvent'
import { cloneDeep } from 'lodash-es'
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
        const { openMessageBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()
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
            typeList: getAlwaysOptions(),
            // 启用、推送、蜂鸣器、消息框弹出、email
            switchList: getSwitchOptions(),
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
            getChlList({}).then((result) => {
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

        const getData = async () => {
            pageData.value.scheduleList = await buildScheduleList({
                isManager: true,
                defaultValue: '',
            })

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
                rowData.disabled = false
                if (!pageData.value.durationList.length && $('content/param/holdTimeNote').length) {
                    pageData.value.durationList = $('content/param/holdTimeNote')
                        .text()
                        .split(',')
                        .map((item) => {
                            const itemNum = Number(item)
                            return {
                                value: item,
                                label: getTranslateForSecond(itemNum),
                            }
                        })
                }

                const content = $('content')[0]
                const $content = queryXml(content.element)

                const index = $content('param/index').text().num() + 1
                const devDescTemp = $content('param/devDesc').text()
                const isEditable = $content('param/devDesc').attr('isEditable') === 'false' ? false : true
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
                rowData.name = $content('param/name').text()
                rowData.originalName = $content('param/name').text()
                rowData.type = $content('param/voltage').text()
                rowData.switch = $content('param/switch').text()
                rowData.holdTimeNote = $content('param/holdTimeNote').text()
                rowData.holdTime = $content('param/holdTime').text()
                rowData.schedule = {
                    value: $content('trigger/triggerSchedule/schedule').attr('id'),
                    label: $content('trigger/triggerSchedule/schedule').text(),
                }
                rowData.oldSchedule = $content('trigger/triggerSchedule/schedule').attr('id')
                rowData.record = {
                    switch: $content('trigger/sysRec/switch').text().bool(),
                    chls: $content('trigger/sysRec/chls/item').map((item) => {
                        return {
                            value: item.attr('id'),
                            label: item.text(),
                        }
                    }),
                }
                rowData.sysAudio = $content('trigger/sysAudio').attr('id') || DEFAULT_EMPTY_ID
                rowData.snap = {
                    switch: $content('trigger/sysSnap/switch').text().bool(),
                    chls: $content('trigger/sysSnap/chls/item').map((item) => {
                        return {
                            value: item.attr('id'),
                            label: item.text(),
                        }
                    }),
                }
                rowData.alarmOut = {
                    switch: $content('trigger/alarmOut/switch').text().bool(),
                    alarmOuts: $content('trigger/alarmOut/alarmOuts/item').map((item) => {
                        return {
                            value: item.attr('id'),
                            label: item.text(),
                        }
                    }),
                }
                rowData.popVideo = {
                    switch: $content('trigger/popVideo/switch').text(),
                    chl: {
                        id: $content('trigger/popVideo/chl').attr('id'),
                        innerText: $content('trigger/popVideo/chl').text(),
                    },
                }
                rowData.preset = {
                    switch: $content('trigger/preset/switch').text().bool(),
                    presets: [],
                }
                rowData.msgPushSwitch = $content('trigger/msgPushSwitch').text()
                rowData.buzzerSwitch = $content('trigger/buzzerSwitch').text()
                rowData.emailSwitch = $content('trigger/emailSwitch').text()
                rowData.popMsgSwitch = $content('trigger/popMsgSwitch').text()

                const audioData = pageData.value.audioList.filter((item) => {
                    item.value === rowData.sysAudio
                })
                if (!audioData.length) {
                    rowData.sysAudio = DEFAULT_EMPTY_ID
                }

                $content('trigger/preset/presets/item').forEach((item) => {
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
                // tableDataInit.push(cloneDeep(rowData))
            })
        }

        // 名称修改时的处理
        const focusName = (name: string) => {
            originalName.value = name
        }

        const blurName = (row: AlarmSensorEventDto) => {
            const name = row.name
            if (!checkChlName(name)) {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_PROMPT_NAME_ILLEGAL_CHARS'),
                })
                row.name = originalName.value
            } else {
                if (!name) {
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_PROMPT_NAME_EMPTY'),
                    })
                    row.name = originalName.value
                }

                for (const item of tableData.value) {
                    if (item.id !== row.id && name === item.name) {
                        openMessageBox({
                            type: 'info',
                            message: Translate('IDCS_NAME_SAME'),
                        })
                        row.name = originalName.value
                        break
                    }
                }
            }
        }

        // 回车键失去焦点
        const blurInput = (event: Event) => {
            ;(event.target as HTMLElement).blur()
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
                    item.schedule.value = value
                    item.oldSchedule = value
                })
            }
        }

        const changeSchedule = (row: AlarmSensorEventDto) => {
            if (row.schedule.value === 'scheduleMgr') {
                pageData.value.isSchedulePop = true
                nextTick(() => {
                    row.schedule.value = row.oldSchedule
                })
            } else {
                nextTick(() => {
                    row.oldSchedule = row.schedule.value
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
                if (field === 'videoPopUp') {
                    item.popVideo.chl.id = value
                    if (value !== '') item.popVideo.switch = 'true'
                } else if (field === 'type') {
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
                        <name><![CDATA[${row.name}]]></name>
                        <voltage type='alarmInVoltage'>${row.type}</voltage>
                        <switch>${row.switch}</switch>
                        <holdTime unit='s'>${row.holdTime}</holdTime>
                    </param>
                    <trigger>
                        <sysRec>
                            <switch>${row.record.switch}</switch>
                            <chls type='list'>
                                ${row.record.chls.map((item) => `<item id='${item.value}'><![CDATA[${item.label}]]></item>`).join('')}
                            </chls>
                        </sysRec>
                        <sysSnap>
                            <switch>${row.snap.switch}</switch>
                            <chls type='list'>
                                ${row.snap.chls.map((item) => `<item id='${item.value}'><![CDATA[${item.label}]]></item>`).join('')}
                            </chls>
                        </sysSnap>
                        <alarmOut>
                            <switch>${row.alarmOut.switch}</switch>
                            <alarmOuts type='list'>
                                ${row.alarmOut.alarmOuts.map((item) => `<item id='${item.value}'><![CDATA[${item.label}]]></item>`).join('')}
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
                                                <name><![CDATA[${item.index}]]></name>
                                                <chl id='${item.chl.value}'>
                                                <![CDATA[${item.chl.label}]]></chl>
                                            </item>
                                        `
                                    })
                                    .join('')}
                            </presets>
                        </preset>
                        <buzzerSwitch>${row.buzzerSwitch}</buzzerSwitch>
                        <popVideo>
                            <switch>${row.popVideo.switch}</switch>
                            <chl id='${row.popVideo.chl.id}'></chl>
                        </popVideo>
                        <popMsgSwitch>${row.popMsgSwitch}</popMsgSwitch>
                        <sysAudio id='${row.sysAudio}'></sysAudio>
                        <triggerSchedule>
                            <switch>${row.schedule.value !== ''}</switch>
                            <schedule id='${row.schedule.value}'></schedule>
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

        onMounted(async () => {
            // 相关请求，获取前置数据
            await getAudioData() // 声音数据
            await getVideoPopupChlList() // 通道数据
            getData()
        })

        return {
            editRows,
            pageData,
            tableData,
            changePaginationSize,
            changePagination,
            // 名称修改
            focusName,
            blurName,
            blurInput,
            // 排程
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
            // 表头改变属性
            changeAllValue,
            setData,
        }
    },
})
