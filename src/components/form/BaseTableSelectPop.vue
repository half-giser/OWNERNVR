<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-26 19:58:43
 * @Description: 多选弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-11 11:24:29
-->
<template>
    <el-dialog
        :model-value="modelValue"
        :title="title"
        width="400"
        align-center
        draggable
        append-to-body
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
                width="60"
            />
            <el-table-column
                :label="labelTitle"
                :prop="label"
            />
        </el-table>
        <slot></slot>
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
        /**
         * @property 是否打开弹窗
         */
        modelValue: boolean
        /**
         * @property 弹窗标题
         */
        title: string
        /**
         * @property value的key
         */
        value?: string
        /**
         * @property label的key
         */
        label?: string
        /**
         * @property 列标题
         */
        labelTitle: string
        /**
         * @property 选项
         */
        data: any[]
        /**
         * @property 当前选项
         */
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

/**
 * @description 选中值更改
 */
const handleCurrentChange = (row: any[]) => {
    selected.value = row
}

/**
 * @description 打开弹窗时 重置选中值
 */
const open = () => {
    const ids = props.current.map((item) => item[props.value])
    props.data.forEach((item) => {
        tableRef.value?.toggleRowSelection(item, ids.includes(item[props.value]))
    })
}

/**
 * @description 确认修改值 关闭弹窗
 */
const confirm = () => {
    emits('confirm', selected.value)
    emits('update:modelValue', false)
}
</script>
