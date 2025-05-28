<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-21 14:26:30
 * @Description: 系统板块右上方工具栏
-->
<template>
    <div>
        <el-button @click="refresh">{{ Translate('IDCS_REFRESH') }}</el-button>
    </div>
</template>

<script lang="ts">
export default defineComponent({
    emits: {
        toolBarEvent(data: ConfigToolBarEvent<undefined>) {
            return !!data
        },
    },

    setup(_props, ctx) {
        const refresh = () => {
            ctx.emit('toolBarEvent', {
                type: 'refresh',
                data: undefined,
            })
        }

        return {
            refresh,
        }
    },
})
</script>
