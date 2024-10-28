<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-05-07 19:40:23
 * @Description: 通道组 右上方工具栏
-->
<template>
    <el-button
        v-if="isAddGroupBtn"
        size="small"
        @click="addChlGroup"
        >{{ Translate('IDCS_ADD_GROUP') }}</el-button
    >
    <BaseImgSprite
        v-else
        file="toolbar_add"
        class="base-toolbar-btn"
        @click="addChlGroup"
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
        const isAddGroupBtn = import.meta.env.VITE_UI_TYPE !== 'UI2-A'

        const addChlGroup = () => {
            ctx.emit('toolBarEvent', {
                type: 'addChlGroup',
                data: undefined,
            })
        }

        return {
            addChlGroup,
            isAddGroupBtn,
        }
    },
})
</script>
