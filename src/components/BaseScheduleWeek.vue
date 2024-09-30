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
                        <a
                            @click="copyToOpen(index, $event)"
                            v-text="Translate('IDCS_COPY_TO')"
                        ></a>
                        <div
                            v-show="curCopyToPlIndex === index"
                            class="copyToPL"
                            @click.stop
                        >
                            <div class="copyToDayList">
                                <el-checkbox-group v-model="copyToCheckedDay">
                                    <template v-for="(cpItem, cpIndex) in weekdayLang">
                                        <el-checkbox
                                            v-if="cpIndex !== index"
                                            :key="cpIndex"
                                            class="copyToDayItem"
                                            :label="Translate(cpItem)"
                                            :value="cpIndex"
                                        />
                                    </template>
                                </el-checkbox-group>
                            </div>
                            <div class="copyToFooter">
                                <el-button @click="copyToOk(index)">{{ Translate('IDCS_OK') }}</el-button>
                                <el-button @click="copyToClose">{{ Translate('IDCS_CANCEL') }}</el-button>
                            </div>
                        </div>
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
 * 记录当前打开复制到的按钮（在周排程时，打开一个手动输入/复制到，需要关闭其他天的手动输入/复制到，不能阻止冒泡，导致document点击时间不触发）
 */
let copyToATarget: EventTarget | null = null

/**
 * 关闭复制到弹框
 */
const copyToClose = (event: Event | null) => {
    if (event == null || event.target != copyToATarget) {
        curCopyToPlIndex.value = -1
        document.removeEventListener('click', copyToClose)
    }
}

/**
 * 打开复制到弹框
 * @param index
 */
const copyToOpen = (index: number, event: Event) => {
    copyToATarget = event.target
    curCopyToPlIndex.value = index
    const arrDay = [...new Array(7).keys()]
    arrDay.splice(index, 1)
    copyToCheckedDay.value = arrDay
    console.log(copyToCheckedDay.value)
    document.addEventListener('click', copyToClose)
}

/**
 * 复制到确定按钮事件
 * @param index
 * @returns
 */
const copyToOk = (index: number) => {
    // console.log(copyToCheckedDay.value)
    if (copyToCheckedDay.value.length === 0) return

    const selectLines = scheduleLines.value?.filter((item: InstanceType<typeof BaseScheduleLine>) => {
        return copyToCheckedDay.value.indexOf(Number((item.$attrs['id'] as string).substring(5))) !== -1
    })
    const curLine = scheduleLines.value?.find((item) => {
        return item.$attrs['id'] === `line-${index}`
    })

    const curValue = (curLine as any as InstanceType<typeof BaseScheduleLine>).getValue()
    selectLines?.forEach((item) => {
        item.resetValue(curValue)
    })
    copyToClose(null)
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
    padding: 3px 0px 0px 0px;
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

.copyToPL {
    position: absolute;
    z-index: 100;
    width: 205px;
    top: 20px;
    left: 0px;
    border: solid 1px var(--main-border);
    background-color: var(--table-stripe);
    padding: 5px;
    border-radius: 5px;

    .copyToDayList {
        display: flex;
        flex-wrap: wrap;

        .copyToDayItem {
            flex: 0 0 60px;
            font-size: 13px;
            margin: 2px;
            height: 20px;
        }
    }

    .copyToFooter {
        display: flex;
        margin-top: 10px;

        button {
            flex: 1 1 auto;
        }
    }
}
</style>
