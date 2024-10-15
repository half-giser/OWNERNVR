<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-18 18:43:21
 * @Description: 登出后预览
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-12 14:14:33
-->
<template>
    <div class="PreviewOnLogout base-flex-box">
        <div class="main">
            <div class="left">
                <div class="player">
                    <BaseVideoPlayer
                        ref="playerRef"
                        :split="1"
                        @onready="onReady"
                    />
                </div>
                <el-form
                    class="form stripe"
                    label-position="left"
                    label-width="100px"
                    :class="{
                        '--form-input-width': '200px',
                    }"
                >
                    <el-form-item :label="Translate('IDCS_CHANNEL_SELECT')">
                        <el-select v-model="pageData.activeChannelIndex">
                            <el-option
                                v-for="(item, index) in channelList"
                                :key="index"
                                :value="index"
                                :label="item.name"
                            >
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item
                        v-if="channelList[pageData.activeChannelIndex]"
                        :label="Translate('IDCS_PREVIEW')"
                    >
                        <el-select
                            v-model="channelList[pageData.activeChannelIndex].switch"
                            @change="pageData.buttonDisabled = false"
                        >
                            <el-option
                                v-for="item in pageData.channelOptions"
                                :key="item.value"
                                :value="item.value"
                                :label="Translate(item.label)"
                            >
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-form>
            </div>
            <div class="right base-table-box">
                <el-table
                    :data="channelList"
                    border
                    stripe
                    flexible
                    :row-class-name="(item) => (item.rowIndex === pageData.activeChannelIndex ? 'active' : '')"
                    @cell-click="handleChangeUser"
                >
                    <el-table-column :label="Translate('IDCS_CHANNEL_NAME')">
                        <template #default="scope">
                            <el-tooltip
                                :content="scope.row.name"
                                :show-after="500"
                            >
                                <div class="ellipsis">{{ scope.row.name }}</div>
                            </el-tooltip>
                        </template>
                    </el-table-column>
                    <el-table-column :label="Translate('IDCS_PREVIEW')">
                        <template #header>
                            <el-dropdown trigger="click">
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
                                            {{ Translate(opt.label) }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="{ $index }">
                            <el-select
                                v-model="channelList[$index].switch"
                                @change="pageData.buttonDisabled = false"
                            >
                                <el-option
                                    v-for="value in pageData.channelOptions"
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
        <div class="base-btn-box">
            <el-button
                :disabled="pageData.buttonDisabled"
                @click="setData"
                >{{ Translate('IDCS_APPLY') }}</el-button
            >
        </div>
    </div>
</template>

<script lang="ts" src="./PreviewOnLogout.v.ts"></script>

<style lang="scss" scoped>
.main {
    display: flex;
    width: 100%;
    height: 100%;
}

.left {
    width: 400px;
    flex-shrink: 0;
    margin-right: 10px;

    .form {
        margin-top: 20px;
    }
}

.player {
    width: 400px;
    height: 300px;
}

.right {
    width: 100%;
    height: 100%;
    margin-right: 10px;
}
</style>
