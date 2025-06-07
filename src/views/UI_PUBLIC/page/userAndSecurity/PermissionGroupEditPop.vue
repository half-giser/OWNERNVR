<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-17 20:25:35
 * @Description: 编辑权限组弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_EDIT_USER_RIGHT')"
        width="1000"
        @open="open"
    >
        <div>
            <el-form
                v-title
                :style="{
                    '--form-input-width': '250px',
                }"
            >
                <el-form-item :label="Translate('IDCS_USER_RIGHT_GROUP_NAME')">
                    <el-input
                        v-model.trim="formData.name"
                        disabled
                        :formatter="displayAuthGroup"
                    />
                </el-form-item>
            </el-form>
            <div class="base-user-auth-box">
                <div
                    v-for="auth in systemAuthList"
                    :key="auth.key"
                    class="base-user-auth"
                >
                    <div class="base-user-auth-title">
                        {{ auth.label }}
                    </div>
                    <ul class="base-user-auth-list">
                        <li
                            v-for="authItem in auth.value"
                            v-show="!authItem.hidden"
                            :key="authItem.key"
                        >
                            <el-checkbox
                                v-model="authItem.value"
                                :label="authItem.label"
                            />
                        </li>
                    </ul>
                </div>
            </div>
            <div class="base-user-chl">
                <ul>
                    <el-radio-group v-model="pageData.activeChannelTab">
                        <el-radio-button
                            v-for="key in pageData.channelTabs"
                            :key
                            :value="key"
                            :label="Translate(key)"
                        />
                    </el-radio-group>
                </ul>
                <div
                    class="base-user-chl-list"
                    :style="{
                        '--list-height': '200px',
                    }"
                >
                    <div :class="{ active: pageData.activeChannelTab === 'IDCS_LOCAL_RIGHT' }">
                        <el-table
                            v-title
                            :data="channelAuthList"
                            height="200"
                        >
                            <el-table-column
                                prop="name"
                                :label="Translate('IDCS_CHANNEL')"
                                show-overflow-tooltip
                            />
                            <el-table-column
                                v-for="(item, key) in pageData.localChannelIds"
                                :key
                                :label="item.label"
                            >
                                <template #header>
                                    <BaseDropdown>
                                        <BaseTableDropdownLink>
                                            {{ item.label }}
                                        </BaseTableDropdownLink>
                                        <template #dropdown>
                                            <el-dropdown-menu>
                                                <el-dropdown-item
                                                    v-for="opt in pageData.channelOption"
                                                    :key="opt.label"
                                                    @click="changeAllChannelAuth(item.value, opt.value)"
                                                >
                                                    {{ opt.label }}
                                                </el-dropdown-item>
                                            </el-dropdown-menu>
                                        </template>
                                    </BaseDropdown>
                                </template>
                                <template #default="{ $index }">
                                    <BaseSelect
                                        v-model="channelAuthList[$index][item.value]"
                                        :options="pageData.channelOption"
                                    />
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                    <div :class="{ active: pageData.activeChannelTab === 'IDCS_REMOTE_RIGHT' }">
                        <el-table
                            v-title
                            :data="channelAuthList"
                            height="200"
                        >
                            <el-table-column
                                prop="name"
                                :label="Translate('IDCS_CHANNEL')"
                                show-overflow-tooltip
                            />
                            <el-table-column
                                v-for="(item, key) in pageData.remoteChannelIds"
                                :key
                                :label="item.label"
                            >
                                <template #header>
                                    <BaseDropdown>
                                        <BaseTableDropdownLink>
                                            {{ item.label }}
                                        </BaseTableDropdownLink>
                                        <template #dropdown>
                                            <el-dropdown-menu>
                                                <el-dropdown-item
                                                    v-for="opt in pageData.channelOption"
                                                    :key="opt.label"
                                                    @click="changeAllChannelAuth(item.value, opt.value)"
                                                >
                                                    {{ opt.label }}
                                                </el-dropdown-item>
                                            </el-dropdown-menu>
                                        </template>
                                    </BaseDropdown>
                                </template>
                                <template #default="{ $index }">
                                    <BaseSelect
                                        v-model="channelAuthList[$index][item.value]"
                                        :options="pageData.channelOption"
                                    />
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </div>
            </div>
        </div>
        <PermissionGroupInfoPop v-model="pageData.isShowInfo" />
        <div class="base-btn-box space-between">
            <el-button @click="pageData.isShowInfo = true">{{ Translate('IDCS_DESCRIPTION') }}</el-button>
            <div>
                <el-button @click="doEditAuthGroup">{{ Translate('IDCS_ADD') }}</el-button>
                <el-button @click="goBack">{{ Translate('IDCS_CANCEL') }}</el-button>
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./PermissionGroupEditPop.v.ts"></script>
