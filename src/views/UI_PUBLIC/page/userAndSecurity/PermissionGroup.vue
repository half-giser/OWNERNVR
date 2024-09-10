<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-17 20:26:14
 * @Description: 权限组列表
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-06 18:21:41
-->
<template>
    <div class="Perm">
        <div class="Perm-left">
            <div class="base-subheading-box">{{ Translate('IDCS_GROUP') }}: {{ authGroupName }}</div>
            <div class="system">
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
            <div class="channel">
                <ul>
                    <el-radio-group v-model="pageData.activeChannelTab">
                        <el-radio-button
                            v-for="key in pageData.channelTabs"
                            :key
                            :value="key"
                            >{{ Translate(key) }}</el-radio-button
                        >
                    </el-radio-group>
                </ul>
                <div class="list">
                    <div
                        v-show="pageData.activeChannelTab === 'IDCS_LOCAL_RIGHT'"
                        class="base-table-box"
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
                            >
                                <template #default="scope">
                                    <el-tooltip :content="scope.row.name">
                                        <div class="ellipsis">{{ scope.row.name }}</div>
                                    </el-tooltip>
                                </template>
                            </el-table-column>
                            <el-table-column
                                v-for="(item, key) in pageData.localChannelIds"
                                :key
                                :label="Translate(item.label)"
                            >
                                <template #default="{ $index }">
                                    <el-text>{{ displayChannelAuth(channelAuthList[$index][item.value]) }}</el-text>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                    <div
                        v-show="pageData.activeChannelTab === 'IDCS_REMOTE_RIGHT'"
                        class="base-table-box"
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
                            >
                                <template #default="scope">
                                    <el-tooltip :content="scope.row.name">
                                        <div class="ellipsis">{{ scope.row.name }}</div>
                                    </el-tooltip>
                                </template>
                            </el-table-column>
                            <el-table-column
                                v-for="(item, key) in pageData.remoteChannelIds"
                                :key
                                :label="Translate(item.label)"
                            >
                                <template #default="{ $index }">
                                    <el-text>{{ displayChannelAuth(channelAuthList[$index][item.value]) }}</el-text>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </div>
            </div>
        </div>
        <div class="Perm-right">
            <el-table
                :data="authGroupList"
                width="100%"
                height="100%"
                border
                stripe
                :current-row-key="pageData.activeAuthGroup"
                flexible
                :row-class-name="(item) => (item.rowIndex === pageData.activeAuthGroup ? 'active' : '')"
                @cell-click="handleChangeAuthGroup"
                @cell-dblclick="handleEditAuthGroup"
            >
                <el-table-column
                    prop="name"
                    :label="Translate('IDCS_RIGHT_GROUP')"
                    :formatter="(row, column, value) => displayAuthGroup(value)"
                >
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_EDIT')"
                    prop="enableEdit"
                >
                    <template #default="scope">
                        <BaseImgSprite
                            v-show="scope.row.enableEdit"
                            file="edit (2)"
                            :index="0"
                            :hover-index="1"
                            :chunk="4"
                            @click.stop="handleEditAuthGroup(scope.row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column :label="Translate('IDCS_SAVE_AS')">
                    <template #default="scope">
                        <BaseImgSprite
                            file="saveas"
                            :index="0"
                            :hover-index="1"
                            :chunk="4"
                            @click.stop="handleSaveAsAuthGroup(scope.row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    prop="isDefault"
                    :label="Translate('IDCS_DELETE')"
                >
                    <template #default="scope">
                        <BaseImgSprite
                            v-show="!scope.row.isDefault"
                            file="del"
                            :index="0"
                            :hover-index="1"
                            :chunk="4"
                            @click.stop="handleDeleteAuthGroup(scope.row)"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <PermissionGroupEditPop
            v-model="pageData.isEditAuthGroup"
            :group-id="pageData.editAuthGroupID"
            @confirm="handleConfirmEditAuthGroup"
            @close="pageData.isEditAuthGroup = false"
        />
    </div>
</template>

<script lang="ts" src="./PermissionGroup.v.ts"></script>

<style lang="scss" scoped>
.Perm {
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
            border-left: 3px solid var(--border-color2);
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
            border: 1px solid var(--border-color6);
            margin: 0;
            padding: 5px;
            flex-shrink: 0;
        }

        .list {
            height: 100%;
        }
    }

    &-right {
        width: 100%;

        :deep(.el-table) {
            width: 100%;

            tbody {
                cursor: pointer;
            }
        }
    }
}
</style>
