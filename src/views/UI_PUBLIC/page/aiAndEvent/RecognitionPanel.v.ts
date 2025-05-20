/*
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-09-04 14:23:54
 * @Description:识别成功（1,2,3）/陌生人tab页/陌生车牌tab页，用于人脸识别和车牌识别的识别tab下
 */
import AlarmBaseRecordSelector from './AlarmBaseRecordSelector.vue'
import AlarmBaseAlarmOutSelector from './AlarmBaseAlarmOutSelector.vue'
import AlarmBaseTriggerSelector from './AlarmBaseTriggerSelector.vue'
import AlarmBasePresetSelector from './AlarmBasePresetSelector.vue'
import AlarmBaseSnapSelector from './AlarmBaseSnapSelector.vue'

export default defineComponent({
    components: {
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

        const supportAlarmAudioConfig = systemCaps.supportAlarmAudioConfig

        const pageData = ref({
            // 分组弹窗
            isGroupPop: false,
            groupSelection: [] as { guid: string; name: string }[],
            // 分组的checkbox
            selectAll: false,
            // 排程弹窗
            isSchedulePop: false,
        })

        // 初始化数据
        const initData = () => {
            pageData.value.selectAll = taskData.groupId.length > 0 && taskData.groupId.length === prop.groupData.length
            pageData.value.groupSelection = prop.groupData.filter((item) => taskData.groupId.includes(item.guid))
        }

        // 分组选中名称拼接
        const groupName = computed(() => {
            return prop.groupData
                .filter((item) => taskData.groupId.includes(item.guid))
                .map((item) => item.name)
                .join('; ')
        })

        // 分组全选checkbox
        const toggleSelectAll = () => {
            if (pageData.value.selectAll) {
                pageData.value.groupSelection = prop.groupData.map((item) => item)
                taskData.groupId = prop.groupData.map((item) => item.guid)
            } else {
                pageData.value.groupSelection = []
                taskData.groupId = []
            }
        }

        /**
         * @description 打开分组弹窗
         */
        const openGroupPop = () => {
            pageData.value.isGroupPop = true
        }

        /**
         * @description 更新分组
         * @param rowData
         */
        const saveGroup = (rowData: { guid: string; name: string }[]) => {
            pageData.value.groupSelection = rowData
            taskData.groupId = pageData.value.groupSelection.map((item) => item.guid)
            pageData.value.selectAll = taskData.groupId.length > 0 && taskData.groupId.length === prop.groupData.length
        }

        watch(taskData, () => {
            ctx.emit('change', taskData)
        })

        onMounted(() => {
            initData()
        })

        return {
            supportAlarmAudioConfig,
            taskData,
            pageData,
            groupName,
            toggleSelectAll,
            openGroupPop,
            saveGroup,
        }
    },
})
