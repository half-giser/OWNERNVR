!
<template>
    <div>停车场</div>
    <button @click.prevent="goBack">返回</button>
</template>

<script lang="ts">
import { useRouter } from 'vue-router'
export default defineComponent({
    setup() {
        const router = useRouter()

        console.log('router', router.getRoutes())

        const goBack = function () {
            router.back()
        }
        return { goBack }
    },
})
</script>

<style lang="scss" scoped></style>
