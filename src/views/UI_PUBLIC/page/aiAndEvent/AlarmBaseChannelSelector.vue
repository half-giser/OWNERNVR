<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-11-28 12:02:37
 * @Description: AI - 通道选择器
-->
<template>
    <el-form
        v-title
        :style="{
            '--form-label-width': '180px',
        }"
    >
        <el-form-item :label="Translate('IDCS_CHANNEL_NAME')">
            <el-popover
                v-model:visible="pageData.isPop"
                width="430"
                popper-class="no-padding"
            >
                <template #reference>
                    <div class="alarm-chl">
                        <div class="text-ellipsis">{{ content }}</div>
                        <BaseImgSprite
                            file="arrow"
                            :chunk="4"
                        />
                    </div>
                </template>
                <el-scrollbar :max-height="height">
                    <div class="alarm-chl-list">
                        <div
                            v-for="item in list"
                            :key="item.id"
                            v-title
                            class="alarm-chl-item"
                            :class="{
                                active: item.id === modelValue,
                            }"
                            @click="change(item.id)"
                        >
                            {{ item.name }}
                        </div>
                    </div>
                </el-scrollbar>
            </el-popover>
        </el-form-item>
    </el-form>
</template>

<script lang="ts" src="./AlarmBaseChannelSelector.v.ts"></script>

<style lang="scss" scoped>
.alarm-chl {
    width: 430px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    display: flex;
    margin-bottom: 10px;
    align-items: center;
    border: 1px solid var(--input-border);
    font-size: 12px;
    box-sizing: border-box;
    padding: 0 5px;
    cursor: pointer;
    transition: border-color 0.2s;

    div {
        width: 100%;
    }

    span {
        flex-shrink: 0;
    }

    &:hover {
        border-color: var(--primary);
    }

    &-list {
        width: 100%;
        flex-wrap: wrap;
        display: flex;
        justify-content: flex-start;
        align-items: flex-start;
        box-sizing: border-box;
        padding: 10px 0;
        background-color: var(--main-bg);
    }

    &-item {
        width: 120px;
        height: 30px;
        line-height: 30px;
        text-align: center;
        margin: 5px 10px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        cursor: pointer;
        border: 1px solid var(--content-border);

        &.active,
        &:hover {
            background-color: var(--primary);
            color: var(--main-text-active);
        }
    }
}
</style>
