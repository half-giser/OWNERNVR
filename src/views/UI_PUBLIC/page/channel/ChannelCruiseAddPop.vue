<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-21 13:47:47
 * @Description: 云台-巡航线-新增弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-21 17:52:16
-->
<template>
    <el-dialog
        :title="Translate('IDCS_ADD_CRUISE')"
        width="600"
        @open="open"
    >
        <div>
            <el-form
                ref="formRef"
                :rules="formRule"
                :model="formData"
            >
                <el-form-item
                    :label="Translate('IDCS_CRUISE_NAME')"
                    prop="name"
                >
                    <el-input
                        v-model="formData.name"
                        :maxlength="nameByteMaxLen"
                        :formatter="formatInputMaxLength"
                        :parser="formatInputMaxLength"
                    />
                </el-form-item>
            </el-form>
            <el-table
                ref="tableRef"
                :data="tableData"
                border
                stripe
                highlight-current-row
                height="300"
                @row-click="handleRowClick"
            >
                <el-table-column
                    :label="Translate('IDCS_PRESET_NAME')"
                    prop="name"
                >
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_SPEED')"
                    prop="speed"
                />
                <el-table-column
                    :label="Translate('IDCS_TIME')"
                    prop="holdTime"
                />
                <el-table-column :label="Translate('IDCS_EDIT')">
                    <template #default="scope">
                        <BaseImgSprite
                            file="edit (2)"
                            :index="2"
                            :hover-index="0"
                            :disabled-index="3"
                            :chunk="4"
                            @click="editPreset(scope.$index)"
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
                    <template #default="scope">
                        <BaseImgSprite
                            file="del"
                            :index="2"
                            :hover-index="0"
                            :disabled-index="3"
                            :chunk="4"
                            @click="deletePreset(scope.$index)"
                        />
                    </template>
                </el-table-column>
            </el-table>
            <div
                class="base-btn-box"
                :span="2"
            >
                <div>
                    <el-button @click="addPreset">{{ Translate('IDCS_ADD_PRESET') }}</el-button>
                </div>
                <div>
                    <el-button
                        :disabled="!tableData.length || pageData.presetIndex === 0"
                        @click="moveUpPreset"
                        >{{ Translate('IDCS_UP') }}</el-button
                    >
                    <el-button
                        :disabled="!tableData.length || pageData.presetIndex === tableData.length - 1"
                        @click="moveDownPreset"
                        >{{ Translate('IDCS_DOWN') }}</el-button
                    >
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
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="verify">{{ Translate('IDCS_ADD') }}</el-button>
                    <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelCruiseAddPop.v.ts"></script>
