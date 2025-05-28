/*
 * @Description: 普通事件——组合报警
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-22 16:04:47
 */
import AlarmBasePresetPop from './AlarmBasePresetPop.vue'
import AlarmBaseSnapPop from './AlarmBaseSnapPop.vue'
import AlarmBaseRecordPop from './AlarmBaseRecordPop.vue'
import AlarmBaseAlarmOutPop from './AlarmBaseAlarmOutPop.vue'
import AlarmBaseTriggerAudioPop from './AlarmBaseTriggerAudioPop.vue'
import AlarmBaseTriggerWhiteLightPop from './AlarmBaseTriggerWhiteLightPop.vue'
import CombinationAlarmPop from './CombinationAlarmPop.vue'

export default defineComponent({
    components: {
        AlarmBasePresetPop,
        AlarmBaseSnapPop,
        AlarmBaseRecordPop,
        AlarmBaseAlarmOutPop,
        CombinationAlarmPop,
        AlarmBaseTriggerAudioPop,
        AlarmBaseTriggerWhiteLightPop,
    },
    setup() {
        const { Translate } = useLangStore()
        const systemCaps = useCababilityStore()

        // 名称被修改时保存原始名称
        const originalName = ref('')

        const COMBINED_ALARM_TYPES_MAPPING: Record<string, string> = {
            Motion: Translate('IDCS_MOTION_DETECTION'), //移动侦测
            Sensor: Translate('IDCS_SENSOR'), //传感器
            FaceMatch: Translate('IDCS_FACE_MATCH'), //人脸识别
            InvadeDetect: Translate('IDCS_INVADE_ENTRY_LEAVE_DETECTION'), //区域入侵
            Tripwire: Translate('IDCS_BEYOND_DETECTION'), //越界
        }

        const pageData = ref({
            // 类型
            typeList: getTranslateOptions(DEFAULT_ALWAYS_OPTIONS),
            // 启用、推送、蜂鸣器、消息框弹出、email
            switchList: getTranslateOptions(DEFAULT_SWITCH_OPTIONS),
            // 持续时间列表
            durationList: [] as SelectOption<string, string>[],
            // 声音列表
            audioList: [] as SelectOption<string, string>[],
            // 视频弹出列表
            videoPopupChlList: [] as SelectOption<string, string>[],
            // 初始化
            totalCount: 0,
            // 组合报警信息
            combinedALarmInfo: '',
            isRecordPop: false,
            isSnapPop: false,
            isAlarmOutPop: false,
            // 当前打开dialog行的index
            triggerDialogIndex: 0,
            // 预置点名称配置
            isPresetPop: false,
            isCombinedAlarmPop: false,
            isTriggerAudioPop: false,
            isTriggerWhiteLightPop: false,
            combinedAlarmLinkedId: '',
            combinedAlarmLinkedList: [] as AlarmCombinedItemDto[],
            currRowFaceObj: {} as Record<string, Record<string, AlarmCombinedFaceMatchDto>>,
            // 人脸对象，层级依次为combinedID，chlID，obj
            faceObj: {} as Record<string, Record<string, Record<string, AlarmCombinedFaceMatchDto>>>,
        })

        // 表格数据
        const tableData = ref<AlarmCombinedDto[]>([])
        // 编辑行
        const editRows = useWatchEditRows<AlarmCombinedDto>()

        // 获取系统配置和基本信息，部分系统配置可用项
        const getSystemCaps = async () => {
            if (systemCaps.supportAlarmAudioConfig) {
                await getAudioData()
            }
        }

        // 获取声音数据
        const getAudioData = async () => {
            pageData.value.audioList = await buildAudioList()
        }

        const getChlData = () => {
            getChlList({
                requireField: ['protocolType'],
            }).then((result) => {
                commLoadResponseHandler(result, ($) => {
                    // 视频弹出数据
                    pageData.value.videoPopupChlList.push({
                        value: '',
                        label: Translate('IDCS_OFF'),
                    })
                    $('content/item').forEach((item) => {
                        const $item = queryXml(item.element)
                        const protocolType = $item('protocolType').text()
                        if (protocolType === 'RTSP') return
                        pageData.value.videoPopupChlList.push({
                            value: item.attr('id'),
                            label: $item('name').text(),
                        })
                    })
                })
            })
        }

        /**
         * @description 获取人脸库列表
         * @returns {XMLQuery} $
         */
        const getFaceGroupData = async () => {
            const result = await queryFacePersonnalInfoGroupList()
            const $ = queryXml(result)

            return $
        }

        /**
         * @description 获取已配置的人脸库分组
         * @returns {XMLQuery} $
         */
        const getFaceMatchData = async () => {
            const result = await queryCombinedAlarmFaceMatch()
            const $ = queryXml(result)

            return $
        }

        /**
         * @description 获取数据
         */
        const getData = async () => {
            editRows.clear()
            openLoading()

            const $faceGroup = await getFaceGroupData()
            const $faceMatch = await getFaceMatchData()

            const result = await queryCombinedAlarm()
            commLoadResponseHandler(result, ($) => {
                closeLoading()
                $('content/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    const trigger = $item('trigger')
                    const $trigger = queryXml(trigger[0].element)
                    const currCombinedId = item.attr('id')

                    const row: AlarmCombinedDto = {
                        id: item.attr('id'),
                        name: $item('param/name').text(),
                        status: '',
                        statusTip: '',
                        disabled: false,
                        combinedAlarm: {
                            switch: $item('param/switch').text().bool(),
                            item: $item('param/alarmSource/item').map((ele) => {
                                const $ele = queryXml(ele.element)
                                const APISource = $ele('alarmSourceType').text() // 接口返回报警类型
                                const APIChlId = $ele('alarmSourceEntity').attr('id') // 接口返回报警源
                                let realSource = ''

                                if (APISource === 'Motion') {
                                    // 已配置的FaceMatch数组
                                    $faceMatch('content/item').forEach((faceItem) => {
                                        const $faceItem = queryXml(faceItem.element)
                                        // FaceMatch数组XML包含了组合报警Id和通道chlId,若匹配上，证明已配置，是FaceMatch类型
                                        if (faceItem.attr('id') === currCombinedId && $faceItem('chlID').attr('id') === APIChlId) {
                                            const alarmSourceType = faceItem.attr('alarmSourceType')
                                            realSource = alarmSourceType ? alarmSourceType : 'Motion'

                                            if (alarmSourceType === 'FaceMatch') {
                                                const chlIdMapFaceName = {} as Record<string, string>
                                                const groupId = [] as string[]
                                                const faceDataBase = [] as string[]
                                                $faceGroup('content/item').forEach((ele2) => {
                                                    const $ele2 = queryXml(ele2.element)
                                                    chlIdMapFaceName[ele2.attr('id')] = $ele2('name').text()
                                                })
                                                $faceItem('groupId/item').forEach((ele3) => {
                                                    groupId.push(ele3.attr('id'))
                                                    faceDataBase.push(chlIdMapFaceName[ele3.attr('id')])
                                                })
                                                pageData.value.faceObj[currCombinedId] = {}
                                                pageData.value.faceObj[currCombinedId][APIChlId] = {}
                                                pageData.value.faceObj[currCombinedId][APIChlId].obj = {
                                                    duration: $faceItem('startTime').text().num(),
                                                    delay: $faceItem('endTime').text().num(),
                                                    faceDataBase: faceDataBase,
                                                    groupId: groupId,
                                                    rule: $faceItem('matchRule').text(),
                                                    noShowDisplay: $faceItem('noShowDisplay').text(),
                                                    displayText: $faceItem('displayText').text(),
                                                }
                                            }
                                        }
                                    })
                                }
                                return {
                                    alarmSourceType: realSource || $ele('alarmSourceType').text(),
                                    alarmSourceEntity: {
                                        value: APIChlId || $ele('alarmSourceEntity').attr('id'),
                                        label: $ele('alarmSourceEntity').text(),
                                    },
                                }
                            }),
                        },
                        record: {
                            switch: $trigger('sysRec/switch').text().bool(),
                            chls: $trigger('sysRec/chls/item').map((element) => {
                                return {
                                    value: element.attr('id'),
                                    label: element.text(),
                                }
                            }),
                        },
                        snap: {
                            switch: $trigger('sysSnap/switch').text().bool(),
                            chls: $trigger('sysSnap/chls/item').map((element) => {
                                return {
                                    value: element.attr('id'),
                                    label: element.text(),
                                }
                            }),
                        },
                        alarmOut: {
                            switch: $trigger('alarmOut/switch').text().bool(),
                            alarmOuts: $trigger('alarmOut/alarmOuts/item').map((element) => {
                                return {
                                    value: element.attr('id'),
                                    label: element.text(),
                                }
                            }),
                        },
                        popVideo: $trigger('popVideo/switch').text() === 'false' ? '' : $trigger('popVideo/chl').attr('id'),
                        preset: {
                            switch: $trigger('preset/switch').text().bool(),
                            presets: $trigger('preset/presets/item').map((element) => {
                                const $element = queryXml(element.element)
                                return {
                                    index: $element('index').text(),
                                    name: $element('name').text(),
                                    chl: {
                                        value: $element('chl').attr('id'),
                                        label: $element('chl').text(),
                                    },
                                }
                            }),
                        },
                        sysAudio: getSystemAudioID(pageData.value.audioList, $trigger('sysAudio').attr('id')), //|| DEFAULT_EMPTY_ID,
                        msgPush: $trigger('msgPushSwitch').text(),
                        beeper: $trigger('buzzerSwitch').text(),
                        email: $trigger('emailSwitch').text(),
                        msgBoxPopup: $trigger('popMsgSwitch').text(),
                        triggerAudio: {
                            switch: $trigger('triggerAudio/switch').text().bool(),
                            chls: $trigger('triggerAudio/chls/item').map((item) => {
                                return {
                                    value: item.attr('id'),
                                    label: item.text(),
                                }
                            }),
                        },
                        triggerWhiteLight: {
                            switch: $trigger('triggerWhiteLight/switch').text().bool(),
                            chls: $trigger('triggerWhiteLight/chls/item').map((item) => {
                                return {
                                    value: item.attr('id'),
                                    label: item.text(),
                                }
                            }),
                        },
                    }

                    tableData.value.push(row)
                })
                tableData.value.forEach((item) => {
                    editRows.listen(item)
                })
            })
        }

        /**
         * @description 修改名称前记录原名
         * @param {string} name
         */
        const focusName = (name: string) => {
            originalName.value = name
        }

        /**
         * @description 失焦校验修改名称
         * @param {AlarmCombinedDto} row
         */
        const blurName = (row: AlarmCombinedDto) => {
            const name = row.name
            if (!checkChlName(name)) {
                openMessageBox(Translate('IDCS_CAN_NOT_CONTAIN_SPECIAL_CHAR').formatForLang(CHANNEL_LIMIT_CHAR))
                row.name = originalName.value
            } else {
                if (!name) {
                    openMessageBox(Translate('IDCS_PROMPT_NAME_EMPTY'))
                    row.name = originalName.value
                }

                for (const item of tableData.value) {
                    if (item.id !== row.id && name === item.name) {
                        openMessageBox(Translate('IDCS_NAME_SAME'))
                        row.name = originalName.value
                        break
                    }
                }
            }
        }

        /**
         * @description 组合报警弹窗打开
         * @param {AlarmCombinedDto} row
         */
        const openCombinedAlarmPop = (row: AlarmCombinedDto) => {
            pageData.value.combinedAlarmLinkedId = row.id
            pageData.value.combinedAlarmLinkedList = row.combinedAlarm.item
            pageData.value.currRowFaceObj = pageData.value.faceObj[row.id]
            pageData.value.isCombinedAlarmPop = true
        }

        /**
         * @description 确认组合报警配置回调
         * @param {string} currId
         * @param {AlarmCombinedItemDto} combinedAlarmItems
         * @param {string} entity
         * @param {AlarmCombinedFaceMatchDto} obj
         */
        const confirmCombinedAlarm = (currId: string, combinedAlarmItems: AlarmCombinedItemDto[], entity: string, obj?: AlarmCombinedFaceMatchDto) => {
            tableData.value.some((item) => {
                if (item.id === currId) {
                    item.combinedAlarm.item = combinedAlarmItems
                    if (entity) {
                        pageData.value.faceObj[currId] = {}
                        pageData.value.faceObj[currId][entity] = {}
                        pageData.value.faceObj[currId][entity].obj = obj!
                    }
                }
            })
            pageData.value.isCombinedAlarmPop = false
        }

        /**
         * @description 关闭组合报警配置弹窗
         * @param {string} id
         */
        const closeCombinedAlarmPop = (id: string) => {
            pageData.value.isCombinedAlarmPop = false
            tableData.value.forEach((item) => {
                if (item.id === id) {
                    changeCombinedAlarmInfo(item)
                    if (!item.combinedAlarm.item.length) item.combinedAlarm.switch = false
                }
            })
        }

        /**
         * @description 开关组合报警配置
         * @param {AlarmCombinedDto} row
         */
        const switchCombinedAlarm = (row: AlarmCombinedDto) => {
            if (row.combinedAlarm.switch) {
                openCombinedAlarmPop(row)
            } else {
                row.combinedAlarm.item = []
            }
            changeCombinedAlarmInfo(row)
        }

        /**
         * @description 开关联动视频
         * @param {number} index
         */
        const switchRecord = (index: number) => {
            const row = tableData.value[index].record
            if (row.switch) {
                openRecord(index)
            } else {
                row.chls = []
            }
        }

        /**
         * @description 打开视频联动穿梭框
         * @param {number} index
         */
        const openRecord = (index: number) => {
            tableData.value[index].record.switch = true
            pageData.value.triggerDialogIndex = index
            pageData.value.isRecordPop = true
        }

        /**
         * @description 更新视频联动
         * @param {number} index
         * @param {SelectOption<string, string>[]} data
         */
        const changeRecord = (index: number, data: SelectOption<string, string>[]) => {
            pageData.value.isRecordPop = false
            tableData.value[index].record = {
                switch: !!data.length,
                chls: cloneDeep(data),
            }
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
            pageData.value.isAlarmOutPop = false
            tableData.value[index].alarmOut = {
                switch: !!data.length,
                alarmOuts: cloneDeep(data),
            }
        }

        /**
         * @description
         * @param {number} index
         */
        const switchTriggerAudio = (index: number) => {
            const row = tableData.value[index].triggerAudio
            if (row.switch) {
                openTriggerAudio(index)
            } else {
                row.chls = []
            }
        }

        /**
         * @description
         * @param {number} index
         */
        const openTriggerAudio = (index: number) => {
            tableData.value[index].triggerAudio.switch = true
            pageData.value.triggerDialogIndex = index
            pageData.value.isTriggerAudioPop = true
        }

        /**
         * @description
         * @param {number} index
         * @param {SelectOption<string, string>[]} data
         */
        const changeTriggerAudio = (index: number, data: SelectOption<string, string>[]) => {
            pageData.value.isTriggerAudioPop = false
            tableData.value[index].triggerAudio = {
                switch: !!data.length,
                chls: cloneDeep(data),
            }
        }

        /**
         * @description
         * @param {number} index
         */
        const switchTriggerWhiteLight = (index: number) => {
            const row = tableData.value[index].triggerWhiteLight
            if (row.switch) {
                openTriggerWhiteLight(index)
            } else {
                row.chls = []
            }
        }

        /**
         * @description
         * @param {number} index
         */
        const openTriggerWhiteLight = (index: number) => {
            tableData.value[index].triggerWhiteLight.switch = true
            pageData.value.triggerDialogIndex = index
            pageData.value.isTriggerWhiteLightPop = true
        }

        /**
         * @description
         * @param {number} index
         * @param {SelectOption<string, string>[]} data
         */
        const changeTriggerWhiteLight = (index: number, data: SelectOption<string, string>[]) => {
            pageData.value.isTriggerWhiteLightPop = false
            tableData.value[index].triggerWhiteLight = {
                switch: !!data.length,
                chls: cloneDeep(data),
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
         * @description
         * @param {AlarmCombinedDto} row
         */
        const changeCombinedAlarmInfo = (row: AlarmCombinedDto) => {
            let info = ''
            row.combinedAlarm.item.forEach((item, index) => {
                if (index === 0) {
                    info += row.name + ': '
                }
                info += item.alarmSourceEntity.label + '  ' + COMBINED_ALARM_TYPES_MAPPING[item.alarmSourceType] + ' & '
            })
            if (info) {
                info = info.slice(0, -3)
            }
            pageData.value.combinedALarmInfo = info
        }

        /**
         * @description: 改变所有项的值
         * @param {string} value 值
         * @param {string} field 字段名
         * @return {*}
         */
        const changeAllValue = (value: string, field: string) => {
            tableData.value.forEach((item) => {
                ;(item as any)[field] = value
            })
        }

        /**
         * @description
         * @param {AlarmCombinedDto} row
         * @returns {string}
         */
        const getSavaData = (row: AlarmCombinedDto) => {
            const sendXml = rawXml`
                <content type='list'>
                    <item id='${row.id}'>
                        <param>
                            <name>${wrapCDATA(row.name)}</name>
                            <switch>${row.combinedAlarm.switch}</switch>
                            <alarmSource>
                                ${row.combinedAlarm.item
                                    .map((item) => {
                                        return rawXml`
                                            <item>
                                                <alarmSourceType>${item.alarmSourceType}</alarmSourceType>
                                                <alarmSourceEntity id='${item.alarmSourceEntity.value}'>${wrapCDATA(item.alarmSourceEntity.label)}</alarmSourceEntity>
                                            </item>
                                        `
                                    })
                                    .join('')}
                            </alarmSource>
                        </param>
                        <trigger>
                            <sysRec>
                                <switch>${row.record.switch}</switch>
                                <chls>
                                    ${row.record.chls.map((item) => `<item id='${item.value}' />`).join('')}
                                </chls>
                            </sysRec>
                            <sysSnap>
                                <switch>${row.snap.switch}</switch>
                                <chls>
                                    ${row.snap.chls.map((item) => `<item id='${item.value}' />`).join('')}
                                </chls>
                            </sysSnap>
                            <alarmOut>
                                <switch>${row.alarmOut.switch}</switch>
                                <alarmOuts>
                                    ${row.alarmOut.alarmOuts.map((item) => `<item id='${item.value}' />`).join('')}
                                </alarmOuts>
                            </alarmOut>
                            <popVideo>
                                <switch>${row.popVideo !== ''}</switch>
                                <chl id='${row.popVideo}'></chl>
                            </popVideo>
                            <preset>
                                <switch>${row.preset.switch}</switch>
                                <presets>
                                    ${row.preset.presets
                                        .map((item) => {
                                            return rawXml`
                                                <item>
                                                    <index>${item.index}</index>
                                                    <chl id='${item.chl.value}' />
                                                </item>
                                            `
                                        })
                                        .join('')}
                                </presets>
                            </preset>
                            <triggerAudio>
                                <switch>${row.triggerAudio.switch}</switch>
                                <chls>
                                    ${row.triggerAudio.chls.map((item) => `<item id='${item.value}' />`).join('')}
                                </chls>
                            </triggerAudio>
                            <triggerWhiteLight>
                                <switch>${row.triggerWhiteLight.switch}</switch>
                                <chls>
                                    ${row.triggerWhiteLight.chls.map((item) => `<item id='${item.value}' />`).join('')}
                                </chls>
                            </triggerWhiteLight>
                            <msgPushSwitch>${row.msgPush}</msgPushSwitch>
                            <buzzerSwitch>${row.beeper}</buzzerSwitch>
                            <popMsgSwitch>${row.msgBoxPopup}</popMsgSwitch>
                            <emailSwitch>${row.email}</emailSwitch>
                            <sysAudio id='${row.sysAudio}'></sysAudio>
                        </trigger>
                    </item>
                </content>              
            `
            return sendXml
        }

        /**
         * @description 提交数据
         */
        const setData = async () => {
            openLoading()

            tableData.value.forEach((ele) => (ele.status = ''))

            for (const item of editRows.toArray()) {
                try {
                    const sendXml = getSavaData(item)
                    const result = await editCombinedAlarm(sendXml)
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

            const sendXml1 = getSaveFaceData()
            await editCombinedAlarmFaceMatch(sendXml1)

            closeLoading()
        }

        const getSaveFaceData = () => {
            const combinedId: string[] = []
            const groupId: string[] = []
            const peaCombinedId: string[] = []
            const peaGroupId: string[] = []
            const tripwireCombinedId: string[] = []
            const tripwireGroupId: string[] = []
            tableData.value.forEach((item) => {
                if (item.combinedAlarm.switch) {
                    item.combinedAlarm.item.forEach((ele) => {
                        if (ele.alarmSourceType === 'FaceMatch') {
                            combinedId.push(item.id)
                            groupId.push(ele.alarmSourceEntity.value)
                        } else if (ele.alarmSourceType === 'InvadeDetect') {
                            peaCombinedId.push(item.id)
                            peaGroupId.push(ele.alarmSourceEntity.value)
                        } else if (ele.alarmSourceType === 'Tripwire') {
                            tripwireCombinedId.push(item.id)
                            tripwireGroupId.push(ele.alarmSourceEntity.value)
                        }
                    })
                }
            })

            const sendXml = rawXml`
                <content>
                    ${combinedId
                        .map((item, index) => {
                            let obj = pageData.value.faceObj[item] && pageData.value.faceObj[item][groupId[index]] && pageData.value.faceObj[item][groupId[index]].obj
                            if (!obj) {
                                obj = {
                                    rule: '1',
                                    duration: -5,
                                    delay: 5,
                                    noShowDisplay: 'false',
                                    displayText: '',
                                    groupId: [],
                                    faceDataBase: [],
                                }
                            }

                            return rawXml`
                                <item id='${item}' alarmSourceType='FaceMatch'>
                                    <chlID id='${groupId[index]}'></chlID>
                                    <matchRule>${obj.rule}</matchRule>
                                    <startTime>${obj.duration}</startTime>
                                    <endTime>${obj.delay}</endTime>
                                    <noShowDisplay>${obj.noShowDisplay}</noShowDisplay>
                                    <displayText>${obj.displayText}</displayText>
                                    <groupId>
                                        ${obj.groupId
                                            .map((element) => {
                                                return `<item id='${element}'></item>`
                                            })
                                            .join('')}
                                    </groupId>
                                </item>
                            `
                        })
                        .join('')}
                    ${peaCombinedId
                        .map((item, index) => {
                            return rawXml`
                                <item id='${item}' alarmSourceType='InvadeDetect'>
                                    <chlID id='${peaGroupId[index]}'></chlID>
                                </item>
                            `
                        })
                        .join('')}
                    ${tripwireCombinedId
                        .map((item, index) => {
                            return rawXml`
                                <item id='${item}' alarmSourceType='Tripwire'>
                                    <chlID id='${tripwireGroupId[index]}'></chlID>
                                </item>
                            `
                        })
                        .join('')}
                </content>
            `

            return sendXml
        }

        onMounted(async () => {
            await getSystemCaps() // 系统配置
            await getChlData() // 通道数据
            getData()
        })

        return {
            pageData,
            tableData,
            changeCombinedAlarmInfo,
            focusName,
            blurName,
            openCombinedAlarmPop,
            confirmCombinedAlarm,
            closeCombinedAlarmPop,
            switchCombinedAlarm,
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
            switchTriggerAudio,
            openTriggerAudio,
            changeTriggerAudio,
            switchTriggerWhiteLight,
            openTriggerWhiteLight,
            changeTriggerWhiteLight,
            changeAllValue,
            setData,
            editRows,
            systemCaps,
        }
    },
})
