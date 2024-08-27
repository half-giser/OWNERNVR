<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-26 19:58:43
 * @Description: 多选弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-26 20:40:07
-->
<template>
    <el-dialog
        :model-value="modelValue"
        :title="title"
        width="400"
        align-center
        draggable
        @open="open"
        @update:model-value="emits('update:modelValue', $event)"
    >
        <el-table
            ref="tableRef"
            height="400"
            border
            stripe
            :data="data"
            :row-key="value"
            @selection-change="handleCurrentChange"
        >
            <el-table-column
                type="selection"
                width="50px"
            />
            <el-table-column
                :label="labelTitle"
                :prop="label"
            />
        </el-table>
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="confirm">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="emits('update:modelValue', false)">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { type TableInstance } from 'element-plus'

const props = withDefaults(
    defineProps<{
        modelValue: boolean
        title: string
        value?: string
        label?: string
        labelTitle: string
        data: any[]
        current: any[]
    }>(),
    {
        value: 'value',
        label: 'label',
        modelValue: false,
    },
)

const emits = defineEmits<{
    (e: 'confirm', data: any[]): void
    (e: 'update:modelValue', bool: boolean): void
}>()

const tableRef = ref<TableInstance>()

const selected = ref<any[]>([])

const handleCurrentChange = (row: any[]) => {
    selected.value = row
}

const open = () => {
    const ids = props.current.map((item) => item[props.value])
    console.log(ids)
    props.data.forEach((item) => {
        console.log(ids.includes(item[props.value]))
        tableRef.value?.toggleRowSelection(item, ids.includes(item[props.value]))
    })
}

const confirm = () => {
    emits('confirm', selected.value)
    emits('update:modelValue', false)
}
</script>

<style lang="scss" scoped></style>
