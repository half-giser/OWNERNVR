<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-05-07 19:40:23
 * @Description: 用户板块右上方工具栏
-->
<template>
    <el-input
        v-model="msg"
        class="base-toolbar-input"
        :placeholder="Translate('IDCS_SEARCH_USER')"
    />
    <BaseImgSprite
        file="toolbar_search"
        class="base-toolbar-btn"
        @click="search"
    />
    <BaseImgSprite
        file="toolbar_add"
        class="base-toolbar-btn"
        @click="add"
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

        const router = useRouter()

        const search = () => {
            ctx.emit('toolBarEvent', {
                type: 'search',
                data: {
                    searchText: msg.value,
                },
            })
        }

        const add = () => {
            router.push({
                path: '/config/security/user/add',
            })
        }

        return {
            msg,
            search,
            add,
        }
    },
})
</script>
