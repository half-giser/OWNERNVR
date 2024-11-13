<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-14 09:58:53
 * @Description: 密码强度指示器
-->
<template>
    <ul class="Strength">
        <li
            v-for="key in 4"
            :key
            :style="{
                backgroundColor: key <= prop.strength ? strengthColors[prop.strength] : strengthColors[0],
            }"
        ></li>
    </ul>
</template>

<script lang="ts" setup>
const prop = defineProps<{
    /**
     * @description 强度值 取值范围：[0, 4]
     */
    strength: number
}>()

// 密码强度的颜色值映射
const strengthColors = ['var(--color-grey)', 'var(--color-error)', 'var(--color-yellow)', 'var(--color-green)', 'var(--color-green)']
</script>

<style lang="scss">
.Strength {
    display: flex;
    width: 100%;
    justify-content: flex-end;
    height: 10px;
    box-sizing: border-box;
    padding-right: 15px;

    li {
        margin-left: 3px;
        width: 40px;
        height: 10px;
        background-color: var(--color-grey);
        list-style: none;
    }
}
</style>
