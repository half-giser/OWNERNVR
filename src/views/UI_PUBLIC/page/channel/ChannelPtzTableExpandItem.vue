<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-22 09:23:51
 * @Description: 云台 表格展开通用列表项
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-22 19:19:35
-->
<template>
    <div class="expand-item">
        <BaseImgSprite
            v-if="file"
            :file="file"
        />
        <span>{{ text }}</span>
        <BaseImgSprite
            file="delItem"
            class="expand-del"
            @click="$emit('delete')"
        />
    </div>
</template>

<script lang="ts">
export default defineComponent({
    props: {
        file: {
            type: String,
            required: false,
        },
        text: {
            type: String,
            default: '',
        },
    },
    emits: {
        delete() {
            return true
        },
    },
})
</script>

<style lang="scss" scoped>
.expand-item {
    width: 200px;
    padding-bottom: 15px;

    &:hover {
        .expand-del {
            opacity: 1;
        }
    }
}

.expand-del {
    opacity: 0;
    cursor: pointer;
    margin-left: 5px;
}
</style>
