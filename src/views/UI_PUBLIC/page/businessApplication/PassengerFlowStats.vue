<!--
 * @Date: 2025-05-08 14:59:35
 * @Description: 客流量 人数统计
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <div class="stats">
        <el-form
            v-title
            class="stripe"
        >
            <div class="base-business-subheading">
                {{ Translate('IDCS_PEOPLE_COUNT_DETECTION') }}
            </div>
            <el-form-item :label="Translate('IDCS_PEOPLE_ENTER_NUMBER')">
                {{ formData.personIn }}
            </el-form-item>
            <el-form-item :label="Translate('IDCS_PEOPLE_ENTRY_NUMBER')">
                {{ formData.personOut }}
            </el-form-item>
            <el-form-item :label="Translate('IDCS_PEOPLE_STAY_NUMBER')">
                {{ formData.personStay }}
            </el-form-item>
            <div class="base-business-subheading">
                {{ Translate('IDCS_CHILD_COUNT') }}
            </div>
            <el-form-item :label="Translate('IDCS_CHILD_ENTRY_NUMBER')">
                {{ formData.childIn }}
            </el-form-item>
            <el-form-item :label="Translate('IDCS_CHILD_EXIT_NUMBER')">
                {{ formData.childOut }}
            </el-form-item>
            <el-form-item :label="Translate('IDCS_CHILD_STAY_NUMBER')">
                {{ formData.childStay }}
            </el-form-item>
            <div class="base-btn-box flex-start">
                <div>
                    * {{ Translate('IDCS_STATISTICS_START_TIME') }}:<span class="data">{{ formData.startStatisticalTime }}</span>
                </div>
            </div>
            <div class="base-btn-box flex-start">
                <div>
                    * {{ Translate('IDCS_STATISTICAL_CHANNEL') }}:<span class="data">{{ formData.chls }}</span>
                </div>
            </div>
        </el-form>
    </div>
</template>

<script lang="ts" src="./PassengerFlowStats.v.ts"></script>

<style lang="scss" scoped>
.stats {
    padding: 25px 20px;
    font-size: 13px;

    .data {
        padding-left: 5px;
    }
}
</style>
