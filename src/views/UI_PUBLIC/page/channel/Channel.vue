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
                :data="tableData"
                show-overflow-tooltip
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
                    <template #default="{ row }: TableColumn<ChannelInfoDto>">
                        {{ formatDisplayName(row) }}
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
                    <template #default="{ row }: TableColumn<ChannelInfoDto>">
                        <!-- 模拟通道端口置空 -->
                        {{ row.ip === '' ? '' : row.port }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_CONNECT_STATUS')"
                    width="100"
                >
                    <template #default="{ row }: TableColumn<ChannelInfoDto>">
                        <span
                            class="status"
                            :class="[row.isOnline ? 'text-online' : 'text-offline']"
                        >
                            {{ row.ip === '' ? '' : row.isOnline ? Translate('IDCS_ONLINE') : Translate('IDCS_OFFLINE') }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_PROTOCOL')"
                    min-width="140"
                >
                    <template #default="{ row }: TableColumn<ChannelInfoDto>">
                        {{ formatDisplayManufacturer(row) }}
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
                    <template #default="{ row }: TableColumn<ChannelInfoDto>">
                        <BaseImgSpriteBtn
                            file="preview"
                            @click="handlePreview(row)"
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
                    <template #default="{ row }: TableColumn<ChannelInfoDto>">
                        <BaseImgSpriteBtn
                            file="edit2"
                            @click="editChannel(row)"
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
                    <template #default="{ row }: TableColumn<ChannelInfoDto>">
                        <BaseImgSpriteBtn
                            file="del"
                            :disabled="row.delDisabled"
                            @click="delChannel(row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    v-if="userSession.appType !== 'P2P'"
                    :label="Translate('IDCS_CONFIGURATION')"
                    width="80"
                >
                    <template #default="{ row }: TableColumn<ChannelInfoDto>">
                        <BaseImgSpriteBtn
                            v-show="row.showSetting"
                            file="localCfg"
                            @click="setChannel(row)"
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
                    <template #default="{ row }: TableColumn<ChannelInfoDto>">
                        <BaseImgSpriteBtn
                            v-show="isShowUpgradeBtn(row) && row.upgradeStatus === 'normal'"
                            file="upload"
                            :disabled="row.upgradeDisabled"
                            @click="upgradeIPC(row)"
                        />
                        <BaseImgSprite
                            v-show="row.upgradeStatus === 'error'"
                            file="error"
                            @click="upgradeIPC(row)"
                        />
                        <BaseImgSprite
                            v-show="row.upgradeStatus === 'success'"
                            file="success"
                            @click="upgradeIPC(row)"
                        />
                        <span v-show="row.upgradeStatus === 'progress'">{{ row.upgradeProgressText }}</span>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="version"
                    :label="Translate('IDCS_VERSION')"
                    min-width="140"
                />
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
            :name-mapping="editNameMapping"
            @confirm="confirmEditChannel"
            @close="closeEditChannelPop"
        />
        <ChannelEditIPCPwdPop
            v-model="editIPCPwdPopVisiable"
            :edit-data="tableData"
            :name-mapping="editNameMapping"
            @close="closeEditIPCPwdPop"
        />
        <BaseLivePop ref="baseLivePopRef" />
        <ChannelIPCUpgradePop ref="channelIPCUpgradePopRef" />
    </div>
</template>

<script lang="ts" src="./Channel.v.ts"></script>
