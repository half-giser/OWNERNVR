<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-15 09:09:46
 * @Description: 平台接入
-->
<template>
    <div class="base-flex-box">
        <el-form
            ref="formRef"
            :rules="formRules"
            :model="formData"
            inline-message
            :style="{
                '--form-label-width': '200px',
                '--form-input-width': '250px',
            }"
            class="stripe"
        >
            <el-form-item :label="Translate('IDCS_ACCESS_TYPE')">
                <el-select v-model="formData.accessType">
                    <el-option
                        v-for="item in pageData.platformTypeList"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label"
                    />
                </el-select>
            </el-form-item>
            <template v-if="formData.accessType === 'NVMS5000'">
                <el-form-item>
                    <el-checkbox
                        v-model="formData.nwms5000Switch"
                        :label="Translate('IDCS_ENABLE')"
                        @change="changeNWMS5000Switch"
                    />
                </el-form-item>

                <el-form-item
                    :label="Translate('IDCS_SERVER_ADDRESS')"
                    prop="serverAddr"
                >
                    <el-input
                        v-model="formData.serverAddr"
                        :formatter="formatInputMaxLength"
                        :parser="formatInputMaxLength"
                        :disabled="!formData.nwms5000Switch"
                    />
                </el-form-item>
                <el-form-item
                    :label="Translate('IDCS_PORT')"
                    prop="port"
                >
                    <BaseNumberInput
                        v-model="formData.port"
                        :min="10"
                        :max="65535"
                        :disabled="!formData.nwms5000Switch"
                    />
                </el-form-item>
                <el-form-item
                    :label="Translate('IDCS_REPORT_ID')"
                    prop="reportId"
                >
                    <BaseNumberInput
                        v-model="formData.reportId"
                        :min="0"
                        :max="99999999"
                        :disabled="!formData.nwms5000Switch"
                    />
                </el-form-item>
                <div class="base-btn-box">
                    <el-button @click="verify">{{ Translate('IDCS_APPLY') }}</el-button>
                </div>
            </template>
            <template v-if="formData.accessType === 'GB28181'">
                <el-form-item>
                    <el-checkbox
                        v-model="formData.gb28181Switch"
                        :label="Translate('IDCS_ENABLE')"
                    />
                </el-form-item>
                <el-form-item>
                    <el-form-item
                        :label="Translate('IDCS_SIP_SERVER_ID')"
                        class="half"
                        prop="sipId"
                    >
                        <el-input
                            v-model="formData.sipId"
                            :maxlength="20"
                            :formatter="formatDigit"
                            :parser="formatDigit"
                            :disabled="!formData.gb28181Switch"
                        />
                    </el-form-item>
                    <el-form-item
                        :label="Translate('IDCS_SIP_DEVICE_ID')"
                        class="half"
                        prop="sipDeviceId"
                    >
                        <el-input
                            v-model="formData.sipDeviceId"
                            :maxlength="20"
                            :formatter="formatDigit"
                            :parser="formatDigit"
                            :disabled="!formData.gb28181Switch"
                        />
                    </el-form-item>
                </el-form-item>
                <el-form-item>
                    <el-form-item
                        :label="Translate('IDCS_SIP_SERVER_DOMIN')"
                        prop="sipRelm"
                    >
                        <el-input
                            v-model="formData.sipRelm"
                            :disabled="!formData.gb28181Switch"
                        />
                    </el-form-item>
                    <el-form-item
                        :label="Translate('IDCS_SIP_USER_NAME')"
                        prop="sipUserName"
                    >
                        <el-input
                            v-model="formData.sipUserName"
                            :disabled="!formData.gb28181Switch"
                        />
                    </el-form-item>
                </el-form-item>
                <el-form-item>
                    <el-form-item
                        :label="Translate('IDCS_SIP_SERVER_ADDR')"
                        prop="sipAddr"
                    >
                        <el-input
                            v-model="formData.sipAddr"
                            :disabled="!formData.gb28181Switch"
                        />
                    </el-form-item>
                    <el-form-item
                        :label="Translate('IDCS_SIP_PASSWORD')"
                        prop="sipPassword"
                    >
                        <el-input
                            v-model="formData.sipPassword"
                            type="password"
                            :disabled="!formData.gb28181Switch"
                            @paste.capture.prevent=""
                            @copy.capture.prevent=""
                            @focus="handlePasswordFocus"
                        />
                    </el-form-item>
                </el-form-item>
                <el-form-item>
                    <el-form-item
                        :label="Translate('IDCS_SIP_SERVER_PORT')"
                        prop="sipPort"
                    >
                        <BaseNumberInput
                            v-model="formData.sipPort"
                            :disabled="!formData.gb28181Switch"
                            :min="1025"
                            :max="65535"
                        />
                    </el-form-item>
                    <el-form-item :label="Translate('IDCS_KEEP_ALIVE_CYCLE')">
                        <BaseNumberInput
                            v-model="formData.sipExpireTime"
                            :disabled="!formData.gb28181Switch"
                            :min="5"
                            :max="3600"
                        />
                    </el-form-item>
                </el-form-item>
                <el-form-item
                    :label="Translate('IDCS_SIP_LOCAL_PORT')"
                    prop="sipLocalPort"
                >
                    <BaseNumberInput
                        v-model="formData.sipLocalPort"
                        :disabled="!formData.gb28181Switch"
                        :min="10"
                        :max="65535"
                    />
                </el-form-item>
            </template>
        </el-form>
        <div
            v-show="formData.accessType === 'GB28181'"
            class="base-table-box"
        >
            <el-table
                :show-header="false"
                :data="tableData"
                stripe
                border
            >
                <el-table-column prop="label" />
                <el-table-column type="expand">
                    <template #default="scope">
                        <el-table
                            :data="scope.row.list"
                            stripe
                            border
                            class="expand-table"
                            :row-class-name="handleRowClassName"
                        >
                            <el-table-column
                                :label="scope.row.value === 'chl' ? Translate('IDCS_CHANNEL_NAME') : Translate('IDCS_NAME')"
                                prop="text"
                            />
                            <el-table-column
                                :label="scope.row.value === 'chl' ? Translate('IDCS_CAMERA_CODE_ID') : Translate('IDCS_ALARM_IN_CODE_ID')"
                                prop="gbId"
                            />
                            <el-table-column :label="Translate('IDCS_EDIT')">
                                <template #default="item">
                                    <BaseImgSprite
                                        file="edit (2)"
                                        :index="0"
                                        :hover-index="1"
                                        :chunk="4"
                                        :disabled-index="3"
                                        :disabled="!formData.gb28181Switch"
                                        @click="editCodeId(scope.$index, item.row)"
                                    />
                                </template>
                            </el-table-column>
                        </el-table>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div
            v-show="formData.accessType === 'GB28181'"
            class="base-btn-box"
        >
            <el-button @click="verify">{{ Translate('IDCS_APPLY') }}</el-button>
        </div>
        <PlatformAccessCodeIdPop
            v-model="pageData.isCodePop"
            :code-list="sipCodeList"
            :name="pageData.codeData.text"
            :code="pageData.codeData.gbId"
            @confirm="confirmEditCodeId"
            @close="pageData.isCodePop = false"
        />
    </div>
</template>

<script lang="ts" src="./PlatformAccess.v.ts"></script>
