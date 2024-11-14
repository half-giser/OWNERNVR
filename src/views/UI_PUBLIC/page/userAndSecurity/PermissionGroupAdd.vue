<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-17 20:25:35
 * @Description: 添加权限组
-->
<template>
    <div class="base-flex-box">
        <el-form
            ref="formRef"
            class="form"
            :rules
            :model="formData"
            :style="{
                '--form-input-width': '340px',
            }"
            inline-message
        >
            <el-form-item
                prop="name"
                :label="Translate('IDCS_USER_RIGHT_GROUP_NAME')"
            >
                <el-input
                    v-model.trim="formData.name"
                    :formatter="formatInputMaxLength"
                    :parser="formatInputMaxLength"
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
                    {{ Translate(auth.key) }}
                </div>
                <ul class="base-user-auth-list">
                    <li
                        v-for="authItem in auth.value"
                        v-show="!authItem.hidden"
                        :key="authItem.key"
                    >
                        <el-checkbox
                            v-model="authItem.value"
                            :label="Translate(authItem.key)"
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
                        :data="channelAuthList"
                        border
                        stripe
                        scrollbar-always-on
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
                                <el-dropdown>
                                    <BaseTableDropdownLink>
                                        {{ Translate(item.label) }}
                                    </BaseTableDropdownLink>
                                    <template #dropdown>
                                        <el-dropdown-menu>
                                            <el-dropdown-item
                                                v-for="opt in pageData.channelOption"
                                                :key="opt.value"
                                                @click="changeAllChannelAuth(item.value, opt.label)"
                                            >
                                                {{ opt.label }}
                                            </el-dropdown-item>
                                        </el-dropdown-menu>
                                    </template>
                                </el-dropdown>
                            </template>
                            <template #default="{ $index }">
                                <el-select
                                    v-model="channelAuthList[$index][item.value]"
                                    :persistent="false"
                                >
                                    <el-option
                                        v-for="value in pageData.channelOption"
                                        :key="value.value"
                                        :label="value.label"
                                        :value="value.value"
                                    />
                                </el-select>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                <div
                    class="base-table-box"
                    :class="{ active: pageData.activeChannelTab === 'IDCS_REMOTE_RIGHT' }"
                >
                    <el-table
                        :data="channelAuthList"
                        border
                        stripe
                        scrollbar-always-on
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
                                <el-dropdown>
                                    <BaseTableDropdownLink>
                                        {{ Translate(item.label) }}
                                    </BaseTableDropdownLink>
                                    <template #dropdown>
                                        <el-dropdown-menu>
                                            <el-dropdown-item
                                                v-for="opt in pageData.channelOption"
                                                :key="opt.value"
                                                @click="changeAllChannelAuth(item.value, opt.label)"
                                            >
                                                {{ opt.label }}
                                            </el-dropdown-item>
                                        </el-dropdown-menu>
                                    </template>
                                </el-dropdown>
                            </template>
                            <template #default="{ $index }">
                                <el-select
                                    v-model="channelAuthList[$index][item.value]"
                                    :persistent="false"
                                >
                                    <el-option
                                        v-for="value in pageData.channelOption"
                                        :key="value.value"
                                        :label="value.label"
                                        :value="value.value"
                                    />
                                </el-select>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </div>
        <div
            class="base-btn-box"
            span="2"
        >
            <div>
                <el-button @click="pageData.isShowInfo = true">{{ Translate('IDCS_DESCRIPTION') }}</el-button>
            </div>
            <div>
                <el-button @click="verify">{{ Translate('IDCS_ADD') }}</el-button>
                <el-button @click="goBack">{{ Translate('IDCS_CANCEL') }}</el-button>
            </div>
        </div>
        <PermissionGroupInfoPop v-model="pageData.isShowInfo" />
    </div>
</template>

<script lang="ts" src="./PermissionGroupAdd.v.ts"></script>
