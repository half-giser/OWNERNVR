<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-22 09:21:40
 * @Description: 云台界面表格展开的通道布局
-->
<template>
    <div class="expand">
        <slot></slot>
        <BaseImgSprite
            class="expand-add"
            file="addItem"
            :hover-index="0"
            :chunk="2"
            @click="$emit('add')"
        />
    </div>
</template>

<script lang="ts" src="./ChannelPtzTableExpandPanel.v.ts"></script>

<style lang="scss" scoped>
.expand {
    display: flex;
    flex-wrap: wrap;
    padding: 15px;

    &-add {
        cursor: pointer;
    }
}
</style>
