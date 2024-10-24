/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-16 18:13:56
 * @Description: 移动侦测
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-24 17:48:55
 */
import { cloneDeep } from 'lodash-es'
import { MotionEventConfig, type PresetItem } from '@/types/apiType/aiAndEvent'
import SetPresetPop from './SetPresetPop.vue'
import ScheduleManagPop from '@/views/UI_PUBLIC/components/schedule/ScheduleManagPop.vue'
// import { DropdownInstance } from 'element-plus'
export default defineComponent({
    components: {
        SetPresetPop,
        ScheduleManagPop,
    },
    setup() {
        const chosedList = ref<any[]>([])
        const { Translate } = useLangStore()
        const tableData = ref<MotionEventConfig[]>([])

        // ;(snapRef.value as InstanceType<typeof ElDropdown>).handleOpen()
        // ;(alarmOutRef.value as InstanceType<typeof ElDropdown>).handleOpen()
        // ;(recordRef.value as InstanceType<typeof ElDropdown>).handleOpen()
        const { openLoading, closeLoading } = useLoading()
        const systemCaps = useCababilityStore()
        const userSession = useUserSessionStore()
        const router = useRouter()
        const openMessageTipBox = useMessageBox().openMessageTipBox
        const pageData = ref({
            pageIndex: 1,
            pageSize: 10,
            totalCount: 0,
            pageDataCountItems: [10, 20, 30],
            enableList: getSwitchOptions(),
            supportAudio: false,
            scheduleList: [] as [] as SelectOption<string, string>[],
            scheduleManagePopOpen: false,
            audioList: [] as SelectOption<string, string>[],
            // 打开穿梭框时选择行的索引
            triggerDialogIndex: 0,

            // record穿梭框数据源
            recordList: [] as SelectOption<string, string>[],
            recordHeaderTitle: 'IDCS_TRIGGER_CHANNEL_RECORD',
            recordSourceTitle: 'IDCS_CHANNEL',
            recordTargetTitle: 'IDCS_CHANNEL_TRGGER',
            // 表头选中id
            recordChosedIdsAll: [] as string[],
            // 表头选中的数据
            recordChosedListAll: [] as SelectOption<string, string>[],
            recordIsShow: false,
            recordType: 'record',

            // snap穿梭框数据源
            snapList: [] as SelectOption<string, string>[],
            snapHeaderTitle: 'IDCS_TRIGGER_CHANNEL_SNAP',
            snapSourceTitle: 'IDCS_CHANNEL',
            snapTargetTitle: 'IDCS_CHANNEL_TRGGER',
            // 表头选中id
            snapChosedIdsAll: [] as string[],
            // 表头选中的数据
            snapChosedListAll: [] as SelectOption<string, string>[],
            snapIsShow: false,
            snapType: 'snap',

            // alarmOut穿梭框数据源
            alarmOutList: [] as SelectOption<string, string>[],
            alarmOutHeaderTitle: 'IDCS_TRIGGER_ALARM_OUT',
            alarmOutSourceTitle: 'IDCS_ALARM_OUT',
            alarmOutTargetTitle: 'IDCS_TRIGGER_ALARM_OUT',
            // 表头选中id
            alarmOutChosedIdsAll: [] as string[],
            // 表头选中的数据
            alarmOutChosedListAll: [] as SelectOption<string, string>[],
            alarmOutIsShow: false,
            alarmOutType: 'alarmOut',

            isPresetPopOpen: false,
            presetChlId: '',
            presetLinkedList: [] as PresetItem[],

            // disable
            applyDisable: true,
            editRows: [] as MotionEventConfig[],

            // popover
            recordPopoverVisible: false,
            snapPopoverVisible: false,
            alarmOutPopoverVisible: false,
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

        const getRecordList = async () => {
            pageData.value.recordList = await buildRecordChlList()
        }

        const getSnapList = async () => {
            pageData.value.snapList = await buildSnapChlList()
        }

        const getAlarmOutList = async () => {
            pageData.value.alarmOutList = await buildAlarmOutChlList()
        }

        const buildTableData = () => {
            tableData.value.length = 0
            getChlList({
                pageIndex: pageData.value.pageIndex,
                pageSize: pageData.value.pageSize,
                isSupportMotion: true,
            }).then(async (resb) => {
                const $chl = queryXml(resb)
                pageData.value.totalCount = Number($chl('//content').attr('total'))
                $chl('//content/item').forEach((item) => {
                    const $ele = queryXml(item.element)
                    const row = new MotionEventConfig()
                    row.id = item.attr('id')!
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
                        </requireField>`
                    const motion = await queryMotion(sendXml)
                    const res = queryXml(motion)
                    row.status = ''

                    if (res('status').text() == 'success') {
                        row.rowDisable = false
                        row.schedule = {
                            value: res('//content/chl/trigger/triggerSchedule/schedule').attr('id') == '' ? ' ' : res('//content/chl/trigger/triggerSchedule/schedule').attr('id'),
                            label: res('//content/chl/trigger/triggerSchedule/schedule').text(),
                        }
                        row.oldSchedule = {
                            value: row.schedule.value,
                            label: row.schedule.label,
                        }
                        row.record = {
                            switch: res('//content/chl/trigger/sysRec/switch').text().toBoolean(),
                            chls: res('//content/chl/trigger/sysRec/chls/item').map((item) => {
                                return {
                                    value: item.attr('id')!,
                                    label: item.text(),
                                }
                            }),
                        }
                        // 获取record中chls的value列表
                        row.recordList = row.record.chls.map((item) => item.value)
                        row.sysAudio = res('//content/chl/trigger/sysAudio').attr('id') || DEFAULT_EMPTY_ID
                        row.snap = {
                            switch: res('//content/chl/trigger/sysSnap/switch').text().toBoolean(),
                            chls: res('//content/chl/trigger/sysSnap/chls/item').map((item) => {
                                return {
                                    value: item.attr('id')!,
                                    label: item.text(),
                                }
                            }),
                        }
                        // 获取snap中chls的value列表
                        row.snapList = row.snap.chls.map((item) => item.value)
                        row.alarmOut = {
                            switch: res('//content/chl/trigger/alarmOut/switch').text() == 'true' ? true : false,
                            chls: res('//content/chl/trigger/alarmOut/alarmOuts/item').map((item) => {
                                return {
                                    value: item.attr('id')!,
                                    label: item.text(),
                                }
                            }),
                        }
                        row.alarmOutList = row.alarmOut.chls.map((item) => item.value)
                        row.beeper = res('//content/chl/trigger/buzzerSwitch').text()
                        row.email = res('//content/chl/trigger/emailSwitch').text()
                        row.msgPush = res('//content/chl/trigger/msgPushSwitch').text()
                        row.videoPopup = res('//content/chl/trigger/popVideoSwitch').text()
                        row.preset.switch = res('//content/chl/trigger/preset/switch').text() == 'true' ? true : false
                        res('//content/chl/trigger/preset/presets/item').forEach((item) => {
                            const $item = queryXml(item.element)
                            row.preset.presets.push({
                                index: $item('index').text(),
                                name: $item('name').text(),
                                chl: {
                                    value: $item('chl').attr('id')!,
                                    label: $item('chl').text(),
                                },
                            })
                        })
                        // 设置的声音文件被删除时，显示为none
                        const AudioData = pageData.value.audioList.filter((element: { value: string; label: string }) => {
                            return element.value === row.sysAudio
                        })
                        if (AudioData.length === 0) {
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
            if (schedule.value == 'scheduleMgr') {
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

        const handleScheduleChangeSingle = (row: MotionEventConfig) => {
            if (row.schedule.value == 'scheduleMgr') {
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

        // 下列为record穿梭框相关
        const recordConfirmAll = (e: any[]) => {
            if (e.length !== 0) {
                pageData.value.recordChosedListAll = cloneDeep(e)
                pageData.value.recordChosedIdsAll = e.map((item) => item.value)
                tableData.value.forEach((item) => {
                    if (!item.rowDisable) {
                        addEditRow(item)
                        item.record.switch = true
                        item.record.chls = pageData.value.recordChosedListAll
                        item.recordList = pageData.value.recordChosedListAll.map((item) => item.value)
                    }
                })
            } else {
                tableData.value.forEach((item) => {
                    if (!item.rowDisable) {
                        addEditRow(item)
                        item.record.switch = false
                        item.record.chls = []
                        item.recordList = []
                    }
                })
            }
            pageData.value.recordChosedListAll = []
            pageData.value.recordChosedIdsAll = []
            pageData.value.recordPopoverVisible = false
        }

        const recordCloseAll = () => {
            pageData.value.recordChosedListAll = []
            pageData.value.recordChosedIdsAll = []
            pageData.value.recordPopoverVisible = false
        }

        const setRecord = (index: number) => {
            pageData.value.triggerDialogIndex = index
            pageData.value.recordIsShow = true
        }

        const recordConfirm = (e: SelectOption<string, string>[]) => {
            addEditRow(tableData.value[pageData.value.triggerDialogIndex])
            if (e.length !== 0) {
                tableData.value[pageData.value.triggerDialogIndex].record.chls = cloneDeep(e)
                const chls = tableData.value[pageData.value.triggerDialogIndex].record.chls
                tableData.value[pageData.value.triggerDialogIndex].recordList = chls.map((item) => item.value)
            } else {
                tableData.value[pageData.value.triggerDialogIndex].record.chls = []
                tableData.value[pageData.value.triggerDialogIndex].recordList = []
                tableData.value[pageData.value.triggerDialogIndex].record.switch = false
            }
            pageData.value.recordIsShow = false
        }

        const recordClose = () => {
            if (!tableData.value[pageData.value.triggerDialogIndex].record.chls.length) {
                tableData.value[pageData.value.triggerDialogIndex].record.switch = false
                tableData.value[pageData.value.triggerDialogIndex].recordList = []
                tableData.value[pageData.value.triggerDialogIndex].record.chls = []
            }
            pageData.value.recordIsShow = false
        }

        // 下列为snap穿梭框相关
        const snapConfirmAll = (e: any[]) => {
            if (e.length !== 0) {
                pageData.value.snapChosedListAll = cloneDeep(e)
                pageData.value.snapChosedIdsAll = e.map((item) => item.value)
                tableData.value.forEach((item) => {
                    if (!item.rowDisable) {
                        addEditRow(item)
                        item.snap.switch = true
                        item.snap.chls = pageData.value.snapChosedListAll
                        item.snapList = pageData.value.snapChosedListAll.map((item) => item.value)
                    }
                })
            } else {
                tableData.value.forEach((item) => {
                    if (!item.rowDisable) {
                        addEditRow(item)
                        item.snap.switch = false
                        item.snap.chls = []
                        item.snapList = []
                    }
                })
            }
            pageData.value.snapChosedListAll = []
            pageData.value.snapChosedIdsAll = []
            pageData.value.snapPopoverVisible = false
        }

        const snapCloseAll = () => {
            pageData.value.snapChosedListAll = []
            pageData.value.snapChosedIdsAll = []
            pageData.value.snapPopoverVisible = false
        }

        const setSnap = (index: number) => {
            pageData.value.triggerDialogIndex = index
            pageData.value.snapIsShow = true
        }

        const snapConfirm = (e: SelectOption<string, string>[]) => {
            addEditRow(tableData.value[pageData.value.triggerDialogIndex])
            if (e.length !== 0) {
                tableData.value[pageData.value.triggerDialogIndex].snap.chls = cloneDeep(e)
                const chls = tableData.value[pageData.value.triggerDialogIndex].snap.chls
                tableData.value[pageData.value.triggerDialogIndex].snapList = chls.map((item) => item.value)
            } else {
                tableData.value[pageData.value.triggerDialogIndex].snap.chls = []
                tableData.value[pageData.value.triggerDialogIndex].snapList = []
                tableData.value[pageData.value.triggerDialogIndex].snap.switch = false
            }
            pageData.value.snapIsShow = false
        }

        const snapClose = () => {
            if (!tableData.value[pageData.value.triggerDialogIndex].snap.chls.length) {
                tableData.value[pageData.value.triggerDialogIndex].snap.switch = false
                tableData.value[pageData.value.triggerDialogIndex].snapList = []
                tableData.value[pageData.value.triggerDialogIndex].snap.chls = []
            }
            pageData.value.snapIsShow = false
        }

        // 下列为alarmOut穿梭框相关
        const alarmOutConfirmAll = (e: any[]) => {
            if (e.length !== 0) {
                pageData.value.alarmOutChosedListAll = cloneDeep(e)
                pageData.value.alarmOutChosedIdsAll = e.map((item) => item.value)
                tableData.value.forEach((item) => {
                    if (!item.rowDisable) {
                        addEditRow(item)
                        item.alarmOut.switch = true
                        item.alarmOut.chls = pageData.value.alarmOutChosedListAll
                        item.alarmOutList = pageData.value.alarmOutChosedListAll.map((item) => item.value)
                    }
                })
            } else {
                tableData.value.forEach((item) => {
                    if (!item.rowDisable) {
                        addEditRow(item)
                        item.alarmOut.switch = false
                        item.alarmOut.chls = []
                        item.alarmOutList = []
                    }
                })
            }
            pageData.value.alarmOutChosedListAll = []
            pageData.value.alarmOutChosedIdsAll = []
            pageData.value.alarmOutPopoverVisible = false
        }

        const alarmOutCloseAll = () => {
            pageData.value.alarmOutChosedListAll = []
            pageData.value.alarmOutChosedIdsAll = []
            pageData.value.alarmOutPopoverVisible = false
        }

        const setAlarmOut = (index: number) => {
            pageData.value.triggerDialogIndex = index
            pageData.value.alarmOutIsShow = true
        }

        const alarmOutConfirm = (e: SelectOption<string, string>[]) => {
            addEditRow(tableData.value[pageData.value.triggerDialogIndex])
            if (e.length !== 0) {
                tableData.value[pageData.value.triggerDialogIndex].alarmOut.chls = cloneDeep(e)
                const chls = tableData.value[pageData.value.triggerDialogIndex].alarmOut.chls
                tableData.value[pageData.value.triggerDialogIndex].alarmOutList = chls.map((item) => item.value)
            } else {
                tableData.value[pageData.value.triggerDialogIndex].alarmOut.chls = []
                tableData.value[pageData.value.triggerDialogIndex].alarmOutList = []
                tableData.value[pageData.value.triggerDialogIndex].alarmOut.switch = false
            }
            pageData.value.alarmOutIsShow = false
        }

        const alarmOutClose = () => {
            if (!tableData.value[pageData.value.triggerDialogIndex].alarmOut.chls.length) {
                tableData.value[pageData.value.triggerDialogIndex].alarmOut.switch = false
                tableData.value[pageData.value.triggerDialogIndex].alarmOutList = []
                tableData.value[pageData.value.triggerDialogIndex].alarmOut.chls = []
            }
            pageData.value.alarmOutIsShow = false
        }

        // presetPop相关
        const openPresetPop = (row: MotionEventConfig) => {
            pageData.value.presetChlId = row.id
            pageData.value.presetLinkedList = row.preset.presets
            pageData.value.isPresetPopOpen = true
        }

        const handlePresetLinkedList = (id: string, linkedList: PresetItem[]) => {
            tableData.value.forEach((item) => {
                if (item.id == id) {
                    item.preset.presets = linkedList
                    addEditRow(item)
                }
            })
        }

        const presetClose = (id: string) => {
            pageData.value.isPresetPopOpen = false
            tableData.value.forEach((item) => {
                if (item.id == id && item.preset.presets.length == 0) {
                    item.preset.switch = false
                }
            })
        }

        // 四个按钮checkBox切换
        const presetSwitchChange = (row: MotionEventConfig) => {
            addEditRow(row)
            if (row.preset.switch === false) {
                row.preset.presets = []
            } else {
                openPresetPop(row)
            }
        }

        const checkChange = (index: number, type: string) => {
            addEditRow(tableData.value[index])
            switch (type) {
                case 'record':
                    if (tableData.value[index].record.switch) {
                        setRecord(index)
                    } else {
                        tableData.value[index].record.chls = []
                        tableData.value[index].recordList = []
                    }
                    break
                case 'snap':
                    if (tableData.value[index].snap.switch) {
                        setSnap(index)
                    } else {
                        tableData.value[index].snap.chls = []
                        tableData.value[index].snapList = []
                    }
                    break
                case 'alarmOut':
                    if (tableData.value[index].alarmOut.switch) {
                        setAlarmOut(index)
                    } else {
                        tableData.value[index].alarmOut.chls = []
                        tableData.value[index].alarmOutList = []
                    }
                    break
                default:
                    break
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
                openMessageTipBox({
                    type: 'info',
                    message: Translate('IDCS_NO_AUTH'),
                })
            }
        }

        const addEditRow = (row: MotionEventConfig) => {
            // 若该行不存在于编辑行中，则添加
            const isExist = pageData.value.editRows.some((item) => item.id === row.id)
            if (!isExist) {
                pageData.value.editRows.push(row)
            }
            pageData.value.applyDisable = false
        }

        const getSavaData = (rowData: MotionEventConfig) => {
            const recordSwitch = rowData.record.switch
            const snapSwitch = rowData.snap.switch
            const alarmOutSwitch = rowData.alarmOut.switch
            const presetSwitch = rowData.preset.switch
            let sendXml = rawXml`<content>
                                <chl id="${rowData.id}">
                                <trigger>`
            sendXml += rawXml`<sysRec>
                            <switch>${recordSwitch.toString()}</switch>
                            <chls type="list">`
            if (!recordSwitch) {
                rowData.record = { switch: false, chls: [] }
            }
            const recordChls = rowData.record.chls
            recordChls.forEach((item) => {
                sendXml += rawXml` <item id="${item.value}">
                                <![CDATA[${item.label}]]>
                            </item>`
            })
            sendXml += rawXml`</chls>
                    </sysRec>`
            sendXml += rawXml`<alarmOut>
                            <switch>${alarmOutSwitch.toString()}</switch>
                            <alarmOuts type="list">`
            if (!alarmOutSwitch) {
                rowData.alarmOut = { switch: false, chls: [] }
            }
            const alarmOutChls = rowData.alarmOut.chls
            alarmOutChls.forEach((item) => {
                sendXml += rawXml` <item id="${item.value}">
                                <![CDATA[${item.label}]]>
                            </item>`
            })
            sendXml += rawXml`</alarmOuts>
                    </alarmOut>`
            sendXml += rawXml`<preset>
                            <switch>${presetSwitch.toString()}</switch>
                            <presets type="list">`
            if (!presetSwitch) {
                rowData.preset = { switch: false, presets: [] }
            }
            let presets = rowData.preset.presets
            if (!presets) {
                presets = []
            }

            if (!(presets instanceof Array)) {
                presets = [presets]
            }
            presets.forEach((item) => {
                if (item.index) {
                    sendXml += rawXml`
                        <item>
                            <index>${item.index}</index>
                            <name><![CDATA[${item.name}]]></name>
                            <chl id="${item.chl.value}"><![CDATA[${item.chl.label}]]></chl>
                        </item>`
                }
            })
            sendXml += rawXml`</presets>
                    </preset>`
            sendXml += rawXml`<sysSnap>
                            <switch>${snapSwitch.toString()}</switch>
                            <chls type="list">`
            if (!snapSwitch) {
                rowData.snap = { switch: false, chls: [] }
            }
            const snapChls = rowData.snap.chls
            snapChls.forEach((item) => {
                sendXml += rawXml` <item id="${item.value}">
                                <![CDATA[${item.label}]]>
                            </item>`
            })
            sendXml += rawXml`</chls>
                    </sysSnap>`
            const schedule = rowData.schedule.value == ' ' ? true : false
            sendXml += rawXml`
                        <buzzerSwitch>${rowData.beeper}</buzzerSwitch>
                        <msgPushSwitch>${rowData.msgPush}</msgPushSwitch>
                        <sysAudio id='${rowData.sysAudio}'></sysAudio>
                        <triggerSchedule>
                            <switch>${schedule.toString()}</switch>
                            <schedule id="${rowData.schedule.value == ' ' ? '' : rowData.schedule.value}"></schedule>
                        </triggerSchedule>
                        <popVideoSwitch>${rowData.videoPopup}</popVideoSwitch>
                        <emailSwitch>${rowData.email}</emailSwitch>
                        </trigger>
                    </chl>
                </content>`
            return sendXml
        }

        const setData = () => {
            openLoading()
            pageData.value.editRows.forEach((item: MotionEventConfig) => {
                const sendXml = getSavaData(item)
                editMotion(sendXml).then((resb) => {
                    const res = queryXml(resb)
                    if (res('status').text() == 'success') {
                        item.status = 'success'
                    } else {
                        item.status = 'error'
                        const errorCode = Number(res('errorCode').text())
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
            await getRecordList()
            await getSnapList()
            await getAlarmOutList()
            buildTableData()
        })
        return {
            changePagination,
            changePaginationSize,
            chosedList,
            pageData,
            tableData,
            openMessageTipBox,
            handleScheduleChangeAll,
            handleScheduleChangeSingle,
            handleSchedulePopClose,
            recordConfirmAll,
            recordCloseAll,
            setRecord,
            recordConfirm,
            recordClose,
            snapConfirmAll,
            snapCloseAll,
            setSnap,
            snapConfirm,
            snapClose,
            alarmOutConfirmAll,
            alarmOutCloseAll,
            setAlarmOut,
            alarmOutConfirm,
            alarmOutClose,
            openPresetPop,
            handlePresetLinkedList,
            presetClose,
            presetSwitchChange,
            checkChange,
            handleSysAudioChangeAll,
            handleMsgPushChangeAll,
            handleBeeperChangeAll,
            handleVideoPopupChangeAll,
            handleEmailChangeAll,
            handleMotionSetting,
            setData,
            addEditRow,
            SetPresetPop,
            ScheduleManagPop,
        }
    },
})
