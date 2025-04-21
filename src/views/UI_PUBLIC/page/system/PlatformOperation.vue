<!--
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-10-25 18:38:09
 * @Description: 平台操作管理
-->
<template>
    <div class="type">
        <el-form
            v-title
            class="stripe"
        >
            <el-form-item :label="Translate('IDCS_USER_TYPE')">
                <el-select-v2
                    v-model="formData.userType"
                    :options="pageData.userTypeList"
                    @change="changeUserType"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_OPERATE_TYPE')">
                <el-select-v2
                    v-model="formData.operationType"
                    :options="pageData.operationTypeList"
                    @change="changeOperationType"
                />
            </el-form-item>
        </el-form>
    </div>
    <div class="wrap">
        <!-- 测试抓图/维护抓图/验收抓图 -->
        <div
            v-show="formData.operationType === 'testScreenshot' || formData.operationType === 'maintenanceScreenshot' || formData.operationType === 'acceptScreenshot'"
            class="screenshot"
        >
            <el-form
                v-title
                class="no-padding"
            >
                <el-form-item :label="Translate('IDCS_MAINTEN_SNAPCHOOSE')">
                    <el-checkbox
                        v-model="pageData.selectAll"
                        :label="Translate('IDCS_SELECT_ALL')"
                        @change="selectAll"
                    />
                    <el-checkbox
                        v-model="pageData.reverseSelect"
                        :label="Translate('IDCS_REVERSE_SELECT')"
                        @change="reverseSelection"
                    />
                </el-form-item>
            </el-form>
            <el-table
                ref="tableRef"
                v-title
                :height="formData.operationType === 'acceptScreenshot' ? 360 : 400"
                :data="tableData"
                highlight-current-row
                @row-click="handleRowClick"
                @select="handleSelect"
                @select-all="selectAllChl"
            >
                <el-table-column
                    type="selection"
                    width="80"
                />
                <el-table-column
                    prop="chlNum"
                    :label="Translate('IDCS_CHANNEL_NUMBER')"
                    width="100"
                />
                <el-table-column
                    prop="name"
                    :label="Translate('IDCS_CHANNEL_NAME')"
                    width="620"
                    show-overflow-tooltip
                />
            </el-table>
            <el-form
                v-show="formData.operationType === 'acceptScreenshot'"
                v-title
                class="no-padding"
            >
                <el-form-item :label="Translate('IDCS_ACCEPTANCE_ALARM')">
                    <el-input
                        v-model="formData.alarmNum"
                        maxlength="20"
                    />
                </el-form-item>
            </el-form>
        </div>
        <!-- 故障报修 -->
        <el-form
            v-show="formData.operationType === 'faultRepair'"
            class="no-padding"
        >
            <el-form-item :label="Translate('IDCS_OPERATE_FAULT_TYPE')">
                <el-select-v2
                    v-model="formData.faultType"
                    :options="pageData.faultTypeList"
                />
            </el-form-item>
            <el-form-item>
                <el-checkbox-group v-model="formData.chooseFaultType">
                    <el-checkbox
                        v-for="item in pageData.chooseFaultTypeList"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label"
                    />
                </el-checkbox-group>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_RECORD_DESCRIPTION')" />
            <el-form-item>
                <el-input
                    v-model="formData.faultRecord"
                    maxlength="40"
                    resize="vertical"
                    type="textarea"
                />
            </el-form-item>
        </el-form>
        <!-- 维保签到 -->
        <el-form
            v-show="formData.operationType === 'maintenanceSign'"
            class="no-padding"
        >
            <el-form-item :label="Translate('IDCS_MAINTENSIGN_ITEM')">
                <el-select-v2
                    v-model="formData.maintenance"
                    :options="pageData.maintenanceList"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_MAINTENSIGN_ITEMCHOOSE')" />
            <el-form-item>
                <el-checkbox-group v-model="formData.chooseMaintenanceType">
                    <el-checkbox
                        v-for="item in pageData.chooseMaintenanceTypeList"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label"
                    />
                </el-checkbox-group>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_RECORD_DESCRIPTION')" />
            <el-form-item>
                <el-input
                    v-model="formData.maintenanceRecord"
                    maxlength="40"
                    resize="vertical"
                    type="textarea"
                />
            </el-form-item>
        </el-form>
        <!-- 维修签到 -->
        <el-form
            v-show="formData.operationType === 'repairSign'"
            v-title
            class="no-padding"
        >
            <el-form-item :label="Translate('IDCS_MAINTENSIGN_ITEMCHOOSE')" />
            <el-form-item>
                <el-checkbox-group v-model="formData.chooseRepairType">
                    <el-checkbox
                        v-for="item in pageData.chooseMaintenanceTypeList"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label"
                    />
                </el-checkbox-group>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_RECORD_DESCRIPTION')" />
            <el-form-item>
                <el-input
                    v-model="formData.repairRecord"
                    maxlength="40"
                    resize="vertical"
                    type="textarea"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_REPAIRSIGN_RESULT')">
                <el-select-v2
                    v-model="formData.repair"
                    :options="pageData.repairList"
                />
            </el-form-item>
        </el-form>
    </div>
    <el-form
        :style="{
            '--form-input-width': '665px',
        }"
    >
        <div class="base-btn-box">
            <el-button
                :disabled="uploadDisabled"
                @click="uploadData"
            >
                {{ Translate('IDCS_PLATFORM_OPERATE_UPLOAD') }}
            </el-button>
            <el-button @click="goBack">{{ Translate('IDCS_PLATFORM_OPERATE_RETURN') }}</el-button>
        </div>
    </el-form>
</template>

<script lang="ts" src="./PlatformOperation.v.ts"></script>

<style lang="scss" scoped>
.type {
    width: 830px;
}

.wrap {
    width: 800px;
    height: 470px;
    padding: 15px;
    border: 1px solid var(--content-border);

    :deep(.el-textarea__inner) {
        width: 780px;
        height: 230px;
        max-height: 275px;
    }
}

.bottom {
    width: 860px;
}
</style>
