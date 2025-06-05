<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-16 16:18:16
 * @Description: 云升级
-->
<template>
    <div class="base-flex-box">
        <el-form
            v-title
            class="no-padding"
        >
            <el-form-item :label="Translate('IDCS_UPGRADE_OPTIONS')">
                <el-select-v2
                    v-model="formData.upgradeType"
                    :options="pageData.upgradeOptions"
                />
                <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
            </el-form-item>
        </el-form>
        <div class="tab">
            <div
                class="tab-btn"
                :class="{ active: pageData.tab === 'nvr' }"
                @click="pageData.tab = 'nvr'"
            >
                {{ Translate('IDCS_UPGRADE_DEV') }}
            </div>
            <div
                class="tab-btn"
                :class="{ active: pageData.tab === 'ipc' }"
                @click="pageData.tab = 'ipc'"
            >
                {{ Translate('IDCS_UPGRADE_NODE') }}
            </div>
        </div>
        <div v-show="pageData.tab === 'nvr'">
            <el-form v-title>
                <el-form-item :label="Translate('IDCS_ONLINE_UPGRADE_CURRENT_VER')">
                    {{ nvrFormData.version }}
                </el-form-item>
                <el-form-item v-show="isUpdateNotify && !nvrFormData.newVersionGUID">
                    <span class="check-log">{{ Translate('IDCS_ONLINE_UPGRADE_TIP_LATEST') }}</span>
                </el-form-item>
                <el-form-item
                    v-show="nvrFormData.newVersionGUID"
                    :label="Translate('IDCS_UPGRADE_NEW_VER')"
                >
                    {{ nvrFormData.newVersion }}
                </el-form-item>
                <el-form-item
                    v-show="nvrFormData.newVersionGUID"
                    :label="Translate('IDCS_NEW_FEATURES')"
                >
                    <el-input
                        type="textarea"
                        :readonly="true"
                        :model-value="nvrFormData.newVersionNote"
                    />
                </el-form-item>
                <el-form-item
                    v-show="nvrFormData.state === 'downloading' || nvrFormData.progress"
                    :label="Translate('IDCS_UPGRADE_DOWN_RATE')"
                >
                    <span class="text-ellipsis">{{ nvrFormData.progress }}</span>
                </el-form-item>
                <el-form-item v-show="nvrFormData.state === 'downloadSuccess' || nvrFormData.state === 'installing'">
                    <span class="text-ellipsis">{{ Translate('IDCS_UPGRADE_DOWN_FINISHED') }}</span>
                </el-form-item>
                <el-form-item v-show="isUpdateNotify">
                    <div class="latest text-error">
                        <BaseImgSprite file="warnIcon" />
                        <span>{{ Translate('IDCS_CLOUD_UPGRADE_WEB_TIP') }}</span>
                    </div>
                </el-form-item>
            </el-form>
        </div>
        <div
            v-show="pageData.tab === 'ipc'"
            class="base-table-box"
        >
            <el-table
                v-title
                :data="ipcTableData"
                row-key="id"
                height="100%"
            >
                <!-- 通道名称 -->
                <el-table-column
                    :label="Translate('IDCS_CHANNEL_NAME')"
                    min-width="240"
                    show-overflow-tooltip
                >
                    <template #default="{ row }: TableColumn<NetCloudUpgradeIPCInfoList>">
                        {{ row.chlName }}
                    </template>
                </el-table-column>
                <!-- ip地址 -->
                <el-table-column
                    :label="Translate('IDCS_ADDRESS')"
                    min-width="240"
                    show-overflow-tooltip
                >
                    <template #default="{ row }: TableColumn<NetCloudUpgradeIPCInfoList>">
                        {{ row.ip }}
                    </template>
                </el-table-column>
                <!-- 当前版本 -->
                <el-table-column
                    :label="Translate('IDCS_ONLINE_UPGRADE_CURRENT_VER')"
                    min-width="240"
                    show-overflow-tooltip
                >
                    <template #default="{ row }: TableColumn<NetCloudUpgradeIPCInfoList>">
                        {{ row.version }}
                    </template>
                </el-table-column>
                <!-- 新版本 -->
                <el-table-column
                    :label="Translate('IDCS_UPGRADE_NEW_VER')"
                    width="240"
                    show-overflow-tooltip
                >
                    <template #default="{ row }: TableColumn<NetCloudUpgradeIPCInfoList>">
                        {{ formatIpcNewVersion(row) }}
                    </template>
                </el-table-column>
                <!-- 云升级 -->
                <el-table-column
                    :label="Translate('IDCS_ONLINE_UPGRADE')"
                    width="140"
                    show-overflow-tooltip
                >
                    <template #default="{ row }: TableColumn<NetCloudUpgradeIPCInfoList>">
                        {{ formatIpcUpgradeState(row) }}
                    </template>
                </el-table-column>
                <!-- 升级 -->
                <el-table-column
                    :label="Translate('IDCS_UPGRADE')"
                    width="140"
                    show-overflow-tooltip
                >
                    <template #default="{ row }: TableColumn<NetCloudUpgradeIPCInfoList>">
                        <el-button
                            :disabled="disabledIPCUpgrade(row)"
                            @click="handleIPCUpgrade([row])"
                        >
                            {{ Translate('IDCS_UPGRADE') }}
                        </el-button>
                    </template>
                </el-table-column>
                <!-- 详情 -->
                <el-table-column
                    :label="Translate('IDCS_DETAIL')"
                    width="140"
                    show-overflow-tooltip
                >
                    <template #default="{ row, $index }: TableColumn<NetCloudUpgradeIPCInfoList>">
                        <el-button
                            :disabled="disabledIPCDetail(row)"
                            @click="showDetail($index)"
                        >
                            {{ Translate('IDCS_DETAIL') }}
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="base-btn-box">
            <el-button
                :disabled="!isUpdateNotify"
                @click="getVersion"
            >
                {{ Translate('IDCS_ONLINE_UPGRADE_CHECK') }}
            </el-button>
            <el-button
                v-show="pageData.tab === 'nvr'"
                :disabled="disabledNVRUpgrade"
                @click="handleNVRUpgrade"
            >
                {{ Translate('IDCS_UPGRADE') }}
            </el-button>
            <el-button
                v-show="pageData.tab === 'ipc'"
                :disabled="!isUpdateNotify"
                @click="batchIPCUpgrade"
            >
                {{ Translate('IDCS_NODE_BATCH_UPGRADE') }}
            </el-button>
        </div>
    </div>
    <!-- ipc升级信息详情弹窗 -->
    <CloudUpgradeIPCInfoPop
        v-model="pageData.isDetailPop"
        :active-index="pageData.detailIndex"
        :data="pageData.detailList"
        @close="pageData.isDetailPop = false"
    />
    <!-- 鉴权弹框 -->
    <BaseCheckAuthPop
        v-model="pageData.isCheckAuthPop"
        @confirm="confirmNVRUpgrade"
        @close="pageData.isCheckAuthPop = false"
    />
</template>

<script lang="ts" src="./CloudUpgrade.v.ts"></script>

<style lang="scss" scoped>
.tab {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    border-bottom: 1px solid var(--table-border);
    margin-bottom: 10px;

    &-btn {
        padding: 4px 10px;
        border-bottom: 5px solid transparent;
        font-size: 15px;
        cursor: pointer;
        margin-right: 10px;

        &.active {
            border-bottom-color: var(--primary);
        }
    }
}

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
