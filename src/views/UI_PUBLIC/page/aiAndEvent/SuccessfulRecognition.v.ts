/*
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-09-04 14:23:54
 * @Description:识别成功（1,2,3）/陌生人tab页/陌生车牌tab页，用于人脸识别和车牌识别的识别tab下
 */
import ScheduleManagPop from '../../components/schedule/ScheduleManagPop.vue'
import { type AlarmRecognitionTaskDto } from '@/types/apiType/aiAndEvent'
import { type TableInstance, type CheckboxValueType } from 'element-plus'
import AlarmBaseRecordSelector from './AlarmBaseRecordSelector.vue'
import AlarmBaseAlarmOutSelector from './AlarmBaseAlarmOutSelector.vue'
import AlarmBaseTriggerSelector from './AlarmBaseTriggerSelector.vue'
import AlarmBasePresetSelector from './AlarmBasePresetSelector.vue'
import AlarmBaseSnapSelector from './AlarmBaseSnapSelector.vue'

export default defineComponent({
    components: {
        ScheduleManagPop,
        AlarmBaseRecordSelector,
        AlarmBaseAlarmOutSelector,
        AlarmBaseTriggerSelector,
        AlarmBasePresetSelector,
        AlarmBaseSnapSelector,
    },
    props: {
        currTaskData: {
            type: Object as PropType<AlarmRecognitionTaskDto>,
            required: true,
        },
        groupData: {
            type: Array as PropType<{ guid: string; name: string }[]>,
            required: true,
        },
        scheduleList: {
            type: Array as PropType<SelectOption<string, string>[]>,
            required: true,
        },
        voiceList: {
            type: Array as PropType<SelectOption<string, string>[]>,
            required: true,
        },
    },
    emits: {
        change(data: AlarmRecognitionTaskDto) {
            return !!data
        },
    },
    setup(prop, ctx) {
        const systemCaps = useCababilityStore()

        const taskData = prop.currTaskData || {
            guid: '',
            id: '',
            ruleType: '',
            pluseSwitch: false,
            groupId: [],
            nameId: 0,
            hintword: '',
            sysAudio: DEFAULT_EMPTY_ID,
            schedule: DEFAULT_EMPTY_ID,
            record: [],
            alarmOut: [],
            snap: [],
            trigger: [],
        }

        const groupTableRef = ref<TableInstance>()

        const supportAlarmAudioConfig = systemCaps.supportAlarmAudioConfig

        const pageData = ref({
            // 分组弹窗
            groupPopOpen: false,
            groupSelection: [] as { guid: string; name: string }[],
            // 分组的checkbox
            selectAll: false,
            // 分组选中名称拼接
            groupName: '',
            // 排程弹窗
            scheduleManagPopOpen: false,
        })

        // 初始化数据
        const initData = () => {
            pageData.value.selectAll = taskData.groupId.length > 0 && taskData.groupId.length === prop.groupData?.length
            handleGroupName()
        }

        // 生成分组选中的数据名称
        const handleGroupName = () => {
            pageData.value.groupName = ''
            prop.groupData?.forEach((item) => {
                if (taskData.groupId.includes(item.guid)) {
                    pageData.value.groupName += item.name + '; '
                }
            })
        }

        // 分组全选checkbox
        const selectAllCheckChange = (value: CheckboxValueType) => {
            if (value) {
                taskData.groupId = prop.groupData?.map((item) => item.guid) as string[]
            } else {
                taskData.groupId = []
            }
            handleGroupName()
        }

        // 分组弹窗打开/关闭
        const openGroupPop = () => {
            prop.groupData?.forEach((item) => {
                if (taskData.groupId.includes(item.guid)) {
                    groupTableRef.value!.toggleRowSelection(item, true)
                }
            })
        }

        const closeGroupPop = () => {
            groupTableRef.value!.clearSelection()
            pageData.value.groupPopOpen = false
        }

        // 分支选中
        const groupSelect = (selection: []) => {
            pageData.value.groupSelection = selection
        }

        // 单行点击
        const handleRowClick = (rowData: { guid: string; name: string }) => {
            groupTableRef.value!.clearSelection()
            groupTableRef.value!.toggleRowSelection(rowData, true)
        }

        const saveGroup = () => {
            taskData.groupId = pageData.value.groupSelection.map((item) => item.guid)
            closeGroupPop()
            pageData.value.selectAll = taskData.groupId.length > 0 && taskData.groupId.length === prop.groupData?.length
            handleGroupName()
        }

        watch(taskData, () => {
            ctx.emit('change', taskData)
        })

        onMounted(async () => {
            initData()
        })

        return {
            ScheduleManagPop,
            groupTableRef,
            supportAlarmAudioConfig,
            taskData,
            pageData,
            // 分组全选checkbox
            selectAllCheckChange,
            // 分组弹框
            groupSelect,
            handleRowClick,
            openGroupPop,
            closeGroupPop,
            saveGroup,
            AlarmBaseRecordSelector,
            AlarmBaseAlarmOutSelector,
            AlarmBaseTriggerSelector,
            AlarmBasePresetSelector,
            AlarmBaseSnapSelector,
        }
    },
})
