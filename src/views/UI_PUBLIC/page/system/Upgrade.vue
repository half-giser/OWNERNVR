<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-27 11:48:58
 * @Description: 系统升级
-->
<template>
    <div>
        <el-form v-title>
            <el-form-item
                :label="Translate('IDCS_WEB_UPGRADE_S_1')"
                :style="{
                    '--form-label-width': 'auto',
                }"
            >
                <el-input
                    type="text"
                    readonly
                    :model-value="formData.filePath"
                />
                <el-button
                    v-show="!isSupportH5"
                    :disabled="pageData.isUploadDisabled"
                    @click="handleOCXUpload"
                >
                    {{ Translate('IDCS_BROWSE') }}
                </el-button>
                <label
                    v-show="isSupportH5"
                    class="el-button"
                    for="h5BrowerImport"
                    :class="{
                        'is-disabled': pageData.isUploadDisabled,
                    }"
                >
                    {{ Translate('IDCS_BROWSE') }}
                </label>
                <el-button
                    :disabled="pageData.isUpgradeDisabled"
                    @click="handleUpgrade"
                >
                    {{ Translate('IDCS_UPGRADE') }}
                </el-button>
                <el-button
                    v-show="systemCaps.devSystemType === 1"
                    :disabled="pageData.isBackUpAndUpgradeDisabled"
                    @click="handleBackupAndUpgrade"
                >
                    {{ Translate('IDCS_BACKUP_AND_UPGRADE') }}
                </el-button>
                <input
                    id="h5BrowerImport"
                    type="file"
                    hidden
                    :disabled="pageData.isUploadDisabled"
                    :accept="pageData.accept"
                    @change="handleH5Upload"
                />
            </el-form-item>
            <el-form-item v-show="systemCaps.devSystemType === 1">
                <div class="system-info">
                    <div
                        v-for="item in pageData.systemList"
                        :key="item.id"
                        :class="{
                            active: item.id === pageData.currentRunningSystem,
                        }"
                    >
                        <BaseImgSprite
                            v-show="pageData.currentRunningSystem === item.id"
                            :title="Translate('IDCS_PRIORITY_BOOT_SYSTEM')"
                            file="systemStatus"
                        />
                        <span>{{ item.label }}</span>
                        <span>{{ item.value }}</span>
                    </div>
                </div>
            </el-form-item>
            <el-form-item>
                <div class="tips">
                    <BaseImgSprite file="warnIcon" />
                    <span>{{ Translate('IDCS_UPGRADE_NOTE') }}</span>
                </div>
            </el-form-item>
            <el-form-item>
                <span class="note">{{ pageData.upgradeNote }}</span>
            </el-form-item>
        </el-form>
        <BaseCheckAuthPop
            v-model="pageData.isCheckAuth"
            :tip="Translate('IDCS_SYSTEM_UPGRADE_QUESTION')"
            @confirm="confirmUpgrade"
            @close="pageData.isCheckAuth = false"
        />
        <UpgradeBackUpPop
            v-model="pageData.isUpgradeBackUp"
            @confirm="confirmOCXBackUp"
        />
    </div>
</template>

<script lang="ts" src="./Upgrade.v.ts"></script>

<style lang="scss" scoped>
.system-info {
    display: flex;

    & > div {
        display: flex;
        align-items: center;

        &:not(:first-child) {
            margin-left: 30px;
            position: relative;

            &::before {
                content: '';
                position: relative;
                height: 17px;
                width: 1px;
                left: -15px;
                border-left: 2px solid var(--btn-border);
            }
        }

        &.active {
            color: var(--upgrade-text-active);
        }

        span:not(:last-child) {
            margin-right: 10px;
        }
    }
}

.note {
    color: var(--primary);
}

.tips {
    display: flex;
    align-items: center;

    span:last-child {
        margin-left: 10px;
    }
}
</style>
