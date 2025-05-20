<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-18 18:43:21
 * @Description: 登出后预览
-->
<template>
    <div class="base-chl-box">
        <div class="base-chl-box-left">
            <div class="base-chl-box-player">
                <BaseVideoPlayer
                    ref="playerRef"
                    @ready="onReady"
                />
            </div>
            <el-form
                v-title
                class="stripe"
            >
                <el-form-item :label="Translate('IDCS_CHANNEL_SELECT')">
                    <el-select-v2
                        v-model="pageData.activeChannelIndex"
                        :options="chlOptions"
                        @change="changeChl"
                    />
                </el-form-item>
                <el-form-item
                    v-if="tableData[pageData.activeChannelIndex]"
                    :label="Translate('IDCS_PREVIEW')"
                >
                    <el-select-v2
                        v-model="tableData[pageData.activeChannelIndex].switch"
                        :options="pageData.channelOptions"
                    />
                </el-form-item>
            </el-form>
        </div>
        <div class="base-chl-box-right">
            <div class="base-table-box">
                <el-table
                    ref="tableRef"
                    v-title
                    :data="tableData"
                    show-overflow-tooltip
                    highlight-current-row
                    @row-click="changeUser"
                >
                    <el-table-column
                        :label="Translate('IDCS_CHANNEL_NAME')"
                        prop="name"
                    />
                    <el-table-column :label="Translate('IDCS_PREVIEW')">
                        <template #header>
                            <el-dropdown>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_PREVIEW') }}
                                </BaseTableDropdownLink>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="opt in pageData.channelOptions"
                                            :key="opt.value"
                                            @click="changeAllChannel(opt.value)"
                                        >
                                            {{ opt.label }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="{ row }: TableColumn<UserPreviewOnLogoutChannelList>">
                            <el-select-v2
                                v-model="row.switch"
                                :options="pageData.channelOptions"
                            />
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="base-btn-box">
                <el-button
                    :disabled="watchEdit.disabled.value"
                    @click="setData"
                >
                    {{ Translate('IDCS_APPLY') }}
                </el-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./PreviewOnLogout.v.ts"></script>
