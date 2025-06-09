/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-21 15:34:24
 * @Description: 前端掉线
 */
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
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()

        const pageData = ref({
            pageIndex: 1,
            pageSize: 10,
            totalCount: 0,
            enableList: getTranslateOptions(DEFAULT_SWITCH_OPTIONS),
            supportAudio: false,
            // 未传值
            // supportFTP: false,
            audioList: [] as SelectOption<string, string>[],
            // 打开穿梭框时选择行的索引
            triggerDialogIndex: 0,
            isSnapPop: false,
            isAlarmOutPop: false,
            isPresetPop: false,
            videoPopupList: [] as SelectOption<string, string>[],
        })

        const tableData = ref<AlarmEventDto[]>([])
        // 编辑行
        const editRows = useWatchEditRows<AlarmEventDto>()

        /**
         * @description 获取声音列表
         */
        const getAudioList = async () => {
            pageData.value.supportAudio = systemCaps.supportAlarmAudioConfig
            // pageData.value.supportAudio = true
            if (pageData.value.supportAudio) {
                pageData.value.audioList = await buildAudioList()
            }
        }

        /**
         * @description 获取视频弹出通道列表
         */
        const getVideoPopupList = () => {
            pageData.value.videoPopupList.push({
                value: ' ',
                label: Translate('IDCS_OFF'),
            })
            getChlList({
                nodeType: 'chls',
            }).then((result) => {
                const $ = queryXml(result)
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

        /**
         * @description 获取列表数据
         */
        const getData = () => {
            editRows.clear()
            tableData.value = []

            getChlList({
                pageIndex: pageData.value.pageIndex,
                pageSize: pageData.value.pageSize,
                chlType: 'digital',
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
                    const result = await queryFrontEndOfflineTrigger(sendXml)
                    const $ = queryXml(result)

                    if (!tableData.value.some((item) => item === row)) {
                        return
                    }

                    row.status = ''
                    if ($('status').text() === 'success') {
                        row.disabled = false
                        row.sysAudio = $('content/sysAudio').attr('id') || DEFAULT_EMPTY_ID
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
                        row.alarmOut = {
                            switch: $('content/alarmOut/switch').text().bool(),
                            alarmOuts: $('content/alarmOut/alarmOuts/item').map((item) => {
                                return {
                                    value: item.attr('id'),
                                    label: item.text(),
                                }
                            }),
                        }
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
                        // 设置的声音文件被删除时，显示为none
                        const audioData = pageData.value.audioList.filter((element: { value: string; label: string }) => {
                            return element.value === row.sysAudio
                        })
                        if (!audioData.length) {
                            row.sysAudio = DEFAULT_EMPTY_ID
                        }

                        editRows.listen(row)
                    } else {
                        row.disabled = true
                    }
                })
            })
        }

        /**
         * @description 翻页
         */
        const changePagination = () => {
            getData()
        }

        /**
         * @description 更改每页大小
         */
        const changePaginationSize = () => {
            const totalPage = Math.ceil(pageData.value.totalCount / pageData.value.pageSize)
            if (pageData.value.pageIndex > totalPage) {
                pageData.value.pageIndex = totalPage
            }
            getData()
        }

        /**
         * @description 开关抓图联动
         * @param {number} index
         */
        const switchSnap = (index: number) => {
            const row = tableData.value[index].snap
            if (row.switch) {
                openSnap(index)
            } else {
                row.chls = []
            }
        }

        /**
         * @description 打开抓图联动穿梭框
         * @param {number} index
         */
        const openSnap = (index: number) => {
            tableData.value[index].snap.switch = true
            pageData.value.triggerDialogIndex = index
            pageData.value.isSnapPop = true
        }

        /**
         * @description 更新抓图联动
         * @param {number} index
         * @param {SelectOption<string, string>[]} data
         */
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

        /**
         * @description 开关报警输出
         * @param {number} index
         */
        const switchAlarmOut = (index: number) => {
            const row = tableData.value[index].alarmOut
            if (row.switch) {
                openAlarmOut(index)
            } else {
                row.alarmOuts = []
            }
        }

        /**
         * @description 打开报警输出穿梭框
         * @param {number} index
         */
        const openAlarmOut = (index: number) => {
            tableData.value[index].alarmOut.switch = true
            pageData.value.triggerDialogIndex = index
            pageData.value.isAlarmOutPop = true
        }

        /**
         * @description 更新报警输出联动
         * @param {number} index
         * @param {SelectOption<string, string>[]} data
         */
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

        /**
         * @description 开关预置点
         * @param {number} index
         */
        const switchPreset = (index: number) => {
            const row = tableData.value[index].preset
            if (row.switch) {
                openPreset(index)
            } else {
                row.presets = []
            }
        }

        /**
         * @description 打开预置点弹窗
         * @param {number} index
         */
        const openPreset = (index: number) => {
            tableData.value[index].alarmOut.switch = true
            pageData.value.triggerDialogIndex = index
            pageData.value.isPresetPop = true
        }

        /**
         * @description 更新预置点
         * @param {number} index
         * @param {AlarmPresetItem[]} data
         */
        const changePreset = (index: number, data: AlarmPresetItem[]) => {
            pageData.value.isPresetPop = false
            tableData.value[index].preset = {
                switch: !!data.length,
                presets: cloneDeep(data),
            }
        }

        /**
         * @description 批量修改系统音频
         * @param {string} sysAudio
         */
        const changeAllAudio = (sysAudio: string) => {
            tableData.value.forEach((item) => {
                if (!item.disabled) {
                    item.sysAudio = sysAudio
                }
            })
        }

        /**
         * @description 批量修改消息推送
         * @param {string} msgPush
         */
        const changeAllMsgPush = (msgPush: string) => {
            tableData.value.forEach((item) => {
                if (!item.disabled) {
                    item.msgPush = msgPush
                }
            })
        }

        /**
         * @description 批量修改蜂鸣器联动
         * @param {string} beeper
         */
        const changeAllBeeper = (beeper: string) => {
            tableData.value.forEach((item) => {
                if (!item.disabled) {
                    item.beeper = beeper
                }
            })
        }

        /**
         * @description 批量修改视频弹出联动
         * @param {string} videoPopup
         */
        const changeAllVideoPopUp = (videoPopup: string) => {
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

        /**
         * @description 批量修改消息框弹出联动
         * @param {string} msgBoxPopup
         */
        const changeAllMsgPopUp = (msgBoxPopup: string) => {
            tableData.value.forEach((item) => {
                if (!item.disabled) {
                    item.msgBoxPopup = msgBoxPopup
                }
            })
        }

        /**
         * @description 批量修改邮件联动
         * @param {string} email
         */
        const changeAllEmail = (email: string) => {
            tableData.value.forEach((item) => {
                if (!item.disabled) {
                    item.email = email
                }
            })
        }

        /**
         * @description
         * @param {AlarmEventDto} rowData
         * @returns {string}
         */
        const getSavaData = (rowData: AlarmEventDto) => {
            const sendXml = rawXml`
                <content id="${rowData.id}">
                    <sysSnap>
                        <switch>${rowData.snap.switch}</switch>
                        <chls type="list">
                            ${rowData.snap.chls.map((item) => `<item id="${item.value}" />`).join('')}
                        </chls>
                    </sysSnap>
                    <alarmOut>
                        <switch>${rowData.alarmOut.switch}</switch>
                        <alarmOuts type="list">
                            ${rowData.alarmOut.alarmOuts.map((item) => `<item id="${item.value}" />`).join('')}
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
                                                <chl id="${item.chl.value}" />
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

        /**
         * @description 保存数据
         */
        const setData = async () => {
            openLoading()

            for (const item of editRows.toArray()) {
                const sendXml = getSavaData(item)
                try {
                    const result = await editFrontEndOfflineTrigger(sendXml)
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
                } catch {
                    item.status = 'error'
                }
            }

            closeLoading()
        }

        onMounted(async () => {
            await getVideoPopupList()
            await getAudioList()
            getData()
        })

        return {
            changePagination,
            changePaginationSize,
            pageData,
            tableData,
            editRows,
            changeAllAudio,
            changeAllMsgPush,
            changeAllBeeper,
            changeAllVideoPopUp,
            changeAllMsgPopUp,
            changeAllEmail,
            setData,
            switchAlarmOut,
            openAlarmOut,
            changeAlarmOut,
            switchSnap,
            openSnap,
            changeSnap,
            switchPreset,
            openPreset,
            changePreset,
        }
    },
})
