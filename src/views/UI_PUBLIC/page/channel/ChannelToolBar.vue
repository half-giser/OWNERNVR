<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-05-05 09:57:16
 * @Description: 通道板块右上方工具栏
-->
<template>
    <el-input
        v-model="msg"
        size="small"
        class="base-toolbar-input"
        :placeholder="Translate('IDCS_SEARCH_CHANNEL')"
        @keydown.enter="search"
    />
    <BaseImgSprite
        file="toolbar_search"
        class="base-toolbar-btn"
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
    emits: {
        toolBarEvent(data: ConfigToolBarEvent<SearchToolBarEvent | undefined>) {
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

        const addChl = () => {
            ctx.emit('toolBarEvent', {
                type: 'addChl',
                data: undefined,
            })
        }

        return {
            msg,
            search,
            addChl,
        }
    },
})
</script>
