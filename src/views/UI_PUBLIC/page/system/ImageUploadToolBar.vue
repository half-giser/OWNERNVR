<!--
 * @Description: 定时图像上传右上角工具栏
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-10-23 14:09:53
-->
<template>
    <BaseImgSprite
        file="toolbar_add"
        class="base-toolbar-btn"
        @click="add"
    />
</template>

<script lang="ts">
export default defineComponent({
    emits: {
        toolBarEvent(data: ConfigToolBarEvent<undefined>) {
            return !!data
        },
    },

    setup(_props, ctx) {
        const add = () => {
            ctx.emit('toolBarEvent', {
                type: 'add',
                data: undefined,
            })
        }

        return {
            add,
        }
    },
})
</script>
