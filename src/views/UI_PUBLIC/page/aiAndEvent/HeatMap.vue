<!--
 * @Description: 绘制热力图组件
 * @Author: liyanqi(a11219@tvt.net.cn)
 * @Date: 2025-05-19 14:33:51
-->
<template>
    <div ref="heatmapContainer"></div>
</template>

<script setup>
const emits = defineEmits(['updateLegend'])

import { onMounted, ref } from 'vue'
import Heatmap from 'heatmap.js'

const heatmapContainer = ref(null)

onMounted(() => {
    if (heatmapContainer.value) {
        const heatmapInstance = Heatmap.create({
            container: heatmapContainer.value,
            canvas: document.getElementById('myCanvas'),
            onExtremaChange: function (data) {
                emits('updateLegend', data)
            },
            radius: 80,
            blur: 0.8,
        })

        const data = [
            { x: 10, y: 20, value: 10 },
            { x: 20, y: 30, value: 15 },
            { x: 30, y: 40, value: 20 },
            // 更多数据点...
        ]

        heatmapInstance.setData({ data })
    }
})
</script>
