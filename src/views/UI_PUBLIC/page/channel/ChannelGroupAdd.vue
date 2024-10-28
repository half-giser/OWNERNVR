<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-19 09:52:15
 * @Description: 新增通道组
-->
<template>
    <div class="base-flex-box">
        <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            class="ruleForm"
            :style="{
                '--form-label-width': '200px',
                '--form-input-width': '220px',
            }"
        >
            <el-form-item
                prop="name"
                :label="Translate('IDCS_GROUP_NAME')"
            >
                <el-input
                    v-model="formData.name"
                    maxlength="63"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_STAY_TIME')">
                <el-select v-model="formData.dwellTime">
                    <el-option
                        v-for="item in timeList"
                        :key="item"
                        :value="item"
                        :label="getTranslateForSecond(item)"
                    />
                </el-select>
            </el-form-item>
        </el-form>
        <div class="base-table-box">
            <el-table
                ref="tableRef"
                border
                stripe
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
                    :label="Translate('IDCS_PREVIEW')"
                    min-width="140"
                >
                    <template #default="scope">
                        <BaseImgSprite
                            file="play (3)"
                            :chunk="4"
                            :index="0"
                            :hover-index="1"
                            :active-index="1"
                            @click="handlePreview(scope.row)"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div
            class="base-btn-box"
            :span="2"
        >
            <div>
                <span>{{ Translate('IDCS_SELECT_CHANNEL_COUNT').formatForLang(selNum, chlGroupCountLimit) }}</span>
            </div>
            <div>
                <el-button @click="save()">{{ Translate('IDCS_OK') }}</el-button>
                <el-button @click="handleCancel">{{ Translate('IDCS_CANCEL') }}</el-button>
            </div>
        </div>
        <BaseLivePop ref="baseLivePopRef"></BaseLivePop>
    </div>
</template>

<script lang="ts" src="./ChannelGroupAdd.v.ts"></script>
