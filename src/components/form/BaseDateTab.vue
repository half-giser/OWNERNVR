<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-26 10:56:10
 * @Description: 日期切换按钮
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-26 14:35:15
-->
<template>
    <div class="date-tab">
        <el-radio-group
            :model-value="currentType"
            @update:model-value="changeType"
        >
            <el-radio-button value="date">{{ Translate('IDCS_DAY_ALL') }}</el-radio-button>
            <el-radio-button value="week">{{ Translate('IDCS_WEEK') }}</el-radio-button>
            <el-radio-button value="month">{{ Translate('IDCS_MONTH_ALL') }}</el-radio-button>
            <el-radio-button value="custom">{{ Translate('IDCS_REPLAY_CUSTOMIZE') }}</el-radio-button>
            <el-radio-button value="today">{{ Translate('IDCS_CALENDAR_TODAY') }} {{ today }}</el-radio-button>
        </el-radio-group>
        <el-dialog
            v-model="pageData.isCustomPop"
            :title="Translate('IDCS_TIME_CUSTOMIZE')"
            width="500"
            :show-close="false"
        >
            <el-form
                label-position="left"
                :style="{
                    '--form-input-width': '100%',
                }"
                class="inline-message"
            >
                <el-form-item :label="Translate('IDCS_START_TIME')">
                    <el-date-picker
                        v-model="formData.startTime"
                        :value-format="dateTimeFormat"
                        :format="dateTimeFormat"
                        :cell-class-name="highlight"
                        clear-icon=""
                        type="datetime"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_END_TIME')">
                    <el-date-picker
                        v-model="formData.endTime"
                        :value-format="dateTimeFormat"
                        :format="dateTimeFormat"
                        :cell-class-name="highlight"
                        clear-icon=""
                        type="datetime"
                    />
                </el-form-item>
            </el-form>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end btnBox"
                >
                    <el-button @click="verifyCustomPop">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="cancelCustomPop">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </el-dialog>
    </div>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs'

const props = withDefaults(
    defineProps<{
        /**
         * @property 日期格式
         */
        dateFormat?: string
        /**
         * @property 日期时间格式
         */
        dateTimeFormat?: string
        /**
         * @property 年月格式
         */
        highlight?: Function
        modelValue: [number, number]
    }>(),
    {
        // type: 'date',
        dateFormat: 'YYYY-MM-DD',
        dateTimeFormat: 'YYYY-MM-DD HH:mm:ss',
        // ymFormat: 'YYYY-MM',
        highlight: () => {},
    },
)

const emits = defineEmits<{
    (e: 'update:modelValue', value: [number, number]): void
    (e: 'change', value: [number, number], type: string): void
}>()

const { openMessageTipBox } = useMessageBox()
const { Translate } = useLangStore()

const pageData = ref({
    isCustomPop: false,
})

const lastType = ref('today')
const currentType = ref('today')

const today = computed(() => {
    return formatDate(Date.now(), props.dateFormat)
})

const formData = ref({
    startTime: '',
    endTime: '',
})

/**
 * @description 验证自定义弹窗 通过后更新数据
 */
const verifyCustomPop = () => {
    const startTime = dayjs(formData.value.startTime, props.dateTimeFormat).valueOf()
    const endTime = dayjs(formData.value.endTime, props.dateTimeFormat).valueOf()
    if (startTime > endTime) {
        openMessageTipBox({
            type: 'info',
            message: Translate('IDCS_END_TIME_GREATER_THAN_START'),
        })
        return
    }
    if (dayjs(endTime).diff(startTime, 'day', true) > 31) {
        openMessageTipBox({
            type: 'info',
            message: Translate('IDCS_TIME_CUSTOMIZE_ERROR'),
        })
        return
    }
    pageData.value.isCustomPop = false
    emits('update:modelValue', [startTime, endTime])
    emits('change', [startTime, endTime], currentType.value)
}

const cancelCustomPop = () => {
    pageData.value.isCustomPop = false

    currentType.value = lastType.value
}

const changeType = (type: string | number | boolean | undefined) => {
    if (typeof type !== 'string') {
        return
    }
    let current: [number, number] = [0, 0]
    lastType.value = currentType.value
    currentType.value = type
    if (type === 'custom') {
        if (!formData.value.startTime) {
            formData.value.startTime = dayjs().hour(0).minute(0).second(0).format(props.dateTimeFormat)
            formData.value.endTime = dayjs().hour(23).minute(59).second(59).format(props.dateTimeFormat)
        }
        pageData.value.isCustomPop = true
    } else {
        const date = dayjs(props.modelValue[0])
        if (type === 'date') {
            current = [date.hour(0).minute(0).second(0).valueOf(), date.hour(23).minute(59).second(59).valueOf()]
        } else if (type === 'month') {
            const days = date.daysInMonth()
            current = [date.date(1).hour(0).minute(0).second(0).valueOf(), date.date(days).hour(23).minute(59).second(59).valueOf()]
        } else if (type === 'week') {
            current = [date.day(0).hour(0).minute(0).second(0).valueOf(), date.day(6).hour(23).minute(59).second(59).valueOf()]
        } else {
            // today
            current = [dayjs().hour(0).minute(0).second(0).valueOf(), dayjs().hour(23).minute(59).second(59).valueOf()]
        }
        emits('update:modelValue', current)
        emits('change', current, currentType.value)
    }
}

onMounted(() => {
    changeType('today')
})

watch(
    () => props.modelValue,
    () => {
        if (currentType.value === 'today') {
            if (!dayjs(props.modelValue[0]).isSame(Date.now(), 'day')) {
                currentType.value = 'date'
            }
        }
    },
)
</script>

<style lang="scss" scoped>
.date-tab {
}
</style>
