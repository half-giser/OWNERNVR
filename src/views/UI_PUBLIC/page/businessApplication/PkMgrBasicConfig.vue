<!--
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-05-10 16:49:13
 * @Description: 业务应用-停车场管理-基础配置
-->

<template>
    <el-form
        id="PkMgrBasicConfigView"
        ref="pkMgrFormRef"
        :rules="rules"
        :model="pageData"
        :hide-required-asterisk="true"
        label-width="170"
        label-position="left"
    >
        <div class="parkLimitTip">{{ Translate('IDCS_PARKING_LOT_MANAGE_TIPS').formatForLang(1) }}</div>
        <div class="title">
            <div class="lineIcon"></div>
            <div class="titleText">{{ Translate('IDCS_PARKING_LOT_NAME') }}</div>
        </div>
        <el-form-item prop="parkName">
            <template #label>
                <el-text
                    class="label"
                    :title="Translate('IDCS_NAME')"
                    truncated
                >
                    {{ Translate('IDCS_NAME') }}
                </el-text>
            </template>
            <el-input
                v-model="pageData.parkName"
                maxlength="256"
            />
        </el-form-item>

        <div class="title">
            <div class="lineIcon"></div>
            <div class="titleText">{{ Translate('IDCS_VEHICLE_NUM') }}</div>
            <div class="titleTip">{{ Translate('IDCS_VEHICLE_NUM_TIPS') }}</div>
        </div>
        <el-form-item prop="totalNum">
            <template #label>
                <el-text
                    class="label"
                    :title="Translate('IDCS_TOTAL_VEHICLE_NUM')"
                    truncated
                >
                    {{ Translate('IDCS_TOTAL_VEHICLE_NUM') }}
                </el-text>
            </template>
            <el-input
                v-model.number="pageData.totalNum"
                v-numericalRange:[pageData].totalNum="[1, 10000]"
            />
        </el-form-item>
        <el-form-item prop="remainTotalNum">
            <template #label>
                <el-text
                    class="label"
                    :title="Translate('IDCS_REMAIN_VEHICLE_NUM')"
                    truncated
                >
                    {{ Translate('IDCS_REMAIN_VEHICLE_NUM') }}
                </el-text>
            </template>
            <el-input
                v-model.number="pageData.remainTotalNum"
                v-numericalRange:[pageData].remainTotalNum="[0, 10000]"
            />
        </el-form-item>

        <el-form-item>
            <el-button
                type="primary"
                @click="apply(pkMgrFormRef)"
            >
                {{ Translate('IDCS_APPLY') }}
            </el-button>
        </el-form-item>
    </el-form>
</template>

<script lang="ts" src="./PkMgrBasicConfig.v.ts"></script>

<style lang="scss" scoped>
#PkMgrBasicConfigView {
    display: flex;
    flex-direction: column;
    .parkLimitTip {
        margin: 10px 0 20px 10px;
        font-size: 14px;
    }
    .title {
        margin: 0 0 20px 30px;
        display: flex;
        align-items: center;
        .lineIcon {
            width: 5px;
            height: 23px;
            border-left: 2px solid var(--text-dark);
        }
        .titleText {
            color: var(--text-dark);
            font-size: 16px;
            font-weight: bold;
            margin-left: 4px;
        }
        .titleTip {
            color: var(--text-menu-03);
            font-size: 14px;
            margin-left: 40px;
        }
    }
    :deep(.el-form-item) {
        width: 520px;
        margin-left: 30px;
        align-items: center;
        .el-form-item__label {
            color: var(--text-dark);
            font-size: 15px;
        }
        .el-form-item__content {
            margin-left: 30px;
            justify-content: flex-end;
        }
    }
}
</style>
