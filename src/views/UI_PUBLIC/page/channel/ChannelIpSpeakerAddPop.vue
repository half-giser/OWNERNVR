<!--
 * @Date: 2025-05-10 13:19:56
 * @Description: IP Speaker 新增弹窗
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <el-dialog
        :title="Translate('IDCS_ADD_IP_SPEARKER')"
        width="600"
        @open="open"
        @closed="closed"
    >
        <div class="base-head-box">
            <el-button @click="refresh">{{ Translate('IDCS_REFRESH') }}</el-button>
        </div>
        <el-table
            ref="tableRef"
            v-title
            :data="tableData"
            highlight-current-row
            height="250"
            show-overflow-tooltip
            @row-click="handleRowClick"
        >
            <el-table-column
                type="index"
                :label="Translate('IDCS_SERIAL_NUMBER')"
            />
            <el-table-column prop="ip">
                <template #header>
                    <div
                        class="sort-title"
                        @click="changeSort"
                    >
                        <span>{{ Translate('IDCS_IP_ADDRESS') }}</span>
                        <BaseImgSprite
                            :file="pageData.sortType || 'asc'"
                            class="sort-icon"
                        />
                    </div>
                </template>
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_PORT')"
                prop="port"
            />
            <el-table-column
                :label="Translate('IDCS_PROTOCOL')"
                prop="protocolType"
            />
            <el-table-column
                :label="Translate('IDCS_PRODUCT_MODEL')"
                prop="productModel"
            />
        </el-table>
        <el-form
            ref="formRef"
            v-title
            class="stripe"
            :model="formData"
            :rules="rules"
        >
            <el-form-item
                :label="Translate('IDCS_IPV4')"
                prop="ip"
            >
                <BaseIpInput v-model="formData.ip" />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_PROTOCOL')">
                <el-select-v2
                    v-model="formData.protocolType"
                    :options="pageData.protocolTypeOptions"
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
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_USERNAME')">
                <el-input
                    v-model="formData.userName"
                    maxlength="64"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_PASSWORD')">
                <BasePasswordInput
                    v-model="formData.password"
                    maxlength="64"
                    :disabled="formData.defaultPwd"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_IPSPEAKER_ASSOCIATION')">
                <el-select-v2
                    v-model="formData.associatedDeviceID"
                    :options="pageData.devList"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_DEV_USE_DEFAULT_PWD')">
                <el-checkbox v-model="formData.defaultPwd" />
            </el-form-item>
        </el-form>
        <div class="base-btn-box">
            <el-button @click="setDefaultPwd">{{ Translate('IDCS_XXX_DEFAULT_PWD').formatForLang(Translate('IDCS_IPSPEAKER')) }}</el-button>
            <el-button @click="setDataAndKeep">{{ Translate('IDCS_ADD_KEEP') }}</el-button>
            <el-button @click="setDataAndClose">{{ Translate('IDCS_ADD') }}</el-button>
            <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
        <ChannelIpSpeakerSetDefaultPwdPop
            v-model="pageData.isSetDefaultPwdPop"
            @close="pageData.isSetDefaultPwdPop = false"
        />
    </el-dialog>
</template>

<script lang="ts" src="./ChannelIpSpeakerAddPop.v.ts"></script>

<style lang="scss" scoped>
.base-head-box {
    display: flex;
    align-items: center;
    padding: 0 10px;
    justify-content: flex-end;
}

.sort {
    &-title {
        position: relative;
        width: 100%;
        cursor: pointer;

        &:hover,
        &.active {
            .sort-icon {
                opacity: 1;
            }
        }
    }

    &-icon {
        position: absolute;
        left: 50%;
        top: -3px;
        opacity: 0;
    }
}
</style>
