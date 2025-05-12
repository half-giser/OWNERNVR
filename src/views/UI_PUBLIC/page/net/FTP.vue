<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-12 18:20:28
 * @Description: FTP
-->
<template>
    <div class="base-flex-box">
        <div class="base-head-box">{{ Translate('IDCS_FTP') }}</div>
        <el-form
            ref="formRef"
            v-title
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
                        :maxlength="formData.serverAddrMaxLen"
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
                    <BaseTextInput
                        v-model="formData.userName"
                        :maxlength="formData.userNameMaxByteLen"
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
                    <BasePasswordInput
                        v-model="formData.password"
                        maxlength="32"
                        :disabled="!formData.switch || formData.anonymousSwitch || !pageData.passwordSwitch"
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
                        :min="formData.maxSizeMin"
                        :max="formData.maxSizeMax"
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
                        :maxlength="formData.pathMaxLen"
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
                <span>{{ Translate('IDCS_DIS_NET_UPLOAD_TIP') }}</span>
            </el-form-item>
        </el-form>
        <div class="base-head-box">{{ Translate('IDCS_UPLOAD_SET') }}</div>
        <el-table
            v-title
            height="100%"
            :data="tableData"
            :row-class-name="handleRowClassName"
        >
            <el-table-column>
                <!-- 通道号 -->
                <el-table-column
                    :label="Translate('IDCS_CHANNEL_NUMBER')"
                    prop="chlNum"
                    width="80"
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
                        <BaseScheduleTableDropdown
                            :disabled="!formData.switch"
                            :options="pageData.scheduleOptions"
                            @change="changeAllSchedule"
                            @edit="openSchedulePop"
                        />
                    </template>
                    <template #default="{ row }: TableColumn<NetFTPList>">
                        <BaseScheduleSelect
                            v-model="row.schedule"
                            :disabled="!formData.switch"
                            :options="pageData.scheduleOptions"
                            @edit="openSchedulePop"
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
                    <template #default="{ row }: TableColumn<NetFTPList>">
                        <el-select-v2
                            v-model="row.motion"
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
                    <template #default="{ row }: TableColumn<NetFTPList>">
                        <el-select-v2
                            v-model="row.inteligence"
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
                    <template #default="{ row }: TableColumn<NetFTPList>">
                        <el-select-v2
                            v-model="row.sensor"
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
                    <template #default="{ row }: TableColumn<NetFTPList>">
                        <el-select-v2
                            v-model="row.streamType"
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
                    <template #default="{ row }: TableColumn<NetFTPList>">
                        <el-select-v2
                            v-model="row.ftpSnapSwitch"
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
                    <template #default="{ row }: TableColumn<NetFTPList>">
                        <el-select-v2
                            v-model="row.ftpAlarmInfoSwitch"
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
                @click="test"
            >
                {{ Translate('IDCS_TEST') }}
            </el-button>
            <el-button @click="verify">{{ Translate('IDCS_APPLY') }}</el-button>
        </div>
        <BaseScheduleManagePop
            v-model="pageData.isSchedulePop"
            @close="closeSchedulePop"
        />
    </div>
</template>

<script lang="ts" src="./FTP.v.ts"></script>
