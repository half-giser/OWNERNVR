<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-08 19:25:53
 * @Description: 按时间搜索
-->
<template>
    <div class="by-time">
        <div class="left">
            <el-form label-position="top">
                <el-form-item :label="Translate('IDCS_START_TIME')">
                    <BaseDatePicker
                        v-model="formData.startTime"
                        :value-format="dateTime.dateTimeFormat"
                        :format="dateTime.dateTimeFormat"
                        type="datetime"
                        :placeholder="Translate('IDCS_START_TIME')"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_END_TIME')">
                    <BaseDatePicker
                        v-model="formData.endTime"
                        :value-format="dateTime.dateTimeFormat"
                        :format="dateTime.dateTimeFormat"
                        type="datetime"
                        :placeholder="Translate('IDCS_END_TIME')"
                    />
                </el-form-item>
            </el-form>
            <div class="chl">
                <el-text>{{ Translate('IDCS_CHANNEL') }}</el-text>
                <el-checkbox
                    :model-value="isChlAll"
                    :label="Translate('IDCS_ALL')"
                    @change="toggleAllChl"
                />
            </div>
            <BaseListBox
                class="chl-box"
                border
            >
                <el-checkbox-group v-model="formData.chls">
                    <BaseListBoxItem
                        v-for="item in pageData.chlList"
                        :key="item.id"
                        :show-hover="false"
                    >
                        <el-checkbox
                            :value="item.id"
                            :label="item.value"
                            :disabled="isChlAll && !formData.chls.includes(item.id)"
                        />
                    </BaseListBoxItem>
                </el-checkbox-group>
            </BaseListBox>
        </div>
        <div class="main">
            <div class="center">
                <BaseImgSpriteBtn
                    file="large_backup"
                    :disabled="!formData.chls.length"
                    @click="backUp"
                />
            </div>
            <div class="backup-tip">
                <BaseImgSprite file="caution" />
                <span>{{ Translate('IDCS_BACKUP_NOTICE').formatForLang(Translate('IDCS_BACKUP')) }}</span>
            </div>
        </div>
        <BackupPop
            v-model="pageData.isBackUpPop"
            :mode="mode"
            :backup-list="pageData.backupRecList"
            @confirm="confirmBackUp"
            @close="pageData.isBackUpPop = false"
        />
        <BackupLocalPop
            v-model="pageData.isLocalBackUpPop"
            :auth="userAuth"
            :backup-list="pageData.backupRecList"
            @close="pageData.isLocalBackUpPop = false"
        />
    </div>
</template>

<script lang="ts" src="./SearchAndBackupByTime.v.ts"></script>

<style lang="scss" scoped>
.by-time {
    width: 100%;
    display: flex;
}

.left {
    width: 260px;
    height: var(--content-height);
    flex-shrink: 0;
    display: flex;
    flex-direction: column;

    .el-form {
        flex-shrink: 0;
        margin-top: 10px;
        margin-bottom: 0 !important;
    }
}

.chl {
    display: flex;
    padding: 10px 15px 5px;
    justify-content: space-between;
    align-items: center;
    flex-shrink: 0;

    &-box {
        width: calc(100% - 30px);
        margin: 0 auto 15px;
    }
}

.main {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    border-left: 1px solid var(--input-border);
}

.center {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
}

.backup {
    &-tip {
        flex-shrink: 0;
        margin-top: 5px;
        margin-bottom: 15px;
        padding-left: 15px;
        display: flex;
        align-items: center;

        span:last-child {
            padding-left: 5px;
        }
    }
}
</style>
