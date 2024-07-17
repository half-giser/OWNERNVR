<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-16 16:18:16
 * @Description: 云升级
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-16 20:12:30
-->
<template>
    <div>
        <el-form
            :style="{
                '--form-input-width': '340px',
            }"
            label-position="left"
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
        </el-form>
        <div class="info">
            <label>{{ Translate('IDCS_ONLINE_UPGRADE_CURRENT_VER') }}</label>
            <span>{{ pageData.currentVersion }}</span>
            <label>{{ Translate('IDCS_ONLINE_UPGRADE_RELEASE_DATE') }}</label>
            <span>{{ pageData.launchDate }}</span>
        </div>
        <p
            v-show="pageData.isUpdateNotify"
            class="check-log"
        >
            {{ pageData.checkLog }}
        </p>
        <div
            v-show="!pageData.isLatest && !pageData.isUpdateNotify"
            class="info"
        >
            <label>{{ Translate('IDCS_UPGRADE_NEW_VER') }}</label>
            <span>{{ pageData.latestVersion }}</span>
        </div>
        <div
            v-show="!pageData.isLatest && !pageData.isUpdateNotify"
            class="info"
        >
            <div>{{ pageData.versionInfo }}</div>
        </div>
        <div
            v-show="pageData.isDownloading"
            class="info"
        >
            <label>{{ Translate('IDCS_UPGRADE_DOWN_RATE') }}</label>
            <span>{{ pageData.downloadProgress }}</span>
        </div>
        <div
            v-show="pageData.isUpdateNotify"
            class="latest"
        >
            <BaseImgSprite file="warnIcon" />
            <span>{{ Translate('IDCS_CLOUD_UPGRADE_WEB_TIP') }}</span>
        </div>
        <div
            class="base-btn-box"
            span="center"
        >
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
        <BaseCheckAuthPop
            v-model="pageData.isCheckAuthPop"
            @confirm="confirmUpgrade"
            @close="pageData.isCheckAuthPop = false"
        />
    </div>
</template>

<script lang="ts" src="./CloudUpgrade.v.ts"></script>

<style lang="scss" scoped>
.info {
    display: flex;
    font-size: 14px;
    padding: 10px 15px;

    label {
        width: 150px;
    }

    span {
        width: calc(50% - 150px);
    }
}

.check-log {
    font-size: 20px;
    padding-left: 15px;
    line-height: 2;
    margin: 0;
}

.latest {
    color: var(--error--01);
    font-size: 20px;
    display: flex;
    align-items: center;
    padding-left: 15px;
    line-height: 2;
}
</style>
