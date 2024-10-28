<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-16 16:18:16
 * @Description: 云升级
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-17 17:44:25
-->
<template>
    <div>
        <el-form
            :style="{
                '--form-label-width': '200px',
                '--form-input-width': '340px',
            }"
        >
            <el-form-item :label="Translate('IDCS_UPGRADE_OPTIONS')">
                <el-select v-model="formData.upgradeType">
                    <el-option
                        v-for="item in pageData.upgradeOptions"
                        :key="item.value"
                        :value="item.value"
                        :label="item.label"
                    />
                </el-select>
            </el-form-item>
            <el-form-item>
                <el-form-item :label="Translate('IDCS_ONLINE_UPGRADE_CURRENT_VER')">
                    {{ pageData.currentVersion }}
                </el-form-item>
                <el-form-item :label="Translate('IDCS_ONLINE_UPGRADE_RELEASE_DATE')">
                    {{ pageData.launchDate }}
                </el-form-item>
            </el-form-item>
            <el-form-item v-show="pageData.isUpdateNotify">
                <span class="check-log">{{ pageData.checkLog }}</span>
            </el-form-item>
            <el-form-item
                v-show="!pageData.isLatest && !pageData.isUpdateNotify"
                :label="Translate('IDCS_UPGRADE_NEW_VER')"
            >
                {{ pageData.latestVersion }}
            </el-form-item>
            <el-form-item
                v-show="!pageData.isLatest && !pageData.isUpdateNotify"
                label=" "
            >
                {{ pageData.versionInfo }}
            </el-form-item>
            <el-form-item v-show="pageData.isUpdateNotify">
                <div class="latest text-error">
                    <BaseImgSprite file="warnIcon" />
                    <span>{{ Translate('IDCS_CLOUD_UPGRADE_WEB_TIP') }}</span>
                </div>
            </el-form-item>
            <div class="base-btn-box">
                <el-button
                    :disabled="!pageData.isUpdateNotify || pageData.isLatest || pageData.isDownloading"
                    @click="upgrade"
                    >{{ Translate('IDCS_UPGRADE') }}</el-button
                >
                <el-button
                    :disabled="!pageData.isUpdateNotify || pageData.isDownloading"
                    @click="getVersion"
                    >{{ Translate('IDCS_ONLINE_UPGRADE_CHECK') }}</el-button
                >
                <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
            </div>
        </el-form>
        <BaseCheckAuthPop
            v-model="pageData.isCheckAuthPop"
            @confirm="confirmUpgrade"
            @close="pageData.isCheckAuthPop = false"
        />
    </div>
</template>

<script lang="ts" src="./CloudUpgrade.v.ts"></script>

<style lang="scss" scoped>
.check-log {
    font-size: 20px;
}

.latest {
    font-size: 20px;
    display: flex;
    align-items: center;
    line-height: 1.4;
    span:first-child {
        flex-shrink: 0;
    }

    span:last-child {
        margin-left: 10px;
    }
}
</style>
