<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-20 13:57:26
 * @Description: 巡航线组
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-22 19:31:17
-->
<template>
    <div class="cruise-group">
        <div class="left">
            <div class="player">
                <BaseVideoPlayer
                    ref="playerRef"
                    type="live"
                    @onready="handlePlayerReady"
                />
            </div>
            <el-form
                label-position="left"
                :style="{
                    '--form-label-width': '100px',
                }"
                class="narrow inline-message"
            >
                <el-form-item :label="Translate('IDCS_CHANNEL_SELECT')">
                    <el-select
                        v-model="pageData.tableIndex"
                        @change="changeChl"
                    >
                        <el-option
                            v-for="(item, index) in tableData"
                            :key="item.chlId"
                            :value="index"
                            :label="item.chlName"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_PTZ_GROUP')">
                    <el-button
                        :disabled="!cruiseOptions.length"
                        @click="playCruiseGroup"
                        >{{ Translate('IDCS_PLAY') }}</el-button
                    >
                    <el-button
                        :disabled="!cruiseOptions.length"
                        @click="stopCruiseGroup"
                        >{{ Translate('IDCS_STOP') }}</el-button
                    >
                </el-form-item>
            </el-form>
            <div class="base-table-box">
                <el-table
                    ref="cruiseTableRef"
                    :data="cruiseOptions"
                    border
                    stripe
                    highlight-current-row
                    @row-click="handleCruiseRowClick"
                >
                    <el-table-column
                        :label="Translate('IDCS_CRUISE')"
                        prop="index"
                    />
                    <el-table-column
                        :label="Translate('IDCS_CRUISE_NAME')"
                        prop="name"
                    />
                    <el-table-column :label="Translate('IDCS_DELETE')">
                        <template #default="scope">
                            <BaseImgSprite
                                file="del"
                                :index="2"
                                :hover-index="0"
                                :disabled-index="3"
                                :chunk="4"
                                @click="deleteCruise(pageData.tableIndex, scope.$index)"
                            />
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div
                class="base-btn-box"
                :span="2"
            >
                <div>
                    <el-button @click="addCruise(pageData.tableIndex)">{{ Translate('IDCS_ADD_CRUISE') }}</el-button>
                </div>
                <div></div>
            </div>
        </div>
        <div class="right">
            <div class="base-table-box">
                <el-table
                    ref="tableRef"
                    :show-header="false"
                    :data="tableData"
                    :row-key="(row) => row.chlId"
                    :expand-row-key="pageData.expandRowKey"
                    highlight-current-row
                    border
                    stripe
                    @row-click="handleRowClick"
                    @expand-change="handleExpandChange"
                >
                    <el-table-column prop="chlName" />
                    <el-table-column>
                        <template #default="scope">
                            {{ Translate('IDCS_CRUISE_NUM_D').formatForLang(scope.row.cruiseCount) }}
                        </template>
                    </el-table-column>
                    <el-table-column type="expand">
                        <template #default="scope">
                            <ChannelPtzTableExpandPanel @add="addCruise(scope.$index)">
                                <ChannelPtzTableExpandItem
                                    v-for="(item, index) in scope.row.cruise"
                                    :key="item.index"
                                    :text="`${item.index}. ${item.name}`"
                                    file="cruise"
                                    @delete="deleteCruise(scope.$index, index)"
                                />
                            </ChannelPtzTableExpandPanel>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
        <ChannelCruiseGroupAddPop
            v-model="pageData.isAddPop"
            :cruise="pageData.addCruise"
            :max="pageData.addCruiseMax"
            :chl-id="pageData.addChlId"
            @confirm="confirmAddCruise"
            @close="pageData.isAddPop = false"
        />
        <BaseNotification v-model:notification="pageData.notification" />
    </div>
</template>

<script lang="ts" src="./ChannelCruiseGroup.v.ts"></script>

<style lang="scss" scoped>
.cruise-group {
    width: 100%;
    height: var(--content-height);
    display: flex;
}

.left {
    width: 400px;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.player {
    width: 400px;
    height: 300px;
    flex-shrink: 0;
}

.right {
    width: 100%;
    height: 100%;
    margin-left: 10px;
}
</style>
