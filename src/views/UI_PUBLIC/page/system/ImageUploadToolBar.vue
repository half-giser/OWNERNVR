<!--
 * @Description: 定时图像上传右上角工具栏
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-10-23 14:09:53
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-10-24 14:13:24
-->
<template>
    <BaseImgSprite
        file="toolbar_add"
        class="toolBarBtn"
        @click="add"
    />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
    emits: ['toolBarEvent'],
    setup(_props, ctx) {
        const add = () => {
            ctx.emit('toolBarEvent', {
                type: 'add',
                data: {},
            })
        }
        return {
            add,
        }
    },
})
</script>

<style lang="scss" scoped>
.toolBarBtn {
    background-color: var(--btn-bg);
    margin-right: 5px;
    cursor: pointer;

    &:hover {
        background-color: var(--btn-bg-hover);
    }
}
</style>
