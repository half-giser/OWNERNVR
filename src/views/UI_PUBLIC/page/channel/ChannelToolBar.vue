<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-05-05 09:57:16
 * @Description:
-->
<template>
    <el-input
        v-model="msg"
        class="toolBarText"
        :placeholder="Translate('IDCS_SEARCH_CHANNEL')"
        @keydown.enter="search"
    />
    <BaseImgSprite
        file="toolbar_search"
        class="toolBarBtn"
        @click="search"
    />
    <el-button
        id="btnAddChl"
        @click="addChl"
        >{{ Translate('IDCS_ADD_CHANNEL') }}</el-button
    >
</template>

<script lang="ts">
import BaseImgSprite from '../../components/sprite/BaseImgSprite.vue'

export default defineComponent({
    components: { BaseImgSprite },
    emits: ['toolBarEvent'],
    setup(_props, ctx) {
        const msg = ref('')
        const search = function () {
            ctx.emit('toolBarEvent', {
                type: 'search',
                data: {
                    searchText: msg.value,
                },
            })
        }
        const addChl = function () {
            ctx.emit('toolBarEvent', {
                type: 'addChl',
            })
        }
        return { msg, search, addChl }
    },
})
</script>

<style lang="scss" scoped>
#btnAddChl {
    margin-left: 20px;
    height: 25px;
}

.toolBarBtn {
    background-color: var(--bg-color2);
    margin-left: 5px;
    cursor: pointer;

    &:hover {
        background-color: var(--bg-color3);
    }
}
</style>
