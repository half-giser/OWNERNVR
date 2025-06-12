<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-17 20:25:35
 * @Description: 添加权限组
-->
<template>
    <div class="base-flex-box">
        <el-form
            ref="formRef"
            v-title
            :rules
            :model="formData"
        >
            <el-form-item
                prop="name"
                :label="Translate('IDCS_USER_RIGHT_GROUP_NAME')"
            >
                <BaseTextInput
                    v-model="formData.name"
                    :maxlength="formData.nameMaxByteLen"
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
            <div class="base-user-chl-list">
                <div
                    class="base-table-box"
                    :class="{
                        active: pageData.activeChannelTab === 'IDCS_LOCAL_RIGHT',
                    }"
                >
                    <el-table
                        v-title
                        :data="channelAuthList"
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
                <div
                    class="base-table-box"
                    :class="{ active: pageData.activeChannelTab === 'IDCS_REMOTE_RIGHT' }"
                >
                    <el-table
                        v-title
                        :data="channelAuthList"
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
        <div class="base-btn-box space-between">
            <el-button @click="pageData.isShowInfo = true">{{ Translate('IDCS_DESCRIPTION') }}</el-button>
            <div>
                <el-button @click="verify">{{ Translate('IDCS_ADD') }}</el-button>
                <el-button @click="goBack">{{ Translate('IDCS_CANCEL') }}</el-button>
            </div>
        </div>
        <PermissionGroupInfoPop v-model="pageData.isShowInfo" />
    </div>
</template>

<script lang="ts" src="./PermissionGroupAdd.v.ts"></script>
