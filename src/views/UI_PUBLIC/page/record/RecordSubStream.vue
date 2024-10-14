<!--
 * @Description: 录像——录像子码流
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-07-31 10:12:26
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-10-12 17:29:11
-->
<template>
    <div class="base-flex-box">
        <div class="base-table-box">
            <el-table
                ref="tableRef"
                border
                stripe
                :data="tableData"
                table-layout="fixed"
                show-overflow-tooltip
                empty-text=" "
                highlight-current-row
                :row-class-name="disabledRow"
            >
                <!-- 通道名称 -->
                <el-table-column
                    :label="Translate('IDCS_CHANNEL_NAME')"
                    min-width="240px"
                >
                    <template #default="scope">
                        <span>{{ scope.row.name }}</span>
                    </template>
                </el-table-column>
                <!-- 码流类型 -->
                <el-table-column
                    :label="Translate('IDCS_CODE_STREAM_TYPE')"
                    prop="streamType"
                    min-width="100px"
                >
                    <template #default="scope">
                        <span>{{ STREAM_TYPE_MAPPING[scope.row.streamType] }}</span>
                    </template>
                </el-table-column>
                <!-- 视频编码 -->
                <el-table-column
                    :label="Translate('IDCS_VIDEO_ENCT')"
                    min-width="130px"
                >
                    <template #header>
                        <div v-if="RecordSubResAdaptive">{{ Translate('IDCS_VIDEO_ENCT') }}</div>
                        <el-dropdown
                            v-else
                            trigger="click"
                        >
                            <span class="el-dropdown-link">
                                {{ Translate('IDCS_VIDEO_ENCT') }}
                                <BaseImgSprite
                                    class="ddn"
                                    file="ddn"
                                />
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.videoEncodeTypeUnionList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        @click="changeAllVideoEncodeType(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <div v-if="RecordSubResAdaptive">{{ STREAM_TYPE_MAPPING[scope.row.videoEncodeType] || '--' }}</div>
                        <div v-else-if="pageData.isRowNonExistent[scope.row.index]?.videoEncodeType">{{ '--' }}</div>
                        <el-select
                            v-else
                            v-model="scope.row.videoEncodeType"
                            :disabled="pageData.isRowDisabled[scope.row.index]"
                            placeholder=" "
                            @change="changeVideoEncodeType(scope.row)"
                        >
                            <el-option
                                v-for="item in pageData.videoEncodeTypeList[scope.row.index]"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                    </template>
                </el-table-column>
                <!-- 分辨率 -->
                <el-table-column
                    :label="Translate('IDCS_RESOLUTION_RATE')"
                    min-width="110px"
                >
                    <template #header>
                        <div v-if="RecordSubResAdaptive">{{ Translate('IDCS_RESOLUTION_RATE') }}</div>
                        <el-popover
                            v-else
                            v-model:visible="pageData.resolutionHeaderVisble"
                            trigger="click"
                            width="430px"
                            popper-class="no-padding"
                        >
                            <template #reference>
                                <span class="pop">
                                    {{ Translate('IDCS_RESOLUTION_RATE') }}
                                    <BaseImgSprite
                                        class="ddn"
                                        file="ddn"
                                    />
                                </span>
                            </template>
                            <div id="resolutionContainer">
                                <el-table
                                    ref="resolutionTableRef"
                                    max-height="400px"
                                    :data="pageData.resolutionGroups"
                                    :show-header="false"
                                    :row-key="getRowKey"
                                    :expand-row-keys="pageData.expands"
                                    stripe
                                    border
                                    @expand-change="handleExpandChange($event, pageData.expands)"
                                >
                                    <el-table-column
                                        prop="res"
                                        width="220px"
                                    >
                                        <template #default="scope">
                                            <el-select
                                                v-model="scope.row.res"
                                                :teleported="false"
                                            >
                                                <el-option
                                                    v-for="item in scope.row.resGroup"
                                                    :key="item"
                                                    :label="item"
                                                    :value="item"
                                                    @click="keepDropDownOpen(scope.row)"
                                                >
                                                </el-option>
                                            </el-select>
                                        </template>
                                    </el-table-column>
                                    <el-table-column
                                        prop="chls"
                                        width="190px"
                                        type="expand"
                                    >
                                        <template #default="scope">
                                            <div :style="{ height: '260px' }">
                                                <el-row>
                                                    <el-col
                                                        v-for="(item, index) in scope.row.chls.data"
                                                        :key="index"
                                                        :span="12"
                                                    >
                                                        <div class="device-item">
                                                            <BaseImgSprite
                                                                file="chl_icon"
                                                                :index="0"
                                                                :hover-index="1"
                                                                :chunk="4"
                                                                :style="{ margin: '0 3px 0 5px' }"
                                                            />
                                                            <span class="device-name">{{ item.label }}</span>
                                                        </div>
                                                    </el-col>
                                                </el-row>
                                            </div>
                                        </template>
                                    </el-table-column>
                                </el-table>
                                <el-row class="base-btn-box">
                                    <el-button @click="apply">{{ Translate('IDCS_OK') }}</el-button>
                                    <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
                                </el-row>
                            </div>
                        </el-popover>
                    </template>
                    <template #default="scope">
                        <div v-if="RecordSubResAdaptive">{{ scope.row.resolution || '--' }}</div>
                        <div v-else-if="pageData.isRowNonExistent[scope.row.index]?.resolution">{{ '--' }}</div>
                        <el-select
                            v-else
                            v-model="scope.row.resolution"
                            :disabled="pageData.isRowDisabled[scope.row.index]"
                            placeholder=" "
                            @change="changeResolution(scope.row, scope.row.resolution)"
                        >
                            <el-option
                                v-for="item in pageData.resolutionList[scope.row.index]"
                                :key="item"
                                :label="item"
                                :value="item"
                            />
                        </el-select>
                    </template>
                </el-table-column>
                <!-- 帧率 -->
                <el-table-column
                    :label="Translate('IDCS_FRAME_RATE')"
                    min-width="90px"
                >
                    <template #header>
                        <div v-if="RecordSubResAdaptive">{{ Translate('IDCS_FRAME_RATE') }}</div>
                        <el-dropdown
                            v-else
                            trigger="click"
                            max-height="400px"
                        >
                            <span class="el-dropdown-link">
                                {{ Translate('IDCS_FRAME_RATE') }}
                                <BaseImgSprite
                                    class="ddn"
                                    file="ddn"
                                />
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.frameRateUnionList"
                                        :key="item"
                                        :label="item"
                                        :value="item"
                                        @click="changeAllFrameRate(item)"
                                    >
                                        {{ item }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <div v-if="RecordSubResAdaptive">{{ scope.row.frameRate || '--' }}</div>
                        <div v-else-if="pageData.isRowNonExistent[scope.row.index]?.frameRate">{{ '--' }}</div>
                        <el-select
                            v-else
                            v-model="scope.row.frameRate"
                            :disabled="pageData.isRowDisabled[scope.row.index]"
                            placeholder=" "
                            @change="changeVideoEncodeType(scope.row)"
                        >
                            <el-option
                                v-for="item in pageData.frameRateList[scope.row.index]"
                                :key="item"
                                :label="item"
                                :value="item"
                            />
                        </el-select>
                    </template>
                </el-table-column>
                <!-- 码率上限 -->
                <el-table-column
                    :label="Translate('IDCS_VIDEO_QUALITY')"
                    min-width="130px"
                >
                    <template #header>
                        <div v-if="RecordSubResAdaptive">{{ Translate('IDCS_VIDEO_QUALITY') }}</div>
                        <el-dropdown
                            v-else
                            trigger="click"
                        >
                            <span class="el-dropdown-link">
                                {{ Translate('IDCS_VIDEO_QUALITY') }}
                                <BaseImgSprite
                                    class="ddn"
                                    file="ddn"
                                />
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.videoQualityList"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                        @click="changeAllVideoQuality(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <!-- 在码率上限中不可修改情况下，有数据的行不可选项也要设置为-- -->
                        <div v-if="RecordSubResAdaptive && pageData.isVideoQualityDisabled[scope.row.index]">{{ '--' }}</div>
                        <div v-else-if="RecordSubResAdaptive">{{ scope.row.videoQuality ? `${scope.row.videoQuality}Kbps` : '--' }}</div>
                        <div v-else-if="pageData.isRowNonExistent[scope.row.index]?.videoQuality">{{ '--' }}</div>
                        <el-select
                            v-else
                            v-model="scope.row.videoQuality"
                            :disabled="pageData.isRowDisabled[scope.row.index] || pageData.isVideoQualityDisabled[scope.row.index]"
                            placeholder=" "
                        >
                            <el-option
                                v-for="item in pageData.videoQualityItemList[scope.row.index]"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="base-btn-box">
            <el-button
                v-show="!RecordSubResAdaptive"
                @click="setData"
                >{{ Translate('IDCS_APPLY') }}</el-button
            >
        </div>
    </div>
</template>

<script lang="ts" src="./RecordSubStream.v.ts"></script>

<style scoped lang="scss">
.disabled {
    color: var(--input-text-disabled);
}

.device-item {
    margin: 5px;
}
:deep(.cell) {
    overflow: visible;
}
:deep(.el-table__cell) {
    z-index: auto;
}
</style>
