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

        const { openLoading, closeLoading } = useLoading()
        const pageData = ref({
            pageIndex: 1,
            pageSize: 10,
            totalCount: 0,
            enableList: getSwitchOptions(),
            // supportFTP: false,
            audioList: [] as SelectOption<string, string>[],
            // 打开穿梭框时选择行的索引
            triggerDialogIndex: 0,
            snapIsShow: false,
            alarmOutIsShow: false,
            filterChlIds: [] as string[],
            isPresetPopOpen: false,
            videoPopupList: [] as SelectOption<string, string>[],
        })

        const tableData = ref<AlarmEventDto[]>([])

        const editRows = useWatchEditRows<AlarmEventDto>()

        const getVideoPopupList = () => {
            pageData.value.videoPopupList.push({
                value: ' ',
                label: Translate('IDCS_OFF'),
            })
            getChlList({
                nodeType: 'chls',
            }).then((res) => {
                const $ = queryXml(res)
                if ($('status').text() === 'success') {
                    $('content/item').forEach((item) => {
                        const $item = queryXml(item.element)
                        pageData.value.videoPopupList.push({
                            value: item.attr('id'),
                            label: $item('name').text(),
                        })
                    })
                }
            })
        }

        const buildTableData = () => {
            editRows.clear()
            tableData.value = []

            getChlList({
                pageIndex: pageData.value.pageIndex,
                pageSize: pageData.value.pageSize,
                chlType: 'analog',
            }).then((res) => {
                const $chl = queryXml(res)
                pageData.value.totalCount = $chl('content').attr('total').num()
                tableData.value = $chl('content/item').map((item) => {
                    const $ele = queryXml(item.element)
                    const row = new AlarmEventDto()
                    row.id = item.attr('id')
                    row.name = $ele('name').text()
                    row.status = 'loading'
                    return row
                })
                tableData.value.forEach(async (row) => {
                    const sendXml = rawXml`
                        <condition>
                            <chlId>${row.id}</chlId>
                        </condition>
                    `
                    const result = await queryVideoLossTrigger(sendXml)
                    const $ = queryXml(result)

                    if (!tableData.value.some((item) => item === row)) {
                        return
                    }

                    row.status = ''

                    if ($('status').text() === 'success') {
                        row.disabled = false
                        row.snap = {
                            switch: $('content/sysSnap/switch').text().bool(),
                            chls: $('content/sysSnap/chls/item').map((item) => {
                                return {
                                    value: item.attr('id'),
                                    label: item.text(),
                                }
                            }),
                        }
                        // 获取snap中chls的value列表
                        // row.snapList = row.snap.chls.map((item) => item.value)
                        row.alarmOut = {
                            switch: $('content/alarmOut/switch').text().bool(),
                            alarmOuts: $('content/alarmOut/alarmOuts/item').map((item) => {
                                return {
                                    value: item.attr('id'),
                                    label: item.text(),
                                }
                            }),
                        }
                        // row.alarmOutList = row.alarmOut.chls.map((item) => item.value)
                        row.beeper = $('content/buzzerSwitch').text()
                        row.email = $('content/emailSwitch').text()
                        row.msgPush = $('content/msgPushSwitch').text()
                        row.videoPopup = $('content/popVideoSwitch').text()
                        row.videoPopupInfo = {
                            switch: $('content/popVideo/switch').text().bool(),
                            chl: {
                                value: $('content/popVideo/chl').attr('id') !== '' ? $('content/popVideo/chl').attr('id') : ' ',
                                label: $('content/popVideo/chl').text(),
                            },
                        }
                        row.videoPopupList = pageData.value.videoPopupList.filter((item) => {
                            return item.value !== row.id
                        })
                        row.msgBoxPopup = $('content/popMsgSwitch').text()
                        row.preset.switch = $('content/preset/switch').text().bool()
                        row.preset.presets = $('content/preset/presets/item').map((item) => {
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
            if (tableData.value[index].disabled) {
                return
            }
            pageData.value.snapIsShow = false
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
            pageData.value.alarmOutIsShow = true
        }

        const changeAlarmOut = (index: number, data: SelectOption<string, string>[]) => {
            if (tableData.value[index].disabled) {
                return
            }
            pageData.value.alarmOutIsShow = false
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
            pageData.value.isPresetPopOpen = true
        }

        const changePreset = (index: number, data: AlarmPresetItem[]) => {
            pageData.value.isPresetPopOpen = false
            tableData.value[index].preset = {
                switch: !!data.length,
                presets: cloneDeep(data),
            }
        }

        // 系统音频
        const handleSysAudioChangeAll = (sysAudio: string) => {
            tableData.value.forEach((item) => {
                if (!item.disabled) {
                    item.sysAudio = sysAudio
                }
            })
        }

        // 消息推送
        const handleMsgPushChangeAll = (msgPush: string) => {
            tableData.value.forEach((item) => {
                if (!item.disabled) {
                    item.msgPush = msgPush
                }
            })
        }

        // ftpSnap 未传值
        // const handleFtpSnapChangeAll = (ftpSnap: string) => {
        //     tableData.value.forEach((item) => {
        //         if (!item.disabled) {
        //             item.ftpSnap = ftpSnap
        //         }
        //     })
        // }

        // 蜂鸣器
        const handleBeeperChangeAll = (beeper: string) => {
            tableData.value.forEach((item) => {
                if (!item.disabled) {
                    item.beeper = beeper
                }
            })
        }

        // 视频弹出
        const handleVideoPopupChangeAll = (videoPopup: string) => {
            tableData.value.forEach((row) => {
                const values = row.videoPopupList.map((item) => item.value)
                if (!row.disabled) {
                    if (values.includes(videoPopup)) {
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
                if (!item.disabled) {
                    item.msgBoxPopup = msgBoxPopup
                }
            })
        }

        // 邮件
        const handleEmailChangeAll = (email: string) => {
            tableData.value.forEach((item) => {
                if (!item.disabled) {
                    item.email = email
                }
            })
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
                        <switch>${rowData.videoPopupInfo.chl.value !== ' '}</switch>
                        <chl id="${rowData.videoPopupInfo.chl.value === ' ' ? '' : rowData.videoPopupInfo.chl.value}"></chl>
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

        const setData = async () => {
            openLoading()

            tableData.value.forEach((item) => (item.status = ''))

            for (const item of editRows.toArray()) {
                const sendXml = getSavaData(item)
                const result = await editVideoLossTrigger(sendXml)
                const $ = queryXml(result)
                if ($('status').text() === 'success') {
                    item.status = 'success'
                    editRows.remove(item)
                } else {
                    item.status = 'error'
                    const errorCode = $('errorCode').text().num()
                    if (errorCode === ErrorCode.USER_ERROR_GET_CONFIG_INFO_FAIL) {
                        item.status = 'success'
                        editRows.remove(item)
                    } else {
                        item.status = 'error'
                    }
                }
            }

            closeLoading()
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
            editRows,
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
            AlarmBasePresetPop,
            AlarmBaseSnapPop,
            AlarmBaseAlarmOutPop,
        }
    },
})
