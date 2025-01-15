<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-07-29 14:15:40
 * @Description: 自动模式通道码流参数配置
-->
<template>
    <el-dialog
        width="1270"
        :title="pageData.mainTitle"
        destroy-on-close
        @open="open"
        @close="$emit('close', false)"
    >
        <el-menu
            v-show="pageData.tabs.length > 1"
            :default-active="pageData.tabs.length > 0 ? pageData.tabs[0].value : ''"
            mode="horizontal"
            @select="changeTab"
        >
            <el-menu-item
                v-for="item in pageData.tabs"
                :key="item.value"
                :index="item.value"
            >
                {{ item.label }}
            </el-menu-item>
        </el-menu>
        <RecordBaseStreamTable
            ref="recordStreamTableRef"
            v-model="pageData.initComplete"
            :mode="pageData.currenMode"
            :pop="true"
            :initkey="autoModeId"
            class="streamTable"
            @bandwidth="getBandwidth"
            @rec-time="getRecTime"
        />
        <div class="base-btn-box space-between">
            <div>
                <span class="row_bandwidth">{{ pageData.txtBandwidth }}</span>
                <span class="detailBtn"></span>
                <span
                    v-if="pageData.isPredict"
                    class="txRecTime"
                    >{{ pageData.recTime }}</span
                >
                <el-button
                    v-if="pageData.isCalculate"
                    class="btnActivate"
                    @click="handleCalculate"
                >
                    {{ Translate('IDCS_CALCULATE') }}
                </el-button>
            </div>
            <div>
                <el-button @click="setData">{{ Translate('IDCS_OK') }}</el-button>
                <el-button @click.prevent="$emit('close', false)">{{ Translate('IDCS_CANCEL') }}</el-button>
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./RecordModeStreamPop.v"></script>

<style lang="scss" scoped>
.el-menu {
    border: 1px solid var(--table-border);

    --el-menu-horizontal-height: 30px;
}

.el-menu--horizontal > .el-menu-item {
    color: var(--main-text);

    &.is-active {
        background-color: var(--primary);
        color: var(--main-text-active) !important;
    }

    &:hover {
        color: var(--primary);
        background-color: var(--primary-light);
    }
}

.streamTable {
    max-height: 500px;
    overflow: auto;
}

.bottom_row {
    margin-top: 10px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
}

.btnActivate {
    margin-left: 20px;
}

.row_bandwidth {
    margin-top: 10px;
}
</style>
