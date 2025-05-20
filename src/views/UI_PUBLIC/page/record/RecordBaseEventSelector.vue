<!--
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2025-05-17 15:38:38
 * @Description: 大回放/按事件搜索备份 - 属性选择器
-->
<template>
    <el-dialog
        v-model="pageData.isPop"
        width="1100"
        :title="Translate('IDCS_EVENT_FILTER')"
    >
        <el-scrollbar :height="550">
            <div
                v-for="item1 in options"
                v-show="item1.eventList.length > 0"
                :key="item1.eventTitle"
            >
                <div class="title">{{ Translate(item1.eventTitle) }}</div>
                <div class="btn-box">
                    <div
                        v-for="item2 in item1.eventList"
                        :key="item2.value"
                        class="btn"
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
</template>

<script lang="ts" src="./RecordBaseEventSelector.v.ts"></script>

<style lang="scss" scoped>
.title {
    font-size: 18px;
    font-weight: bold;
    padding: 0 10px;
    margin: 15px 0;
    border-left: 5px solid var(--content-border);
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

    &.active {
        border-color: var(--primary);
        color: var(--primary);
    }
}

.el-select {
    width: 102px;
    margin: 5px 10px;
}

:deep(.el-select__wrapper) {
    border-radius: 0;
    font-size: 12px;
    text-align: center;
    height: 26px;
}
</style>
