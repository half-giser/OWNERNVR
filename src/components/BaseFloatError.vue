<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-07-12 16:58:29
 * @Description:
-->
<template>
    <teleport :to="container || 'body'">
        <div
            v-if="visiable"
            class="tip_wrap"
            :style="{ 'border-color': index === 1 ? 'var(--float-ok)' : 'var(--float-error)' }"
            @click="handleClick"
        >
            <BaseImgSprite
                file="floatTip"
                :chunk="5"
                :index="index"
            />
            <span
                class="tip_msg"
                :style="{ color: index === 1 ? 'var(--float-ok)' : 'var(--float-error)' }"
            >
                {{ msg }}
            </span>
        </div>
    </teleport>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue'
import BaseImgSprite from '@/components/sprite/BaseImgSprite.vue'

export default defineComponent({
    components: { BaseImgSprite },
    setup() {
        const container = ref('')
        const visiable = ref(false)
        const index = ref(0)
        const msg = ref('')
        const typeIndexMap = {
            ok: 1,
            error: 2,
        }
        let timer: NodeJS.Timeout | number = 0

        const show = ($container: string, message: string, type?: 'ok' | 'error') => {
            clearTimer()
            container.value = $container
            msg.value = message
            index.value = typeIndexMap[type || 'error']
            visiable.value = true
            timer = setTimeout(() => {
                visiable.value = false
            }, 5000)
        }

        const clearTimer = () => {
            if (timer) clearTimeout(timer)
        }

        const handleClick = () => {
            clearTimer()
            visiable.value = false
        }

        return {
            container,
            visiable,
            index,
            msg,
            show,
            handleClick,
        }
    },
})
</script>

<style lang="scss" scoped>
.tip_wrap {
    display: flex;
    align-items: center;
    font-size: 12px;
    padding: 3px 5px 3px 3px;
    border: 1px solid;
    white-space: nowrap;
    position: relative;

    .tip_msg {
        margin-left: 3px;
    }
}
</style>
