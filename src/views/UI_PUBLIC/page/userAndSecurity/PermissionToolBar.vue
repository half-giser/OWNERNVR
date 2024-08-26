<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-17 20:19:12
 * @Description: 权限列表板块右上方工具栏
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-23 14:06:24
-->
<template>
    <BaseImgSprite
        file="toolbar_add"
        class="toolBarBtn"
        @click="add"
    />
</template>

<script lang="ts">
export default defineComponent({
    emits: ['toolBarEvent'],
    setup() {
        const router = useRouter()

        const add = () => {
            router.push({
                path: '/config/security/auth_group/add',
            })
        }
        return { add }
    },
})
</script>

<style lang="scss" scoped>
.toolBarBtn {
    background-color: var(--bg-color2);
    margin-left: 5px;

    &:hover {
        background-color: var(--bg-color3);
    }
}
</style>
