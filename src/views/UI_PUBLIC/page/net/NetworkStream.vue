<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-17 09:00:44
 * @Description: 网络码流设置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-17 13:45:53
-->
<template>
    <div class="base-flex-box">
        <el-table
            :data="tableData"
            border
            stripe
            table-layout="fixed"
            :row-class-name="(data) => handleRowClassName(data.row)"
            show-overflow-tooltip
        >
            <!-- 通道名称 -->
            <el-table-column
                :label="Translate('IDCS_CHANNEL_NAME')"
                prop="name"
                width="270"
            />
            <!-- 码流类型 -->
            <el-table-column
                :label="Translate('IDCS_CODE_STREAM_TYPE')"
                width="140"
            >
                {{ Translate('IDCS_SUB_STREAM') }}
            </el-table-column>
            <!-- 视频编码 -->
            <el-table-column
                :label="Translate('IDCS_VIDEO_ENCT')"
                prop="videoEncodeType"
                width="140"
            >
                <template #header>
                    <el-dropdown
                        trigger="click"
                        :max-height="400"
                    >
                        <BaseTableDropdownLink>
                            {{ Translate('IDCS_VIDEO_ENCT') }}
                        </BaseTableDropdownLink>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item
                                    v-for="item in pageData.videoEcodeTypeList"
                                    :key="item"
                                    :value="item"
                                    @click="changeAllStreamType(item)"
                                >
                                    {{ displayStreamType(item) }}
                                </el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </template>
                <template #default="scope">
                    <el-select
                        v-model="scope.row.videoEncodeType"
                        :disabled="isChlTypeDisabled(scope.$index)"
                        placeholder=""
                        :persistent="!isChlTypeDisabled(scope.$index)"
                        @change="changeStreamType(scope.$index)"
                    >
                        <el-option
                            v-for="item in scope.row.subCaps.supEnct"
                            :key="item"
                            :value="item"
                            :label="displayStreamType(item)"
                        />
                    </el-select>
                </template>
            </el-table-column>
            <!-- 分辨率 -->
            <el-table-column
                :label="Translate('IDCS_RESOLUTION_RATE')"
                prop="resolution"
                width="140"
            >
                <template #header>
                    <el-popover
                        v-model:visible="pageData.isResolutionPop"
                        :width="400"
                        trigger="click"
                        :show-after="0"
                        :hide-after="0"
                    >
                        <template #reference>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_RESOLUTION_RATE') }}
                            </BaseTableDropdownLink>
                        </template>
                        <el-table
                            :height="400"
                            :show-header="false"
                            :data="pageData.resolutionList"
                            stripe
                            border
                        >
                            <el-table-column>
                                <template #default="scope">
                                    <el-select
                                        v-model="scope.row.value"
                                        :persistent="false"
                                        @visible-change="handleResolutionVisibleChange"
                                    >
                                        <el-option
                                            v-for="item in scope.row.resolution"
                                            :key="item.value"
                                            :value="item.value"
                                            :label="item.value"
                                        />
                                    </el-select>
                                </template>
                            </el-table-column>
                            <el-table-column type="expand">
                                <template #default="scope">
                                    <div class="expand">
                                        <div
                                            v-for="item in scope.row.chlsList"
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
                <template #default="scope">
                    <el-select
                        v-model="scope.row.resolution"
                        :disabled="isChlTypeDisabled(scope.$index)"
                        placeholder=""
                        :persistent="false"
                        @change="changeResolution(scope.$index)"
                    >
                        <el-option
                            v-for="item in scope.row.subCaps.res"
                            :key="item.value"
                            :value="item.value"
                            :label="item.value"
                        />
                    </el-select>
                </template>
            </el-table-column>
            <!-- 帧率 -->
            <el-table-column
                :label="Translate('IDCS_FRAME_RATE')"
                width="140"
            >
                <template #header>
                    <el-dropdown
                        trigger="click"
                        :max-height="400"
                    >
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

                <template #default="scope">
                    <el-select
                        v-if="!scope.row.frameRate"
                        model-value=""
                        placeholder=""
                        disabled
                        :persistent="false"
                    ></el-select>
                    <el-select
                        v-else
                        v-model="scope.row.frameRate"
                        placeholder=""
                        :disabled="isChlTypeDisabled(scope.$index)"
                        :persistent="false"
                    >
                        <el-option
                            v-for="i in getMaxFps(scope.$index)"
                            :key="i"
                            :value="i"
                            :label="i"
                        />
                    </el-select>
                </template>
            </el-table-column>
            <!-- 码率类型 -->
            <el-table-column
                :label="Translate('IDCS_BITRATE_TYPE')"
                prop="bitType"
                width="140"
            >
                <template #header>
                    <el-dropdown trigger="click">
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

                <template #default="scope">
                    <el-text v-if="!scope.row.subCaps.bitType.length">--</el-text>
                    <el-select
                        v-else
                        v-model="scope.row.bitType"
                        placeholder=""
                        :disabled="isBitTypeDisabled(scope.$index)"
                        :persistent="false"
                        @change="changeBitType(scope.$index)"
                    >
                        <el-option
                            v-for="item in scope.row.subCaps.bitType"
                            :key="item"
                            :label="item"
                            :value="item"
                        />
                    </el-select>
                </template>
            </el-table-column>
            <!-- 图像质量 -->
            <el-table-column
                :label="Translate('IDCS_IMAGE_QUALITY')"
                prop="level"
                width="140"
            >
                <template #header>
                    <el-dropdown trigger="click">
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
                <template #default="scope">
                    <el-select
                        v-model="scope.row.level"
                        :disabled="isLevelDisabled(scope.$index)"
                        placeholder=""
                        :persistent="!isChlTypeDisabled(scope.$index)"
                    >
                        <el-option
                            v-for="item in pageData.levelList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                </template>
            </el-table-column>
            <!-- 码率设置 -->
            <el-table-column
                :label="Translate('IDCS_VIDEO_QUALITY')"
                width="140"
            >
                <template #header>
                    <el-dropdown trigger="click">
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
                <template #default="scope">
                    <el-select
                        v-if="isVideoQualityDisabled(scope.$index)"
                        :model-value="scope.row.videoQuality === 0 ? '' : scope.row.videoQuality"
                        disabled
                        placeholder=""
                        :persistent="false"
                    >
                    </el-select>
                    <el-select
                        v-else
                        v-model="scope.row.videoQuality"
                    >
                        <el-option
                            v-for="item in getVideoQualityOptions(scope.$index)"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                </template>
            </el-table-column>
            <!-- 码率上限推荐范围 -->
            <el-table-column
                :label="Translate('IDCS_RATE_RECOMMEND_RANGE')"
                width="200"
            >
                <template #default="scope">{{ getBitRange(scope.row) }}</template>
            </el-table-column>
            <!-- GOP -->
            <el-table-column
                :label="Translate('IDCS_GOP')"
                prop="GOP"
                width="140"
            >
                <template #header>
                    <el-popover
                        v-model:visible="pageData.isGOPPop"
                        trigger="click"
                        :width="250"
                    >
                        <template #reference>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_GOP') }}
                            </BaseTableDropdownLink>
                        </template>
                        <el-form
                            label-position="left"
                            :style="{
                                '--form-label-width': '50px',
                                '--form-input-width': '150px',
                            }"
                        >
                            <el-form-item :label="Translate('IDCS_GOP')">
                                <BaseNumberInput
                                    v-model="pageData.GOP"
                                    :min="1"
                                    :max="480"
                                    value-on-clear="min"
                                />
                            </el-form-item>
                            <div class="base-btn-box">
                                <el-button @click="changeAllGOP">{{ Translate('IDCS_OK') }}</el-button>
                                <el-button @click="pageData.isGOPPop = false">{{ Translate('IDCS_CANCEL') }}</el-button>
                            </div>
                        </el-form>
                    </el-popover>
                </template>
                <template #default="scope">
                    <el-input
                        v-if="isGOPDisabled(scope.$index)"
                        :model-value="scope.row.GOP === 0 ? '' : scope.row.GOP"
                        disabled
                    />
                    <BaseNumberInput
                        v-else
                        v-model="scope.row.GOP"
                        :min="1"
                        :max="480"
                        value-on-clear="min"
                    />
                </template>
            </el-table-column>
        </el-table>
        <div class="base-btn-box">
            <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
        </div>
    </div>
</template>

<script lang="ts" src="./NetworkStream.v.ts"></script>

<style lang="scss" scoped>
:deep(.el-input-number) {
    width: 100%;

    .el-input__wrapper {
        padding: 0 10px;
    }

    .el-input__inner {
        text-align: left;
    }
}

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
