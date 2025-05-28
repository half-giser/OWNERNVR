<!--
 * @Date: 2025-02-25 13:33:24
 * @Description: 适用于4状态雪碧图的按钮（normal、hover、active、disabled）
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <BaseImgSprite
        :file
        :index="index[0]"
        :hover-index="index[1]"
        :active-index="index[2]"
        :disabled-index="index[3]"
        :chunk
    />
</template>

<script setup lang="ts">
withDefaults(
    defineProps<{
        file: string
        index?: number[]
        chunk?: number
    }>(),
    {
        index: () => [0, 1, 2, 3],
        chunk: 4,
    },
)
</script>
