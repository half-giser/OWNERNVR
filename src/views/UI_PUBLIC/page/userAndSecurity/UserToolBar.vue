<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-05-07 19:40:23
 * @Description: 用户板块右上方工具栏
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-23 14:05:05
-->
<template>
    <el-input
        v-model="msg"
        class="toolBarText"
        :placeholder="Translate('IDCS_SEARCH_USER')"
    ></el-input>
    <BaseImgSprite
        file="toolbar_search"
        class="toolBarBtn"
        @click="search"
    />
    <BaseImgSprite
        file="toolbar_add"
        class="toolBarBtn"
        @click="add"
    />
</template>

<script lang="ts">
export default defineComponent({
    emits: ['toolBarEvent'],
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

<style lang="scss" scoped>
.toolBarText {
    width: 200px;
    height: 23px;
    margin-right: 5px;

    :deep(.el-input__inner) {
        height: 23px;
    }
}

.toolBarBtn {
    background-color: var(--bg-color2);
    margin-left: 5px;

    &:hover {
        background-color: var(--bg-color3);
    }
}
</style>
