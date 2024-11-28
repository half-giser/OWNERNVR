<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-18 18:43:21
 * @Description: 登出后预览
-->
<template>
    <div class="base-flex-box">
        <div class="main">
            <div class="left">
                <div class="player">
                    <BaseVideoPlayer
                        ref="playerRef"
                        @ready="onReady"
                    />
                </div>
                <el-form
                    class="form stripe"
                    label-width="100"
                    :class="{
                        '--form-input-width': '200px',
                    }"
                >
                    <el-form-item :label="Translate('IDCS_CHANNEL_SELECT')">
                        <el-select-v2
                            v-model="pageData.activeChannelIndex"
                            :options="chlOptions"
                        />
                    </el-form-item>
                    <el-form-item
                        v-if="channelList[pageData.activeChannelIndex]"
                        :label="Translate('IDCS_PREVIEW')"
                    >
                        <el-select-v2
                            v-model="channelList[pageData.activeChannelIndex].switch"
                            :options="pageData.channelOptions"
                            @change="pageData.buttonDisabled = false"
                        />
                    </el-form-item>
                </el-form>
            </div>
            <div class="right base-table-box">
                <el-table
                    :data="channelList"
                    flexible
                    show-overflow-tooltip
                    :row-class-name="(item) => (item.rowIndex === pageData.activeChannelIndex ? 'active' : '')"
                    @cell-click="handleChangeUser"
                >
                    <el-table-column
                        :label="Translate('IDCS_CHANNEL_NAME')"
                        prop="name"
                    />
                    <el-table-column :label="Translate('IDCS_PREVIEW')">
                        <template #header>
                            <el-dropdown>
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
                                            {{ opt.label }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="{ $index }">
                            <el-select-v2
                                v-model="channelList[$index].switch"
                                :options="pageData.channelOptions"
                                @change="pageData.buttonDisabled = false"
                            />
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
        <div class="base-btn-box">
            <el-button
                :disabled="pageData.buttonDisabled"
                @click="setData"
            >
                {{ Translate('IDCS_APPLY') }}
            </el-button>
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
