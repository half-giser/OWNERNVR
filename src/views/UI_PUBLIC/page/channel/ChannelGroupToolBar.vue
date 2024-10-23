<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-05-07 19:40:23
 * @Description:
-->
<template>
    <el-button
        v-if="isAddGroupBtn"
        id="btnAdd"
        @click="addChlGroup"
        >{{ Translate('IDCS_ADD_GROUP') }}</el-button
    >
    <BaseImgSprite
        v-else
        file="toolbar_add"
        class="toolBarBtn"
        @click="addChlGroup"
    />
</template>

<script lang="ts">
export default defineComponent({
    emits: ['toolBarEvent'],
    setup(_props, ctx) {
        const isAddGroupBtn = import.meta.env.VITE_UI_TYPE !== 'UI2-A'

        const addChlGroup = () => {
            ctx.emit('toolBarEvent', {
                type: 'addChlGroup',
            })
        }

        return { addChlGroup, isAddGroupBtn }
    },
})
</script>

<style lang="scss" scoped>
.toolBarText {
    width: 200px;
    height: 23px;
    margin-right: 5px;

    :deep(.el-input__inner) {
        height: 23px;
    }
}

#btnAdd {
    height: 25px;
}

.toolBarBtn {
    background-color: var(--btn-bg);
    cursor: pointer;

    &:hover {
        background-color: var(--btn-bg-hover);
    }
}
</style>
