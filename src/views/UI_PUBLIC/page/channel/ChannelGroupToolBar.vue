<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-05-07 19:40:23
 * @Description:
-->
<template>
    <el-button
        v-if="uiName !== 'UI2-A'"
        id="btnAdd"
        @click="addChlGroup"
        >{{ Translate('IDCS_ADD_GROUP') }}</el-button
    >
    <BaseImgSprite
        v-else
        file="toolbar_add"
        class="toolBarBtn"
        @click="addChlGroup"
    />
</template>

<script lang="ts">
import BaseImgSprite from '../../components/sprite/BaseImgSprite.vue'

export default defineComponent({
    components: { BaseImgSprite },
    emits: ['toolBarEvent'],
    setup(_props, ctx) {
        const { name: uiName } = getUiAndTheme()
        const addChlGroup = function () {
            ctx.emit('toolBarEvent', {
                type: 'addChlGroup',
            })
        }
        return { addChlGroup, uiName }
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

#btnAdd {
    height: 25px;
}

.toolBarBtn {
    background-color: var(--bg-color2);
    cursor: pointer;

    &:hover {
        background-color: var(--bg-color3);
    }
}
</style>
