<!--
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-05-10 16:49:13
 * @Description: 业务应用-停车场管理-基础配置
-->

<template>
    <div class="manage">
        <el-form
            ref="pkMgrFormRef"
            :rules="rules"
            :model="pageData"
            label-position="left"
            hide-required-asterisk
            :style="{
                '--form-input-width': '300px',
                '--form-label-width': '200px',
            }"
            class="inline-message"
        >
            <div class="limit">{{ Translate('IDCS_PARKING_LOT_MANAGE_TIPS').formatForLang(1) }}</div>
            <div class="title">{{ Translate('IDCS_PARKING_LOT_NAME') }}</div>
            <el-form-item
                prop="parkName"
                :label="Translate('IDCS_NAME')"
            >
                <el-input
                    v-model="pageData.parkName"
                    maxlength="256"
                />
            </el-form-item>

            <div class="title">
                <span>{{ Translate('IDCS_VEHICLE_NUM') }}</span>
                <span class="title-tip">{{ Translate('IDCS_VEHICLE_NUM_TIPS') }}</span>
            </div>
            <el-form-item
                prop="totalNum"
                :label="Translate('IDCS_TOTAL_VEHICLE_NUM')"
            >
                <el-input-number
                    v-model="pageData.totalNum"
                    :min="1"
                    :max="10000"
                    value-on-clear="min"
                    :controls="false"
                />
            </el-form-item>
            <el-form-item
                prop="remainTotalNum"
                :label="Translate('IDCS_REMAIN_VEHICLE_NUM')"
            >
                <el-input-number
                    v-model="pageData.remainTotalNum"
                    :min="0"
                    :max="10000"
                    value-on-clear="min"
                    :controls="false"
                />
            </el-form-item>
            <div class="base-btn-box">
                <el-button @click="apply()">{{ Translate('IDCS_APPLY') }}</el-button>
            </div>
        </el-form>
    </div>
</template>

<script lang="ts" src="./PkMgrBasicConfig.v.ts"></script>

<style lang="scss" scoped>
.manage {
    padding: 25px 20px;
}

.limit {
    margin: 10px 0 20px 10px;
    font-size: 14px;
}

.title {
    margin: 10px 0 10px;
    display: flex;
    align-items: center;
    height: 23px;
    border-left: 2px solid var(--main-text);
    color: var(--main-text);
    font-size: 16px;
    font-weight: bold;
    padding-left: 10px;

    &-tip {
        color: var(--main-text-light);
        font-size: 14px;
        margin-left: 40px;
        font-weight: normal;
    }

    & > span:first-child {
        flex-shrink: 0;
    }
}
</style>
