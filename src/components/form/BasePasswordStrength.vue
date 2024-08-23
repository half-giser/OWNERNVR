<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-14 09:58:53
 * @Description: 密码强度指示器
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-16 10:49:14
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
    strength: number
}>()

// 密码强度的颜色值映射
const strengthColors = ['grey', 'red', 'yellow', 'green', 'green']
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
        background-color: grey;
        list-style: none;
    }
}
</style>
