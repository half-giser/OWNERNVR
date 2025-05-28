<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-17 20:26:14
 * @Description: 权限组列表
-->
<template>
    <div class="base-user-box">
        <div class="base-user-box-left">
            <div class="base-head-box text-ellipsis">{{ Translate('IDCS_GROUP') }}: {{ authGroupName }}</div>
            <div class="base-user-auth">
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
                        :class="{ active: pageData.activeChannelTab === 'IDCS_LOCAL_RIGHT' }"
                    >
                        <el-table
                            v-title
                            :data="channelAuthList"
                        >
                            <el-table-column
                                :label="Translate('IDCS_CHANNEL')"
                                show-overflow-tooltip
                                prop="name"
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
                        class="base-table-box"
                        :class="{ active: pageData.activeChannelTab === 'IDCS_REMOTE_RIGHT' }"
                    >
                        <el-table :data="channelAuthList">
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
                :data="authGroupList"
                width="100%"
                height="100%"
                flexible
                highlight-current-row
                show-overflow-tooltip
                @cell-click="changeAuthGroup"
                @cell-dblclick="openEditAuthGroupPop"
            >
                <el-table-column
                    min-width="220"
                    :label="Translate('IDCS_RIGHT_GROUP')"
                >
                    <template #default="{ row }: TableColumn<UserAuthGroupList>">
                        {{ displayAuthGroup(row.name) }}
                    </template>
                </el-table-column>
                <el-table-column :label="Translate('IDCS_EDIT')">
                    <template #default="{ row }: TableColumn<UserAuthGroupList>">
                        <BaseImgSpriteBtn
                            v-show="isShowEdit(row)"
                            file="edit2"
                            :stop-propagation="false"
                            @click="openEditAuthGroupPop(row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column :label="Translate('IDCS_SAVE_AS')">
                    <template #default="{ row }: TableColumn<UserAuthGroupList>">
                        <BaseImgSpriteBtn
                            v-show="isShowCopy(row)"
                            file="saveas"
                            @click="copyAuthGroup(row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column :label="Translate('IDCS_DELETE')">
                    <template #default="{ row }: TableColumn<UserAuthGroupList>">
                        <BaseImgSpriteBtn
                            v-show="isShowDelete(row)"
                            file="del"
                            :stop-propagation="false"
                            @click="deleteAuthGroup(row)"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <PermissionGroupEditPop
            v-model="pageData.isEditAuthGroup"
            :group-id="pageData.editAuthGroupID"
            @confirm="confirmEditAuthGroup"
            @close="pageData.isEditAuthGroup = false"
        />
    </div>
</template>

<script lang="ts" src="./PermissionGroup.v.ts"></script>
