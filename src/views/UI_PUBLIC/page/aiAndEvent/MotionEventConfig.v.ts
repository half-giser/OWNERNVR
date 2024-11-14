/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-16 18:13:56
 * @Description: 移动侦测
 */
import { cloneDeep } from 'lodash-es'
import { AlarmEventDto, type AlarmPresetItem } from '@/types/apiType/aiAndEvent'
import AlarmBasePresetPop from './AlarmBasePresetPop.vue'
import AlarmBaseSnapPop from './AlarmBaseSnapPop.vue'
import AlarmBaseRecordPop from './AlarmBaseRecordPop.vue'
import AlarmBaseAlarmOutPop from './AlarmBaseAlarmOutPop.vue'
import ScheduleManagPop from '@/views/UI_PUBLIC/components/schedule/ScheduleManagPop.vue'
export default defineComponent({
    components: {
        AlarmBasePresetPop,
        AlarmBaseSnapPop,
        AlarmBaseRecordPop,
        AlarmBaseAlarmOutPop,
        ScheduleManagPop,
    },
    setup() {
        const chosedList = ref<any[]>([])
        const { Translate } = useLangStore()
        const tableData = ref<AlarmEventDto[]>([])

        const { openLoading, closeLoading } = useLoading()
        const systemCaps = useCababilityStore()
        const userSession = useUserSessionStore()
        const router = useRouter()
        const openMessageBox = useMessageBox().openMessageBox
        const pageData = ref({
            pageIndex: 1,
            pageSize: 10,
            totalCount: 0,
            enableList: getSwitchOptions(),
            supportAudio: false,
            scheduleList: [] as [] as SelectOption<string, string>[],
            scheduleManagePopOpen: false,
            audioList: [] as SelectOption<string, string>[],
            // 打开穿梭框时选择行的索引
            triggerDialogIndex: 0,
            recordIsShow: false,
            snapIsShow: false,
            alarmOutIsShow: false,
            isPresetPopOpen: false,
            applyDisable: true,
            editRows: [] as AlarmEventDto[],
        })

        const getScheduleList = async () => {
            pageData.value.scheduleList = await buildScheduleList({
                isManager: true,
                defaultValue: ' ',
            })
        }

        const getAudioList = async () => {
            pageData.value.supportAudio = systemCaps.supportAlarmAudioConfig
            if (pageData.value.supportAudio) {
                pageData.value.audioList = await buildAudioList()
            }
        }

        const buildTableData = () => {
            tableData.value.length = 0
            getChlList({
                pageIndex: pageData.value.pageIndex,
                pageSize: pageData.value.pageSize,
                isSupportMotion: true,
            }).then(async (resb) => {
                const $chl = queryXml(resb)
                pageData.value.totalCount = $chl('//content').attr('total').num()
                $chl('//content/item').forEach((item) => {
                    const $ele = queryXml(item.element)
                    const row = new AlarmEventDto()
                    row.id = item.attr('id')
                    row.addType = $ele('addType').text()
                    row.chlType = $ele('chlType').text()
                    row.name = $ele('name').text()
                    row.poeIndex = $ele('poeIndex').text()
                    row.productModel = { value: $ele('productModel').text(), factoryName: $ele('productModel').attr('factoryName') }
                    row.status = 'loading'
                    tableData.value.push(row)
                })
                for (let i = 0; i < tableData.value.length; i++) {
                    const row = tableData.value[i]
                    const sendXml = rawXml`
                        <condition>
                            <chlId>${row.id}</chlId>
                        </condition>
                        <requireField>
                            <trigger/>
                        </requireField>
                    `
                    const motion = await queryMotion(sendXml)
                    const res = queryXml(motion)
                    row.status = ''

                    if (res('status').text() === 'success') {
                        row.rowDisable = false
                        row.schedule = {
                            value: res('//content/chl/trigger/triggerSchedule/schedule').attr('id') === '' ? ' ' : res('//content/chl/trigger/triggerSchedule/schedule').attr('id'),
                            label: res('//content/chl/trigger/triggerSchedule/schedule').text(),
                        }
                        row.oldSchedule = {
                            value: row.schedule.value,
                            label: row.schedule.label,
                        }
                        row.record = {
                            switch: res('//content/chl/trigger/sysRec/switch').text().bool(),
                            chls: res('//content/chl/trigger/sysRec/chls/item').map((item) => {
                                return {
                                    value: item.attr('id'),
                                    label: item.text(),
                                }
                            }),
                        }
                        row.sysAudio = res('//content/chl/trigger/sysAudio').attr('id') || DEFAULT_EMPTY_ID
                        row.snap = {
                            switch: res('//content/chl/trigger/sysSnap/switch').text().bool(),
                            chls: res('//content/chl/trigger/sysSnap/chls/item').map((item) => {
                                return {
                                    value: item.attr('id'),
                                    label: item.text(),
                                }
                            }),
                        }
                        row.alarmOut = {
                            switch: res('//content/chl/trigger/alarmOut/switch').text().bool(),
                            alarmOuts: res('//content/chl/trigger/alarmOut/alarmOuts/item').map((item) => {
                                return {
                                    value: item.attr('id'),
                                    label: item.text(),
                                }
                            }),
                        }
                        row.beeper = res('//content/chl/trigger/buzzerSwitch').text()
                        row.email = res('//content/chl/trigger/emailSwitch').text()
                        row.msgPush = res('//content/chl/trigger/msgPushSwitch').text()
                        row.videoPopup = res('//content/chl/trigger/popVideoSwitch').text()
                        row.preset.switch = res('//content/chl/trigger/preset/switch').text().bool()
                        res('//content/chl/trigger/preset/presets/item').forEach((item) => {
                            const $item = queryXml(item.element)
                            row.preset.presets.push({
                                index: $item('index').text(),
                                name: $item('name').text(),
                                chl: {
                                    value: $item('chl').attr('id'),
                                    label: $item('chl').text(),
                                },
                            })
                        })
                        // 设置的声音文件被删除时，显示为none
                        const AudioData = pageData.value.audioList.filter((element) => {
                            return element.value === row.sysAudio
                        })
                        if (!AudioData.length) {
                            row.sysAudio = DEFAULT_EMPTY_ID
                        }
                    } else {
                        row.rowDisable = true
                    }
                }
            })
        }

        const changePagination = () => {
            buildTableData()
        }

        const changePaginationSize = () => {
            const totalPage = Math.ceil(pageData.value.totalCount / pageData.value.pageSize)
            if (pageData.value.pageIndex > totalPage) {
                pageData.value.pageIndex = totalPage
            }
            buildTableData()
        }

        const handleScheduleChangeAll = (schedule: { value: string; label: string }) => {
            if (schedule.value === 'scheduleMgr') {
                pageData.value.scheduleManagePopOpen = true
                return
            }
            tableData.value.forEach((item) => {
                if (!item.rowDisable) {
                    item.schedule = schedule
                    addEditRow(item)
                }
            })
        }

        const handleScheduleChangeSingle = (row: AlarmEventDto) => {
            if (row.schedule.value === 'scheduleMgr') {
                pageData.value.scheduleManagePopOpen = true
                row.schedule.value = row.oldSchedule.value
                row.schedule.label = row.oldSchedule.label
                return
            }
            addEditRow(row)
            row.oldSchedule.value = row.schedule.value
            row.oldSchedule.label = row.schedule.label
        }

        const handleSchedulePopClose = async () => {
            pageData.value.scheduleManagePopOpen = false
            await getScheduleList()
        }

        const switchRecord = (index: number) => {
            addEditRow(tableData.value[index])
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
            pageData.value.recordIsShow = true
        }

        const changeRecord = (index: number, data: SelectOption<string, string>[]) => {
            if (tableData.value[index].rowDisable) {
                return
            }
            addEditRow(tableData.value[index])
            pageData.value.recordIsShow = false
            tableData.value[index].record = {
                switch: !!data.length,
                chls: cloneDeep(data),
            }
        }

        const switchSnap = (index: number) => {
            addEditRow(tableData.value[index])
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
            pageData.value.snapIsShow = true
        }

        const changeSnap = (index: number, data: SelectOption<string, string>[]) => {
            if (tableData.value[index].rowDisable) {
                return
            }
            addEditRow(tableData.value[index])
            pageData.value.snapIsShow = false
            tableData.value[index].snap = {
                switch: !!data.length,
                chls: cloneDeep(data),
            }
        }

        const switchAlarmOut = (index: number) => {
            addEditRow(tableData.value[index])
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
            pageData.value.alarmOutIsShow = true
        }

        const changeAlarmOut = (index: number, data: SelectOption<string, string>[]) => {
            if (tableData.value[index].rowDisable) {
                return
            }
            addEditRow(tableData.value[index])
            pageData.value.alarmOutIsShow = false
            tableData.value[index].alarmOut = {
                switch: !!data.length,
                alarmOuts: cloneDeep(data),
            }
        }

        const switchPreset = (index: number) => {
            addEditRow(tableData.value[index])
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
            pageData.value.isPresetPopOpen = true
        }

        const changePreset = (index: number, data: AlarmPresetItem[]) => {
            addEditRow(tableData.value[index])
            pageData.value.isPresetPopOpen = false
            tableData.value[index].preset = {
                switch: !!data.length,
                presets: cloneDeep(data),
            }
        }

        // 系统音频
        const handleSysAudioChangeAll = (sysAudio: string) => {
            tableData.value.forEach((item) => {
                if (!item.rowDisable) {
                    addEditRow(item)
                    item.sysAudio = sysAudio
                }
            })
        }

        // 消息推送
        const handleMsgPushChangeAll = (msgPush: string) => {
            tableData.value.forEach((item) => {
                if (!item.rowDisable) {
                    addEditRow(item)
                    item.msgPush = msgPush
                }
            })
        }

        // 蜂鸣器
        const handleBeeperChangeAll = (beeper: string) => {
            tableData.value.forEach((item) => {
                if (!item.rowDisable) {
                    addEditRow(item)
                    item.beeper = beeper
                }
            })
        }

        // 视频弹出
        const handleVideoPopupChangeAll = (videoPopup: string) => {
            tableData.value.forEach((item) => {
                if (!item.rowDisable) {
                    addEditRow(item)
                    item.videoPopup = videoPopup
                }
            })
        }

        // 邮件
        const handleEmailChangeAll = (email: string) => {
            tableData.value.forEach((item) => {
                if (!item.rowDisable) {
                    addEditRow(item)
                    item.email = email
                }
            })
        }

        const handleMotionSetting = () => {
            // 跳转到移动侦测设置页面
            // router.push('/config/channel/settings/motion')
            if (userSession.hasAuth('remoteChlMgr')) {
                router.push('/config/channel/settings/motion')
            } else {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_NO_AUTH'),
                })
            }
        }

        const addEditRow = (row: AlarmEventDto) => {
            // 若该行不存在于编辑行中，则添加
            const isExist = pageData.value.editRows.some((item) => item.id === row.id)
            if (!isExist) {
                pageData.value.editRows.push(row)
            }
            pageData.value.applyDisable = false
        }

        const getSavaData = (rowData: AlarmEventDto) => {
            const sendXml = rawXml`
                <content>
                    <chl id="${rowData.id}">
                        <trigger>
                            <sysRec>
                                <switch>${rowData.record.switch}</switch>
                                <chls type="list">
                                    ${rowData.record.chls.map((item) => `<item id="${item.value}"><![CDATA[${item.label}]]></item>`).join('')}
                                </chls>
                            </sysRec>
                            <alarmOut>
                                <switch>${rowData.alarmOut.switch}</switch>
                                <alarmOuts type="list">
                                    ${rowData.alarmOut.alarmOuts.map((item) => `<item id="${item.value}"><![CDATA[${item.label}]]></item>`).join('')}
                                </alarmOuts>
                            </alarmOut>
                            <preset>
                                <switch>${rowData.preset.switch}</switch>
                                <presets type="list">
                                    ${rowData.preset.presets
                                        .map((item) => {
                                            if (item.index) {
                                                return rawXml`
                                                    <item>
                                                        <index>${item.index}</index>
                                                        <name><![CDATA[${item.name}]]></name>
                                                        <chl id="${item.chl.value}"><![CDATA[${item.chl.label}]]></chl>
                                                    </item>`
                                            }
                                            return ''
                                        })
                                        .join('')}
                                </presets>
                            </preset>
                            <sysSnap>
                                <switch>${rowData.snap.switch}</switch>
                                <chls type="list">
                                    ${rowData.snap.chls.map((item) => `<item id="${item.value}"><![CDATA[${item.label}]]></item>`).join('')}
                                </chls>
                            </sysSnap>
                            <buzzerSwitch>${rowData.beeper}</buzzerSwitch>
                            <msgPushSwitch>${rowData.msgPush}</msgPushSwitch>
                            <sysAudio id='${rowData.sysAudio}'></sysAudio>
                            <triggerSchedule>
                                <switch>${rowData.schedule.value !== ' '}</switch>
                                <schedule id="${rowData.schedule.value === ' ' ? '' : rowData.schedule.value}"></schedule>
                            </triggerSchedule>
                            <popVideoSwitch>${rowData.videoPopup}</popVideoSwitch>
                            <emailSwitch>${rowData.email}</emailSwitch>
                        </trigger>
                    </chl>
                </content>
            `
            return sendXml
        }

        const setData = () => {
            openLoading()
            pageData.value.editRows.forEach((item: AlarmEventDto) => {
                const sendXml = getSavaData(item)
                editMotion(sendXml).then((resb) => {
                    const res = queryXml(resb)
                    if (res('status').text() === 'success') {
                        item.status = 'success'
                    } else {
                        item.status = 'error'
                        const errorCode = res('errorCode').text().num()
                        if (errorCode === ErrorCode.USER_ERROR_GET_CONFIG_INFO_FAIL) {
                            item.status = 'success'
                        } else {
                            item.status = 'error'
                        }
                    }
                    // buildTableData()
                })
            })
            closeLoading()
            pageData.value.editRows = []
            pageData.value.applyDisable = true
        }

        onMounted(async () => {
            await getScheduleList()
            await getAudioList()
            buildTableData()
        })

        return {
            changePagination,
            changePaginationSize,
            chosedList,
            pageData,
            tableData,
            openMessageBox,
            handleScheduleChangeAll,
            handleScheduleChangeSingle,
            handleSchedulePopClose,
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
            handleSysAudioChangeAll,
            handleMsgPushChangeAll,
            handleBeeperChangeAll,
            handleVideoPopupChangeAll,
            handleEmailChangeAll,
            handleMotionSetting,
            setData,
            addEditRow,
            AlarmBasePresetPop,
            AlarmBaseSnapPop,
            AlarmBaseRecordPop,
            AlarmBaseAlarmOutPop,
            ScheduleManagPop,
        }
    },
})
