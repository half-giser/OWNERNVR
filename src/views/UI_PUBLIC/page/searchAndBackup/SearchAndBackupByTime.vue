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
                    <el-date-picker
                        v-model="formData.startTime"
                        :value-format="dateTime.dateTimeFormat"
                        :format="dateTime.dateTimeFormat"
                        type="datetime"
                        :placeholder="Translate('IDCS_START_TIME')"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_END_TIME')">
                    <el-date-picker
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
            <BaseListBox class="chl-box">
                <el-checkbox-group v-model="formData.chls">
                    <el-checkbox
                        v-for="item in pageData.chlList"
                        :key="item.id"
                        :value="item.id"
                        :label="item.value"
                        :disabled="isChlAll && !formData.chls.includes(item.id)"
                    />
                </el-checkbox-group>
            </BaseListBox>
        </div>
        <div class="main">
            <div class="center">
                <BaseImgSprite
                    file="large_backup"
                    :index="0"
                    :hover-index="1"
                    :chunk="4"
                    :disabled-index="3"
                    :disabled="!formData.chls.length"
                    @click="backUp"
                />
            </div>
            <div class="backup-tip">
                <BaseImgSprite file="caution" />
                <span>{{ Translate('IDCS_BACKUP_NOTICE').formatForLang(Translate('IDCS_BACKUP')) }}</span>
            </div>
        </div>
        <BasePluginNotice />
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
    height: 100%;
    flex-shrink: 0;
    border-right: 1px solid var(--input-border);
    display: flex;
    flex-direction: column;

    .el-form {
        flex-shrink: 0;
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
        border: 1px solid var(--input-border);
    }
}

.main {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
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
