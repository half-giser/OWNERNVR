<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-17 09:00:44
 * @Description: 网络码流设置
-->
<template>
    <div class="base-flex-box">
        <div class="base-table-box">
            <el-table
                :data="virtualTableData"
                row-key="id"
                :row-class-name="(data) => (tableData[data.rowIndex].disabled ? 'disabled' : '')"
            >
                <!-- 通道名称 -->
                <el-table-column
                    :label="Translate('IDCS_CHANNEL_NAME')"
                    width="270"
                    show-overflow-tooltip
                >
                    <template #default="{ $index }: TableColumn<number>">
                        {{ tableData[$index].name }}
                    </template>
                </el-table-column>
                <!-- 码流类型 -->
                <el-table-column
                    :label="Translate('IDCS_CODE_STREAM_TYPE')"
                    width="140"
                    show-overflow-tooltip
                >
                    {{ Translate('IDCS_SUB_STREAM') }}
                </el-table-column>
                <!-- 视频编码 -->
                <el-table-column
                    :label="Translate('IDCS_VIDEO_ENCT')"
                    width="140"
                >
                    <template #header>
                        <el-dropdown :max-height="400">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_VIDEO_ENCT') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.videoEcodeTypeList"
                                        :key="item.value"
                                        @click="changeAllStreamType(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="{ $index }: TableColumn<number>">
                        <el-select-v2
                            v-model="tableData[$index].videoEncodeType"
                            :disabled="tableData[$index].disabled"
                            :options="tableData[$index].subCaps.supEnct"
                            @change="changeStreamType($index)"
                        />
                    </template>
                </el-table-column>
                <!-- 分辨率 -->
                <el-table-column
                    :label="Translate('IDCS_RESOLUTION_RATE')"
                    width="170"
                >
                    <template #header>
                        <el-popover
                            v-model:visible="pageData.isResolutionPop"
                            :width="400"
                        >
                            <template #reference>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_RESOLUTION_RATE') }}
                                </BaseTableDropdownLink>
                            </template>
                            <el-table
                                :height="400"
                                :show-header="false"
                                :border="false"
                                :data="pageData.resolutionList"
                            >
                                <el-table-column>
                                    <template #default="{ row, $index }: TableColumn<NetSubStreamResolutionList>">
                                        <el-select-v2
                                            v-model="tableData[$index].resolution"
                                            :options="row.resolution"
                                            @visible-change="handleResolutionVisibleChange"
                                        />
                                    </template>
                                </el-table-column>
                                <el-table-column type="expand">
                                    <template #default="{ row }: TableColumn<NetSubStreamResolutionList>">
                                        <div class="expand">
                                            <div
                                                v-for="item in row.chlsList"
                                                :key="item.chlId"
                                            >
                                                <BaseImgSprite
                                                    file="chl_icon"
                                                    :index="0"
                                                    :chunk="4"
                                                />
                                                <span>{{ item.chlName }}</span>
                                            </div>
                                        </div>
                                    </template>
                                </el-table-column>
                            </el-table>
                            <div class="base-btn-box">
                                <el-button @click="changeAllResolution">{{ Translate('IDCS_OK') }}</el-button>
                                <el-button @click="pageData.isResolutionPop = false">{{ Translate('IDCS_CANCEL') }}</el-button>
                            </div>
                        </el-popover>
                    </template>
                    <template #default="{ $index }: TableColumn<number>">
                        <el-select-v2
                            v-model="tableData[$index].resolution"
                            :disabled="tableData[$index].disabled"
                            :options="tableData[$index].subCaps.res"
                            @change="changeResolution($index)"
                        />
                    </template>
                </el-table-column>
                <!-- 帧率 -->
                <el-table-column
                    :label="Translate('IDCS_FRAME_RATE')"
                    width="140"
                >
                    <template #header>
                        <el-dropdown :max-height="400">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_FRAME_RATE') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="i in pageData.maxFps"
                                        :key="i"
                                        @click="changeAllFps(i)"
                                    >
                                        {{ i }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>

                    <template #default="{ $index }: TableColumn<number>">
                        <el-select-v2
                            v-if="!tableData[$index].frameRate"
                            model-value=""
                            disabled
                            :options="[]"
                        />
                        <el-select-v2
                            v-else
                            v-model="tableData[$index].frameRate"
                            :disabled="tableData[$index].disabled"
                            :options="getFpsOptions($index)"
                        />
                    </template>
                </el-table-column>
                <!-- 码率类型 -->
                <el-table-column
                    :label="Translate('IDCS_BITRATE_TYPE')"
                    width="140"
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

                    <template #default="{ $index }: TableColumn<number>">
                        <el-text v-if="!tableData[$index].subCaps.bitType.length">--</el-text>
                        <el-select-v2
                            v-else
                            v-model="tableData[$index].bitType"
                            :disabled="isBitTypeDisabled($index)"
                            :options="arrayToOptions(tableData[$index].subCaps.bitType)"
                            @change="changeBitType($index)"
                        />
                    </template>
                </el-table-column>
                <!-- 图像质量 -->
                <el-table-column
                    :label="Translate('IDCS_IMAGE_QUALITY')"
                    width="140"
                >
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_IMAGE_QUALITY') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu :disabled="isAllLevelDisabled()">
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
                    <template #default="{ $index }: TableColumn<number>">
                        <el-select-v2
                            v-model="tableData[$index].level"
                            :disabled="isLevelDisabled($index)"
                            :options="pageData.levelList"
                        />
                    </template>
                </el-table-column>
                <!-- 码率设置 -->
                <el-table-column
                    :label="Translate('IDCS_VIDEO_QUALITY')"
                    width="140"
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
                    <template #default="{ $index }: TableColumn<number>">
                        <el-select-v2
                            v-if="isVideoQualityDisabled($index)"
                            :model-value="tableData[$index].videoQuality === 0 ? '' : tableData[$index].videoQuality"
                            disabled
                            :options="[]"
                        />
                        <el-select-v2
                            v-else
                            v-model="tableData[$index].videoQuality"
                            :options="getVideoQualityOptions($index)"
                        />
                    </template>
                </el-table-column>
                <!-- 码率上限推荐范围 -->
                <el-table-column
                    :label="Translate('IDCS_RATE_RECOMMEND_RANGE')"
                    width="200"
                    show-overflow-tooltip
                >
                    <template #default="{ $index }: TableColumn<number>">{{ getBitRange(tableData[$index]) }}</template>
                </el-table-column>
                <!-- GOP -->
                <el-table-column
                    :label="Translate('IDCS_GOP')"
                    width="140"
                >
                    <template #header>
                        <el-popover
                            v-model:visible="pageData.isGOPPop"
                            :width="250"
                            popper-class="no-padding"
                        >
                            <template #reference>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_GOP') }}
                                </BaseTableDropdownLink>
                            </template>
                            <el-form
                                :style="{
                                    '--form-label-width': '50px',
                                    '--form-input-width': '170px',
                                }"
                            >
                                <el-form-item :label="Translate('IDCS_GOP')">
                                    <BaseNumberInput
                                        v-model="pageData.GOP"
                                        :min="1"
                                        :max="480"
                                    />
                                </el-form-item>
                                <div class="base-btn-box">
                                    <el-button @click="changeAllGOP">{{ Translate('IDCS_OK') }}</el-button>
                                    <el-button @click="pageData.isGOPPop = false">{{ Translate('IDCS_CANCEL') }}</el-button>
                                </div>
                            </el-form>
                        </el-popover>
                    </template>
                    <template #default="{ $index }: TableColumn<number>">
                        <BaseNumberInput
                            :model-value="isGOPDisabled($index) && tableData[$index].GOP === 0 ? undefined : tableData[$index].GOP"
                            :min="1"
                            :max="480"
                            :disabled="isGOPDisabled($index)"
                            @update:model-value="tableData[$index].GOP = $event"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="base-btn-box">
            <el-button
                :disabled="!editRows.size()"
                @click="setData"
            >
                {{ Translate('IDCS_APPLY') }}
            </el-button>
        </div>
    </div>
</template>

<script lang="ts" src="./NetworkStream.v.ts"></script>

<style lang="scss" scoped>
.expand {
    display: flex;
    flex-wrap: wrap;
    padding: 15px;

    & > div {
        width: 50%;
        margin-bottom: 10px;
        text-align: left;

        span:last-child {
            margin-left: 5px;
        }
    }
}
</style>
