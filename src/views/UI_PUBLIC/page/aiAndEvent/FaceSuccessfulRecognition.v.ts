/*
 * @Description:人脸识别——识别成功（1,2,3）/陌生人tab页
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-09-04 14:23:54
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-09-06 15:17:46
 */
import { cloneDeep } from 'lodash'
import ScheduleManagPop from '../../components/schedule/ScheduleManagPop.vue'
import { type PresetList, type FaceCompareTask } from '@/types/apiType/aiAndEvent'
import { type CheckboxValueType, type ElTable } from 'element-plus'

export default defineComponent({
    components: {
        ScheduleManagPop,
    },
    props: {
        currTaskData: {
            type: Object as PropType<FaceCompareTask>,
            require: true,
            default: () => {},
        },
        faceGroupData: {
            type: Array<any>,
            require: true,
            default: [],
        },
        scheduleList: {
            type: Array<any>,
            require: true,
            default: [],
        },
        voiceList: {
            type: Array<any>,
            require: true,
            default: [],
        },
        recordList: {
            type: Array<any>,
            require: true,
            default: [],
        },
        alarmOutList: {
            type: Array<any>,
            require: true,
            default: [],
        },
        snapList: {
            type: Array<any>,
            require: true,
            default: [],
        },
    },
    setup(prop) {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const systemCaps = useCababilityStore()

        const taskData = prop.currTaskData || {
            guid: '',
            id: '',
            ruleType: '',
            pluseSwitch: false,
            groupId: [],
            nameId: 0,
            hintword: '',
            sysAudio: '{00000000-0000-0000-0000-000000000000}',
            schedule: '{00000000-0000-0000-0000-000000000000}',
            record: [],
            alarmOut: [],
            snap: [],
            msgPushSwitch: true,
            buzzerSwitch: false,
            popVideoSwitch: false,
            emailSwitch: false,
            popMsgSwitch: false,
        }

        const normalParamList = ref([
            { value: 'msgPushSwitch', label: Translate('IDCS_PUSH') },
            { value: 'buzzerSwitch', label: Translate('IDCS_BUZZER') },
            { value: 'popVideoSwitch', label: Translate('IDCS_VIDEO_POPUP') },
            { value: 'emailSwitch', label: Translate('IDCS_EMAIL') },
            { value: 'popMsgSwitch', label: Translate('IDCS_MESSAGEBOX_POPUP') },
        ])

        const faceGroupTableRef = ref<InstanceType<typeof ElTable>>()
        // 常规联动
        const normalParamCheckAll = ref(false)
        const normalParamCheckList = ref([] as string[])
        // 联动预置点
        const MAX_TRIGGER_PRESET_COUNT = 16
        const PresetTableData = ref<PresetList[]>([])

        const supportAlarmAudioConfig = systemCaps.supportAlarmAudioConfig

        const pageData = ref({
            // 人脸分组弹窗
            faceGroupPopOpen: false,
            faceGroupSelection: [] as { guid: string; name: string }[],
            // 人脸分组的checkbox
            selectAll: false,
            // 人脸分组选中名称拼接
            faceGroupName: '',
            // 排程弹窗
            scheduleManagPopOpen: false,
            recordIsShow: false,
            snapIsShow: false,
            alarmOutIsShow: false,
        })

        // 初始化数据
        const initData = () => {
            pageData.value.selectAll = taskData.groupId.length > 0 && taskData.groupId.length == prop.faceGroupData.length
            handleFaceGroupName()
            if (taskData.msgPushSwitch) normalParamCheckList.value.push('msgPushSwitch')
            if (taskData.buzzerSwitch) normalParamCheckList.value.push('buzzerSwitch')
            if (taskData.popVideoSwitch) normalParamCheckList.value.push('popVideoSwitch')
            if (taskData.emailSwitch) normalParamCheckList.value.push('emailSwitch')
            if (taskData.popMsgSwitch) normalParamCheckList.value.push('popMsgSwitch')
            if (normalParamCheckList.value.length == normalParamList.value.length) {
                normalParamCheckAll.value = true
            }
        }
        // 生成人脸分组选中的数据名称
        const handleFaceGroupName = () => {
            pageData.value.faceGroupName = ''
            prop.faceGroupData.forEach((item) => {
                if (taskData.groupId.includes(item.guid)) {
                    pageData.value.faceGroupName += item.name + '; '
                }
            })
        }
        // 人脸分组全选checkbox
        const selectAllCheckChange = (value: CheckboxValueType) => {
            if (value) {
                taskData.groupId = prop.faceGroupData.map((item) => item.guid)
            } else {
                taskData.groupId = []
            }
            handleFaceGroupName()
        }

        // 人脸分组弹窗打开/关闭
        const openFaceGroupPop = () => {
            prop.faceGroupData.forEach((item) => {
                if (taskData.groupId.includes(item.guid)) {
                    faceGroupTableRef.value!.toggleRowSelection(item, true)
                }
            })
        }
        const closeFaceGroupPop = () => {
            faceGroupTableRef.value!.clearSelection()
            pageData.value.faceGroupPopOpen = false
        }
        // 人脸分支选中
        const faceGroupSelect = (selection: []) => {
            pageData.value.faceGroupSelection = selection
        }
        // 单行点击
        const handleRowClick = (rowData: { guid: string; name: string }) => {
            faceGroupTableRef.value!.clearSelection()
            faceGroupTableRef.value!.toggleRowSelection(rowData, true)
        }
        const saveFaceGroup = () => {
            taskData.groupId = pageData.value.faceGroupSelection.map((item) => item.guid)
            closeFaceGroupPop()
            pageData.value.selectAll = taskData.groupId.length > 0 && taskData.groupId.length == prop.faceGroupData.length
            handleFaceGroupName()
        }

        // 常规联动多选
        const handleNormalParamCheckAll = (value: CheckboxValueType) => {
            normalParamCheckList.value = value ? normalParamList.value.map((item) => item.value) : []
            if (value) {
                taskData.msgPushSwitch = true
                taskData.buzzerSwitch = true
                taskData.popVideoSwitch = true
                taskData.emailSwitch = true
                taskData.popMsgSwitch = true
            }
        }
        const handleNormalParamCheck = (value: CheckboxValueType[]) => {
            normalParamCheckAll.value = value.length === normalParamList.value.length
            taskData.msgPushSwitch = value.includes('msgPushSwitch')
            taskData.buzzerSwitch = value.includes('buzzerSwitch')
            taskData.popVideoSwitch = value.includes('popVideoSwitch')
            taskData.emailSwitch = value.includes('emailSwitch')
            taskData.popMsgSwitch = value.includes('popMsgSwitch')
        }

        // 录像配置相关处理
        const recordConfirm = (e: { value: string; label: string }[]) => {
            taskData.record = cloneDeep(e)
            pageData.value.recordIsShow = false
        }
        const recordClose = () => {
            pageData.value.recordIsShow = false
        }
        // 报警输出相关处理
        const alarmOutConfirm = (e: { value: string; label: string }[]) => {
            taskData.alarmOut = cloneDeep(e)
            pageData.value.alarmOutIsShow = false
        }
        const alarmOutClose = () => {
            pageData.value.alarmOutIsShow = false
        }
        // 抓图配置相关处理
        const snapConfirm = (e: { value: string; label: string }[]) => {
            taskData.snap = cloneDeep(e)
            pageData.value.snapIsShow = false
        }
        const snapClose = () => {
            pageData.value.snapIsShow = false
        }
        // 获取联动预置点数据
        const getPresetData = async () => {
            const sendXml = rawXml`
                <types>
                    <nodeType>
                        <enum>chls</enum>
                        <enum>sensors</enum>
                        <enum>alarmOuts</enum>
                    </nodeType>
                </types>
                <nodeType type="nodeType">chls</nodeType>
                <requireField>
                    <name/>
                    <chlType/>
                </requireField>
                <condition>
                    <supportPtz/>
                </condition>
            `
            const result = await queryNodeList(getXmlWrapData(sendXml))

            let rowData = [] as PresetList[]
            commLoadResponseHandler(result, async ($) => {
                rowData = $('/response/content/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        id: item.attr('id')!,
                        name: $item('name').text(),
                        chlType: $item('chlType').text(),
                        preset: { value: '', label: Translate('IDCS_NULL') },
                        presetList: [{ value: '', label: Translate('IDCS_NULL') }],
                    }
                })
                rowData.forEach((row) => {
                    taskData.preset?.forEach((item) => {
                        if (row.id == item.chl.value) {
                            row.preset = { value: item.index, label: item.name }
                        }
                    })
                })

                for (let i = rowData.length - 1; i >= 0; i--) {
                    //预置点里过滤掉recorder通道
                    if (rowData[i].chlType == 'recorder') {
                        rowData.splice(i, 1)
                    } else {
                        await getPresetById(rowData[i])
                    }
                }

                PresetTableData.value = rowData
            })
        }
        const getPresetById = async (row: PresetList) => {
            const sendXml = rawXml`
                <condition>
                    <chlId>${row.id}</chlId>
                </condition>
            `
            const result = await queryChlPresetList(sendXml)
            commLoadResponseHandler(result, ($) => {
                $('/response/content/presets/item').forEach((item) => {
                    row.presetList.push({
                        value: item.attr('index')!,
                        label: item.text(),
                    })
                })
            })
        }
        const presetChange = (row: PresetList) => {
            const ids = taskData.preset.map((item) => item.chl.value)
            if (ids.includes(row.id)) {
                taskData.preset = taskData.preset.filter((item) => row.id != item.chl.value)
            }
            if (row.preset.value !== '') {
                taskData.preset.push({
                    index: row.preset.value,
                    name: row.preset.label,
                    chl: {
                        value: row.id,
                        label: row.name,
                    },
                })
            }
            if (taskData.preset.length > MAX_TRIGGER_PRESET_COUNT) {
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_PRESET_LIMIT'),
                })
            }
        }

        onMounted(async () => {
            initData()
            await getPresetData()
        })
        return {
            ScheduleManagPop,
            faceGroupTableRef,
            normalParamCheckAll,
            normalParamCheckList,
            supportAlarmAudioConfig,
            taskData,
            prop,
            pageData,
            PresetTableData,
            normalParamList,
            // 人脸分组全选checkbox
            selectAllCheckChange,
            // 人脸分组弹框
            faceGroupSelect,
            handleRowClick,
            openFaceGroupPop,
            closeFaceGroupPop,
            saveFaceGroup,
            // 常规联动
            handleNormalParamCheckAll,
            handleNormalParamCheck,
            recordConfirm,
            recordClose,
            snapConfirm,
            snapClose,
            alarmOutConfirm,
            alarmOutClose,
            presetChange,
        }
    },
})
