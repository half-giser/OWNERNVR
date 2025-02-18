<!--
 * @Description: 录像——录像子码流
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-07-31 10:12:26
-->
<template>
    <div class="base-flex-box">
        <div class="base-table-box">
            <el-table
                ref="tableRef"
                :data="virtualTableData"
                show-overflow-tooltip
                :row-class-name="(data) => (tableData[data.rowIndex].disabled ? 'disabled' : '')"
            >
                <!-- 通道名称 -->
                <el-table-column
                    :label="Translate('IDCS_CHANNEL_NAME')"
                    min-width="240"
                >
                    <template #default="{ row }: TableColumn<number>">
                        {{ tableData[row].name }}
                    </template>
                </el-table-column>
                <!-- 码流类型 -->
                <el-table-column
                    :label="Translate('IDCS_CODE_STREAM_TYPE')"
                    min-width="100"
                >
                    <template #default="{ row }: TableColumn<number>">
                        {{ displayStreamType(tableData[row].streamType) }}
                    </template>
                </el-table-column>
                <!-- 视频编码 -->
                <el-table-column
                    :label="Translate('IDCS_VIDEO_ENCT')"
                    min-width="130"
                >
                    <template #header>
                        <div v-if="RecordSubResAdaptive">{{ Translate('IDCS_VIDEO_ENCT') }}</div>
                        <el-dropdown v-else>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_VIDEO_ENCT') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.videoEncodeTypeList"
                                        :key="item.value"
                                        @click="changeAllVideoEncodeType(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="{ row }: TableColumn<number>">
                        <div v-if="RecordSubResAdaptive">{{ displayStreamType(tableData[row].videoEncodeType) }}</div>
                        <div v-else-if="tableData[row].isRTSPChl || !tableData[row].videoEncodeType">--</div>
                        <el-select-v2
                            v-else
                            v-model="tableData[row].videoEncodeType"
                            :disabled="tableData[row].disabled"
                            :options="tableData[row].subCaps.supEnct"
                            @change="changeVideoEncodeType(tableData[row])"
                        />
                    </template>
                </el-table-column>
                <!-- 分辨率 -->
                <el-table-column
                    :label="Translate('IDCS_RESOLUTION_RATE')"
                    min-width="110"
                >
                    <template #header>
                        <div v-if="RecordSubResAdaptive">{{ Translate('IDCS_RESOLUTION_RATE') }}</div>
                        <el-popover
                            v-else
                            v-model:visible="pageData.resolutionHeaderVisble"
                            width="430"
                        >
                            <template #reference>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_RESOLUTION_RATE') }}
                                </BaseTableDropdownLink>
                            </template>
                            <div>
                                <el-table
                                    ref="resolutionTableRef"
                                    max-height="400"
                                    :data="pageData.resolutionGroups"
                                    :show-header="false"
                                    :row-key="getRowKey"
                                    :expand-row-keys="pageData.expands"
                                    :border="false"
                                    @expand-change="handleExpandChange($event, pageData.expands)"
                                >
                                    <el-table-column width="220">
                                        <template #default="{ row }: TableColumn<RecordStreamResolutionDto>">
                                            <el-select-v2
                                                v-model="row.res"
                                                :options="row.resGroup"
                                                @visible-change="handleResolutionVisibleChange"
                                            />
                                        </template>
                                    </el-table-column>
                                    <el-table-column type="expand">
                                        <template #default="{ row }: TableColumn<RecordStreamResolutionDto>">
                                            <div class="chl-box">
                                                <div
                                                    v-for="(item, index) in row.chls.data"
                                                    :key="index"
                                                    :span="12"
                                                    class="chl-item"
                                                >
                                                    <BaseImgSprite
                                                        file="chl_icon"
                                                        :index="0"
                                                        :hover-index="1"
                                                        :chunk="4"
                                                    />
                                                    <span class="text-ellispsis">{{ item.label }}</span>
                                                </div>
                                            </div>
                                        </template>
                                    </el-table-column>
                                </el-table>
                                <div class="base-btn-box">
                                    <el-button @click="apply">{{ Translate('IDCS_OK') }}</el-button>
                                    <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
                                </div>
                            </div>
                        </el-popover>
                    </template>
                    <template #default="{ row }: TableColumn<number>">
                        <div v-if="RecordSubResAdaptive">{{ tableData[row].resolution || '--' }}</div>
                        <div v-else-if="tableData[row].isRTSPChl || !tableData[row].resolution">--</div>
                        <el-select-v2
                            v-else
                            v-model="tableData[row].resolution"
                            :disabled="tableData[row].disabled"
                            :options="tableData[row].subCaps.res"
                            @change="changeResolution(tableData[row], tableData[row].resolution)"
                        />
                    </template>
                </el-table-column>
                <!-- 帧率 -->
                <el-table-column
                    :label="Translate('IDCS_FRAME_RATE')"
                    min-width="90"
                >
                    <template #header>
                        <div v-if="RecordSubResAdaptive">{{ Translate('IDCS_FRAME_RATE') }}</div>
                        <el-dropdown
                            v-else
                            max-height="400"
                        >
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_FRAME_RATE') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in getFrameRateList()"
                                        :key="item.value"
                                        @click="changeAllFrameRate(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="{ row }: TableColumn<number>">
                        <div v-if="RecordSubResAdaptive">{{ tableData[row].frameRate || '--' }}</div>
                        <div v-else-if="tableData[row].isRTSPChl || !tableData[row].frameRate">--</div>
                        <el-select-v2
                            v-else
                            v-model="tableData[row].frameRate"
                            :disabled="tableData[row].disabled"
                            :options="getFrameRateSingleList(tableData[row])"
                            @change="changeVideoEncodeType(tableData[row])"
                        />
                    </template>
                </el-table-column>
                <!-- 码率上限 -->
                <el-table-column
                    :label="Translate('IDCS_VIDEO_QUALITY')"
                    min-width="130"
                >
                    <template #header>
                        <div v-if="RecordSubResAdaptive">{{ Translate('IDCS_VIDEO_QUALITY') }}</div>
                        <el-dropdown v-else>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_VIDEO_QUALITY') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.videoQualityList"
                                        :key="item.value"
                                        @click="changeAllVideoQuality(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="{ row }: TableColumn<number>">
                        <!-- 在码率上限中不可修改情况下，有数据的行不可选项也要设置为-- -->
                        <div v-if="RecordSubResAdaptive && isVideoQualityDisabled(row)">--</div>
                        <div v-else-if="RecordSubResAdaptive">{{ tableData[row].videoQuality ? `${tableData[row].videoQuality}Kbps` : '--' }}</div>
                        <div v-else-if="tableData[row].isRTSPChl || !tableData[row].videoQuality">--</div>
                        <el-select-v2
                            v-else
                            v-model="tableData[row].videoQuality"
                            :disabled="isVideoQualityDisabled(row)"
                            :options="getQualityList(tableData[row])"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="base-btn-box">
            <el-button
                v-show="!RecordSubResAdaptive"
                :disabled="!editRows.size()"
                @click="setData"
            >
                {{ Translate('IDCS_APPLY') }}
            </el-button>
        </div>
    </div>
</template>

<script lang="ts" src="./RecordSubStream.v.ts"></script>

<style scoped lang="scss">
.chl-box {
    display: flex;
    flex-wrap: wrap;
}

.chl-item {
    padding-left: 15px;
    display: flex;
    align-items: center;
    width: 50%;
    box-sizing: border-box;
    height: 30px;

    span:first-child {
        flex-shrink: 0;
    }

    span:last-child {
        margin-left: 5px;
    }
}
</style>
