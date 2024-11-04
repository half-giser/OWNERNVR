<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-05-05 09:57:16
 * @Description: 通道-云台-协议 右上方工具栏
-->
<template>
    <el-input
        v-model="msg"
        class="base-toolbar-input"
        :placeholder="Translate('IDCS_SEARCH_CHANNEL')"
        @keydown.enter="search"
    />
    <BaseImgSprite
        file="toolbar_search"
        class="base-toolbar-btn"
        @click="search"
    />
</template>

<script lang="ts">
export default defineComponent({
    emits: {
        toolBarEvent(data: ConfigToolBarEvent<SearchToolBarEvent>) {
            return !!data
        },
    },

    setup(_props, ctx) {
        const msg = ref('')

        const search = () => {
            ctx.emit('toolBarEvent', {
                type: 'search',
                data: {
                    searchText: msg.value,
                },
            })
        }

        return {
            msg,
            search,
        }
    },
})
</script>
