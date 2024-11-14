<!--
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-10-25 18:38:09
 * @Description: 平台操作管理
-->
<template>
    <div class="type">
        <el-form
            :style="{
                '--form-label-width': '150px',
                '--form-input-width': '200px',
            }"
        >
            <el-form-item :label="Translate('IDCS_USER_TYPE')">
                <el-select
                    v-model="formData.userType"
                    @change="changeUserType"
                >
                    <el-option
                        v-for="item in pageData.userTypeList"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label"
                    />
                </el-select>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_OPERATE_TYPE')">
                <el-select
                    v-model="formData.operationType"
                    @change="changeOperationType"
                >
                    <el-option
                        v-for="item in pageData.operationTypeList"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label"
                    />
                </el-select>
            </el-form-item>
        </el-form>
    </div>
    <div
        class="wrap"
        :style="{
            '--form-input-width': '200px',
        }"
    >
        <!-- 测试抓图/维护抓图/验收抓图 -->
        <div
            v-show="formData.operationType === 'testScreenshot' || formData.operationType === 'maintenanceScreenshot' || formData.operationType === 'acceptScreenshot'"
            class="screenshot"
        >
            <el-form>
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
                :height="formData.operationType === 'acceptScreenshot' ? 360 : 400"
                border
                stripe
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
                />
            </el-table>
            <el-form v-show="formData.operationType === 'acceptScreenshot'">
                <el-form-item :label="Translate('IDCS_ACCEPTANCE_ALARM')">
                    <el-input
                        v-model="formData.alarmNum"
                        maxlength="20"
                    />
                </el-form-item>
            </el-form>
        </div>
        <!-- 故障报修 -->
        <el-form v-show="formData.operationType === 'faultRepair'">
            <el-form-item :label="Translate('IDCS_OPERATE_FAULT_TYPE')">
                <el-select v-model="formData.faultType">
                    <el-option
                        v-for="item in pageData.faultTypeList"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label"
                    />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-checkbox-group
                    v-model="formData.chooseFaultType"
                    @change="refreshUploadBtnStatus"
                >
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
        <el-form v-show="formData.operationType === 'maintenanceSign'">
            <el-form-item :label="Translate('IDCS_MAINTENSIGN_ITEM')">
                <el-select v-model="formData.maintenance">
                    <el-option
                        v-for="item in pageData.maintenanceList"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label"
                    />
                </el-select>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_MAINTENSIGN_ITEMCHOOSE')" />
            <el-form-item>
                <el-checkbox-group
                    v-model="formData.chooseMaintenanceType"
                    @change="refreshUploadBtnStatus"
                >
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
        <el-form v-show="formData.operationType === 'repairSign'">
            <el-form-item :label="Translate('IDCS_MAINTENSIGN_ITEMCHOOSE')" />
            <el-form-item>
                <el-checkbox-group
                    v-model="formData.chooseRepairType"
                    @change="refreshUploadBtnStatus"
                >
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
                <el-select v-model="formData.repair">
                    <el-option
                        v-for="item in pageData.repairList"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label"
                    />
                </el-select>
            </el-form-item>
        </el-form>
    </div>
    <div
        class="base-btn-box"
        :style="{ '--form-input-width': '665px' }"
    >
        <el-button
            :disabled="pageData.uploadDisabled"
            @click="uploadData"
            >{{ Translate('IDCS_PLATFORM_OPERATE_UPLOAD') }}</el-button
        >
        <el-button @click="handleReturn">{{ Translate('IDCS_PLATFORM_OPERATE_RETURN') }}</el-button>
    </div>
</template>

<script lang="ts" src="./PlatformOperation.v.ts"></script>

<style lang="scss" scoped>
.type {
    width: 800px;
    padding: 15px;
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

    :deep(.el-checkbox) {
        margin-left: 0 !important;
    }
}

.bottom {
    width: 860px;
}
</style>
