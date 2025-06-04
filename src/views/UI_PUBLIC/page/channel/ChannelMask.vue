<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-07-16 17:39:53
 * @Description: 通道 - 视频遮挡配置
-->
<template>
    <div class="base-chl-box">
        <div class="base-chl-box-left">
            <div class="base-chl-box-player">
                <BaseVideoPlayer
                    ref="playerRef"
                    @ready="onReady"
                    @message="notify"
                />
            </div>
            <div class="base-btn-box gap">
                <el-button
                    :disabled="formData.disabled || formData.mask.length >= formData.maxCount"
                    @click="changeEditStatus(!editStatus)"
                >
                    {{ editStatus ? Translate('IDCS_STOP_DRAW') : Translate('IDCS_DRAW_AREA') }}
                </el-button>
                <el-button
                    :disabled="formData.disabled || !drawingArea.length"
                    @click="handleClearArea"
                >
                    {{ Translate('IDCS_CLEAR_AREA') }}
                </el-button>
            </div>
            <el-form
                v-title
                class="stripe odd"
            >
                <el-form-item :label="Translate('IDCS_CHANNEL_SELECT')">
                    <el-select-v2
                        v-model="selectedChlId"
                        :options="chlOptions"
                        :persistent="true"
                        popper-class="intersect-ocx"
                        @change="handleChlSel"
                    />
                </el-form-item>
                <el-form-item
                    v-if="formData.isPtz"
                    :label="Translate('IDCS_PRESET')"
                >
                    <el-select-v2
                        v-model="formData.preset"
                        :disabled="formData.disabled"
                        :options="formData.presetList"
                        :persistent="true"
                        popper-class="intersect-ocx"
                        @change="playPreset(formData.id, formData.preset, 4)"
                    />
                    <BaseImgSprite
                        file="call"
                        :index="1"
                        :hover-index="1"
                        :chunk="2"
                    />
                </el-form-item>
                <div class="base-btn-box">
                    <el-button
                        :disabled="formData.disabled"
                        @click="addMask"
                    >
                        {{ Translate('IDCS_ADD') }}
                    </el-button>
                    <el-button
                        :disabled="formData.disabled"
                        @click="removeMask"
                    >
                        {{ Translate('IDCS_DELETE') }}
                    </el-button>
                </div>
            </el-form>

            <div class="base-table-box">
                <el-table
                    ref="maskTableRef"
                    v-title
                    :data="formData.mask"
                    show-overflow-tooltip
                    highlight-current-row
                    @row-click="handleSelectMask"
                >
                    <el-table-column
                        :label="Translate('IDCS_VIDEO_MASK_AREA')"
                        prop="areaIndex"
                    />
                    <el-table-column min-width="180">
                        <template #header>
                            <el-dropdown>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_ENABLE') }}
                                </BaseTableDropdownLink>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="item in switchOptions"
                                            :key="item.label"
                                            @click="changeAllMaskSwitch(item.value)"
                                        >
                                            {{ item.label }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="{ row }: TableColumn<ChannelPrivacyMaskDto>">
                            <el-select-v2
                                v-model="row.switch"
                                :options="switchOptions"
                                @change="changeMaskSwitch"
                            />
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
        <div class="base-chl-box-right">
            <div class="base-table-box">
                <el-table
                    ref="tableRef"
                    v-title
                    :data="tableData"
                    show-overflow-tooltip
                    highlight-current-row
                    @row-click="handleRowClick"
                >
                    <el-table-column
                        label=" "
                        width="50"
                    >
                        <template #default="{ row }: TableColumn<ChannelMaskDto>">
                            <BaseTableRowStatus
                                :icon="row.status"
                                :error-text="row.statusTip"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column
                        prop="name"
                        :label="Translate('IDCS_CHANNEL_NAME')"
                        min-width="180"
                    />
                    <el-table-column min-width="180">
                        <template #header>
                            <el-dropdown>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_ENABLE') }}
                                </BaseTableDropdownLink>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="item in switchOptions"
                                            :key="item.label"
                                            @click="changeSwitchAll(item.value)"
                                        >
                                            {{ item.label }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="{ row }: TableColumn<ChannelMaskDto>">
                            <el-select-v2
                                v-model="row.switch"
                                :disabled="row.disabled || !row.mask.length"
                                :options="switchOptions"
                                @change="changeSwitch"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_COLOR')"
                        min-width="120"
                    >
                        <template #default="{ row }: TableColumn<ChannelMaskDto>">
                            {{ colorMap[row.color] }}
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./ChannelMask.v.ts"></script>
