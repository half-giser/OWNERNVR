<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-16 16:18:16
 * @Description: 云升级
-->
<template>
    <div class="base-flex-box">
        <div>
            <el-form v-title>
                <el-form-item :label="Translate('IDCS_UPGRADE_OPTIONS')">
                    <el-select-v2
                        v-model="pageData.upgradeType"
                        :options="pageData.upgradeOptions"
                    />
                    <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div>
            <el-tabs
                v-model="pageData.tab"
                class="base-upgrade-tabs"
            >
                <!-- 设备升级 -->
                <el-tab-pane
                    :label="Translate('IDCS_UPGRADE_DEV')"
                    name="dev"
                >
                    <el-form v-title>
                        <el-form-item :label="Translate('IDCS_ONLINE_UPGRADE_CURRENT_VER')">
                            <span class="text-ellipsis">{{ pageData.devInfoObj.version }}</span>
                        </el-form-item>
                        <el-form-item v-show="!pageData.devInfoObj.newVersionGUID">
                            <span class="check-log">{{ Translate('IDCS_ONLINE_UPGRADE_TIP_LATEST') }}</span>
                        </el-form-item>
                        <el-form-item
                            v-show="pageData.devInfoObj.newVersionGUID"
                            :label="Translate('IDCS_UPGRADE_NEW_VER')"
                        >
                            <span class="text-ellipsis">{{ pageData.devInfoObj.newVersion }}</span>
                        </el-form-item>
                        <el-form-item
                            v-show="pageData.devInfoObj.newVersionGUID"
                            :label="Translate('IDCS_NEW_FEATURES')"
                        >
                            <el-input
                                type="textarea"
                                :readonly="true"
                                :model-value="pageData.devInfoObj.newVersionNote"
                            />
                        </el-form-item>
                        <el-form-item
                            v-show="pageData.devInfoObj.state === 'downloading' || pageData.devInfoObj.progress"
                            :label="Translate('IDCS_UPGRADE_DOWN_RATE')"
                        >
                            <span class="text-ellipsis">{{ pageData.devInfoObj.progress }}</span>
                        </el-form-item>
                        <el-form-item v-show="pageData.devInfoObj.state === 'downloadSuccess' || pageData.devInfoObj.state === 'installing'">
                            <span class="text-ellipsis">{{ Translate('IDCS_UPGRADE_DOWN_FINISHED') }}</span>
                        </el-form-item>
                        <el-form-item v-show="pageData.isUpdateNotify">
                            <div class="latest text-error">
                                <BaseImgSprite file="warnIcon" />
                                <span>{{ Translate('IDCS_CLOUD_UPGRADE_WEB_TIP') }}</span>
                            </div>
                        </el-form-item>
                    </el-form>
                </el-tab-pane>
                <!-- 通道升级 -->
                <el-tab-pane
                    :label="Translate('IDCS_UPGRADE_NODE')"
                    name="ipc"
                >
                    <div class="base-table-box">
                        <el-table
                            v-title
                            :data="pageData.ipcInfoList"
                            row-key="id"
                            height="100%"
                        >
                            <!-- 通道名称 -->
                            <el-table-column
                                :label="Translate('IDCS_CHANNEL_NAME')"
                                min-width="240"
                                show-overflow-tooltip
                            >
                                <template #default="{ $index }: TableColumn<number>">
                                    {{ pageData.ipcInfoList[$index].chlName }}
                                </template>
                            </el-table-column>
                            <!-- ip地址 -->
                            <el-table-column
                                :label="Translate('IDCS_ADDRESS')"
                                min-width="240"
                                show-overflow-tooltip
                            >
                                <template #default="{ $index }: TableColumn<number>">
                                    {{ pageData.ipcInfoList[$index].ip }}
                                </template>
                            </el-table-column>
                            <!-- 当前版本 -->
                            <el-table-column
                                :label="Translate('IDCS_ONLINE_UPGRADE_CURRENT_VER')"
                                min-width="240"
                                show-overflow-tooltip
                            >
                                <template #default="{ $index }: TableColumn<number>">
                                    {{ pageData.ipcInfoList[$index].version }}
                                </template>
                            </el-table-column>
                            <!-- 新版本 -->
                            <el-table-column
                                :label="Translate('IDCS_UPGRADE_NEW_VER')"
                                width="240"
                                show-overflow-tooltip
                            >
                                <template #default="{ $index }: TableColumn<number>">
                                    {{ pageData.ipcInfoList[$index].formatNewVersion }}
                                </template>
                            </el-table-column>
                            <!-- 云升级 -->
                            <el-table-column
                                :label="Translate('IDCS_ONLINE_UPGRADE')"
                                width="140"
                                show-overflow-tooltip
                            >
                                <template #default="{ $index }: TableColumn<number>">
                                    {{ pageData.ipcInfoList[$index].formatState }}
                                </template>
                            </el-table-column>
                            <!-- 升级 -->
                            <el-table-column
                                :label="Translate('IDCS_UPGRADE')"
                                width="140"
                                show-overflow-tooltip
                            >
                                <template #default="{ $index }: TableColumn<number>">
                                    <el-button
                                        :disabled="disabledIpcSingleUpgrade(pageData.ipcInfoList[$index])"
                                        @click="ipcUpgrade([pageData.ipcInfoList[$index]])"
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
                                <template #default="{ $index }: TableColumn<number>">
                                    <el-button
                                        :disabled="disabledIpcSingleDetail(pageData.ipcInfoList[$index])"
                                        @click="showDetail($index)"
                                    >
                                        {{ Translate('IDCS_DETAIL') }}
                                    </el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>
        <div class="base-btn-box">
            <el-button
                :disabled="disabledCheckVersion"
                @click="getVersion"
            >
                {{ Translate('IDCS_ONLINE_UPGRADE_CHECK') }}
            </el-button>
            <el-button
                v-show="pageData.tab === 'dev'"
                :disabled="disabledDevUpgrade"
                @click="devUpgrade"
            >
                {{ Translate('IDCS_UPGRADE') }}
            </el-button>
            <el-button
                v-show="pageData.tab === 'ipc'"
                :disabled="disabledIpcUpgrade"
                @click="ipcUpgrade(pageData.ipcInfoList)"
            >
                {{ Translate('IDCS_NODE_BATCH_UPGRADE') }}
            </el-button>
        </div>
    </div>
    <!-- ipc升级信息详情弹窗 -->
    <IpcInfoDetailPop
        v-model="pageData.isDetailPop"
        :active-index="pageData.activeTableIndex"
        :data="pageData.ipcInfoList"
        @change="changeDetail"
        @close="closeDetail"
    />
    <!-- 鉴权弹框 -->
    <BaseCheckAuthPop
        v-model="pageData.isCheckAuthPop"
        @confirm="confirmDevUpgrade"
        @close="pageData.isCheckAuthPop = false"
    />
</template>

<script lang="ts" src="./CloudUpgrade.v.ts"></script>

<style lang="scss" scoped>
.base-upgrade-tabs {
    & > :deep(.el-tabs__header) {
        padding: 0px 15px;
    }
}

.check-log {
    font-size: 20px;
}

.base-table-box {
    box-sizing: border-box;
    margin: 0px 15px;
    min-height: 696px;
}

.base-btn-box {
    box-sizing: border-box;
    padding-right: 20px;
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
