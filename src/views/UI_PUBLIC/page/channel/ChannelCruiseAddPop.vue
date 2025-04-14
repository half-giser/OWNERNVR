<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-21 13:47:47
 * @Description: 云台-巡航线-新增弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_ADD_CRUISE')"
        width="600"
        @open="open"
        @closed="reset"
    >
        <div>
            <el-form
                ref="formRef"
                v-title
                :rules="formRule"
                :model="formData"
            >
                <el-form-item
                    :label="Translate('IDCS_CRUISE_NAME')"
                    prop="name"
                >
                    <el-input
                        v-model="formData.name"
                        :formatter="formatInputMaxLength"
                        :parser="formatInputMaxLength"
                    />
                </el-form-item>
            </el-form>
            <el-table
                ref="tableRef"
                v-title
                :data="tableData"
                highlight-current-row
                show-overflow-tooltip
                height="300"
                @row-click="handleRowClick"
            >
                <el-table-column
                    :label="Translate('IDCS_PRESET')"
                    prop="index"
                />
                <el-table-column
                    :label="Translate('IDCS_PRESET_NAME')"
                    prop="name"
                    width="95"
                />
                <el-table-column
                    :label="Translate('IDCS_SPEED')"
                    prop="speed"
                />
                <el-table-column
                    :label="Translate('IDCS_TIME')"
                    prop="holdTime"
                />
                <el-table-column :label="Translate('IDCS_EDIT')">
                    <template #default="{ $index }: TableColumn<ChannelPtzCruisePresetDto>">
                        <BaseImgSpriteBtn
                            file="edit2"
                            @click="editPreset($index)"
                        />
                    </template>
                </el-table-column>
                <el-table-column>
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_DELETE') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click="deleteAllPreset">{{ Translate('IDCS_DELETE_ALL') }}</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="{ $index }: TableColumn<ChannelPtzCruisePresetDto>">
                        <BaseImgSpriteBtn
                            file="del"
                            @click="deletePreset($index)"
                        />
                    </template>
                </el-table-column>
            </el-table>
            <div class="base-btn-box space-between">
                <el-button @click="addPreset">{{ Translate('IDCS_ADD_PRESET') }}</el-button>
                <div>
                    <el-button
                        :disabled="!tableData.length || pageData.presetIndex === 0"
                        @click="moveUpPreset"
                    >
                        {{ Translate('IDCS_UP') }}
                    </el-button>
                    <el-button
                        :disabled="!tableData.length || pageData.presetIndex === tableData.length - 1"
                        @click="moveDownPreset"
                    >
                        {{ Translate('IDCS_DOWN') }}
                    </el-button>
                </div>
            </div>
        </div>
        <ChannelCruiseEditPresetPop
            v-model="pageData.isPresetPop"
            :chl-id="chlId"
            :type="pageData.presetType"
            :data="tableData[pageData.presetIndex] || undefined"
            @confirm="confirmChangePreset"
            @close="pageData.isPresetPop = false"
        />
        <div class="base-btn-box">
            <el-button @click="verify">{{ Translate('IDCS_ADD') }}</el-button>
            <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelCruiseAddPop.v.ts"></script>
