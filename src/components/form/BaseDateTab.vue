<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-26 10:56:10
 * @Description: 日期切换按钮
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-30 17:24:54
-->
<template>
    <div class="date-tab">
        <el-radio-group :model-value="currentType">
            <el-radio-button
                v-for="item in filterBtns"
                :key="item.value"
                :value="item.value"
                :label="item.value === 'today' ? `${item.label} ${today}` : item.label"
                @click="handleClick(item.value)"
            />
        </el-radio-group>
        <el-dialog
            v-model="pageData.isCustomPop"
            :title="Translate('IDCS_TIME_CUSTOMIZE')"
            width="500"
            align-center
            draggable
            :show-close="false"
            append-to-body
        >
            <el-form
                :style="{
                    '--form-input-width': '100%',
                }"
                class="inline-message"
            >
                <el-form-item :label="Translate('IDCS_START_TIME')">
                    <el-date-picker
                        v-model="formData.startTime"
                        :value-format="dateTime.dateTimeFormat"
                        :format="dateTime.dateTimeFormat"
                        type="datetime"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_END_TIME')">
                    <el-date-picker
                        v-model="formData.endTime"
                        :value-format="dateTime.dateTimeFormat"
                        :format="dateTime.dateTimeFormat"
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
         * @property {<'day' | 'week' | 'month' | 'quarter' | 'custom' | 'today'>[]} 可选的按钮 排序：day week month quarter custom today
         */
        layout?: string[]
        /**
         * @property 起止日期时间戳
         */
        modelValue: [number, number]
    }>(),
    {
        layout: () => ['date', 'week', 'month', 'custom', 'today'],
    },
)

const emits = defineEmits<{
    (e: 'update:modelValue', value: [number, number]): void
    (e: 'change', value: [number, number], type: string): void
}>()

const { openMessageBox } = useMessageBox()
const { Translate } = useLangStore()
const dateTime = useDateTimeStore()

const pageData = ref({
    // 是否弹出自定义弹窗
    isCustomPop: false,
    // 按钮选项
    buttons: [
        {
            label: Translate('IDCS_DAY_ALL'),
            value: 'date',
        },
        {
            label: Translate('IDCS_WEEK'),
            value: 'week',
        },
        {
            label: Translate('IDCS_MONTH_ALL'),
            value: 'month',
        },
        {
            label: Translate('IDCS_QUARTER'),
            value: 'quarter',
        },
        {
            label: Translate('IDCS_REPLAY_CUSTOMIZE'),
            value: 'custom',
        },
        {
            label: Translate('IDCS_CALENDAR_TODAY'),
            value: 'today',
        },
    ],
})

const filterBtns = computed(() => {
    return pageData.value.buttons.filter((item) => props.layout.includes(item.value))
})

const lastType = ref('today')
const currentType = ref('today')

// 当天日期的格式化显示
const today = computed(() => {
    return formatDate(Date.now(), dateTime.dateFormat)
})

const formData = ref({
    // 自定义开始时间
    startTime: '',
    // 自定义结束时间
    endTime: '',
})

/**
 * @description 验证自定义弹窗 通过后更新数据
 */
const verifyCustomPop = () => {
    const startTime = dayjs(formData.value.startTime, dateTime.dateTimeFormat).valueOf()
    const endTime = dayjs(formData.value.endTime, dateTime.dateTimeFormat).valueOf()
    if (startTime > endTime) {
        openMessageBox({
            type: 'info',
            message: Translate('IDCS_END_TIME_GREATER_THAN_START'),
        })
        return
    }

    if (dayjs(endTime).diff(startTime, 'day', true) > 31) {
        openMessageBox({
            type: 'info',
            message: Translate('IDCS_TIME_CUSTOMIZE_ERROR'),
        })
        return
    }

    pageData.value.isCustomPop = false
    emits('update:modelValue', [startTime, endTime])
    emits('change', [startTime, endTime], currentType.value)
}

/**
 * @description 取消自定义日期
 */
const cancelCustomPop = () => {
    pageData.value.isCustomPop = false

    currentType.value = lastType.value
}

/**
 * @description 更改日期类型（如果日期类型没变，则不处理）
 * @param {string} value
 */
const handleClick = (value: string) => {
    if (currentType.value === 'custom' || currentType.value !== value) {
        changeType(value)
    }
}

/**
 * @description 更改日期类型
 */
const changeType = (type: string | number | boolean | undefined) => {
    if (typeof type !== 'string') {
        return
    }
    let current: [number, number] = [0, 0]
    lastType.value = currentType.value
    currentType.value = type
    if (type === 'custom') {
        if (!formData.value.startTime) {
            formData.value.startTime = dayjs().hour(0).minute(0).second(0).format(dateTime.dateTimeFormat)
            formData.value.endTime = dayjs().hour(23).minute(59).second(59).format(dateTime.dateTimeFormat)
        }
        pageData.value.isCustomPop = true
    } else {
        const date = dayjs(props.modelValue[0])
        switch (type) {
            case 'date':
                current = [date.hour(0).minute(0).second(0).valueOf(), date.hour(23).minute(59).second(59).valueOf()]
                break
            case 'month':
                const days = date.daysInMonth()
                current = [date.date(1).hour(0).minute(0).second(0).valueOf(), date.date(days).hour(23).minute(59).second(59).valueOf()]
                break
            case 'week':
                current = [date.day(0).hour(0).minute(0).second(0).valueOf(), date.day(6).hour(23).minute(59).second(59).valueOf()]
                break
            case 'quarter':
                const quarter = Math.floor(date.month() / 4)
                const daysInLastMonth = date.month(quarter * 3 + 2).daysInMonth()
                current = [
                    date
                        .month(quarter * 3)
                        .date(1)
                        .hour(0)
                        .minute(0)
                        .second(0)
                        .valueOf(),
                    date
                        .month(quarter * 3 + 2)
                        .date(daysInLastMonth)
                        .hour(23)
                        .minute(59)
                        .second(59)
                        .valueOf(),
                ]
                break
            case 'today':
            default:
                current = [dayjs().hour(0).minute(0).second(0).valueOf(), dayjs().hour(23).minute(59).second(59).valueOf()]
                break
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
