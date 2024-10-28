<template>
    <div class="platformOperation_Type">
        <el-form
            class="narrow"
            :style="{
                '--form-label-width': '150px',
                '--form-input-width': '200px',
            }"
        >
            <el-form-item :label="Translate('IDCS_USER_TYPE')">
                <el-select
                    v-model="pageData.userType"
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
                    v-model="pageData.operationType"
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
    <div class="platformOperation_Wrap">
        <!-- 测试抓图/维护抓图/验收抓图 -->
        <div
            v-show="pageData.operationType === 'testScreenshot' || pageData.operationType === 'maintenanceScreenshot' || pageData.operationType === 'acceptScreenshot'"
            class="screenshot"
        >
            <el-form class="narrow">
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
                :height="pageData.operationType === 'acceptScreenshot' ? 360 : 400"
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
                ></el-table-column>
                <el-table-column
                    prop="name"
                    :label="Translate('IDCS_CHANNEL_NAME')"
                    width="620"
                ></el-table-column>
            </el-table>
            <el-form
                v-show="pageData.operationType === 'acceptScreenshot'"
                class="narrow"
                :style="{ '--form-input-width': '200px', marginTop: '20px' }"
            >
                <el-form-item :label="Translate('IDCS_ACCEPTANCE_ALARM')">
                    <el-input
                        v-model="pageData.alarmNum"
                        maxlength="20"
                    ></el-input>
                </el-form-item>
            </el-form>
        </div>
        <!-- 故障报修 -->
        <div
            v-show="pageData.operationType === 'faultRepair'"
            class="screenshot"
        >
            <el-form
                class="narrow"
                :style="{ '--form-input-width': '200px' }"
            >
                <el-form-item :label="Translate('IDCS_OPERATE_FAULT_TYPE')">
                    <el-select v-model="pageData.faultType">
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
                        v-model="pageData.chooseFaultType"
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
                <el-form-item :label="Translate('IDCS_RECORD_DESCRIPTION')"></el-form-item>
                <el-form-item>
                    <el-input
                        v-model="pageData.faultRecord"
                        maxlength="40"
                        resize="vertical"
                        type="textarea"
                    />
                </el-form-item>
            </el-form>
        </div>
        <!-- 维保签到 -->
        <div
            v-show="pageData.operationType === 'maintenanceSign'"
            class="maintenanceSign"
        >
            <el-form
                class="narrow"
                :style="{ '--form-input-width': '200px' }"
            >
                <el-form-item :label="Translate('IDCS_MAINTENSIGN_ITEM')">
                    <el-select v-model="pageData.maintenance">
                        <el-option
                            v-for="item in pageData.maintenanceList"
                            :key="item.value"
                            :value="item.value"
                            :label="item.label"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_MAINTENSIGN_ITEMCHOOSE')"></el-form-item>
                <el-form-item>
                    <el-checkbox-group
                        v-model="pageData.chooseMaintenanceType"
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
                <el-form-item :label="Translate('IDCS_RECORD_DESCRIPTION')"></el-form-item>
                <el-form-item>
                    <el-input
                        v-model="pageData.maintenanceRecord"
                        maxlength="40"
                        resize="vertical"
                        type="textarea"
                    />
                </el-form-item>
            </el-form>
        </div>
        <!-- 维修签到 -->
        <div
            v-show="pageData.operationType === 'repairSign'"
            class="repairSign"
        >
            <el-form
                class="narrow"
                :style="{ '--form-input-width': '200px' }"
            >
                <el-form-item :label="Translate('IDCS_MAINTENSIGN_ITEMCHOOSE')"></el-form-item>
                <el-form-item>
                    <el-checkbox-group
                        v-model="pageData.chooseRepairType"
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
                <el-form-item :label="Translate('IDCS_RECORD_DESCRIPTION')"></el-form-item>
                <el-form-item>
                    <el-input
                        v-model="pageData.repairRecord"
                        maxlength="40"
                        resize="vertical"
                        type="textarea"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_REPAIRSIGN_RESULT')">
                    <el-select v-model="pageData.repair">
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
    </div>
    <div class="base-btn-box platformOperation_Bottom">
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
.platformOperation_Type {
    margin: 10px 40px;
}
.platformOperation_Wrap {
    width: 800px;
    height: 470px;
    margin-left: 20px;
    padding: 20px;
    border: 1px solid var(--content-border);
    :deep(.el-textarea__inner) {
        width: 780px;
        height: 230px;
        max-height: 275px;
    }
    .screenshot {
        :deep(.el-textarea__inner) {
            max-height: 350px;
        }
    }
}

.platformOperation_Bottom {
    width: 860px;
}
</style>
