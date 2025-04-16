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
                v-title
                :data="virtualTableData"
                show-overflow-tooltip
                highlight-current-row
            >
                <el-table-column
                    :label="Translate('IDCS_CHANNEL_NUMBER')"
                    width="80"
                >
                    <template #default="{ $index }: TableColumn<number>">
                        {{ tableData[$index].chlNum }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_CHANNEL_NAME')"
                    min-width="200"
                >
                    <template #default="{ $index }: TableColumn<number>">
                        {{ formatDisplayName(tableData[$index]) }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_ADDRESS')"
                    min-width="140"
                >
                    <template #default="{ $index }: TableColumn<number>">
                        {{ tableData[$index].ip }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_PORT')"
                    width="80"
                >
                    <template #default="{ $index }: TableColumn<number>">
                        {{ tableData[$index].ip === '' ? '' : tableData[$index].port || '' }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_CONNECT_STATUS')"
                    width="100"
                >
                    <template #default="{ $index }: TableColumn<number>">
                        <span
                            class="status"
                            :class="tableData[$index].isOnline ? 'text-online' : 'text-offline'"
                        >
                            {{ tableData[$index].ip === '' ? '' : tableData[$index].isOnline ? Translate('IDCS_ONLINE') : Translate('IDCS_OFFLINE') }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_PROTOCOL')"
                    min-width="140"
                >
                    <template #default="{ $index }: TableColumn<number>">
                        {{ formatDisplayManufacturer(tableData[$index]) }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_PRODUCT_MODEL')"
                    min-width="140"
                >
                    <template #default="{ $index }: TableColumn<number>">
                        {{ tableData[$index].productModel.innerText }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_PREVIEW')"
                    width="80"
                >
                    <template #default="{ $index }: TableColumn<number>">
                        <BaseImgSpriteBtn
                            file="preview"
                            @click="handlePreview(tableData[$index])"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_EDIT')"
                    width="80"
                >
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_EDIT') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click="editIPCPwd">{{ Translate('IDCS_MODIFY_IPC_PASSWORD') }}</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="{ $index }: TableColumn<number>">
                        <BaseImgSpriteBtn
                            file="edit2"
                            @click="editChannel(tableData[$index])"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_DELETE')"
                    width="80"
                >
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_DELETE') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click="delAllChannel">{{ Translate('IDCS_DELETE_ALL') }}</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="{ $index }: TableColumn<number>">
                        <BaseImgSpriteBtn
                            file="del"
                            :disabled="tableData[$index].delDisabled"
                            @click="delChannel(tableData[$index])"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    v-if="userSession.appType !== 'P2P'"
                    :label="Translate('IDCS_CONFIGURATION')"
                    width="80"
                >
                    <template #default="{ $index }: TableColumn<number>">
                        <BaseImgSpriteBtn
                            v-show="tableData[$index].showSetting"
                            file="localCfg"
                            @click="setChannel(tableData[$index])"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_UPGRADE')"
                    width="80"
                >
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_UPGRADE') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click="upgradeIPCBatch">{{ Translate('IDCS_IPC_BATCH_UPGRADE') }}</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="{ $index }: TableColumn<ChannelInfoDto>">
                        <BaseImgSpriteBtn
                            v-show="isShowUpgradeBtn(tableData[$index]) && tableData[$index].upgradeStatus === 'normal'"
                            file="upload"
                            :disabled="isUpgradeDisabled(tableData[$index])"
                            @click="upgradeIPC(tableData[$index])"
                        />
                        <BaseImgSprite
                            v-show="tableData[$index].upgradeStatus === 'error'"
                            file="error"
                            @click="upgradeIPC(tableData[$index])"
                        />
                        <BaseImgSprite
                            v-show="tableData[$index].upgradeStatus === 'success'"
                            file="success"
                        />
                        <span v-show="tableData[$index].upgradeStatus === 'progress'">{{ tableData[$index].upgradeProgressText }}</span>
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_VERSION')"
                    min-width="140"
                >
                    <template #default="{ $index }: TableColumn<number>">
                        {{ tableData[$index].version }}
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="base-btn-box flex-start">
            <div v-show="ipNumVisable">{{ Translate('IDCS_IP_NUM') }} {{ ipNum }}</div>
        </div>
        <div class="base-btn-box flex-start collapse">
            {{ txtBrandwidth }}
        </div>
        <ChannelEditPop
            v-model="channelEditPopVisable"
            :row-data="editRowData"
            :protocol-list="protocolList"
            :manufacturer-map="manufacturerMap"
            :name-mapping="nameMapping"
            @confirm="confirmEditChannel"
            @close="closeEditChannelPop"
        />
        <ChannelEditIPCPwdPop
            v-model="editIPCPwdPopVisiable"
            :edit-data="tableData"
            :name-mapping="nameMapping"
            @close="closeEditIPCPwdPop"
        />
        <BaseLivePop ref="baseLivePopRef" />
        <ChannelIPCUpgradePop ref="channelIPCUpgradePopRef" />
    </div>
</template>

<script lang="ts" src="./Channel.v.ts"></script>
