<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-05-05 09:57:16
 * @Description: 通道板块右上方工具栏
-->
<template>
    <el-input
        v-model="msg"
        class="base-toolbar-input"
        :placeholder="Translate('IDCS_SEARCH_CHANNEL')"
        @keyup.enter="search"
    />
    <BaseImgSprite
        file="toolbar_search"
        class="base-toolbar-btn"
        :title="Translate('IDCS_SEARCH_CHANNEL')"
        @click="search"
    />
    <el-button
        v-if="isAddGroupBtn"
        @click="addChl"
    >
        {{ Translate('IDCS_ADD_CHANNEL') }}
    </el-button>
    <BaseImgSprite
        v-else
        file="toolbar_add"
        class="base-toolbar-btn"
        :title="Translate('IDCS_ADD_CHANNEL')"
        @click="addChl"
    />
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

        const isAddGroupBtn = import.meta.env.VITE_UI_TYPE !== 'UI2-A'

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
            isAddGroupBtn,
        }
    },
})
</script>
