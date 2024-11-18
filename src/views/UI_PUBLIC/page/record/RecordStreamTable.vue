<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-07-31 10:29:37
 * @Description: 录像码流通用表格组件
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
                    min-width="220"
                />
                <!-- 码流类型 -->
                <el-table-column
                    :label="Translate('IDCS_CODE_STREAM_TYPE')"
                    width="120"
                >
                    <template #default="scope">
                        <span>{{ formatDisplayStreamType(scope.row) }}</span>
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
                                                    <span class="text-ellipsis">{{ item.text }}</span>
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
                    width="205"
                >
                    <template #default="scope">
                        <span :disabled="scope.row.bitRangeDisable">{{ formatDisplayBitRange(scope.row) }}</span>
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
                            v-model="scope.row.GOP"
                            :disabled="scope.row.GOPDisable"
                            :min="scope.row.GOPDisable ? 0 : 1"
                            :max="480"
                            @keydown.enter="GOPhandleKeydown(scope.row)"
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
                <!-- 这个按钮老代码中写死不显示，新代码其他页面也没实现 -->
                <!-- <span
                    class="detailBtn"
                ></span> -->
                <span v-if="pageData.PredictVisible">{{ pageData.recTime }}</span>
                <el-button
                    v-if="pageData.CalculateVisible"
                    class="btnActivate"
                    @click="handleCalculate"
                    >{{ Translate('IDCS_CALCULATE') }}</el-button
                >
            </div>
            <div>
                <el-button
                    :disabled="pageData.applyBtnDisable"
                    @click="setData"
                    >{{ Translate('IDCS_APPLY') }}</el-button
                >
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./RecordStreamTable.v.ts"></script>

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
