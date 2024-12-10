<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-12 18:20:28
 * @Description: FTP
-->
<template>
    <div class="base-flex-box">
        <div class="base-subheading-box">{{ Translate('IDCS_FTP') }}</div>
        <el-form
            ref="formRef"
            :style="{
                '--form-label-width': '200px',
                '--form-input-width': '200px',
            }"
            class="stripe"
            :rules="formRule"
            :model="formData"
        >
            <el-form-item>
                <el-checkbox
                    v-model="formData.switch"
                    :label="Translate('IDCS_ENABLE')"
                    @change="changeSwitch"
                />
            </el-form-item>
            <el-form-item>
                <el-form-item
                    :label="Translate('IDCS_SERVER_ADDRESS')"
                    prop="serverAddr"
                >
                    <el-input
                        v-model="formData.serverAddr"
                        :disabled="!formData.switch"
                        :formatter="formatServerAddress"
                        :parser="formatServerAddress"
                        maxlength="64"
                    />
                </el-form-item>
                <el-form-item
                    :label="Translate('IDCS_PORT')"
                    prop="port"
                >
                    <BaseNumberInput
                        v-model="formData.port"
                        :disabled="!formData.switch"
                        :min="10"
                        :max="65535"
                    />
                </el-form-item>
            </el-form-item>
            <el-form-item>
                <el-checkbox
                    v-model="formData.anonymousSwitch"
                    :disabled="!formData.switch"
                    :label="Translate('IDCS_ANONYMOUS')"
                />
            </el-form-item>
            <el-form-item>
                <el-form-item
                    :label="Translate('IDCS_USERNAME')"
                    prop="userName"
                >
                    <el-input
                        v-model="formData.userName"
                        maxlength="64"
                        :disabled="!formData.switch || formData.anonymousSwitch"
                    />
                </el-form-item>
                <el-form-item prop="password">
                    <template #label>
                        {{ Translate('IDCS_PASSWORD') }}
                        <el-checkbox
                            v-model="pageData.passwordSwitch"
                            :disabled="!formData.switch || formData.anonymousSwitch"
                        />
                    </template>
                    <el-input
                        v-model="formData.password"
                        type="password"
                        maxlength="32"
                        :disabled="!formData.switch || formData.anonymousSwitch || !pageData.passwordSwitch"
                        @paste.capture.prevent=""
                        @copy.capture.prevent=""
                    />
                </el-form-item>
            </el-form-item>
            <el-form-item>
                <el-form-item
                    :label="Translate('IDCS_MAX_FILE_SIZE')"
                    prop="maxSize"
                >
                    <BaseNumberInput
                        v-model="formData.maxSize"
                        :min="pageData.minFileSize"
                        :max="pageData.maxFileSize"
                        :disabled="!formData.switch"
                    />
                    <el-text>M</el-text>
                </el-form-item>
                <el-form-item
                    :label="Translate('IDCS_REMOTE_DIRECTORY')"
                    prop="path"
                >
                    <el-input
                        v-model="formData.path"
                        maxlength="64"
                        :formatter="formatDir"
                        :parser="formatDir"
                        :disabled="!formData.switch"
                    />
                </el-form-item>
            </el-form-item>
            <el-form-item>
                <el-checkbox
                    v-model="formData.disNetUpLoad"
                    :disabled="!formData.switch"
                    :label="Translate('IDCS_DIS_NET_UPLOAD')"
                />
                <el-text class="tip">{{ Translate('IDCS_DIS_NET_UPLOAD_TIP') }}</el-text>
            </el-form-item>
        </el-form>
        <div class="base-subheading-box">{{ Translate('IDCS_UPLOAD_SET') }}</div>
        <el-table
            height="100%"
            :data="tableData"
            :row-class-name="handleRowClassName"
        >
            <el-table-column>
                <!-- 通道号 -->
                <el-table-column
                    :label="Translate('IDCS_CHANNEL_NUMBER')"
                    prop="chlNum"
                    width="60"
                />
                <!-- 通道名称 -->
                <el-table-column
                    :label="Translate('IDCS_CHANNEL_NAME')"
                    prop="name"
                    width="150"
                    show-overflow-tooltip
                />
                <!-- 排程 -->
                <el-table-column>
                    <template #header>
                        <el-dropdown :disabled="!formData.switch">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_SCHEDULE') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.scheduleOptions"
                                        :key="item.value"
                                        @click="changeAllSwitch('schedule', item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select-v2
                            v-model="scope.row.schedule"
                            :disabled="!formData.switch"
                            :options="pageData.scheduleOptions"
                        />
                    </template>
                </el-table-column>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_FTP_UPLOAD_RECORD')">
                <!-- 移动侦测 -->
                <el-table-column :label="Translate('IDCS_MOTION_DETECTION')">
                    <template #header>
                        <el-dropdown :disabled="!formData.switch">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_MOTION_DETECTION') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.switchOptions"
                                        :key="item.value"
                                        @click="changeAllSwitch('motion', item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select-v2
                            v-model="scope.row.motion"
                            :disabled="!formData.switch"
                            :options="pageData.switchOptions"
                        />
                    </template>
                </el-table-column>
                <!-- 智能 -->
                <el-table-column>
                    <template #header>
                        <el-dropdown :disabled="!formData.switch">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_INTELLIGENT') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.switchOptions"
                                        :key="item.value"
                                        @click="changeAllSwitch('inteligence', item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select-v2
                            v-model="scope.row.inteligence"
                            :options="pageData.switchOptions"
                            :disabled="!formData.switch"
                        />
                    </template>
                </el-table-column>
                <!-- 传感器 -->
                <el-table-column>
                    <template #header>
                        <el-dropdown :disabled="!formData.switch">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_SENSOR') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.switchOptions"
                                        :key="item.value"
                                        @click="changeAllSwitch('sensor', item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select-v2
                            v-model="scope.row.sensor"
                            :disabled="!formData.switch"
                            :options="pageData.switchOptions"
                        />
                    </template>
                </el-table-column>
                <!-- 码流类型 -->
                <el-table-column>
                    <template #header>
                        <el-dropdown :disabled="!formData.switch">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_CODE_STREAM_TYPE') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.streamTypeOptions"
                                        :key="item.value"
                                        @click="changeAllSwitch('streamType', item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select-v2
                            v-model="scope.row.streamType"
                            :disabled="!formData.switch"
                            :options="pageData.streamTypeOptions"
                        />
                    </template>
                </el-table-column>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_FTP_UPLOAD_SNAP')">
                <!-- 抓图 -->
                <el-table-column>
                    <template #header>
                        <el-dropdown :disabled="!formData.switch">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_SNAP') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.switchOptions"
                                        :key="item.value"
                                        @click="changeAllSwitch('ftpSnapSwitch', item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select-v2
                            v-model="scope.row.ftpSnapSwitch"
                            :disabled="!formData.switch"
                            :options="pageData.switchOptions"
                        />
                    </template>
                </el-table-column>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_UPLOAD_FILE')">
                <!-- 报警信息 -->
                <el-table-column>
                    <template #header>
                        <el-dropdown :disabled="!formData.switch">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_ALARM_INFO') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.switchOptions"
                                        :key="item.value"
                                        @click="changeAllSwitch('ftpAlarmInfoSwitch', item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select-v2
                            v-model="scope.row.ftpAlarmInfoSwitch"
                            :disabled="!formData.switch"
                            :options="pageData.switchOptions"
                        />
                    </template>
                </el-table-column>
            </el-table-column>
        </el-table>
        <div class="base-btn-box">
            <el-button
                :disabled="!formData.switch"
                @click="manageSchedule"
            >
                {{ Translate('IDCS_SCHEDULE_MANAGE') }}
            </el-button>
            <el-button
                :disabled="!formData.switch"
                @click="test"
            >
                {{ Translate('IDCS_TEST') }}
            </el-button>
            <el-button @click="verify">{{ Translate('IDCS_APPLY') }}</el-button>
        </div>
        <ScheduleManagPop
            v-model="pageData.isSchedulePop"
            @close="confirmManageSchedule"
        />
    </div>
</template>

<script lang="ts" src="./FTP.v.ts"></script>

<style lang="scss" scoped>
.tip {
    line-height: 1.4;
}
</style>
