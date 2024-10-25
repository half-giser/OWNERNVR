<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-05-04 12:58:39
 * @Description: 通道列表
-->
<template>
    <div class="base-flex-box">
        <div class="base-table-box">
            <el-table
                ref="tableRef"
                border
                stripe
                :data="tableData"
                table-layout="fixed"
                show-overflow-tooltip
                empty-text=" "
                highlight-current-row
            >
                <el-table-column
                    prop="chlNum"
                    :label="Translate('IDCS_CHANNEL_NUMBER')"
                    width="80"
                />
                <el-table-column
                    :label="Translate('IDCS_CHANNEL_NAME')"
                    min-width="200"
                >
                    <template #default="scope">
                        {{ formatDisplayName(scope.row) }}
                    </template>
                </el-table-column>
                <el-table-column
                    prop="ip"
                    :label="Translate('IDCS_ADDRESS')"
                    min-width="140"
                />
                <el-table-column
                    :label="Translate('IDCS_PORT')"
                    width="80"
                >
                    <template #default="scope">
                        <!-- 模拟通道端口置空 -->
                        {{ scope.row.ip === '' ? '' : scope.row.port }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_CONNECT_STATUS')"
                    width="100"
                >
                    <template #default="scope">
                        <span
                            class="status"
                            :class="{
                                online: scope.row.isOnline,
                                offline: !scope.row.isOnline,
                            }"
                            >{{ scope.row.ip === '' ? '' : scope.row.isOnline ? Translate('IDCS_ONLINE') : Translate('IDCS_OFFLINE') }}</span
                        >
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_PROTOCOL')"
                    min-width="140"
                >
                    <template #default="scope">
                        {{ formatDisplayManufacturer(scope.row) }}
                    </template>
                </el-table-column>
                <el-table-column
                    prop="productModel.innerText"
                    :label="Translate('IDCS_PRODUCT_MODEL')"
                    min-width="140"
                />
                <el-table-column
                    :label="Translate('IDCS_PREVIEW')"
                    width="80"
                >
                    <template #default="scope">
                        <BaseImgSprite
                            file="play (3)"
                            :chunk="4"
                            :index="0"
                            :hover-index="1"
                            :active-index="1"
                            @click="handlePreview(scope.row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_EDIT')"
                    width="80"
                >
                    <template #header>
                        <el-dropdown trigger="click">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_EDIT') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click="handleEditIPCPwd">{{ Translate('IDCS_MODIFY_IPC_PASSWORD') }}</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <BaseImgSprite
                            file="edit (2)"
                            :chunk="4"
                            :index="0"
                            :hover-index="1"
                            :active-index="1"
                            @click="handleEditChannel(scope.row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_DELETE')"
                    width="80"
                >
                    <template #header>
                        <el-dropdown trigger="click">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_DELETE') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click="handleDelChannelAll">{{ Translate('IDCS_DELETE_ALL') }}</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <BaseImgSprite
                            file="del"
                            :chunk="4"
                            :index="0"
                            :hover-index="1"
                            :active-index="1"
                            :class="{
                                disabled: scope.row.delDisabled,
                            }"
                            @click="handleDelChannel(scope.row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_CONFIGURATION')"
                    width="80"
                >
                    <template #default="scope">
                        <BaseImgSprite
                            v-show="scope.row.showSetting"
                            file="localCfg"
                            :chunk="4"
                            :index="0"
                            :hover-index="1"
                            :active-index="1"
                            @click="handleSettingChannel(scope.row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_UPGRADE')"
                    width="80"
                >
                    <template #header>
                        <el-dropdown trigger="click">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_UPGRADE') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click="handleBatchUpgradeIPC">{{ Translate('IDCS_IPC_BATCH_UPGRADE') }}</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <BaseImgSprite
                            v-show="handleShowUpgradeBtn(scope.row) && scope.row.upgradeStatus === 'normal'"
                            file="upload"
                            :chunk="4"
                            :index="0"
                            :hover-index="1"
                            :active-index="1"
                            :disabled-index="3"
                            :disabled="scope.row.upgradeDisabled"
                            @click="handleUpgradeIPC(scope.row)"
                        />
                        <BaseImgSprite
                            v-show="scope.row.upgradeStatus === 'error'"
                            file="error"
                            :chunk="1"
                            :index="0"
                            @click="handleUpgradeIPC(scope.row)"
                        />
                        <BaseImgSprite
                            v-show="scope.row.upgradeStatus === 'success'"
                            file="success"
                            :chunk="1"
                            :index="0"
                            @click="handleUpgradeIPC(scope.row)"
                        />
                        <span v-show="scope.row.upgradeStatus === 'progress'">{{ scope.row.upgradeProgressText }}</span>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="version"
                    :label="Translate('IDCS_VERSION')"
                    min-width="140"
                />
            </el-table>
        </div>
        <div
            class="base-btn-box"
            span="start"
        >
            <div v-show="ipNumVisable">{{ Translate('IDCS_IP_NUM') }} {{ ipNum }}</div>
        </div>
        <div
            class="base-btn-box collapse"
            span="start"
        >
            {{ txtBrandwidth }}
        </div>
        <ChannelEditPop
            v-model="channelEditPopVisable"
            :row-data="editRowData"
            :protocol-list="protocolList"
            :manufacturer-map="manufacturerMap"
            :name-mapping="editNameMapping"
            :set-data-call-back="setDataCallBack"
            @close="closeEditChannelPop"
        />
        <ChannelEditIPCPwdPop
            v-model="editIPCPwdPopVisiable"
            :edit-data="tableData"
            :name-mapping="editNameMapping"
            @close="closeEditIPCPwdPop"
        />
        <BaseLivePop ref="baseLivePopRef" />
        <BaseNotification v-model:notifications="notifications" />
        <ChannelIPCUpgradePop ref="channelIPCUpgradePopRef" />
    </div>
</template>

<script lang="ts" src="./Channel.v.ts"></script>

<style scoped lang="scss">
.status {
    &.online {
        color: var(--color-online);
    }
    &.offline {
        color: var(--color-offline);
    }
}
</style>
