<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-17 20:25:35
 * @Description: 添加权限组
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-24 09:42:57
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
            hide-required-asterisk
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
                    :maxlength="nameByteMaxLen"
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
        <div class="channel">
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
            <div class="list">
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

<style lang="scss" scoped>
.system {
    display: flex;
    width: 100%;
    flex-shrink: 0;

    & > div {
        width: 50%;
    }

    .title {
        border-left: 3px solid var(--content-border);
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

    ul {
        display: flex;
        justify-content: center;
        margin: 0;
        padding: 5px;
        flex-shrink: 0;
    }

    .list {
        position: relative;
        width: 100%;
        height: 100%;

        & > div {
            position: absolute;
            top: 0;
            left: 0;
            opacity: 0;
            pointer-events: none;
            width: 100%;
            height: 100%;

            &.active {
                opacity: 1;
                pointer-events: unset;
            }
        }
    }
}
</style>
