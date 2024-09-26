/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-21 15:34:24
 * @Description: 前端掉线
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-08-27 17:03:59
 */
import { cloneDeep } from 'lodash'
import { ArrowDown } from '@element-plus/icons-vue'
import { tableRowStatus, tableRowStatusToolTip } from '@/utils/const/other'
import BaseTransferPop from '@/components/BaseTransferPop.vue'
import BaseTableRowStatus from '@/components/BaseTableRowStatus.vue'
import BaseTransferDialog from '@/components/BaseTransferDialog.vue'
import { MotionEventConfig, type PresetItem } from '@/types/apiType/aiAndEvent'
import { errorCodeMap } from '@/utils/constants'
import SetPresetPop from './SetPresetPop.vue'
export default defineComponent({
    components: {
        ArrowDown,
        BaseTransferPop,
        BaseTransferDialog,
        SetPresetPop,
        BaseTableRowStatus,
    },
    setup() {
        const chosedList = ref<any[]>([])
        const { Translate } = useLangStore()
        const tableData = ref<MotionEventConfig[]>([])
        const snapRef = ref()
        const alarmOutRef = ref()
        const presetRef = ref()

        // ;(snapRef.value as InstanceType<typeof ElDropdown>).handleOpen()
        // ;(alarmOutRef.value as InstanceType<typeof ElDropdown>).handleOpen()
        const { LoadingTarget, openLoading, closeLoading } = useLoading()
        const systemCaps = useCababilityStore()
        const openMessageTipBox = useMessageBox().openMessageTipBox
        const pageData = ref({
            pageIndex: 1,
            pageSize: 10,
            totalCount: 0,
            pageDataCountItems: [10, 20, 30],
            enableList: [
                { value: 'true', label: Translate('IDCS_ON') },
                { value: 'false', label: Translate('IDCS_OFF') },
            ],
            defaultAudioId: '{00000000-0000-0000-0000-000000000000}',
            supportAudio: false,
            // TODO 未传值
            // supportFTP: false,
            audioList: [] as { value: string; label: string }[],
            // 打开穿梭框时选择行的索引
            triggerDialogIndex: 0,

            // snap穿梭框数据源
            snapList: [] as { value: string; label: string }[],
            snapHeaderTitle: 'IDCS_TRIGGER_CHANNEL_SNAP',
            snapSourceTitle: 'IDCS_CHANNEL',
            snapTargetTitle: 'IDCS_CHANNEL_TRGGER',
            // 表头选中id
            snapChosedIdsAll: [] as string[],
            // 表头选中的数据
            snapChosedListAll: [] as { value: string; label: string }[],
            snapIsShowAll: false,
            snapIsShow: false,
            snapType: 'snap',

            // alarmOut穿梭框数据源
            alarmOutList: [] as { value: string; label: string; device: { value: string; label: string } }[],
            alarmOutHeaderTitle: 'IDCS_TRIGGER_ALARM_OUT',
            alarmOutSourceTitle: 'IDCS_ALARM_OUT',
            alarmOutTargetTitle: 'IDCS_TRIGGER_ALARM_OUT',
            // 表头选中id
            alarmOutChosedIdsAll: [] as string[],
            // 表头选中的数据
            alarmOutChosedListAll: [] as { value: string; label: string }[],
            alarmOutIsShowAll: false,
            alarmOutIsShow: false,
            alarmOutType: 'alarmOut',

            presetList: [] as any[],
            filterChlIds: [] as string[],
            isPresetPopOpen: false,
            presetChlId: '',
            presetLinkedList: [] as PresetItem[],

            videoPopupList: [] as { value: string; label: string }[],

            // disable
            applyDisable: true,
            editRows: [] as MotionEventConfig[],
        })
        const getAudioList = async () => {
            pageData.value.supportAudio = systemCaps.supportAlarmAudioConfig
            // pageData.value.supportAudio = true
            if (pageData.value.supportAudio == true) {
                queryAlarmAudioCfg().then(async (resb) => {
                    pageData.value.audioList = []
                    const res = queryXml(resb)
                    if (res('status').text() == 'success') {
                        res('//content/audioList/item').forEach((item: any) => {
                            const $item = queryXml(item.element)
                            pageData.value.audioList.push({
                                value: item.attr('id'),
                                label: $item('name').text(),
                            })
                        })
                        pageData.value.audioList.push({ value: pageData.value.defaultAudioId, label: '<' + Translate('IDCS_NULL') + '>' })
                    }
                })
            }
        }
        const getSnapList = async () => {
            getChlList({
                nodeType: 'chls',
                isSupportSnap: true,
            }).then(async (resb) => {
                const res = queryXml(resb)
                if (res('status').text() == 'success') {
                    res('//content/item').forEach((item: any) => {
                        const $item = queryXml(item.element)
                        pageData.value.snapList.push({
                            value: item.attr('id'),
                            label: $item('name').text(),
                        })
                    })
                }
            })
        }
        const getAlarmOutList = async () => {
            getChlList({
                requireField: ['device'],
                nodeType: 'alarmOuts',
            }).then(async (resb) => {
                const res = queryXml(resb)
                if (res('status').text() == 'success') {
                    res('//content/item').forEach((item: any) => {
                        const $item = queryXml(item.element)
                        let name = $item('name').text()
                        if ($item('devDesc').text()) {
                            name = $item('devDesc').text() + '-' + name
                        }
                        pageData.value.alarmOutList.push({
                            value: item.attr('id'),
                            label: name,
                            device: {
                                value: $item('device').attr('id'),
                                label: $item('device').text(),
                            },
                        })
                    })
                }
            })
        }
        const getSnapListSingle = function (row: MotionEventConfig) {
            return pageData.value.snapList.filter((item) => {
                return item.value != row.id
            })
        }
        const getAlarmOutListSingle = function (row: MotionEventConfig) {
            const alarmOutlist = pageData.value.alarmOutList.filter((item) => {
                return item.device.value != row.id
            })
            return alarmOutlist
        }
        const getVideoPopupList = async () => {
            pageData.value.videoPopupList.push({ value: ' ', label: Translate('IDCS_OFF') })
            getChlList({
                nodeType: 'chls',
            }).then(async (resb) => {
                const res = queryXml(resb)
                if (res('status').text() == 'success') {
                    res('//content/item').forEach((item: any) => {
                        const $item = queryXml(item.element)
                        pageData.value.videoPopupList.push({
                            value: item.attr('id'),
                            label: $item('name').text(),
                        })
                    })
                }
            })
        }
        const buildTableData = function () {
            tableData.value.length = 0
            const xml = rawXml`<types>
                            <nodeType>
                                <enum>chls</enum>
                                <enum>sensors</enum>
                                <enum>alarmOuts</enum>
                            </nodeType>
                            <chlType>
                                <enum>analog</enum>
                                <enum>digital</enum>
                                <enum>all</enum>
                            </chlType>
                        </types>
                        <pageIndex>${pageData.value.pageIndex.toString()}</pageIndex>
                        <pageSize>${pageData.value.pageSize.toString()}</pageSize>
                        <nodeType type="nodeType">chls</nodeType>
                        <requireField>
                            <name/>
                        </requireField>
                        <condition>
                            <chlType type="chlType">digital</chlType>
                        </condition>`
            queryNodeList(getXmlWrapData(xml)).then(async (res) => {
                const $chl = queryXml(res)
                pageData.value.totalCount = Number($chl('//content').attr('total'))
                $chl('//content/item').forEach(async (item) => {
                    const $ele = queryXml(item.element)
                    const row = new MotionEventConfig()
                    row.id = item.attr('id')!
                    row.name = $ele('name').text()
                    row.status = tableRowStatus.loading
                    tableData.value.push(row)
                })
                for (let i = 0; i < tableData.value.length; i++) {
                    const row = tableData.value[i]
                    row.status = ''
                    const sendXml = rawXml`<condition>
                                        <chlId>${row.id}</chlId>
                                    </condition>`
                    const offLine = await queryFrontEndOfflineTrigger(sendXml)
                    const res = queryXml(offLine)
                    if (res('status').text() == 'success') {
                        row.rowDisable = false
                        row.sysAudio = res('//content/sysAudio').attr('id') || pageData.value.defaultAudioId
                        row.snap = {
                            switch: res('//content/sysSnap/switch').text() == 'true' ? true : false,
                            chls: res('//content/sysSnap/chls/item').map((item: any) => {
                                return {
                                    value: item.attr('id'),
                                    label: item.text(),
                                }
                            }),
                        }
                        // 获取snap中chls的value列表
                        row.snapList = row.snap.chls.map((item) => item.value)
                        row.alarmOut = {
                            switch: res('//content/alarmOut/switch').text() == 'true' ? true : false,
                            chls: res('//content/alarmOut/alarmOuts/item').map((item: any) => {
                                return {
                                    value: item.attr('id'),
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
                        res('//content/preset/presets/item').forEach((item: any) => {
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
                        const AudioData = pageData.value.audioList.filter((element: { value: string; label: string }) => {
                            return element.value === row.sysAudio
                        })
                        if (AudioData.length === 0) {
                            row.sysAudio = pageData.value.defaultAudioId
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

        // 下列为snap穿梭框相关
        const snapDropdownOpen = () => {
            snapRef.value.handleOpen()
            pageData.value.snapIsShowAll = true
        }
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
            pageData.value.snapIsShowAll = false
            snapRef.value.handleClose()
        }
        const snapCloseAll = () => {
            pageData.value.snapChosedListAll = []
            pageData.value.snapChosedIdsAll = []
            pageData.value.snapIsShowAll = false
            snapRef.value.handleClose()
        }
        const setSnap = function (index: number) {
            pageData.value.snapIsShow = true
            pageData.value.triggerDialogIndex = index
        }
        const snapConfirm = (e: { value: string; label: string }[]) => {
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
        const alarmOutDropdownOpen = () => {
            alarmOutRef.value.handleOpen()
            pageData.value.alarmOutIsShowAll = true
        }
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
            pageData.value.alarmOutIsShowAll = false
            alarmOutRef.value.handleClose()
        }
        const alarmOutCloseAll = () => {
            pageData.value.alarmOutChosedListAll = []
            pageData.value.alarmOutChosedIdsAll = []
            pageData.value.alarmOutIsShowAll = false
            alarmOutRef.value.handleClose()
        }
        const setAlarmOut = function (index: number) {
            pageData.value.alarmOutIsShow = true
            pageData.value.triggerDialogIndex = index
        }
        const alarmOutConfirm = (e: { value: string; label: string }[]) => {
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

        const snapSwitchChange = function (row: MotionEventConfig) {
            addEditRow(row)
            if (row.snap.switch === false) {
                row.snap.chls = []
                row.snapList = []
            }
        }
        const alarmOutSwitchChange = function (row: MotionEventConfig) {
            addEditRow(row)
            if (row.alarmOut.switch === false) {
                row.alarmOut.chls = []
                row.alarmOutList = []
            }
        }
        const presetSwitchChange = function (row: MotionEventConfig) {
            addEditRow(row)
            if (row.preset.switch === false) {
                row.preset.presets = []
            }
        }

        // 系统音频
        const handleSysAudioChangeAll = function (sysAudio: string) {
            tableData.value.forEach((item) => {
                if (!item.rowDisable) {
                    addEditRow(item)
                    item.sysAudio = sysAudio
                }
            })
        }
        // 消息推送
        const handleMsgPushChangeAll = function (msgPush: string) {
            tableData.value.forEach((item) => {
                if (!item.rowDisable) {
                    addEditRow(item)
                    item.msgPush = msgPush
                }
            })
        }
        // ftpSnap 未传值
        // const handleFtpSnapChangeAll = function (ftpSnap: string) {
        //     tableData.value.forEach((item) => {
        //         if (!item.rowDisable) {
        //             addEditRow(item)
        //             item.ftpSnap = ftpSnap
        //         }
        //     })
        // }

        // 蜂鸣器
        const handleBeeperChangeAll = function (beeper: string) {
            tableData.value.forEach((item) => {
                if (!item.rowDisable) {
                    addEditRow(item)
                    item.beeper = beeper
                }
            })
        }
        // 视频弹出
        const handleVideoPopupChangeAll = function (videoPopup: string) {
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
        const handleMsgBoxPopupChangeAll = function (msgBoxPopup: string) {
            tableData.value.forEach((item) => {
                if (!item.rowDisable) {
                    addEditRow(item)
                    item.msgBoxPopup = msgBoxPopup
                }
            })
        }
        // 邮件
        const handleEmailChangeAll = function (email: string) {
            tableData.value.forEach((item) => {
                if (!item.rowDisable) {
                    addEditRow(item)
                    item.email = email
                }
            })
        }

        const addEditRow = function (row: MotionEventConfig) {
            // 若该行不存在于编辑行中，则添加
            const isExist = pageData.value.editRows.some((item) => item.id === row.id)
            if (!isExist) {
                pageData.value.editRows.push(row)
            }
            pageData.value.applyDisable = false
        }
        const getSavaData = function (rowData: MotionEventConfig) {
            const snapSwitch = rowData.snap.switch
            const alarmOutSwitch = rowData.alarmOut.switch
            const presetSwitch = rowData.preset.switch
            let sendXml = rawXml`<content id="${rowData.id}">`
            sendXml += rawXml`<sysSnap>
                            <switch>${snapSwitch.toString()}</switch>
                            <chls type="list">`
            if (!snapSwitch) {
                rowData.snap = { switch: false, chls: [] }
            }
            const snapChls = rowData.snap.chls
            snapChls.forEach((item: any) => {
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
            alarmOutChls.forEach((item: any) => {
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
            presets.forEach((item: any) => {
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
                        <buzzerSwitch>${rowData.beeper}</buzzerSwitch>
                        <popVideo>
                            <switch>${rowData.videoPopupInfo.chl.value == ' ' ? 'false' : 'true'}</switch>
                            <chl id="${rowData.videoPopupInfo.chl.value == ' ' ? '' : rowData.videoPopupInfo.chl.value}"></chl>
                        </popVideo>
                        <popMsgSwitch>${rowData.msgBoxPopup}</popMsgSwitch>
                        <emailSwitch>${rowData.email}</emailSwitch>
                        <msgPushSwitch>${rowData.msgPush}</msgPushSwitch>
                        <sysAudio id='${rowData.sysAudio}'></sysAudio>
                </content>`
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
        const setData = function () {
            openLoading(LoadingTarget.FullScreen)
            pageData.value.editRows.forEach((item: MotionEventConfig) => {
                const sendXml = getSavaData(item)
                editFrontEndOfflineTrigger(sendXml).then((resb) => {
                    const res = queryXml(resb)
                    if (res('status').text() == 'success') {
                        item.status = 'success'
                    } else {
                        item.status = 'error'
                        const errorCode = Number(res('errorCode').text())
                        if (errorCode === errorCodeMap.noConfigData) {
                            item.status = 'success'
                        } else {
                            item.status = 'error'
                        }
                    }
                })
            })
            closeLoading(LoadingTarget.FullScreen)
            pageData.value.editRows = []
            pageData.value.applyDisable = true
        }

        onMounted(async () => {
            await getVideoPopupList()
            await getAudioList()
            await getSnapList()
            await getAlarmOutList()
            buildTableData()
        })
        return {
            changePagination,
            changePaginationSize,
            Translate,
            tableRowStatus,
            tableRowStatusToolTip,
            chosedList,
            pageData,
            tableData,
            openMessageTipBox,
            snapRef,
            alarmOutRef,
            presetRef,
            getAlarmOutListSingle,
            getSnapListSingle,
            snapDropdownOpen,
            snapConfirmAll,
            snapCloseAll,
            setSnap,
            snapConfirm,
            snapClose,
            alarmOutDropdownOpen,
            alarmOutConfirmAll,
            alarmOutCloseAll,
            setAlarmOut,
            alarmOutConfirm,
            alarmOutClose,
            openPresetPop,
            handlePresetLinkedList,
            presetClose,
            snapSwitchChange,
            alarmOutSwitchChange,
            presetSwitchChange,
            handleSysAudioChangeAll,
            handleMsgPushChangeAll,
            handleBeeperChangeAll,
            handleVideoPopupChangeAll,
            handleMsgBoxPopupChangeAll,
            handleEmailChangeAll,
            setData,
            addEditRow,
            BaseTableRowStatus,
        }
    },
})
