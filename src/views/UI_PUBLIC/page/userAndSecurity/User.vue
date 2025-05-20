<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-05-04 12:58:39
 * @Description: 查看或更改用户
-->
<template>
    <div class="base-user-box">
        <div class="base-user-box-left">
            <div class="base-head-box text-ellipsis">{{ Translate('IDCS_USER') }}: {{ userName }}</div>
            <div
                v-show="!authEffective"
                class="base-user-auth-none"
            >
                {{ Translate('IDCS_CLOSE_PERMISSION_CONTROL') }}
            </div>
            <div
                v-show="authEffective"
                class="base-user-auth"
            >
                <template
                    v-for="auth in systemAuthList"
                    :key="auth.key"
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
                            <BaseImgSprite
                                file="tick"
                                :style="{
                                    visibility: authItem.value ? 'visible' : 'hidden',
                                }"
                            />
                            <span>{{ authItem.label }}</span>
                        </li>
                    </ul>
                </template>
            </div>
            <div
                v-show="authEffective"
                class="base-user-chl"
            >
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
                        :class="{ active: pageData.activeChannelTab === 'IDCS_LOCAL_RIGHT' }"
                        class="base-table-box"
                    >
                        <el-table
                            v-title
                            :data="channelAuthList"
                            class="fill"
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
                                <template #default="{ $index }">
                                    {{ displayChannelAuth(channelAuthList[$index][item.value]) }}
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                    <div
                        :class="{ active: pageData.activeChannelTab === 'IDCS_REMOTE_RIGHT' }"
                        class="base-table-box"
                    >
                        <el-table
                            v-title
                            :data="channelAuthList"
                            class="fill"
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
                                <template #default="{ $index }">
                                    {{ displayChannelAuth(channelAuthList[$index][item.value]) }}
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </div>
            </div>
        </div>
        <div class="base-user-box-right">
            <el-table
                ref="tableRef"
                v-title
                :data="userList"
                width="100%"
                height="100%"
                flexible
                highlight-current-row
                show-overflow-tooltip
                @cell-click="changeUser"
                @cell-dblclick="openEditUserPop"
            >
                <el-table-column
                    prop="userName"
                    :label="Translate('IDCS_USERNAME')"
                    min-width="150"
                />
                <el-table-column
                    :label="Translate('IDCS_RIGHT_GROUP')"
                    min-width="150"
                >
                    <template #default="{ row }: TableColumn<UserList>">
                        {{ displayAuthGroup(row.authGroupName) }}
                    </template>
                </el-table-column>
                <el-table-column :label="Translate('IDCS_EDIT')">
                    <template #default="{ row }: TableColumn<UserList>">
                        <BaseImgSpriteBtn
                            v-show="row.edit"
                            file="edit2"
                            :stop-propagation="false"
                            @click="openEditUserPop(row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column :label="Translate('IDCS_DELETE')">
                    <template #default="{ row }: TableColumn<UserList>">
                        <BaseImgSpriteBtn
                            v-show="row.del"
                            file="del"
                            :stop-propagation="false"
                            @click="deleteUser(row)"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <UserEditPop
            v-model="pageData.isEditUser"
            :user-id="pageData.editUserId"
            @confirm="confirmEditUser"
            @close="pageData.isEditUser = false"
            @reset-password="openEditUserPasswordPop"
        />
        <UserEditPasswordPop
            v-model="pageData.isEditUserPassword"
            :user-id="pageData.editUserId"
            :user-name="pageData.editUserName"
            @close="pageData.isEditUserPassword = false"
        />
        <BaseCheckAuthPop
            v-model="pageData.isCheckAuthPop"
            title="IDCS_CERTIFICATION_RIGHT"
            @confirm="confirmDeleteUser"
            @close="pageData.isCheckAuthPop = false"
        />
    </div>
</template>

<script lang="ts" src="./User.v.ts"></script>
