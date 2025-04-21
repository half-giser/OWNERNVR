/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-16 18:13:56
 * @Description: 移动侦测
 */
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
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()
        const userSession = useUserSessionStore()
        const router = useRouter()

        const pageData = ref({
            pageIndex: 1,
            pageSize: 10,
            totalCount: 0,
            enableList: getTranslateOptions(DEFAULT_SWITCH_OPTIONS),
            supportAudio: false,
            scheduleList: [] as SelectOption<string, string>[],
            isSchedulePop: false,
            audioList: [] as SelectOption<string, string>[],
            // 打开穿梭框时选择行的索引
            triggerDialogIndex: 0,
            isRecordPop: false,
            isSnapPop: false,
            isAlarmOutPop: false,
            isPresetPop: false,
        })

        const tableData = ref<AlarmEventDto[]>([])

        const editRows = useWatchEditRows<AlarmEventDto>()

        const getScheduleList = async () => {
            pageData.value.scheduleList = await buildScheduleList({
                defaultValue: ' ',
            })
        }

        const getAudioList = async () => {
            pageData.value.supportAudio = systemCaps.supportAlarmAudioConfig
            if (pageData.value.supportAudio) {
                pageData.value.audioList = await buildAudioList()
            }
        }

        const getData = () => {
            editRows.clear()
            tableData.value = []
            getChlList({
                pageIndex: pageData.value.pageIndex,
                pageSize: pageData.value.pageSize,
                isSupportMotion: true,
            }).then((result) => {
                const $chl = queryXml(result)
                pageData.value.totalCount = $chl('content').attr('total').num()
                tableData.value = $chl('content/item').map((item) => {
                    const $ele = queryXml(item.element)
                    const row = new AlarmEventDto()
                    row.id = item.attr('id')
                    row.addType = $ele('addType').text()
                    row.chlType = $ele('chlType').text()
                    row.name = $ele('name').text()
                    row.poeIndex = $ele('poeIndex').text()
                    row.productModel = {
                        value: $ele('productModel').text(),
                        factoryName: $ele('productModel').attr('factoryName'),
                    }
                    row.status = 'loading'
                    return row
                })
                tableData.value.forEach(async (row) => {
                    const sendXml = rawXml`
                        <condition>
                            <chlId>${row.id}</chlId>
                        </condition>
                        <requireField>
                            <trigger/>
                        </requireField>
                    `
                    const result = await queryMotion(sendXml)
                    const $ = queryXml(result)

                    if (!tableData.value.some((item) => item === row)) {
                        return
                    }

                    row.status = ''

                    if ($('status').text() === 'success') {
                        const $trigger = queryXml($('content/chl/trigger')[0].element)

                        row.disabled = false
                        row.schedule = $trigger('triggerSchedule/schedule').attr('id') || ' '
                        row.record = {
                            switch: $trigger('sysRec/switch').text().bool(),
                            chls: $trigger('sysRec/chls/item').map((item) => {
                                return {
                                    value: item.attr('id'),
                                    label: item.text(),
                                }
                            }),
                        }
                        row.sysAudio = getSystemAudioID(pageData.value.audioList, $trigger('sysAudio').attr('id'))
                        row.snap = {
                            switch: $trigger('sysSnap/switch').text().bool(),
                            chls: $trigger('sysSnap/chls/item').map((item) => {
                                return {
                                    value: item.attr('id'),
                                    label: item.text(),
                                }
                            }),
                        }
                        row.alarmOut = {
                            switch: $trigger('alarmOut/switch').text().bool(),
                            alarmOuts: $trigger('alarmOut/alarmOuts/item').map((item) => {
                                return {
                                    value: item.attr('id'),
                                    label: item.text(),
                                }
                            }),
                        }
                        row.beeper = $trigger('buzzerSwitch').text()
                        row.email = $trigger('emailSwitch').text()
                        row.msgPush = $trigger('msgPushSwitch').text()
                        row.videoPopup = $trigger('popVideoSwitch').text()
                        row.preset.switch = $trigger('preset/switch').text().bool()
                        row.preset.presets = $trigger('preset/presets/item').map((item) => {
                            const $item = queryXml(item.element)
                            return {
                                index: $item('index').text(),
                                name: $item('name').text(),
                                chl: {
                                    value: $item('chl').attr('id'),
                                    label: $item('chl').text(),
                                },
                            }
                        })

                        editRows.listen(row)
                    } else {
                        row.disabled = true
                    }
                })
            })
        }

        const changePagination = () => {
            getData()
        }

        const changePaginationSize = () => {
            const totalPage = Math.ceil(pageData.value.totalCount / pageData.value.pageSize)
            if (pageData.value.pageIndex > totalPage) {
                pageData.value.pageIndex = totalPage
            }
            getData()
        }

        const changeAllSchedule = (schedule: string) => {
            tableData.value.forEach((item) => {
                if (!item.disabled) {
                    item.schedule = schedule
                }
            })
        }

        const openSchedulePop = () => {
            pageData.value.isSchedulePop = true
        }

        const closeSchedulePop = async () => {
            pageData.value.isSchedulePop = false
            await getScheduleList()
            tableData.value.forEach((item) => {
                if (!item.disabled) {
                    item.schedule = getScheduleId(pageData.value.scheduleList, item.schedule, ' ')
                }
            })
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

        // 系统音频
        const changeAllAudio = (sysAudio: string) => {
            tableData.value.forEach((item) => {
                if (!item.disabled) {
                    item.sysAudio = sysAudio
                }
            })
        }

        // 消息推送
        const changeAllMsgPush = (msgPush: string) => {
            tableData.value.forEach((item) => {
                if (!item.disabled) {
                    item.msgPush = msgPush
                }
            })
        }

        // 蜂鸣器
        const changeAllBeeper = (beeper: string) => {
            tableData.value.forEach((item) => {
                if (!item.disabled) {
                    item.beeper = beeper
                }
            })
        }

        // 视频弹出
        const changeAllVideoPopUp = (videoPopup: string) => {
            tableData.value.forEach((item) => {
                if (!item.disabled) {
                    item.videoPopup = videoPopup
                }
            })
        }

        // 邮件
        const changeAllEmail = (email: string) => {
            tableData.value.forEach((item) => {
                if (!item.disabled) {
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
                openMessageBox(Translate('IDCS_NO_AUTH'))
            }
        }

        const getSavaData = (rowData: AlarmEventDto) => {
            const sendXml = rawXml`
                <content>
                    <chl id="${rowData.id}">
                        <trigger>
                            <sysRec>
                                <switch>${rowData.record.switch}</switch>
                                <chls type="list">
                                    ${rowData.record.chls.map((item) => `<item id="${item.value}">${wrapCDATA(item.label)}</item>`).join('')}
                                </chls>
                            </sysRec>
                            <alarmOut>
                                <switch>${rowData.alarmOut.switch}</switch>
                                <alarmOuts type="list">
                                    ${rowData.alarmOut.alarmOuts.map((item) => `<item id="${item.value}">${wrapCDATA(item.label)}</item>`).join('')}
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
                                                        <name>${wrapCDATA(item.name)}</name>
                                                        <chl id="${item.chl.value}">${wrapCDATA(item.chl.label)}</chl>
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
                                    ${rowData.snap.chls.map((item) => `<item id="${item.value}">${wrapCDATA(item.label)}</item>`).join('')}
                                </chls>
                            </sysSnap>
                            <buzzerSwitch>${rowData.beeper}</buzzerSwitch>
                            <msgPushSwitch>${rowData.msgPush}</msgPushSwitch>
                            <sysAudio id='${rowData.sysAudio}'></sysAudio>
                            <triggerSchedule>
                                <switch>${rowData.schedule !== ' '}</switch>
                                <schedule id="${rowData.schedule === ' ' ? '' : rowData.schedule}"></schedule>
                            </triggerSchedule>
                            <popVideoSwitch>${rowData.videoPopup}</popVideoSwitch>
                            <emailSwitch>${rowData.email}</emailSwitch>
                        </trigger>
                    </chl>
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
                    const result = await editMotion(sendXml)
                    const $ = queryXml(result)
                    if ($('status').text() === 'success') {
                        item.status = 'success'
                        editRows.remove(item)
                    } else {
                        const errorCode = $('errorCode').text().num()
                        if (errorCode === ErrorCode.USER_ERROR_GET_CONFIG_INFO_FAIL) {
                            item.status = 'success'
                            editRows.remove(item)
                        } else {
                            item.status = 'error'
                        }
                    }
                } catch {
                    item.status = 'error'
                }
            }

            closeLoading()
        }

        onMounted(async () => {
            await getScheduleList()
            await getAudioList()
            getData()
        })

        return {
            changePagination,
            changePaginationSize,
            pageData,
            tableData,
            editRows,
            changeAllSchedule,
            closeSchedulePop,
            openSchedulePop,
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
            changeAllAudio,
            changeAllMsgPush,
            changeAllBeeper,
            changeAllVideoPopUp,
            changeAllEmail,
            handleMotionSetting,
            setData,
        }
    },
})
