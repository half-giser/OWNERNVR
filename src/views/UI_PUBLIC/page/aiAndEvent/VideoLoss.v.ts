/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-21 15:34:24
 * @Description: 视频丢失配置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-24 17:33:55
 */
import { cloneDeep } from 'lodash-es'
import { MotionEventConfig, type PresetItem } from '@/types/apiType/aiAndEvent'
import SetPresetPop from './SetPresetPop.vue'
export default defineComponent({
    components: {
        SetPresetPop,
    },
    setup() {
        const chosedList = ref<any[]>([])
        const { Translate } = useLangStore()
        const tableData = ref<MotionEventConfig[]>([])

        const { openLoading, closeLoading } = useLoading()
        const pageData = ref({
            pageIndex: 1,
            pageSize: 10,
            totalCount: 0,
            pageDataCountItems: [10, 20, 30],
            enableList: getSwitchOptions(),
            // TODO 未传值
            // supportFTP: false,
            audioList: [] as SelectOption<string, string>[],
            // 打开穿梭框时选择行的索引
            triggerDialogIndex: 0,

            // snap穿梭框数据源
            snapList: [] as SelectOption<string, string>[],
            // 表头选中id
            snapChosedIdsAll: [] as string[],
            // 表头选中的数据
            snapChosedListAll: [] as SelectOption<string, string>[],
            snapIsShow: false,
            snapType: 'snap',

            // alarmOut穿梭框数据源
            alarmOutList: [] as { value: string; label: string; device: { value: string; label: string } }[],
            // 表头选中id
            alarmOutChosedIdsAll: [] as string[],
            // 表头选中的数据
            alarmOutChosedListAll: [] as SelectOption<string, string>[],
            alarmOutIsShow: false,
            alarmOutType: 'alarmOut',

            presetList: [] as any[],
            filterChlIds: [] as string[],
            isPresetPopOpen: false,
            presetChlId: '',
            presetLinkedList: [] as PresetItem[],

            videoPopupList: [] as SelectOption<string, string>[],

            // disable
            applyDisable: true,
            editRows: [] as MotionEventConfig[],

            snapPopoverVisible: false,
            alarmOutPopoverVisible: false,
        })
        const getSnapList = async () => {
            pageData.value.snapList = await buildSnapChlList()
        }

        const getAlarmOutList = async () => {
            pageData.value.alarmOutList = await buildAlarmOutChlList()
        }

        const getSnapListSingle = (row: MotionEventConfig) => {
            return pageData.value.snapList.filter((item) => {
                return item.value !== row.id
            })
        }

        const getAlarmOutListSingle = (row: MotionEventConfig) => {
            const alarmOutlist = pageData.value.alarmOutList.filter((item) => {
                return item.device.value !== row.id
            })
            return alarmOutlist
        }

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
                    const row = new MotionEventConfig()
                    row.id = item.attr('id')!
                    row.name = $ele('name').text()
                    row.status = 'loading'
                    tableData.value.push(row)
                })
                for (let i = 0; i < tableData.value.length; i++) {
                    const row = tableData.value[i]
                    row.status = ''
                    const sendXml = rawXml`<condition>
                                        <chlId>${row.id}</chlId>
                                    </condition>`
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
                        row.snapList = row.snap.chls.map((item) => item.value)
                        row.alarmOut = {
                            switch: res('//content/alarmOut/switch').text() == 'true' ? true : false,
                            chls: res('//content/alarmOut/alarmOuts/item').map((item) => {
                                return {
                                    value: item.attr('id')!,
                                    label: item.text(),
                                }
                            }),
                        }
                        row.alarmOutList = row.alarmOut.chls.map((item) => item.value)
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

        // 下列为snap穿梭框相关
        const snapConfirmAll = (e: any[]) => {
            if (e.length !== 0) {
                pageData.value.snapChosedListAll = cloneDeep(e)
                pageData.value.snapChosedIdsAll = e.map((item) => item.value)
                tableData.value.forEach((item) => {
                    if (!item.rowDisable) {
                        item.snap.chls = []
                        addEditRow(item)
                        item.snap.switch = true
                        pageData.value.snapChosedListAll.forEach((snap) => {
                            if (getSnapListSingle(item).some((snapItem) => snapItem.value === snap.value)) {
                                item.snap.chls.push(snap)
                            }
                        })
                        item.snapList = item.snap.chls.map((item) => item.value)
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
                        item.alarmOut.chls = []
                        addEditRow(item)
                        item.alarmOut.switch = true
                        const availableids = getAlarmOutListSingle(item).map((ele) => ele.value)
                        pageData.value.alarmOutChosedListAll.forEach((alarmOut) => {
                            if (availableids.includes(alarmOut.value)) {
                                item.alarmOut.chls.push(alarmOut)
                            }
                        })
                        item.alarmOutList = item.alarmOut.chls.map((item) => item.value)
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

        const addEditRow = (row: MotionEventConfig) => {
            // 若该行不存在于编辑行中，则添加
            const isExist = pageData.value.editRows.some((item) => item.id === row.id)
            if (!isExist) {
                pageData.value.editRows.push(row)
            }
            pageData.value.applyDisable = false
        }

        const getSavaData = (rowData: MotionEventConfig) => {
            const snapSwitch = rowData.snap.switch
            const alarmOutSwitch = rowData.alarmOut.switch
            const presetSwitch = rowData.preset.switch
            let sendXml = `<content id="${rowData.id}">`
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
            sendXml += rawXml`<alarmOut>
                            <switch>${alarmOutSwitch.toString()}</switch>
                            <alarmOuts type="list">`
            if (!alarmOutSwitch) {
                rowData.alarmOut = { switch: false, chls: [] }
            }
            const alarmOutChls = rowData.alarmOut.chls
            alarmOutChls.forEach((item) => {
                sendXml += rawXml`<item id="${item.value}">
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
            sendXml += rawXml`
                        <msgPushSwitch>${rowData.msgPush}</msgPushSwitch>
                        <buzzerSwitch>${rowData.beeper}</buzzerSwitch>
                        <popVideo>
                            <switch>${rowData.videoPopupInfo.chl.value == ' ' ? 'false' : 'true'}</switch>
                            <chl id="${rowData.videoPopupInfo.chl.value == ' ' ? '' : rowData.videoPopupInfo.chl.value}"></chl>
                        </popVideo>
                        <popMsgSwitch>${rowData.msgBoxPopup}</popMsgSwitch>
                        <emailSwitch>${rowData.email}</emailSwitch>
                </content>`
            // ftpSnap无效 TODO
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
            getAlarmOutListSingle,
            getSnapListSingle,
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
            checkChange,
            presetSwitchChange,
            handleSysAudioChangeAll,
            handleMsgPushChangeAll,
            handleBeeperChangeAll,
            handleVideoPopupChangeAll,
            handleMsgBoxPopupChangeAll,
            handleEmailChangeAll,
            setData,
            addEditRow,
        }
    },
})
