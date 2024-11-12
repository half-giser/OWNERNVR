<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-17 20:19:12
 * @Description: 权限列表板块右上方工具栏
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
    setup() {
        const router = useRouter()

        const add = () => {
            router.push({
                path: '/config/security/auth_group/add',
            })
        }

        return {
            add,
        }
    },
})
</script>
