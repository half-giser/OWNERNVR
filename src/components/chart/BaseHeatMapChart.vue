<!--
 * @Description: 绘制热力图组件
 * @Author: liyanqi(a11219@tvt.net.cn)
 * @Date: 2025-05-19 14:33:51
-->
<template>
    <div class="heatmap-box">
        <div id="heatmap"></div>
    </div>
</template>

<script lang="ts" setup>
import Heatmap from 'heatmap.js'

const props = withDefaults(
    defineProps<{
        data: { x: number; y: number; value: number }[]
        min?: number
        max?: number
    }>(),
    {
        data: () => [],
        min: 0,
        max: 100,
    },
)

let heatmapInstance: Heatmap.Heatmap<'x', 'y', 'value'>

onMounted(() => {
    heatmapInstance = Heatmap.create({
        container: document.getElementById('heatmap')!,
        radius: 80,
        blur: 0.8,
    })

    setData()
})

const setData = () => {
    heatmapInstance.setData({
        data: props.data,
        min: props.min,
        max: props.max,
    })
}

watch(
    () => props.data,
    () => {
        setData()
    },
)

watch(
    () => props.min,
    () => {
        setData()
    },
)

watch(
    () => props.max,
    () => {
        setData()
    },
)

const toDataURL = (type = 'image/png') => {
    const canvas = document.querySelector('#heatmap canvas')
    if (canvas) {
        return (canvas as HTMLCanvasElement).toDataURL(type)
    } else {
        return DEFAULT_EMPTY_IMG
    }
}

const expose = {
    toDataURL: toDataURL,
}

export type HeatMapReturnsType = typeof expose

defineExpose(expose)
</script>

<style lang="scss" scoped>
.heatmap-box {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

#heatmap {
    width: 100%;
    height: 100%;

    canvas {
        width: 100%;
        height: 100%;
    }
}
</style>
