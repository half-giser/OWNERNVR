<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-12 18:20:28
 * @Description: FTP
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-05 15:49:10
-->
<template>
    <div class="base-flex-box">
        <div class="base-subheading-box">{{ Translate('IDCS_FTP') }}</div>
        <el-form
            ref="formRef"
            :style="{
                '--form-input-width': '200px',
            }"
            inline-message
            class="stripe narrow"
            :rules="formRule"
            :model="formData"
            label-position="left"
        >
            <el-form-item>
                <el-form-item>
                    <el-checkbox
                        v-model="formData.switch"
                        @change="changeSwitch"
                        >{{ Translate('IDCS_ENABLE') }}</el-checkbox
                    >
                </el-form-item>
                <el-form-item>&nbsp;</el-form-item>
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
                    <el-input-number
                        v-model="formData.port"
                        :disabled="!formData.switch"
                        :min="10"
                        :max="65535"
                        :controls="false"
                    />
                </el-form-item>
            </el-form-item>
            <el-form-item>
                <el-form-item>
                    <el-checkbox
                        v-model="formData.anonymousSwitch"
                        :disabled="!formData.switch"
                        >{{ Translate('IDCS_ANONYMOUS') }}</el-checkbox
                    >
                </el-form-item>
                <el-form-item>&nbsp;</el-form-item>
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
                <el-form-item
                    :label="Translate('IDCS_CHANGE_PWD')"
                    prop="password"
                >
                    <el-input
                        v-model="formData.password"
                        type="password"
                        maxlength="32"
                        :disabled="!formData.switch || formData.anonymousSwitch || !pageData.passwordSwitch"
                        @paste.capture.prevent=""
                        @copy.capture.prevent=""
                    />
                    <el-checkbox
                        v-model="pageData.passwordSwitch"
                        :disabled="!formData.switch || formData.anonymousSwitch"
                    />
                </el-form-item>
            </el-form-item>
            <el-form-item>
                <el-form-item
                    :label="Translate('IDCS_MAX_FILE_SIZE')"
                    prop="maxSize"
                >
                    <el-input-number
                        v-model="formData.maxSize"
                        :min="pageData.minFileSize"
                        :max="pageData.maxFileSize"
                        :disabled="!formData.switch"
                        :controls="false"
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
                <el-form-item>
                    <el-checkbox
                        v-model="formData.disNetUpLoad"
                        :disabled="!formData.switch"
                        >{{ Translate('IDCS_DIS_NET_UPLOAD') }}</el-checkbox
                    >
                    <el-text>{{ Translate('IDCS_DIS_NET_UPLOAD_TIP') }}</el-text>
                </el-form-item>
                <el-form-item>&nbsp;</el-form-item>
            </el-form-item>
        </el-form>
        <div class="base-subheading-box">{{ Translate('IDCS_UPLOAD_SET') }}</div>
        <el-table
            height="100%"
            stripe
            border
            :data="tableData"
        >
            <el-table-column>
                <!-- 通道号 -->
                <el-table-column
                    :label="Translate('IDCS_CHANNEL_NUMBER')"
                    prop="chlNum"
                />
                <!-- 通道名称 -->
                <el-table-column
                    :label="Translate('IDCS_CHANNEL_NAME')"
                    prop="name"
                />
                <!-- 排程 -->
                <el-table-column>
                    <template #header>
                        <el-dropdown
                            trigger="click"
                            :disabled="!formData.switch"
                        >
                            <span class="el-dropdown-link">
                                {{ Translate('IDCS_SCHEDULE') }}
                                <BaseImgSprite
                                    class="ddn"
                                    file="ddn"
                                />
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.scheduleOptions"
                                        :key="item.value"
                                        :value="item.value"
                                        @click="changeAllSwitch('schedule', item.value)"
                                        >{{ item.label }}</el-dropdown-item
                                    >
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.schedule"
                            :disabled="!formData.switch"
                        >
                            <el-option
                                v-for="item in pageData.scheduleOptions"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            />
                        </el-select>
                    </template>
                </el-table-column>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_FTP_UPLOAD_RECORD')">
                <!-- 移动侦测 -->
                <el-table-column :label="Translate('IDCS_MOTION_DETECTION')">
                    <template #header>
                        <el-dropdown
                            trigger="click"
                            :disabled="!formData.switch"
                        >
                            <span class="el-dropdown-link">
                                {{ Translate('IDCS_MOTION_DETECTION') }}
                                <BaseImgSprite
                                    class="ddn"
                                    file="ddn"
                                />
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.switchOptions"
                                        :key="item.value"
                                        :value="item.value"
                                        @click="changeAllSwitch('motion', item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.motion"
                            :disabled="!formData.switch"
                        >
                            <el-option
                                v-for="item in pageData.switchOptions"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            />
                        </el-select>
                    </template>
                </el-table-column>
                <!-- 智能 -->
                <el-table-column>
                    <template #header>
                        <el-dropdown
                            trigger="click"
                            :disabled="!formData.switch"
                        >
                            <span class="el-dropdown-link">
                                {{ Translate('IDCS_INTELLIGENT') }}
                                <BaseImgSprite
                                    class="ddn"
                                    file="ddn"
                                />
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.switchOptions"
                                        :key="item.value"
                                        :value="item.value"
                                        @click="changeAllSwitch('inteligence', item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.inteligence"
                            :disabled="!formData.switch"
                        >
                            <el-option
                                v-for="item in pageData.switchOptions"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            />
                        </el-select>
                    </template>
                </el-table-column>
                <!-- 传感器 -->
                <el-table-column>
                    <template #header>
                        <el-dropdown
                            trigger="click"
                            :disabled="!formData.switch"
                        >
                            <span class="el-dropdown-link">
                                {{ Translate('IDCS_SENSOR') }}
                                <BaseImgSprite
                                    class="ddn"
                                    file="ddn"
                                />
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.switchOptions"
                                        :key="item.value"
                                        :value="item.value"
                                        @click="changeAllSwitch('sensor', item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.sensor"
                            :disabled="!formData.switch"
                        >
                            <el-option
                                v-for="item in pageData.switchOptions"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            />
                        </el-select>
                    </template>
                </el-table-column>
                <!-- 码流类型 -->
                <el-table-column>
                    <template #header>
                        <el-dropdown
                            trigger="click"
                            :disabled="!formData.switch"
                        >
                            <span class="el-dropdown-link">
                                {{ Translate('IDCS_CODE_STREAM_TYPE') }}
                                <BaseImgSprite
                                    class="ddn"
                                    file="ddn"
                                />
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.streamTypeOptions"
                                        :key="item.value"
                                        :value="item.value"
                                        @click="changeAllSwitch('streamType', item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.streamType"
                            :disabled="!formData.switch"
                        >
                            <el-option
                                v-for="item in pageData.streamTypeOptions"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            />
                        </el-select>
                    </template>
                </el-table-column>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_FTP_UPLOAD_SNAP')">
                <!-- 抓图 -->
                <el-table-column>
                    <template #header>
                        <el-dropdown
                            trigger="click"
                            :disabled="!formData.switch"
                        >
                            <span class="el-dropdown-link">
                                {{ Translate('IDCS_SNAP') }}
                                <BaseImgSprite
                                    class="ddn"
                                    file="ddn"
                                />
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.switchOptions"
                                        :key="item.value"
                                        :value="item.value"
                                        @click="changeAllSwitch('ftpSnapSwitch', item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.ftpSnapSwitch"
                            :disabled="!formData.switch"
                        >
                            <el-option
                                v-for="item in pageData.switchOptions"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            />
                        </el-select>
                    </template>
                </el-table-column>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_UPLOAD_FILE')">
                <!-- 报警信息 -->
                <el-table-column>
                    <template #header>
                        <el-dropdown
                            trigger="click"
                            :disabled="!formData.switch"
                        >
                            <span class="el-dropdown-link">
                                {{ Translate('IDCS_ALARM_INFO') }}
                                <BaseImgSprite
                                    class="ddn"
                                    file="ddn"
                                />
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.switchOptions"
                                        :key="item.value"
                                        :value="item.value"
                                        @click="changeAllSwitch('ftpAlarmInfoSwitch', item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.ftpAlarmInfoSwitch"
                            :disabled="!formData.switch"
                        >
                            <el-option
                                v-for="item in pageData.switchOptions"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            />
                        </el-select>
                    </template>
                </el-table-column>
            </el-table-column>
        </el-table>
        <div class="base-btn-box">
            <el-button
                :disabled="!formData.switch"
                @click="manageSchedule"
                >{{ Translate('IDCS_SCHEDULE_MANAGE') }}</el-button
            >
            <el-button
                :disabled="!formData.switch"
                @click="test"
                >{{ Translate('IDCS_TEST') }}</el-button
            >
            <el-button @click="verify">{{ Translate('IDCS_APPLY') }}</el-button>
        </div>
        <ScheduleManagPop
            v-model="pageData.isSchedulePop"
            @close="pageData.isSchedulePop = false"
        />
    </div>
</template>

<script lang="ts" src="./FTP.v.ts"></script>
