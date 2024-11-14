/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-21 15:34:24
 * @Description: 前端掉线
 */
import { cloneDeep } from 'lodash-es'
import { AlarmEventDto, type AlarmPresetItem } from '@/types/apiType/aiAndEvent'
import AlarmBasePresetPop from './AlarmBasePresetPop.vue'
import AlarmBaseAlarmOutPop from './AlarmBaseAlarmOutPop.vue'
import AlarmBaseSnapPop from './AlarmBaseSnapPop.vue'

export default defineComponent({
    components: {
        AlarmBasePresetPop,
        AlarmBaseAlarmOutPop,
        AlarmBaseSnapPop,
    },
    setup() {
        const chosedList = ref<any[]>([])
        const { Translate } = useLangStore()
        const tableData = ref<AlarmEventDto[]>([])

        const { openLoading, closeLoading } = useLoading()
        const systemCaps = useCababilityStore()
        const pageData = ref({
            pageIndex: 1,
            pageSize: 10,
            totalCount: 0,
            enableList: getSwitchOptions(),
            supportAudio: false,
            // 未传值
            // supportFTP: false,
            audioList: [] as SelectOption<string, string>[],
            // 打开穿梭框时选择行的索引
            triggerDialogIndex: 0,
            snapIsShow: false,
            alarmOutIsShow: false,
            isPresetPopOpen: false,

            videoPopupList: [] as SelectOption<string, string>[],

            // disable
            applyDisable: true,
            editRows: [] as AlarmEventDto[],
        })

        const getAudioList = async () => {
            pageData.value.supportAudio = systemCaps.supportAlarmAudioConfig
            // pageData.value.supportAudio = true
            if (pageData.value.supportAudio) {
                pageData.value.audioList = await buildAudioList()
            }
        }

        const getVideoPopupList = async () => {
            pageData.value.videoPopupList.push({ value: ' ', label: Translate('IDCS_OFF') })
            getChlList({
                nodeType: 'chls',
            }).then(async (resb) => {
                const res = queryXml(resb)
                if (res('status').text() === 'success') {
                    res('//content/item').forEach((item) => {
                        const $item = queryXml(item.element)
                        pageData.value.videoPopupList.push({
                            value: item.attr('id')!,
                            label: $item('name').text(),
                        })
                    })
                }
            })
        }

        const buildTableData = () => {
            tableData.value = []
            getChlList({
                pageIndex: pageData.value.pageIndex,
                pageSize: pageData.value.pageSize,
                chlType: 'digital',
            }).then(async (res) => {
                const $chl = queryXml(res)
                pageData.value.totalCount = $chl('//content').attr('total').num()
                $chl('//content/item').forEach((item) => {
                    const $ele = queryXml(item.element)
                    const row = new AlarmEventDto()
                    row.id = item.attr('id')!
                    row.name = $ele('name').text()
                    row.status = 'loading'
                    tableData.value.push(row)
                })

                for (let i = 0; i < tableData.value.length; i++) {
                    const row = tableData.value[i]
                    row.status = ''
                    const sendXml = rawXml`
                        <condition>
                            <chlId>${row.id}</chlId>
                        </condition>
                    `
                    const offLine = await queryFrontEndOfflineTrigger(sendXml)
                    const res = queryXml(offLine)
                    if (res('status').text() === 'success') {
                        row.rowDisable = false
                        row.sysAudio = res('//content/sysAudio').attr('id') || DEFAULT_EMPTY_ID
                        row.snap = {
                            switch: res('//content/sysSnap/switch').text().bool(),
                            chls: res('//content/sysSnap/chls/item').map((item) => {
                                return {
                                    value: item.attr('id')!,
                                    label: item.text(),
                                }
                            }),
                        }
                        // 获取snap中chls的value列表
                        row.alarmOut = {
                            switch: res('//content/alarmOut/switch').text().bool(),
                            alarmOuts: res('//content/alarmOut/alarmOuts/item').map((item) => {
                                return {
                                    value: item.attr('id')!,
                                    label: item.text(),
                                }
                            }),
                        }
                        row.beeper = res('//content/buzzerSwitch').text()
                        row.email = res('//content/emailSwitch').text()
                        row.msgPush = res('//content/msgPushSwitch').text()
                        row.videoPopup = res('//content/popVideoSwitch').text()
                        row.videoPopupInfo = {
                            switch: res('//content/popVideo/switch').text().bool(),
                            chl: {
                                value: res('//content/popVideo/chl').attr('id') !== '' ? res('//content/popVideo/chl').attr('id') : ' ',
                                label: res('//content/popVideo/chl').text(),
                            },
                        }
                        row.videoPopupList = pageData.value.videoPopupList.filter((item) => {
                            return item.value !== row.id
                        })
                        row.msgBoxPopup = res('//content/popMsgSwitch').text()
                        row.preset.switch = res('//content/preset/switch').text().bool()
                        res('//content/preset/presets/item').forEach((item) => {
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

        // ftpSnap 未传值
        // const handleFtpSnapChangeAll = (ftpSnap: string) => {
        //     tableData.value.forEach((item) => {
        //         if (!item.rowDisable) {
        //             addEditRow(item)
        //             item.ftpSnap = ftpSnap
        //         }
        //     })
        // }

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
            tableData.value.forEach((row) => {
                const values = row.videoPopupList.map((item) => item.value)
                if (!row.rowDisable) {
                    if (values.includes(videoPopup)) {
                        addEditRow(row)
                        row.videoPopupInfo.chl.value = videoPopup
                        row.videoPopupInfo.chl.label = row.videoPopupList.find((item) => item.value === videoPopup)!.label
                    } else {
                        row.videoPopupInfo.chl.value = ' '
                        row.videoPopupInfo.chl.label = Translate('IDCS_OFF')
                    }
                }
            })
        }

        // 消息框弹出
        const handleMsgBoxPopupChangeAll = (msgBoxPopup: string) => {
            tableData.value.forEach((item) => {
                if (!item.rowDisable) {
                    addEditRow(item)
                    item.msgBoxPopup = msgBoxPopup
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
                <content id="${rowData.id}">
                    <sysSnap>
                        <switch>${rowData.snap.switch}</switch>
                        <chls type="list">
                            ${rowData.snap.chls.map((item) => `<item id="${item.value}"><![CDATA[${item.label}]]></item>`).join('')}
                        </chls>
                    </sysSnap>
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
                                            </item>
                                        `
                                    }
                                    return ''
                                })
                                .join('')}
                        </presets>
                    </preset>
                    <buzzerSwitch>${rowData.beeper}</buzzerSwitch>
                    <popVideo>
                        <switch>${rowData.videoPopupInfo.chl.value !== ' '}</switch>
                        <chl id="${rowData.videoPopupInfo.chl.value === ' ' ? '' : rowData.videoPopupInfo.chl.value}"></chl>
                    </popVideo>
                    <popMsgSwitch>${rowData.msgBoxPopup}</popMsgSwitch>
                    <emailSwitch>${rowData.email}</emailSwitch>
                    <msgPushSwitch>${rowData.msgPush}</msgPushSwitch>
                    <sysAudio id='${rowData.sysAudio}'></sysAudio>
                </content>
            `
            // ftpSnap无效
            // sendXml += `
            //             <buzzerSwitch>${rowData.beeper}</buzzerSwitch>
            //             <popVideo>
            //                 <switch>${rowData.videoPopupInfo.chl.value == ' ' ? 'false' : 'true'}</switch>
            //                 <chl id="${rowData.videoPopupInfo.chl.value == ' ' ? '' : rowData.videoPopupInfo.chl.value}"></chl>
            //             </popVideo>
            //             <popMsgSwitch>${rowData.msgBoxPopup}</popMsgSwitch>
            //             <emailSwitch>${rowData.email}</emailSwitch>
            //             <msgPushSwitch>${rowData.msgPush}</msgPushSwitch>
            //             <ftpSnapSwitch>${rowData.ftpSnap}</ftpSnapSwitch>
            //             <sysAudio id='${rowData.sysAudio}'></sysAudio>
            //     </content>`
            return sendXml
        }

        const setData = () => {
            openLoading()
            pageData.value.editRows.forEach((item: AlarmEventDto) => {
                const sendXml = getSavaData(item)
                editFrontEndOfflineTrigger(sendXml).then((resb) => {
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
                })
            })
            closeLoading()
            pageData.value.editRows = []
            pageData.value.applyDisable = true
        }

        onMounted(async () => {
            await getVideoPopupList()
            await getAudioList()
            buildTableData()
        })

        return {
            changePagination,
            changePaginationSize,
            chosedList,
            pageData,
            tableData,
            handleSysAudioChangeAll,
            handleMsgPushChangeAll,
            handleBeeperChangeAll,
            handleVideoPopupChangeAll,
            handleMsgBoxPopupChangeAll,
            handleEmailChangeAll,
            setData,
            addEditRow,
            switchAlarmOut,
            openAlarmOut,
            changeAlarmOut,
            switchSnap,
            openSnap,
            changeSnap,
            switchPreset,
            openPreset,
            changePreset,
            AlarmBasePresetPop,
            AlarmBaseAlarmOutPop,
            AlarmBaseSnapPop,
        }
    },
})
