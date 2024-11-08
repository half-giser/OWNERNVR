<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-16 17:19:02
 * @Description: 穿梭框弹窗
-->
<template>
    <el-dialog
        :width="600"
        :title="Translate(headerTitle)"
        @open="open"
        @close="close"
    >
        <div>
            <el-transfer
                v-model="chosedList"
                :data="data"
                :props="{
                    key: 'value',
                    label: 'label',
                    disabled: 'disabled',
                }"
                :titles="[Translate(sourceTitle), Translate(targetTitle)]"
                @change="change"
            />
        </div>
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" setup>
const props = withDefaults(
    defineProps<{
        headerTitle?: string
        sourceTitle?: string
        targetTitle?: string
        sourceData: { label: string; value: string; disabled?: boolean }[]
        linkedList: string[]
        limit?: number
        limitTip?: string
    }>(),
    {
        headerTitle: '',
        sourceTitle: '',
        targetTitle: '',
        limit: 16,
        limitTip: '',
    },
)

const emits = defineEmits<{
    (e: 'confirm', data: SelectOption<string, string>[]): void
    (e: 'close'): void
}>()

const data = ref<SelectOption<string, string>[]>([])
const chosedList = ref<string[]>([])

const { openMessageBox } = useMessageBox()
const { Translate } = useLangStore()

/**
 * @description 打开弹窗回调
 */
const open = () => {
    data.value = props.sourceData
    chosedList.value = props.linkedList
}

/**
 * @description 限制联动通道数量
 */
const change = () => {
    if (chosedList.value.length > props.limit) {
        openMessageBox({
            type: 'info',
            message: Translate(props.limitTip),
        })
        chosedList.value.splice(props.limit, chosedList.value.length - 1)
    }
}

/**
 * @description 保存数据
 */
const verify = () => {
    const filterList = data.value.filter((item) => chosedList.value.includes(item.value))
    emits('confirm', filterList)
}

/**
 * @description 关闭弹窗
 */
const close = () => {
    emits('close')
}

onMounted(() => {
    open()
})
</script>
