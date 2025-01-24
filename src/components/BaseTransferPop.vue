<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-16 17:19:02
 * @Description: 穿梭下拉框内容
-->
<template>
    <div class="Transfer">
        <el-transfer
            v-model="chosedList"
            :data="sourceData"
            :props="{
                key: 'value',
                label: 'label',
                disabled: 'disabled',
            }"
            :titles="[Translate(sourceTitle), Translate(targetTitle)]"
            @change="change"
        />
        <div class="base-btn-box">
            <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </div>
</template>

<script lang="ts" setup>
const props = withDefaults(
    defineProps<{
        /**
         * @property {boolean} 是否显示
         */
        visible?: boolean
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
        visible: false,
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

const chosedList = ref<string[]>([])

const { Translate } = useLangStore()

/**
 * @description 打开弹窗回调
 */
const open = () => {
    chosedList.value = props.linkedList
}

/**
 * @description 限制联动通道数量
 */
const change = () => {
    if (chosedList.value.length > props.limit) {
        openMessageBox(Translate(props.limitTip))
        chosedList.value.splice(props.limit, chosedList.value.length - 1)
    }
}

/**
 * @description 保存数据
 */
const verify = () => {
    const filterList = props.sourceData.filter((item) => chosedList.value.includes(item.value))
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

watch(
    () => props.visible,
    (visible) => {
        if (visible) {
            open()
        }
    },
)
</script>

<style lang="scss" scoped>
.Transfer {
    margin: 10px;
    width: 600px;
}

.btnBox {
    margin-top: 10px;
}
</style>
