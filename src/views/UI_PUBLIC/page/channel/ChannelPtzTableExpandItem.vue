<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-22 09:23:51
 * @Description: 云台 表格展开通用列表项
-->
<template>
    <div class="expand-item">
        <BaseImgSprite
            v-if="file"
            :file="file"
        />
        <span class="text-ellipsis">{{ text }}</span>
        <BaseImgSprite
            file="delItem"
            class="expand-del"
            @click="$emit('delete')"
        />
    </div>
</template>

<script lang="ts" src="./ChannelPtzTableExpandItem.v.ts"></script>

<style lang="scss" scoped>
.expand-item {
    display: flex;
    width: 200px;
    padding-bottom: 15px;
    text-align: left;
    align-items: center;

    &:hover {
        .expand-del {
            opacity: 1;
        }
    }

    .Icon {
        flex-shrink: 0;
    }
}

.expand-del {
    opacity: 0;
    cursor: pointer;
    margin-left: 5px;
}
</style>
