<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-05-04 12:58:39
 * @Description: 查看或更改用户
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-30 18:12:13
-->
<template>
    <div class="User">
        <div class="User-left">
            <div class="base-subheading-box">{{ Translate('IDCS_USER') }}: {{ userName }}</div>
            <div
                v-show="!authEffective"
                class="no-auth"
            >
                {{ Translate('IDCS_CLOSE_PERMISSION_CONTROL') }}
            </div>
            <div
                v-show="authEffective"
                class="system"
            >
                <template
                    v-for="auth in systemAuthList"
                    :key="auth.key"
                >
                    <div class="title">
                        {{ Translate(auth.key) }}
                    </div>
                    <ul class="list">
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
                            <span>{{ Translate(authItem.key) }}</span>
                        </li>
                    </ul>
                </template>
            </div>
            <div
                v-show="authEffective"
                class="channel"
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
                <div class="base-table-box">
                    <div v-show="pageData.activeChannelTab === 'IDCS_LOCAL_RIGHT'">
                        <el-table
                            :data="channelAuthList"
                            border
                            stripe
                            scrollbar-always-on
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
                                :label="Translate(item.label)"
                            >
                                <template #default="{ $index }">
                                    {{ displayChannelAuth(channelAuthList[$index][item.value]) }}
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                    <div v-show="pageData.activeChannelTab === 'IDCS_REMOTE_RIGHT'">
                        <el-table
                            :data="channelAuthList"
                            border
                            stripe
                            scrollbar-always-on
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
                                :label="Translate(item.label)"
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
        <div class="User-right">
            <el-table
                ref="tableRef"
                :data="userList"
                width="100%"
                height="100%"
                border
                stripe
                flexible
                highlight-current-row
                show-overflow-tooltip
                @cell-click="handleChangeUser"
                @cell-dblclick="handleEditUser"
            >
                <el-table-column
                    prop="userName"
                    :label="Translate('IDCS_USERNAME')"
                    min-width="150"
                >
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_RIGHT_GROUP')"
                    min-width="150"
                >
                    <template #default="scope">
                        {{ displayAuthGroup(scope.row.authGroupName) }}
                    </template>
                </el-table-column>
                <el-table-column :label="Translate('IDCS_EDIT')">
                    <template #default="scope">
                        <BaseImgSprite
                            v-show="scope.row.edit"
                            file="edit (2)"
                            :index="0"
                            :hover-index="1"
                            :chunk="4"
                            @click.stop="handleEditUser(scope.row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column :label="Translate('IDCS_DELETE')">
                    <template #default="scope">
                        <BaseImgSprite
                            v-show="scope.row.del"
                            file="del"
                            :index="0"
                            :hover-index="1"
                            :chunk="4"
                            @click.stop="handleDeleteUser(scope.row)"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <UserEditPop
            v-model="pageData.isEditUser"
            :user-id="pageData.editUserId"
            @close="handleCloseEditUser"
            @reset-password="handleEditUserPassword"
        />
        <UserEditPasswordPop
            v-model="pageData.isEditUserPassword"
            :user-id="pageData.editUserId"
            :user-name="pageData.editUserName"
            @close="handleCloseEditUserPassword"
        />
    </div>
</template>

<script lang="ts" src="./User.v.ts"></script>

<style lang="scss" scoped>
.User {
    width: 100%;
    height: var(--content-height);
    display: flex;

    &-left {
        width: 550px;
        height: 100%;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        margin-right: 5px;
        overflow: hidden;
    }

    .ellipsis {
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .system {
        width: 100%;
        flex-shrink: 0;
        margin-top: 12px;

        .title {
            border-left: 3px solid var(--content-border);
            height: 30px;
            line-height: 30px;
            padding-left: 15px;
            margin-left: 15px;
        }

        .list {
            width: 100%;
            display: flex;
            flex-wrap: wrap;
            margin: 0;

            li {
                width: 50%;
                height: 35px;
                line-height: 35px;
                display: flex;
                align-items: center;
                // padding-left: 20px;
                box-sizing: border-box;
            }
        }
    }

    .channel {
        height: 100%;
        margin-top: 10px;
        display: flex;
        flex-direction: column;

        ul {
            display: flex;
            justify-content: center;
            border: 1px solid var(--table-border);
            margin: 0;
            padding: 5px;
            flex-shrink: 0;
        }

        .list {
            height: 100%;
            position: relative;
        }

        :deep(.el-table) {
            position: absolute;
            width: 100%;
            height: 100%;
        }
    }

    .no-auth {
        font-size: 30px;
        font-weight: bold;
        padding-top: 50px;
        text-align: center;
    }

    &-right {
        width: 100%;

        :deep(.el-table) {
            width: 100%;
            height: var(--content-height);

            tbody {
                cursor: pointer;
            }
        }
    }
}
</style>
