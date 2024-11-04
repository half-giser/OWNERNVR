<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-07-31 10:29:37
 * @Description: 录像码流通用表格组件
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-10-28 14:59:34
-->
<template>
    <div class="base-flex-box">
        <div class="base-table-box">
            <el-table
                :data="tableData"
                class="RecordStreamList"
                stripe
                border
                show-overflow-tooltip
                :row-class-name="(data) => (data.row.rowDisable ? 'disabled' : '')"
                highlight-current-row
            >
                <!-- 通道名 -->
                <el-table-column
                    prop="name"
                    :label="Translate('IDCS_CHANNEL_NAME')"
                    min-width="10%"
                />
                <!-- 码流类型 -->
                <el-table-column
                    :label="Translate('IDCS_CODE_STREAM_TYPE')"
                    min-width="6%"
                >
                    <template #default="scope">
                        <span>{{ formatDisplayStreamType(scope.row) }}</span>
                    </template>
                </el-table-column>
                <!-- videoEncodeType -->
                <el-table-column
                    :label="Translate('IDCS_VIDEO_ENCT')"
                    min-width="8%"
                >
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_VIDEO_ENCT') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="(item, index) in pageData.videoEncodeTypeUnionList"
                                        :key="index"
                                        :value="item"
                                        @click="handleVideoEncodeTypeChangeAll(item)"
                                    >
                                        {{ Translate(streamTypeMapping[item]) }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.videoEncodeType"
                            :disabled="scope.row.videoEncodeTypeDisable"
                            @change="handleVideoEncodeTypeChange(scope.row)"
                        >
                            <el-option
                                v-for="item in scope.row.mainCaps['@supEnct']"
                                :key="item"
                                :label="Translate(streamTypeMapping[item])"
                                :value="item"
                            />
                        </el-select>
                    </template>
                </el-table-column>
                <!-- resolution -->
                <el-table-column
                    :label="Translate('IDCS_RESOLUTION_RATE')"
                    min-width="11%"
                >
                    <template #header>
                        <el-popover
                            v-model:visible="pageData.resolutionHeaderVisble"
                            width="430"
                            popper-class="no-padding"
                        >
                            <template #reference>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_RESOLUTION_RATE') }}
                                </BaseTableDropdownLink>
                            </template>
                            <div class="resolutionContainer">
                                <el-table
                                    ref="resolutionTableRef"
                                    max-height="400"
                                    :data="pageData.resolutionGroups"
                                    :show-header="pageData.headerVisble"
                                    :row-key="getRowKey"
                                    :expand-row-keys="pageData.expands"
                                    stripe
                                    @expand-change="handleExpandChange($event, pageData.expands)"
                                >
                                    <el-table-column width="220">
                                        <template #default="scope">
                                            <el-select
                                                v-model="scope.row.res"
                                                :teleported="false"
                                            >
                                                <el-option
                                                    v-for="item in scope.row.resGroup"
                                                    :key="item.value"
                                                    :label="item.label"
                                                    :value="item.value"
                                                    @click="keepDropDownOpen(scope.row)"
                                                />
                                            </el-select>
                                        </template>
                                    </el-table-column>
                                    <el-table-column
                                        width="190"
                                        type="expand"
                                    >
                                        <template #default="scope">
                                            <div class="chl_area">
                                                <el-row>
                                                    <el-col
                                                        v-for="(item, index) in scope.row.chls.data"
                                                        :key="index"
                                                        :span="12"
                                                        class="fit-content-height"
                                                    >
                                                        <div class="device-item">
                                                            <BaseImgSprite
                                                                file="chl_icon"
                                                                :index="0"
                                                                :chunk="4"
                                                            />
                                                            <span class="device-name">{{ item.text }}</span>
                                                        </div>
                                                    </el-col>
                                                </el-row>
                                            </div>
                                        </template>
                                    </el-table-column>
                                </el-table>
                                <el-row class="base-btn-box">
                                    <el-button @click="handleSetResolutionAll">{{ Translate('IDCS_OK') }}</el-button>
                                    <el-button @click="handleSetResolutionCancel">{{ Translate('IDCS_CANCEL') }}</el-button>
                                </el-row>
                            </div>
                        </el-popover>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.resolution"
                            max-height="400"
                            :disabled="scope.row.resolutionDisable"
                            @change="handleResolutionChange(scope.row)"
                        >
                            <el-option
                                v-for="item in scope.row.resolutions"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                    </template>
                </el-table-column>
                <!-- frameRate -->
                <el-table-column
                    :label="Translate('IDCS_FRAME_RATE')"
                    min-width="6%"
                >
                    <template #header>
                        <el-dropdown max-height="400">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_FRAME_RATE') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.frameRateList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                        @click="handleFrameRateChangeAll(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.frameRate"
                            max-height="400"
                            :disabled="scope.row.frameRateDisable"
                            @change="handleFrameRateChange(scope.row)"
                        >
                            <el-option
                                v-for="item in scope.row.frameRates"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                    </template>
                </el-table-column>
                <!-- bitType -->
                <el-table-column
                    :label="Translate('IDCS_BITRATE_TYPE')"
                    min-width="8%"
                >
                    <template #header>
                        <el-dropdown :disabled="pageData.bitTypeDropDisable">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_BITRATE_TYPE') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.bitTypeUnionList"
                                        :key="item"
                                        :value="item"
                                        @click="handleBitTypeChangeAll(item)"
                                    >
                                        {{ item }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-if="scope.row.bitTypeVisible"
                            v-model="scope.row.bitType"
                            :disabled="scope.row.bitTypeDisable"
                            @change="handleBitTypeChange(scope.row)"
                        >
                            <el-option
                                v-for="item in scope.row.mainCaps['@bitType']"
                                :key="item"
                                :label="item"
                                :value="item"
                            />
                        </el-select>
                        <span v-else>- -</span>
                    </template>
                </el-table-column>
                <!-- imageLevel -->
                <el-table-column
                    :label="Translate('IDCS_IMAGE_QUALITY')"
                    min-width="8%"
                >
                    <template #header>
                        <el-dropdown :disabled="pageData.levelDropDisable">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_IMAGE_QUALITY') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.levelList"
                                        :key="item.value"
                                        :value="item.text"
                                        @click="handleLevelChangeAll(item.value)"
                                    >
                                        {{ item.text }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.level"
                            :placeholder="Translate('IDCS_LOWEST')"
                            :disabled="scope.row.imageLevelDisable"
                            @change="handleLevelChange(scope.row)"
                        >
                            <el-option
                                v-for="item in scope.row.levelNote"
                                :key="item"
                                :label="formatDisplayImageLevel(item)"
                                :value="item"
                            />
                        </el-select>
                    </template>
                </el-table-column>
                <!-- videoQuality -->
                <el-table-column
                    :label="Translate('IDCS_VIDEO_QUALITY')"
                    min-width="11%"
                >
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_VIDEO_QUALITY') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.videoQualityList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                        @click="handleVideoQualityChangeAll(item)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.videoQuality"
                            :disabled="scope.row.videoQualityDisable"
                            @change="handleVideoQualityChange(scope.row)"
                        >
                            <el-option
                                v-for="item in scope.row.qualitys"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            />
                        </el-select>
                    </template>
                </el-table-column>
                <!-- bitRange -->
                <el-table-column
                    :label="Translate('IDCS_RATE_RECOMMEND_RANGE')"
                    min-width="13%"
                >
                    <template #default="scope">
                        <span :disabled="scope.row.bitRangeDisable">{{ formatDisplayBitRange(scope.row) }}</span>
                    </template>
                </el-table-column>
                <!-- audio -->
                <el-table-column
                    :label="Translate('IDCS_AUDIO_FREQUENCY')"
                    min-width="7%"
                >
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_AUDIO_FREQUENCY') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.audioOptions"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                        @click="handleAudioOptionsChangeAll(item)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.audio"
                            :placeholder="Translate('IDCS_ON')"
                            :disabled="scope.row.audioDisable"
                            @change="handleAudioOptionsChange(scope.row)"
                        >
                            <el-option
                                v-for="item in pageData.audioOptions"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            />
                        </el-select>
                    </template>
                </el-table-column>
                <!-- 原代码中写死了不显示 recordStream -->
                <!-- <el-table-column
                    v-if="pageData.recordStreamVisible"
                    :label="Translate('IDCS_RECORD_CODE_STREAM')"
                    min-width="9%"
                >
                    <template #header>
                        <el-dropdown >
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_RECORD_CODE_STREAM') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in recordStreams"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                        @click="handleRecordStreamChangeAll(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.recordStream"
                            placeholder="主码流"
                            :disabled="scope.row.recordStreamDisable"
                            @change="handleRecordStreamChange(scope.row)"
                        >
                            <el-option
                                v-for="item in recordStreams"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            >
                            </el-option>
                        </el-select>
                    </template>
                </el-table-column> -->
                <!-- GOP -->
                <el-table-column
                    :label="Translate('IDCS_GOP')"
                    min-width="6%"
                >
                    <template #header>
                        <el-popover
                            v-model:visible="pageData.gopHeaderVisble"
                            popper-class="no-padding"
                            width="300"
                            placement="bottom-end"
                        >
                            <template #reference>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_GOP') }}
                                </BaseTableDropdownLink>
                            </template>
                            <div class="GOP_dropDown">
                                <div class="GOP_input">
                                    <span>GOP</span>
                                    <el-input
                                        v-model="pageData.gopSetAll"
                                        @input="GOPhandleFocus(pageData.gopSetAll)"
                                    />
                                </div>

                                <el-row class="base-btn-box">
                                    <el-button @click="handleSetGopAll(pageData.gopSetAll)">{{ Translate('IDCS_OK') }}</el-button>
                                    <el-button @click="handleGopCancel">{{ Translate('IDCS_CANCEL') }}</el-button>
                                </el-row>
                            </div>
                        </el-popover>
                    </template>
                    <template #default="scope">
                        <el-input
                            v-model="scope.row.GOP"
                            :disabled="scope.row.GOPDisable"
                            @input="GOPhandleFocus(scope.row)"
                            @keydown.enter="GOPhandleKeydown(scope.row)"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <el-row
            v-if="!pageData.pop"
            class="bottom_row"
        >
            <div>
                <span
                    id="txtBandwidth"
                    class="row_bandwidth"
                    >{{ pageData.txtBandwidth }}</span
                >
                <!-- 这个按钮老代码中写死不显示，新代码其他页面也没实现 -->
                <!-- <span
                    id="bandwidthDetail"
                    class="detailBtn"
                ></span> -->
                <span
                    v-if="pageData.PredictVisible"
                    id="txRecTime"
                    >{{ pageData.recTime }}</span
                >
                <el-button
                    v-if="pageData.CalculateVisible"
                    id="btnActivate"
                    @click="handleCalculate"
                    >{{ Translate('IDCS_CALCULATE') }}</el-button
                >
            </div>
            <el-button
                id="btnSetDefaultPwd"
                :disabled="pageData.applyBtnDisable"
                @click="setData"
                >{{ Translate('IDCS_APPLY') }}</el-button
            >
        </el-row>
    </div>
</template>

<script lang="ts" src="./RecordStreamTable.v.ts"></script>

<style lang="scss" scoped>
.RecordStreamList {
    // width: 100%;
    // height: calc(100vh - 280px);

    .el-dropdown-link {
        color: var(--el-table-header-text-color);
    }

    .status {
        &.online {
            color: var(--color-online);
        }
        &.offline {
            color: var(--color-offline);
        }
    }
}
.bottom_row {
    margin-top: 10px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
}
#txRecTime {
    margin-left: 20px;
    margin-top: 10px;
}
#btnActivate {
    margin-left: 20px;
}
.row_bandwidth {
    margin-top: 10px;
}
.gop_btn {
    margin: 10px 20px;
}

.resolutionContainer {
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    :deep() {
        .cell {
            overflow: visible;
        }
        .el-table__cell {
            z-index: auto;
        }
    }
}
.device-item {
    margin-left: 15px;
    display: flex;
    align-items: center;
    gap: 3px;
}
.chl_area {
    min-height: 260px;
}
.fit-content-height {
    height: 35px;
    display: flex;
    align-items: center;
}
// .base-popover-icon {
//     width: 100%;
//     height: 100%;
//     display: flex;
//     justify-content: center;
//     align-items: center;
//     color: var(--el-table-header-text-color);
//     .el-icon {
//         cursor: pointer;
//         &:hover {
//             color: var(--input-text);
//         }
//     }
// }
.GOP_dropDown {
    width: 280px;
    height: 80px;
    padding: 20px 10px 0px 10px;
}
.GOP_input {
    display: flex;
    gap: 20px;
    align-items: center;
    font-size: 13px;
    color: var(--main-text);
}
</style>
