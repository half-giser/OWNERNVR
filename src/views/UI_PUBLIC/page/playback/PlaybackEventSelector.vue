<!--
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2025-05-17 15:38:38
 * @Description: 大回放/按事件搜索备份 - 属性选择器
-->
<template>
    <div>
        <div
            v-if="layout === 'selector'"
            class="selector text-ellipsis"
            :title="content"
            readonly
            @click="pageData.isPop = true"
        >
            {{ content }}
        </div>
        <div
            v-else
            class="filter"
        >
            <span class="filter-title">{{ Translate('IDCS_EVENT_FILTER') }}</span>
            <BaseImgSpriteBtn
                file="filterBtn"
                :scale="0.7"
                :index="[0, 2, 2, 3]"
                @click="pageData.isPop = true"
            />
            <div
                class="text-ellipsis"
                :title="content"
            >
                ({{ content }})
            </div>
        </div>

        <el-dialog
            v-model="pageData.isPop"
            width="1100"
            :title="Translate('IDCS_EVENT_FILTER')"
            @open="open"
        >
            <el-scrollbar :height="550">
                <div
                    v-for="item1 in options"
                    :key="item1.eventTitle"
                >
                    <div class="title">{{ item1.eventTitle }}</div>
                    <div class="btn-box">
                        <div
                            v-for="item2 in item1.eventList"
                            :key="item2.value"
                            v-title
                            class="btn text-ellipsis"
                            :class="{
                                active: pageData.selectedRecTypeList.includes(item2.value),
                            }"
                            @click="change(item2.value)"
                        >
                            {{ Translate(item2.label) }}
                        </div>
                    </div>
                </div>
            </el-scrollbar>
            <div class="base-btn-box">
                <el-button @click="reset">{{ Translate('IDCS_RESET') }}</el-button>
                <el-button @click="chooseAll">{{ Translate('IDCS_ALL') }}</el-button>
                <el-button @click="confirm">{{ Translate('IDCS_OK') }}</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script lang="ts" src="./PlaybackEventSelector.v.ts"></script>

<style lang="scss" scoped>
.selector {
    border: 1px solid var(--input-border);
    width: 155px;
    height: 20px;
    cursor: pointer;
    box-sizing: border-box;
    padding: 0 5px;
    line-height: 18px;

    &:hover {
        border-color: var(--primary);
    }
}

.filter {
    width: 100%;
    border: 1px solid var(--content-border);
    padding: 5px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    font-size: 14px;

    &-title {
        flex-shrink: 0;
    }

    .Sprite {
        flex-shrink: 0;
    }

    div {
        width: 100%;
    }
}

.title {
    font-size: 18px;
    font-weight: bold;
    padding: 0 10px;
    margin: 15px 0;
}

.sub-box {
    padding-left: 15px;
    width: 100%;
    box-sizing: border-box;
}

.sub-title {
    font-size: 18px;
    font-weight: bold;
    margin: 15px 0;
}

.tri-box {
    display: flex;
    width: 100%;
}

.label {
    width: 200px;
    flex-shrink: 0;
    line-height: 40px;

    &::after {
        content: ' : ';
    }
}

.btn-box {
    display: flex;
    flex-wrap: wrap;
}

.btn {
    width: 100px;
    height: 24px;
    line-height: 24px;
    cursor: pointer;
    margin: 5px 10px;
    text-align: center;
    font-size: 12px;
    border: 1px solid var(--input-border);
    user-select: none;
    box-sizing: border-box;
    padding: 0 3px;

    &.active {
        border-color: var(--primary);
        color: var(--primary);
    }
}
</style>
