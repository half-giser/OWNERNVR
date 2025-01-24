<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-12 15:40:03
 * @Description: 插件占位DIV
-->
<template>
    <div
        ref="$player"
        class="PluginPlayer"
    ></div>
</template>

<script lang="ts" setup>
import { type XMLQuery } from '@/utils/xmlParse'

const pluginStore = usePluginStore()

const prop = withDefaults(
    defineProps<{
        /**
         * @property 是否向插件发送位置数据
         */
        isUpdatePos: boolean
    }>(),
    {
        isUpdatePos: true,
    },
)

const emits = defineEmits<{
    (e: 'ready'): void
    (e: 'message', $: XMLQuery, stateType: string): void
}>()

const plugin = usePlugin()
const $player = ref<HTMLDivElement>()
const ready = ref(false)

usePlugin({
    player: $player,
    onMessage: ($, stateType) => emits('message', $, stateType),
})

/**
 * @description 组件与OCX通信均就绪时回调
 */
const stopWatchReady = watchEffect(() => {
    if (ready.value && pluginStore.ready && pluginStore.currPluginMode === 'ocx') {
        plugin.SetPluginSize($player.value!)
        emits('ready')
        stopWatchReady()
    }
})

onMounted(() => {
    if (prop.isUpdatePos) {
        plugin.AddPluginMoveEvent($player.value!)
    }
    ready.value = true
})

onBeforeUnmount(() => {
    plugin.CloseCurPlugin($player.value!)
    plugin.DisplayOCX(false)
})

watch(
    () => prop.isUpdatePos,
    (newValue) => {
        if (newValue) {
            plugin.AddPluginMoveEvent($player.value!)
        } else {
            plugin.DisableUpdatePluginPos($player.value!)
        }
    },
    {
        immediate: false,
    },
)

defineExpose({
    plugin,
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
