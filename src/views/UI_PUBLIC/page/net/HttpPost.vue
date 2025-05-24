<!--
 * @Date: 2025-05-15 09:30:47
 * @Description: HTTP Post
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <div class="base-flex-box">
        <div class="base-head-box">{{ Translate('IDCS_HTTP_POST') }}</div>
        <el-form
            ref="formRef"
            v-title
            class="stripe"
            :model="formData"
            :rules="rules"
        >
            <el-form-item>
                <el-checkbox
                    v-model="formData.switch"
                    :label="Translate('IDCS_ENABLE')"
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_SERVER_ADDRESS')"
                prop="host"
            >
                <BaseTextInput
                    v-model="formData.host"
                    :maxlength="formData.hostMaxByteLen"
                    :disabled="!formData.switch"
                    :formatter="formatPath"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_PORT')">
                <BaseNumberInput
                    v-model="formData.port"
                    :min="formData.portMin"
                    :max="formData.portMax"
                    :disabled="!formData.switch"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_PATH')">
                <BaseTextInput
                    v-model="formData.path"
                    :maxlength="formData.pathMaxByteLen"
                    :disabled="!formData.switch"
                    :formatter="formatPath"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_PROTOCOL')">
                <el-select-v2
                    v-model="formData.protocolType"
                    :options="pageData.protocolTypeList"
                    :disabled="!formData.switch"
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_USER_NAME')"
                prop="userName"
            >
                <BaseTextInput
                    v-model="formData.userName"
                    :maxlength="formData.userNameMaxByteLen"
                    :disabled="!formData.switch || formData.userInfoDsiabled"
                />
                <el-checkbox
                    v-model="formData.userInfoDsiabled"
                    :label="Translate('IDCS_ANONYMOUS_LOGIN')"
                    :disabled="!formData.switch"
                    @change="changeUserInfoSwitch"
                />
            </el-form-item>
            <el-form-item prop="password">
                <template #label>
                    <div class="base-label-box">
                        <span>{{ Translate('IDCS_PASSWORD') }}</span>
                        <el-checkbox
                            v-model="formData.passwordSwitch"
                            :disabled="!formData.switch || formData.userInfoDsiabled"
                            @change="changePasswordSwitch"
                        />
                    </div>
                </template>
                <BasePasswordInput
                    v-model="formData.password"
                    :disabled="!formData.switch || formData.userInfoDsiabled || !formData.passwordSwitch"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_CONNECTION')">
                <el-select-v2
                    v-model="formData.connectType"
                    :options="pageData.connectionTypeList"
                    :disabled="!formData.switch"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_INTERVAL_TIME')">
                <BaseNumberInput
                    v-model="formData.heartbeatInterval"
                    :min="formData.heartbeatIntervalMin"
                    :max="formData.heartbeatIntervalMax"
                    :disabled="!formData.switch || !formData.keepAliveInfoEnable"
                />
                <el-checkbox
                    v-model="formData.keepAliveInfoEnable"
                    :label="Translate('IDCS_SEND_HEARTBEAT')"
                    :disabled="!formData.switch"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_SCHEDULE')">
                <BaseScheduleSelect
                    v-model="formData.schedule"
                    :disabled="!formData.switch"
                    :options="pageData.scheduleList"
                    @edit="pageData.isSchedulePop = true"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_ATTACH_IMAGE')">
                <el-checkbox-group
                    v-model="formData.enablePostPic"
                    :disabled="!formData.switch"
                >
                    <el-checkbox
                        v-for="item in pageData.postPicList"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label"
                    />
                </el-checkbox-group>
            </el-form-item>
        </el-form>
        <div class="base-table-box">
            <el-table
                v-show="formData.protocolType === 'HTTP'"
                :data="tableData"
                class="table"
            >
                <el-table-column>
                    <template #header>
                        <div class="tabel_header">
                            <span>{{ Translate('IDCS_EVENT_TYPE') }}</span>
                            <el-button
                                class="btn"
                                :disabled="!formData.switch"
                                @click="pageData.isEventPop = true"
                            >
                                {{ Translate('IDCS_CONFIG') }}
                            </el-button>
                        </div>
                    </template>
                    <template #default="{ row }: TableColumn<SelectOption<string, string>>">
                        <span class="table_item">{{ row.label }}</span>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <el-form>
            <div class="base-btn-box">
                <el-button
                    :disabled="!formData.switch"
                    @click="testData()"
                >
                    {{ Translate('IDCS_TEST') }}
                </el-button>
                <el-button @click="setData()">{{ Translate('IDCS_APPLY') }}</el-button>
            </div>
        </el-form>
        <BaseScheduleManagePop
            v-model="pageData.isSchedulePop"
            @close="closeSchedulePop"
        />
        <BaseTransferPop
            v-model="pageData.isEventPop"
            header-title="IDCS_EVENT_TYPE"
            source-title="IDCS_EVENT"
            target-title="IDCS_SEND_EVENT"
            :source-data="pageData.eventList"
            :linked-list="eventLinkedList"
            :limit="10000"
            @confirm="setEvent"
            @close="pageData.isEventPop = false"
        />
    </div>
</template>

<script lang="ts" src="./HttpPost.v.ts"></script>

<style lang="scss" scoped>
.base-table-box {
    width: 415px;
}

.tabel_header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;
    box-sizing: border-box;
}

.table_item {
    text-align: left;
    display: block;
}
</style>
