<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-21 14:26:30
 * @Description: 系统板块右上方工具栏
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-06-21 15:05:10
-->
<template>
    <div>
        <el-button
            size="small"
            @click="refresh"
            >{{ Translate('IDCS_REFRESH') }}</el-button
        >
    </div>
</template>

<script lang="ts">
export default defineComponent({
    emits: ['toolBarEvent'],
    setup(_props, ctx) {
        const refresh = () => {
            ctx.emit('toolBarEvent', {
                type: 'refresh',
                data: {},
            })
        }

        return { refresh }
    },
})
</script>
