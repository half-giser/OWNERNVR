<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-07-22 15:26:37
 * @Description: 周排程
-->
<template>
    <div>
        <div
            v-for="(item, index) in weekdayLang"
            :key="index"
            class="row"
            :style="{ width: `${width}px` }"
        >
            <div
                class="day-name"
                :title="Translate(item)"
                v-text="Translate(item)"
            ></div>
            <div class="day-schedule">
                <BaseScheduleLine
                    v-bind="$attrs"
                    :id="`line-${index}`"
                    ref="scheduleLines"
                    :width="width - 90"
                >
                    <template #customerControlPanel>
                        <el-popover
                            :visible="curCopyToPlIndex === index"
                            width="260"
                            @update:visible="
                                ($event) => {
                                    curCopyToPlIndex = $event ? index : -1
                                }
                            "
                            @before-enter="copyToOpen(index)"
                        >
                            <template #reference>
                                <a href="javascript:;">{{ Translate('IDCS_COPY_TO') }}</a>
                            </template>
                            <el-checkbox-group
                                v-model="copyToCheckedDay"
                                class="inline"
                            >
                                <template v-for="(cpItem, cpIndex) in weekdayLang">
                                    <el-checkbox
                                        v-if="cpIndex !== index"
                                        :key="cpIndex"
                                        :label="Translate(cpItem)"
                                        :value="cpIndex"
                                    />
                                </template>
                            </el-checkbox-group>
                            <div class="base-btn-box">
                                <el-button @click="copyToOk(index)">{{ Translate('IDCS_OK') }}</el-button>
                                <el-button @click="copyToClose">{{ Translate('IDCS_CANCEL') }}</el-button>
                            </div>
                        </el-popover>
                    </template>
                </BaseScheduleLine>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import BaseScheduleLine from './BaseScheduleLine.vue'

withDefaults(
    defineProps<{
        width: number
    }>(),
    {
        width: 300,
    },
)

const weekdayLang = ['IDCS_SUNDAY', 'IDCS_MONDAY', 'IDCS_TUESDAY', 'IDCS_WEDNESDAY', 'IDCS_THURSDAY', 'IDCS_FRIDAY', 'IDCS_SATURDAY']
const scheduleLines: Ref<InstanceType<typeof BaseScheduleLine>[] | null> = ref(null)
const copyToCheckedDay: Ref<number[]> = ref([])

onMounted(() => {})

//当前打开复制到面板的天序号
const curCopyToPlIndex = ref(-1)

/**
 * 关闭复制到弹框
 */
const copyToClose = () => {
    curCopyToPlIndex.value = -1
}

/**
 * 打开复制到弹框
 * @param index
 */
const copyToOpen = (index: number) => {
    curCopyToPlIndex.value = index
    const arrDay = [...new Array(7).keys()]
    arrDay.splice(index, 1)
    copyToCheckedDay.value = arrDay
}

/**
 * 复制到确定按钮事件
 * @param index
 * @returns
 */
const copyToOk = (index: number) => {
    if (!copyToCheckedDay.value.length) return

    const selectLines = scheduleLines.value?.filter((item: InstanceType<typeof BaseScheduleLine>) => {
        return copyToCheckedDay.value.indexOf(Number((item.$attrs.id as string).substring(5))) !== -1
    })
    const curLine = scheduleLines.value?.find((item) => {
        return item.$attrs.id === `line-${index}`
    })

    const curValue = (curLine as any as InstanceType<typeof BaseScheduleLine>).getValue()
    selectLines?.forEach((item) => {
        item.resetValue(curValue)
    })
    copyToClose()
}

/**
 * @description: 获取周排程数据
 * @return {*} 格式：[string,string][][]，第一层数组7个元素，代表天，0代表周日，第二层数组n个元素，代表一天的时间段，第三层数组代表单个时间段[startTime, endTime]
 */
const getValue = () => {
    const value = scheduleLines.value?.map((item) => {
        return item.getValue()
    })
    return value ? value : []
}

/**
 * @description: 设置周排程数据
 * @return {*} 格式同getValue的返回值
 */
const resetValue = (value: [string, string][][]) => {
    for (let i = 0; i < scheduleLines.value!.length; i++) {
        scheduleLines.value![i].resetValue(value[i])
    }
}

/**
 * @description: 设置周排程数据
 * @return {*} 格式同getValue的返回值
 */
const resetSameValue = (value: [string, string][]) => {
    for (let i = 0; i < scheduleLines.value!.length; i++) {
        scheduleLines.value![i].resetValue(value)
    }
}

/**
 * @description: 给每天手动添加相同的时间段，支持  ['00:30','02:00'] 或 [30,120] 格式
 * @return {*}
 */
const addTimeSpan = (timeSpan: [string, string] | [number, number], days: number[] = [0, 1, 2, 3, 4, 5, 6]) => {
    days.forEach((day) => {
        scheduleLines.value![day].addTimeSpan(timeSpan)
    })
}

/**
 * @description: 反选每天的排程数据
 * @return {*}
 */
const invert = () => {
    scheduleLines.value?.forEach((item) => {
        item.invert()
    })
}

defineExpose({
    weekdayLang,
    getValue,
    resetValue,
    resetSameValue,
    addTimeSpan,
    invert,
})
</script>

<style lang="scss" scoped>
.row {
    display: flex;
}

.day-name {
    flex: 0 0 auto;
    padding: 3px 0 0;
    width: 90px;
    font-size: 14px;
    max-height: 60px;
    overflow: hidden;
    text-wrap: nowrap;
    text-overflow: ellipsis;
}

.day-schedule {
    flex: 0 0 auto;
}
</style>
