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
        <div class="base-btn-box">
            <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" setup>
const props = withDefaults(
    defineProps<{
        /**
         * @property {string} ElDialog 的 props.title
         */
        headerTitle?: string
        /**
         * @property {string} ELTransfer 的 props.tities[0]
         */
        sourceTitle?: string
        /**
         * @property {string} ELTransfer 的 props.tities[1]
         */
        targetTitle?: string
        /**
         * @property {string} ELTransfer 的 props.data
         */
        sourceData: { label: string; value: string; disabled?: boolean }[]
        /**
         * @property {string[]} ELTransfer 的 props.modelValue
         */
        linkedList: string[]
        /**
         * @property {number} 数量限制
         */
        limit?: number
        /**
         * @property {string} 超出数量限制时的文本提示
         */
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
