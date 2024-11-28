<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-07-31 10:29:37
 * @Description: 录像码流通用表格组件
-->
<template>
    <div class="base-flex-box">
        <div class="base-table-box">
            <el-table
                :data="virtualTableData"
                class="RecordStreamList"
                show-overflow-tooltip
                :row-class-name="(data) => (tableData[data.rowIndex].disabled ? 'disabled' : '')"
                highlight-current-row
            >
                <!-- 通道名 -->
                <el-table-column
                    :label="Translate('IDCS_CHANNEL_NAME')"
                    min-width="220"
                >
                    <template #default="scope">
                        {{ tableData[scope.$index].name }}
                    </template>
                </el-table-column>
                <!-- 码流类型 -->
                <el-table-column
                    :label="Translate('IDCS_CODE_STREAM_TYPE')"
                    width="120"
                >
                    <template #default="scope">
                        {{ formatDisplayStreamType(tableData[scope.$index]) }}
                    </template>
                </el-table-column>
                <!-- videoEncodeType -->
                <el-table-column
                    :label="Translate('IDCS_VIDEO_ENCT')"
                    width="130"
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
                                        @click="handleVideoEncodeTypeChangeAll(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select-v2
                            v-model="tableData[scope.$index].videoEncodeType"
                            :disabled="tableData[scope.$index].videoEncodeTypeDisable"
                            :options="tableData[scope.$index].mainCaps.supEnct"
                            @change="handleVideoEncodeTypeChange(tableData[scope.$index])"
                        />
                    </template>
                </el-table-column>
                <!-- resolution -->
                <el-table-column
                    :label="Translate('IDCS_RESOLUTION_RATE')"
                    width="145"
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
                                    width="408"
                                    max-height="400"
                                    :data="pageData.resolutionGroups"
                                    :show-header="pageData.headerVisble"
                                    :row-key="getRowKey"
                                    :expand-row-keys="pageData.expands"
                                    :border="false"
                                    @expand-change="handleExpandChange($event, pageData.expands)"
                                >
                                    <el-table-column width="220">
                                        <template #default="scope">
                                            <el-select-v2
                                                v-model="scope.row.res"
                                                :options="scope.row.resGroup"
                                                @visible-change="handleResolutionVisibleChange"
                                            />
                                        </template>
                                    </el-table-column>
                                    <el-table-column
                                        type="expand"
                                        width="188"
                                    >
                                        <template #default="scope">
                                            <div class="chl-box">
                                                <div
                                                    v-for="(item, index) in scope.row.chls.data"
                                                    :key="index"
                                                    class="chl-item"
                                                >
                                                    <BaseImgSprite
                                                        file="chl_icon"
                                                        :index="0"
                                                        :chunk="4"
                                                    />
                                                    <span class="text-ellipsis">{{ item.label }}</span>
                                                </div>
                                            </div>
                                        </template>
                                    </el-table-column>
                                </el-table>
                                <div class="base-btn-box">
                                    <el-button @click="handleSetResolutionAll">{{ Translate('IDCS_OK') }}</el-button>
                                    <el-button @click="handleSetResolutionCancel">{{ Translate('IDCS_CANCEL') }}</el-button>
                                </div>
                            </div>
                        </el-popover>
                    </template>
                    <template #default="scope">
                        <el-select-v2
                            v-model="tableData[scope.$index].resolution"
                            max-height="400"
                            :disabled="tableData[scope.$index].resolutionDisable"
                            :options="tableData[scope.$index].resolutions"
                            @change="handleResolutionChange(tableData[scope.$index])"
                        />
                    </template>
                </el-table-column>
                <!-- frameRate -->
                <el-table-column
                    :label="Translate('IDCS_FRAME_RATE')"
                    width="95"
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
                                        @click="handleFrameRateChangeAll(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select-v2
                            v-model="tableData[scope.$index].frameRate"
                            :disabled="tableData[scope.$index].frameRateDisable"
                            :options="tableData[scope.$index].frameRates"
                            @change="handleFrameRateChange(tableData[scope.$index])"
                        />
                    </template>
                </el-table-column>
                <!-- bitType -->
                <el-table-column
                    :label="Translate('IDCS_BITRATE_TYPE')"
                    width="145"
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
                                        @click="handleBitTypeChangeAll(item)"
                                    >
                                        {{ item }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select-v2
                            v-if="tableData[scope.$index].bitTypeVisible"
                            v-model="tableData[scope.$index].bitType"
                            :disabled="tableData[scope.$index].bitTypeDisable"
                            :options="arrayToOptions(tableData[scope.$index].mainCaps.bitType)"
                            @change="handleBitTypeChange(tableData[scope.$index])"
                        />
                        <span v-else>- -</span>
                    </template>
                </el-table-column>
                <!-- imageLevel -->
                <el-table-column
                    :label="Translate('IDCS_IMAGE_QUALITY')"
                    width="145"
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
                                        @click="handleLevelChangeAll(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select-v2
                            v-model="tableData[scope.$index].level"
                            :placeholder="Translate('IDCS_LOWEST')"
                            :disabled="tableData[scope.$index].imageLevelDisable"
                            :options="tableData[scope.$index].levelNote"
                            @change="handleLevelChange(tableData[scope.$index])"
                        />
                    </template>
                </el-table-column>
                <!-- videoQuality -->
                <el-table-column
                    :label="Translate('IDCS_VIDEO_QUALITY')"
                    width="145"
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
                                        @click="handleVideoQualityChangeAll(item)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select-v2
                            v-model="tableData[scope.$index].videoQuality"
                            :disabled="tableData[scope.$index].videoQualityDisable"
                            :options="tableData[scope.$index].qualitys"
                        />
                    </template>
                </el-table-column>
                <!-- bitRange -->
                <el-table-column
                    :label="Translate('IDCS_RATE_RECOMMEND_RANGE')"
                    width="205"
                >
                    <template #default="scope">
                        <span :disabled="tableData[scope.$index].bitRangeDisable">{{ formatDisplayBitRange(tableData[scope.$index]) }}</span>
                    </template>
                </el-table-column>
                <!-- audio -->
                <el-table-column
                    :label="Translate('IDCS_AUDIO_FREQUENCY')"
                    width="100"
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
                                        @click="handleAudioOptionsChangeAll(item)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select-v2
                            v-model="tableData[scope.$index].audio"
                            :placeholder="Translate('IDCS_ON')"
                            :disabled="tableData[scope.$index].audioDisable"
                            :options="pageData.audioOptions"
                        />
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
                                        @click="handleRecordStreamChangeAll(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select-v2
                            v-model="tableData[scope.$index].recordStream"
                            placeholder="主码流"
                            :disabled="tableData[scope.$index].recordStreamDisable"
                            :options="recordStreams"
                            @change="handleRecordStreamChange(tableData[scope.$index])"
                        />
                    </template>
                </el-table-column> -->
                <!-- GOP -->
                <el-table-column
                    :label="Translate('IDCS_GOP')"
                    width="95"
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
                                <el-form
                                    :style="{
                                        '--form-label-width': 'auto',
                                    }"
                                >
                                    <el-form-item label="GOP">
                                        <BaseNumberInput
                                            v-model="pageData.gopSetAll"
                                            :min="1"
                                            :max="480"
                                        />
                                    </el-form-item>
                                    <div class="base-btn-box">
                                        <el-button @click="handleSetGopAll(pageData.gopSetAll)">{{ Translate('IDCS_OK') }}</el-button>
                                        <el-button @click="handleGopCancel">{{ Translate('IDCS_CANCEL') }}</el-button>
                                    </div>
                                </el-form>
                            </div>
                        </el-popover>
                    </template>
                    <template #default="scope">
                        <BaseNumberInput
                            v-model="tableData[scope.$index].GOP"
                            :disabled="tableData[scope.$index].GOPDisable"
                            :min="tableData[scope.$index].GOPDisable ? 0 : 1"
                            :max="480"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div
            v-if="!pageData.pop"
            class="base-btn-box"
            span="2"
        >
            <div>
                <span class="row_bandwidth">{{ pageData.txtBandwidth }}</span>
                <!-- <span
                    class="detailBtn"
                ></span> -->
                <span v-if="pageData.PredictVisible">{{ pageData.recTime }}</span>
                <el-button
                    v-if="pageData.CalculateVisible"
                    class="btnActivate"
                    @click="handleCalculate"
                >
                    {{ Translate('IDCS_CALCULATE') }}
                </el-button>
            </div>
            <div>
                <el-button
                    :disabled="!editRows.size()"
                    @click="setData"
                >
                    {{ Translate('IDCS_APPLY') }}
                </el-button>
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./RecordBaseStreamTable.v.ts"></script>

<style lang="scss" scoped>
.txRecTime {
    margin-left: 20px;
    margin-top: 10px;
}

.btnActivate {
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
}

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

.GOP_dropDown {
    padding: 10px;
}

.GOP_input {
    display: flex;
    gap: 20px;
    align-items: center;
    font-size: 13px;
    color: var(--main-text);
}
</style>
