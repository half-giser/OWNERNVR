/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-21 15:34:24
 * @Description: 视频丢失配置
 */
import { cloneDeep } from 'lodash-es'
import { AlarmEventDto, type AlarmPresetItem } from '@/types/apiType/aiAndEvent'
import AlarmBasePresetPop from './AlarmBasePresetPop.vue'
import AlarmBaseSnapPop from './AlarmBaseRecordPop.vue'
import AlarmBaseAlarmOutPop from './AlarmBaseAlarmOutPop.vue'

export default defineComponent({
    components: {
        AlarmBasePresetPop,
        AlarmBaseSnapPop,
        AlarmBaseAlarmOutPop,
    },
    setup() {
        const chosedList = ref<any[]>([])
        const { Translate } = useLangStore()
        const tableData = ref<AlarmEventDto[]>([])

        const { openLoading, closeLoading } = useLoading()
        const pageData = ref({
            pageIndex: 1,
            pageSize: 10,
            totalCount: 0,
            enableList: getSwitchOptions(),
            // TODO 未传值
            // supportFTP: false,
            audioList: [] as SelectOption<string, string>[],
            // 打开穿梭框时选择行的索引
            triggerDialogIndex: 0,
            snapIsShow: false,
            alarmOutIsShow: false,
            filterChlIds: [] as string[],
            isPresetPopOpen: false,
            videoPopupList: [] as SelectOption<string, string>[],
            // disable
            applyDisable: true,
            editRows: [] as AlarmEventDto[],
        })

        const getVideoPopupList = async () => {
            pageData.value.videoPopupList.push({ value: ' ', label: Translate('IDCS_OFF') })
            getChlList({
                nodeType: 'chls',
            }).then(async (res) => {
                const $ = queryXml(res)
                if ($('status').text() == 'success') {
                    $('//content/item').forEach((item) => {
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
            tableData.value.length = 0
            getChlList({
                pageIndex: pageData.value.pageIndex,
                pageSize: pageData.value.pageSize,
                chlType: 'analog',
            }).then(async (res) => {
                const $chl = queryXml(res)
                pageData.value.totalCount = Number($chl('//content').attr('total'))
                $chl('//content/item').forEach(async (item) => {
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
                    const videoLoss = await queryVideoLossTrigger(sendXml)
                    const res = queryXml(videoLoss)
                    if (res('status').text() == 'success') {
                        row.rowDisable = false
                        row.snap = {
                            switch: res('//content/sysSnap/switch').text() == 'true' ? true : false,
                            chls: res('//content/sysSnap/chls/item').map((item) => {
                                return {
                                    value: item.attr('id')!,
                                    label: item.text(),
                                }
                            }),
                        }
                        // 获取snap中chls的value列表
                        // row.snapList = row.snap.chls.map((item) => item.value)
                        row.alarmOut = {
                            switch: res('//content/alarmOut/switch').text() == 'true' ? true : false,
                            alarmOuts: res('//content/alarmOut/alarmOuts/item').map((item) => {
                                return {
                                    value: item.attr('id')!,
                                    label: item.text(),
                                }
                            }),
                        }
                        // row.alarmOutList = row.alarmOut.chls.map((item) => item.value)
                        row.beeper = res('//content/buzzerSwitch').text()
                        row.email = res('//content/emailSwitch').text()
                        row.msgPush = res('//content/msgPushSwitch').text()
                        row.videoPopup = res('//content/popVideoSwitch').text()
                        row.videoPopupInfo = {
                            switch: res('//content/popVideo/switch').text() == 'true' ? true : false,
                            chl: {
                                value: res('//content/popVideo/chl').attr('id') != '' ? res('//content/popVideo/chl').attr('id') : ' ',
                                label: res('//content/popVideo/chl').text(),
                            },
                        }
                        row.videoPopupList = pageData.value.videoPopupList.filter((item) => {
                            return item.value !== row.id
                        })
                        row.msgBoxPopup = res('//content/popMsgSwitch').text()
                        row.preset.switch = res('//content/preset/switch').text() == 'true' ? true : false
                        res('//content/preset/presets/item').forEach((item) => {
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
            const row = tableData.value[index].snap
            addEditRow(tableData.value[index])
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
            pageData.value.snapIsShow = false
            addEditRow(tableData.value[index])
            tableData.value[index].snap = {
                switch: !!data.length,
                chls: cloneDeep(data),
            }
        }

        const switchAlarmOut = (index: number) => {
            const row = tableData.value[index].alarmOut
            addEditRow(tableData.value[index])
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
            pageData.value.alarmOutIsShow = false
            addEditRow(tableData.value[index])
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

        // presetPop相关
        // const openPresetPop = (row: AlarmEventDto) => {
        //     pageData.value.presetChlId = row.id
        //     pageData.value.presetLinkedList = row.preset.presets
        //     pageData.value.isPresetPopOpen = true
        // }

        // const handlePresetLinkedList = (id: string, linkedList: AlarmPresetItem[]) => {
        //     tableData.value.forEach((item) => {
        //         if (item.id == id) {
        //             item.preset.presets = linkedList
        //             addEditRow(item)
        //         }
        //     })
        // }

        // const presetClose = (id: string) => {
        //     pageData.value.isPresetPopOpen = false
        //     tableData.value.forEach((item) => {
        //         if (item.id == id && item.preset.presets.length == 0) {
        //             item.preset.switch = false
        //         }
        //     })
        // }

        // const presetSwitchChange = (row: AlarmEventDto) => {
        //     addEditRow(row)
        //     if (row.preset.switch === false) {
        //         row.preset.presets = []
        //     } else {
        //         openPresetPop(row)
        //     }
        // }

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
            const presetSwitch = rowData.preset.switch

            if (!presetSwitch) {
                rowData.preset = { switch: false, presets: [] }
            }

            const sendXml = `
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
                        <switch>${presetSwitch}</switch>
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
                    <msgPushSwitch>${rowData.msgPush}</msgPushSwitch>
                    <buzzerSwitch>${rowData.beeper}</buzzerSwitch>
                    <popVideo>
                        <switch>${rowData.videoPopupInfo.chl.value == ' ' ? 'false' : 'true'}</switch>
                        <chl id="${rowData.videoPopupInfo.chl.value == ' ' ? '' : rowData.videoPopupInfo.chl.value}"></chl>
                    </popVideo>
                    <popMsgSwitch>${rowData.msgBoxPopup}</popMsgSwitch>
                    <emailSwitch>${rowData.email}</emailSwitch>
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
            pageData.value.editRows.forEach((item) => {
                const sendXml = getSavaData(item)
                editVideoLossTrigger(sendXml).then((res) => {
                    const $ = queryXml(res)
                    if ($('status').text() == 'success') {
                        item.status = 'success'
                    } else {
                        item.status = 'error'
                        const errorCode = Number($('errorCode').text())
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
            buildTableData()
        })

        return {
            changePagination,
            changePaginationSize,
            chosedList,
            pageData,
            tableData,
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
            handleMsgBoxPopupChangeAll,
            handleEmailChangeAll,
            setData,
            addEditRow,
            AlarmBasePresetPop,
            AlarmBaseSnapPop,
            AlarmBaseAlarmOutPop,
        }
    },
})
