<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-12 15:40:03
 * @Description: 插件占位DIV
-->
<template>
    <div
        ref="$player"
        class="PluginPlayer"
    >
        <BasePluginNotice />
    </div>
</template>

<script lang="ts" setup>
const pluginStore = usePluginStore()

const prop = withDefaults(
    defineProps<{
        isUpdatePos: boolean // 是否向插件发送位置数据
    }>(),
    {
        isUpdatePos: true,
    },
)

const emits = defineEmits<{
    (e: 'onready'): void
}>()

const Plugin = inject('Plugin') as PluginType
const $player = ref<HTMLDivElement>()
const ready = ref(false)

/**
 * @description 组件与OCX通信均就绪时回调
 */
const handleReady = () => {
    if (ready.value && pluginStore.ready && pluginStore.currPluginMode === 'ocx') {
        Plugin.SetPluginSize($player.value!)
        emits('onready')
    }
}

onMounted(() => {
    if (prop.isUpdatePos) {
        Plugin.AddPluginMoveEvent($player.value!)
    }
    ready.value = true
    handleReady()
})

onBeforeUnmount(() => {
    Plugin.CloseCurPlugin($player.value!)
    Plugin.DisplayOCX(false)
})

watch(
    () => pluginStore.ready,
    () => {
        handleReady()
    },
    {
        immediate: true,
    },
)

watch(
    () => prop.isUpdatePos,
    (newValue) => {
        if (newValue) {
            Plugin.AddPluginMoveEvent($player.value!)
        } else {
            Plugin.DisableUpdatePluginPos($player.value!)
        }
    },
    {
        immediate: false,
    },
)

defineExpose({
    plugin: Plugin,
})
</script>

<style lang="scss" scoped>
.PluginPlayer {
    position: relative;
    background-color: #787878;
    width: 100%;
    height: 100%;
}
</style>
