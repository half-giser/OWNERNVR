<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-27 11:48:58
 * @Description: 系统升级
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-04 19:47:03
-->
<template>
    <div class="Upgrade">
        <el-form>
            <el-form-item :label="Translate('IDCS_WEB_UPGRADE_S_1')">
                <el-input
                    type="text"
                    readonly
                    :model-value="formData.filePath"
                ></el-input>
                <el-button
                    v-show="!isSupportH5"
                    :disabled="pageData.isUploadDisabled"
                    @click="handleOCXUpload"
                    >{{ Translate('IDCS_BROWSE') }}</el-button
                >
                <input
                    id="h5BrowerImport"
                    type="file"
                    hidden
                    :disabled="pageData.isUploadDisabled"
                    :accept="pageData.accept"
                    @change="handleH5Upload"
                />
                <el-button
                    v-show="isSupportH5"
                    :disabled="pageData.isUploadDisabled"
                >
                    <label
                        for="h5BrowerImport"
                        :class="{ disabled: pageData.isUploadDisabled }"
                    >
                        {{ Translate('IDCS_BROWSE') }}
                    </label>
                </el-button>
                <el-button
                    :disabled="pageData.isUpgradeDisabled"
                    @click="handleUpgrade"
                    >{{ Translate('IDCS_UPGRADE') }}</el-button
                >
                <el-button
                    :disabled="pageData.isBackUpAndUpgradeDisabled"
                    @click="handleBackupAndUpgrade"
                    >{{ Translate('IDCS_BACKUP_AND_UPGRADE') }}</el-button
                >
            </el-form-item>
        </el-form>
        <div class="system-info">
            <div
                v-for="item in pageData.systemList"
                :key="item.id"
                :class="{ active: item.id === pageData.currentRunningSystem }"
            >
                <el-tooltip :content="Translate('IDCS_PRIORITY_BOOT_SYSTEM')">
                    <BaseImgSprite
                        v-show="pageData.currentRunningSystem === item.id"
                        file="systemStatus"
                    />
                </el-tooltip>
                <span>{{ item.label }}</span>
                <span>{{ item.value }}</span>
            </div>
        </div>
        <div class="upgrade-note">{{ Translate('IDCS_UPGRADE_NOTE') }}</div>
        <div class="upgrade-note">{{ pageData.upgradeNote }}</div>
        <BasePluginNotice />
        <BaseNotification v-model:notifications="pageData.notifications" />
        <BaseCheckAuthPop
            v-model="pageData.isCheckAuth"
            :tip="pageData.checkAuthTip"
            @confirm="confirmUpgrade"
            @close="pageData.isCheckAuth = false"
        />
        <BaseInputEncryptPwdPop
            v-model="pageData.isEncryptPwd"
            :upgrade-flag="true"
            @confirm="confirmBackUpAndUpgrade"
            @close="closeBackUpAndUpgrade"
        />
        <UpgradeBackUpPop
            v-model="pageData.isUpgradeBackUp"
            @confirm="confirmOCXBackUp"
        />
    </div>
</template>

<script lang="ts" src="./Upgrade.v.ts"></script>

<style lang="scss" scoped>
.Upgrade {
    position: relative;

    label {
        display: inline-block;

        &.disabled {
            cursor: not-allowed;
        }
    }

    .el-input {
        width: 250px;
    }

    :deep(.el-form-item__content) > *:not(:first-child) {
        margin-left: 5px;
    }

    .system-info {
        font-size: 15px;
        display: flex;

        & > div {
            display: flex;
            align-items: center;
            height: 35px;
            line-height: 35px;
            &:not(:first-child) {
                margin-left: 30px;
                position: relative;

                &:before {
                    content: '';
                    position: relative;
                    height: 17px;
                    width: 1px;
                    left: -15px;
                    border-left: 2px solid var(--border-color4);
                }
            }

            &.active {
                color: #23de1a;
            }

            span:not(:last-child) {
                margin-right: 10px;
            }
        }
    }

    .upgrade-note {
        font-size: 15px;
        margin: 10px 0px 0px 0px;
    }
}
</style>
