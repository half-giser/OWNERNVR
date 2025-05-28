<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-19 09:52:15
 * @Description: 新增通道组
-->
<template>
    <div class="base-flex-box">
        <el-form
            ref="formRef"
            v-title
            :model="formData"
            :rules="rules"
            class="stripe"
            :style="{
                '--form-input-width': '250px',
            }"
        >
            <el-form-item
                prop="name"
                :label="Translate('IDCS_GROUP_NAME')"
            >
                <BaseTextInput
                    v-model="formData.name"
                    :maxlength="formData.nameMaxByteLen"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_STAY_TIME')">
                <el-select-v2
                    v-model="formData.dwellTime"
                    :options="timeList"
                />
            </el-form-item>
        </el-form>
        <div class="base-table-box">
            <el-table
                ref="tableRef"
                v-title
                :data="tableData"
                show-overflow-tooltip
                highlight-current-row
                @row-click="handleRowClick"
                @selection-change="handleSelectionChange"
            >
                <el-table-column
                    type="index"
                    :label="Translate('IDCS_SERIAL_NUMBER')"
                    width="80"
                />
                <el-table-column
                    type="selection"
                    width="50"
                />
                <el-table-column
                    prop="name"
                    :label="Translate('IDCS_CHANNEL_NAME')"
                    min-width="300"
                />
                <el-table-column
                    prop="ip"
                    :label="Translate('IDCS_ADDRESS')"
                    min-width="300"
                />
                <el-table-column
                    v-if="!dialog"
                    :label="Translate('IDCS_PREVIEW')"
                    min-width="140"
                >
                    <template #default="{ row }: TableColumn<ChannelInfoDto>">
                        <BaseImgSpriteBtn
                            file="preview"
                            @click="handlePreview(row)"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="base-btn-box space-between">
            <div>
                {{ Translate('IDCS_SELECT_CHANNEL_COUNT').formatForLang(selNum, tableData.length) }}
            </div>
            <div>
                <el-button @click="save()">{{ Translate('IDCS_OK') }}</el-button>
                <el-button @click="handleCancel">{{ Translate('IDCS_CANCEL') }}</el-button>
            </div>
        </div>
        <BaseLivePop ref="baseLivePopRef" />
    </div>
</template>

<script lang="ts" src="./ChannelGroupAdd.v.ts"></script>
