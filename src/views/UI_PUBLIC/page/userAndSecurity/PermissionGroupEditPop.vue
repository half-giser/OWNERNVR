<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-17 20:25:35
 * @Description: 编辑权限组弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-06 18:23:10
-->
<template>
    <el-dialog
        :title="Translate('IDCS_EDIT_USER_RIGHT')"
        handle-open
        align-center
        draggable
        @open="handleOpen"
    >
        <div class="PermGroupEdit">
            <el-form
                label-position="left"
                :model="formData"
                :style="{
                    '--form-input-width': '340px',
                }"
                hide-required-asterisk
                inline-message
            >
                <el-form-item :label="Translate('IDCS_USER_RIGHT_GROUP_NAME')">
                    <el-input
                        v-model.trim="formData.name"
                        disabled
                        :formatter="displayAuthGroup"
                    >
                    </el-input>
                </el-form-item>
            </el-form>
            <div class="system">
                <div
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
                            <el-checkbox v-model="authItem.value">{{ Translate(authItem.key) }}</el-checkbox>
                        </li>
                    </ul>
                </div>
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
                    <div :class="{ active: pageData.activeChannelTab === 'IDCS_LOCAL_RIGHT' }">
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
                                :label="item.label"
                            >
                                <template #header>
                                    <el-dropdown trigger="click">
                                        <span class="el-dropdown-link">
                                            {{ Translate(item.label) }}
                                            <BaseImgSprite
                                                class="ddn"
                                                file="ddn"
                                            />
                                        </span>
                                        <template #dropdown>
                                            <el-dropdown-menu>
                                                <el-dropdown-item
                                                    v-for="opt in pageData.channelOption"
                                                    :key="opt.value"
                                                    @click="changeAllChannelAuth(item.value, opt.value)"
                                                >
                                                    {{ Translate(opt.label) }}
                                                </el-dropdown-item>
                                            </el-dropdown-menu>
                                        </template>
                                    </el-dropdown>
                                </template>
                                <template #default="{ $index }">
                                    <el-select v-model="channelAuthList[$index][item.value]">
                                        <el-option
                                            v-for="value in pageData.channelOption"
                                            :key="value.value"
                                            :label="Translate(value.label)"
                                            :value="value.value"
                                        />
                                    </el-select>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                    <div :class="{ active: pageData.activeChannelTab === 'IDCS_REMOTE_RIGHT' }">
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
                                :label="item.label"
                            >
                                <template #header>
                                    <el-dropdown trigger="click">
                                        <span class="el-dropdown-link">
                                            {{ Translate(item.label) }}
                                            <BaseImgSprite
                                                class="ddn"
                                                file="ddn"
                                            />
                                        </span>
                                        <template #dropdown>
                                            <el-dropdown-menu>
                                                <el-dropdown-item
                                                    v-for="opt in pageData.channelOption"
                                                    :key="opt.value"
                                                    @click="changeAllChannelAuth(item.value, opt.value)"
                                                >
                                                    {{ Translate(opt.label) }}
                                                </el-dropdown-item>
                                            </el-dropdown-menu>
                                        </template>
                                    </el-dropdown>
                                </template>
                                <template #default="{ $index }">
                                    <el-select v-model="channelAuthList[$index][item.value]">
                                        <el-option
                                            v-for="value in pageData.channelOption"
                                            :key="value.value"
                                            :label="Translate(value.label)"
                                            :value="value.value"
                                        />
                                    </el-select>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                </div>
            </div>
        </div>
        <PermissionGroupInfoPop v-model="pageData.isShowInfo" />
        <template #footer>
            <el-row>
                <el-col
                    :span="8"
                    class="el-col-flex-start"
                >
                    <el-button @click="pageData.isShowInfo = true">{{ Translate('IDCS_DESCRIPTION') }}</el-button>
                </el-col>
                <el-col
                    :span="16"
                    class="el-col-flex-end"
                >
                    <el-button @click="doEditAuthGroup">{{ Translate('IDCS_ADD') }}</el-button>
                    <el-button @click="goBack">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./PermissionGroupEditPop.v.ts"></script>

<style lang="scss" scoped>
.PermGroupEdit {
    .system {
        display: flex;
        width: 100%;

        & > div {
            width: 50%;
        }

        .title {
            border-left: 3px solid var(--border-color2);
            height: 30px;
            line-height: 30px;
            padding-left: 15px;
            margin-left: 15px;
        }

        .list {
            display: flex;
            flex-wrap: wrap;
            padding-left: 30px;
            margin: 0;

            & > li {
                list-style: none;
                width: 50%;
            }
        }
    }

    .channel {
        height: 100%;
        margin-top: 10px;
        display: flex;
        flex-direction: column;

        .ddn {
            margin-left: 5px;
        }

        ul {
            display: flex;
            justify-content: center;
            margin: 0;
            padding: 5px;
            flex-shrink: 0;
        }

        :deep(.el-table) {
            height: 200px;
        }

        .list {
            position: relative;
            height: 200px;
            width: 100%;

            & > div {
                position: absolute;
                top: 0;
                left: 0;
                opacity: 0;
                pointer-events: none;
                width: 100%;
                height: 200px;

                &.active {
                    opacity: 1;
                    pointer-events: unset;
                }
            }
        }
    }
}
</style>
