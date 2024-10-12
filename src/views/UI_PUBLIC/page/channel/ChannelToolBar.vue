<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-05-05 09:57:16
 * @Description: 通道板块右上方工具栏
-->
<template>
    <el-input
        v-model="msg"
        size="small"
        class="toolBarText"
        :placeholder="Translate('IDCS_SEARCH_CHANNEL')"
        @keydown.enter="search"
    />
    <BaseImgSprite
        file="toolbar_search"
        class="toolBarBtn"
        @click="search"
    />
    <el-button
        size="small"
        @click="addChl"
        >{{ Translate('IDCS_ADD_CHANNEL') }}</el-button
    >
</template>

<script lang="ts">
export default defineComponent({
    emits: ['toolBarEvent'],
    setup(_props, ctx) {
        const msg = ref('')
        const search = function () {
            ctx.emit('toolBarEvent', {
                type: 'search',
                data: {
                    searchText: msg.value,
                },
            })
        }
        const addChl = function () {
            ctx.emit('toolBarEvent', {
                type: 'addChl',
            })
        }
        return { msg, search, addChl }
    },
})
</script>

<style lang="scss" scoped>
.toolBarText {
    width: 200px;
    margin-right: 5px;
}

.toolBarBtn {
    background-color: var(--btn-bg);
    margin-right: 5px;
    cursor: pointer;

    &:hover {
        background-color: var(--btn-bg-hover);
    }
}
</style>
