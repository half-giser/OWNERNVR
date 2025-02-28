<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-20 13:57:26
 * @Description: 巡航线组
-->
<template>
    <div class="base-chl-box">
        <div class="base-chl-box-left">
            <div class="base-chl-box-player">
                <BaseVideoPlayer
                    ref="playerRef"
                    @ready="handlePlayerReady"
                />
            </div>
            <el-form
                :style="{
                    '--form-label-width': '100px',
                }"
            >
                <el-form-item :label="Translate('IDCS_CHANNEL_SELECT')">
                    <el-select-v2
                        v-if="tableData.length"
                        v-model="pageData.tableIndex"
                        :options="chlOptions"
                        @change="changeChl"
                    />
                    <el-select-v2
                        v-else
                        model-value=""
                        :options="[]"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_PTZ_GROUP')">
                    <el-button
                        :disabled="!cruiseOptions.length"
                        @click="playCruiseGroup"
                    >
                        {{ Translate('IDCS_PLAY') }}
                    </el-button>
                    <el-button
                        :disabled="!cruiseOptions.length"
                        @click="stopCruiseGroup"
                    >
                        {{ Translate('IDCS_STOP') }}
                    </el-button>
                </el-form-item>
            </el-form>
            <div class="base-table-box">
                <el-table
                    ref="cruiseTableRef"
                    :data="cruiseOptions"
                    highlight-current-row
                    show-overflow-tooltip
                    @row-click="handleCruiseRowClick"
                >
                    <el-table-column
                        :label="Translate('IDCS_CRUISE')"
                        prop="index"
                    />
                    <el-table-column
                        :label="Translate('IDCS_CRUISE_NAME')"
                        prop="name"
                        width="152"
                    />
                    <el-table-column :label="Translate('IDCS_EDIT')">
                        <template #default="{ $index }: TableColumn<ChannelPtzCruiseGroupCruiseDto>">
                            <BaseImgSpriteBtn
                                file="del"
                                @click="deleteCruise(pageData.tableIndex, $index)"
                            />
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="base-btn-box flex-start">
                <el-button
                    :disabled="!tableData.length"
                    @click="addCruise(pageData.tableIndex)"
                >
                    {{ Translate('IDCS_ADD_CRUISE') }}
                </el-button>
            </div>
        </div>
        <div class="base-chl-box-right">
            <div class="base-table-box">
                <el-table
                    ref="tableRef"
                    :show-header="false"
                    :data="tableData"
                    :row-key="getRowKey"
                    :expand-row-key="pageData.expandRowKey"
                    :border="false"
                    highlight-current-row
                    show-overflow-tooltip
                    @row-click="handleRowClick"
                    @expand-change="handleExpandChange"
                >
                    <el-table-column prop="chlName" />
                    <el-table-column>
                        <template #default="{ row }: TableColumn<ChannelPtzCruiseGroupChlDto>">
                            {{ Translate('IDCS_CRUISE_NUM_D').formatForLang(row.cruiseCount) }}
                        </template>
                    </el-table-column>
                    <el-table-column type="expand">
                        <template #default="{ row, $index }: TableColumn<ChannelPtzCruiseGroupChlDto>">
                            <ChannelPtzTableExpandPanel @add="addCruise($index)">
                                <ChannelPtzTableExpandItem
                                    v-for="(item, index) in row.cruise"
                                    :key="item.index"
                                    :text="`${item.index}. ${item.name}`"
                                    file="cruise"
                                    @delete="deleteCruise($index, index)"
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
    </div>
</template>

<script lang="ts" src="./ChannelCruiseGroup.v.ts"></script>
