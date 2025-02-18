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
                :row-class-name="(data) => (tableData[data.rowIndex].disabled ? 'disabled' : '')"
            >
                <!-- 通道名 -->
                <el-table-column
                    :label="Translate('IDCS_CHANNEL_NAME')"
                    min-width="220"
                    show-overflow-tooltip
                >
                    <template #default="{ row }: TableColumn<number>">
                        {{ tableData[row].name }}
                    </template>
                </el-table-column>
                <!-- 码流类型 -->
                <el-table-column
                    :label="Translate('IDCS_CODE_STREAM_TYPE')"
                    width="120"
                    show-overflow-tooltip
                >
                    <template #default="{ row }: TableColumn<number>">
                        {{ displayStreamType(tableData[row]) }}
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
                                        v-for="(item, index) in pageData.videoEncodeTypeList"
                                        :key="index"
                                        @click="changeAllVideoEncodeType(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="{ row }: TableColumn<number>">
                        <el-select-v2
                            v-model="tableData[row].videoEncodeType"
                            :disabled="tableData[row].disabled"
                            :options="tableData[row].mainCaps.supEnct"
                            @change="changeVideoEncodeType(tableData[row])"
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
                                    @expand-change="changeExpandResolution($event, pageData.expands)"
                                >
                                    <el-table-column width="220">
                                        <template #default="{ row }: TableColumn<RecordStreamResolutionDto>">
                                            <el-select-v2
                                                v-model="row.res"
                                                :options="row.resGroup"
                                                @visible-change="changeResolutionVisible"
                                            />
                                        </template>
                                    </el-table-column>
                                    <el-table-column
                                        type="expand"
                                        width="188"
                                    >
                                        <template #default="{ row }: TableColumn<RecordStreamResolutionDto>">
                                            <div class="chl-box">
                                                <div
                                                    v-for="(item, index) in row.chls.data"
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
                                    <el-button @click="changeAllResolution">{{ Translate('IDCS_OK') }}</el-button>
                                    <el-button @click="cancelSetAllResolution">{{ Translate('IDCS_CANCEL') }}</el-button>
                                </div>
                            </div>
                        </el-popover>
                    </template>
                    <template #default="{ row }: TableColumn<number>">
                        <el-select-v2
                            v-model="tableData[row].resolution"
                            max-height="400"
                            :disabled="tableData[row].disabled"
                            :options="tableData[row].mainCaps.res"
                            @change="changeResolution(tableData[row])"
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
                        <el-select-v2
                            v-if="!tableData[row].frameRate"
                            model-value=""
                            disabled
                            :options="[]"
                        />
                        <el-select-v2
                            v-else
                            v-model="tableData[row].frameRate"
                            :disabled="tableData[row].disabled"
                            :options="getFrameRateSingleList(tableData[row])"
                        />
                    </template>
                </el-table-column>
                <!-- bitType -->
                <el-table-column
                    :label="Translate('IDCS_BITRATE_TYPE')"
                    width="145"
                >
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_BITRATE_TYPE') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.bitTypeList"
                                        :key="item"
                                        @click="changeAllBitType(item)"
                                    >
                                        {{ item }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="{ row }: TableColumn<number>">
                        <el-select-v2
                            v-if="!tableData[row].disabled"
                            v-model="tableData[row].bitType"
                            :disabled="isBitTypeDisabled(row)"
                            :options="arrayToOptions(tableData[row].mainCaps.bitType)"
                            @change="changeBitType(tableData[row])"
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
                        <el-dropdown :disabled="isAllLevelDisabled()">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_IMAGE_QUALITY') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.levelList"
                                        :key="item.value"
                                        @click="changeAllLevel(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="{ row }: TableColumn<number>">
                        <el-select-v2
                            v-model="tableData[row].level"
                            :placeholder="Translate('IDCS_LOWEST')"
                            :disabled="isLevelDisabled(row)"
                            :options="tableData[row].levelNote"
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
                                        @click="changeAllVideoQuality(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="{ row }: TableColumn<number>">
                        <el-select-v2
                            v-model="tableData[row].videoQuality"
                            :disabled="isVideoQualityDisabled(row)"
                            :options="getQualityList(tableData[row])"
                        />
                    </template>
                </el-table-column>
                <!-- bitRange -->
                <el-table-column
                    :label="Translate('IDCS_RATE_RECOMMEND_RANGE')"
                    width="205"
                    show-overflow-tooltip
                >
                    <template #default="{ row }: TableColumn<number>">
                        <span :disabled="tableData[row].disabled">{{ getBitRange(tableData[row]) }}</span>
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
                                        @click="changeAllAudio(item)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="{ row }: TableColumn<number>">
                        <el-select-v2
                            v-model="tableData[row].audio"
                            :placeholder="Translate('IDCS_ON')"
                            :disabled="isAudioDisabled(row)"
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
                    <template #default="{ row }: TableColumn<number>">
                        <el-select-v2
                            v-model="tableData[row].recordStream"
                            placeholder="主码流"
                            :disabled="tableData[row].recordStreamDisable"
                            :options="recordStreams"
                            @change="handleRecordStreamChange(tableData[row])"
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
                                        <el-button @click="changeAllGOP(pageData.gopSetAll)">{{ Translate('IDCS_OK') }}</el-button>
                                        <el-button @click="cancelSetGOP">{{ Translate('IDCS_CANCEL') }}</el-button>
                                    </div>
                                </el-form>
                            </div>
                        </el-popover>
                    </template>
                    <template #default="{ row }: TableColumn<number>">
                        <BaseNumberInput
                            v-model="tableData[row].GOP"
                            :disabled="isGOPDisabled(row)"
                            :min="isGOPDisabled(row) ? 0 : 1"
                            :max="480"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div
            v-if="!pop"
            class="base-btn-box space-between"
        >
            <div>
                <span class="row_bandwidth">{{ pageData.txtBandwidth }}</span>
                <!-- <span
                    class="detailBtn"
                ></span> -->
                <span v-if="pageData.isRecTime">{{ pageData.recTime }}</span>
                <el-button
                    v-if="pageData.isRecTime"
                    class="btnActivate"
                    @click="getRemainRecTime"
                >
                    {{ Translate('IDCS_CALCULATE') }}
                </el-button>
            </div>
            <el-button
                :disabled="!editRows.size()"
                @click="setData"
            >
                {{ Translate('IDCS_APPLY') }}
            </el-button>
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
