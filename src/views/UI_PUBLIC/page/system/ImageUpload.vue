<!--
 * @Description: 系统——上海地标平台——定时图像上传
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-10-23 11:43:06
-->
<template>
    <div class="base-flex-box">
        <div class="base-table-box">
            <el-table
                ref="tableRef"
                v-title
                :data="tableData"
                :row-key="getRowKey"
                :expand-row-key="pageData.expandRowKey"
                highlight-current-row
                show-overflow-tooltip
                :header-cell-style="{ 'border-right': '1px solid var(--table-thead-border)' }"
                @expand-change="handleExpandChange"
            >
                <!-- 通道号 -->
                <el-table-column
                    prop="chlNum"
                    :label="Translate('IDCS_CHANNEL_NUMBER')"
                    width="120"
                />
                <!-- 通道名称 -->
                <el-table-column
                    prop="name"
                    :label="Translate('IDCS_CHANNEL_NAME')"
                    min-width="300"
                />
                <!-- 时间点 -->
                <el-table-column
                    prop="timeCount"
                    :label="Translate('IDCS_SCHEDULE_TIMES')"
                    min-width="400"
                >
                    <template #default="{ row }: TableColumn<SystenSHDBImageUploadDto>">
                        {{ Translate('IDCS_SCHEDULE_UPLOAD_PIC_TIMES').formatForLang(row.timeCount) }}
                    </template>
                </el-table-column>
                <!-- 清空 -->
                <el-table-column
                    prop="delete"
                    :label="Translate('IDCS_CLEAR_ALL')"
                    width="110"
                >
                    <template #default="{ row }: TableColumn<SystenSHDBImageUploadDto>">
                        <BaseImgSpriteBtn
                            file="del"
                            @click="clearChannelAllTime(row)"
                        />
                    </template>
                </el-table-column>
                <!-- 编辑 -->
                <el-table-column
                    type="expand"
                    :label="Translate('IDCS_EDIT')"
                    width="106"
                >
                    <template #default="{ row }: TableColumn<SystenSHDBImageUploadDto>">
                        <div class="expand">
                            <div
                                v-for="(item, index) in row.timelist"
                                :key="item.value"
                                class="expand-item"
                            >
                                <span class="text-ellipsis">{{ item.label }}</span>
                                <BaseImgSprite
                                    file="delItem"
                                    class="expand-del"
                                    :hover-index="0"
                                    @click="deleteTimeItem(row, index)"
                                />
                            </div>
                            <BaseImgSprite
                                class="expand-add"
                                file="addItem"
                                :hover-index="0"
                                :chunk="2"
                                @click="openAddTimeDialog(row)"
                            />
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="base-btn-box">
            <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
        </div>
    </div>
    <!-- 添加单个时间项弹窗 -->
    <el-dialog
        v-model="pageData.addSignTimeDialogOpen"
        width="450"
        hight="220"
    >
        <el-form
            ref="formRef"
            v-title
            class="stripe"
        >
            <el-form-item :label="Translate('IDCS_CHANNEL_NUMBER')">
                {{ pageData.currentRow.chlNum }}
            </el-form-item>
            <el-form-item :label="Translate('IDCS_CHANNEL_NAME')">
                {{ pageData.currentRow.name }}
            </el-form-item>
            <el-form-item :label="Translate('IDCS_SCHEDULE_START_TIME')">
                <BaseTimePicker v-model="pageData.addTimeData" />
            </el-form-item>
        </el-form>
        <div class="base-btn-box">
            <el-button @click="addTimeItem">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="pageData.addSignTimeDialogOpen = false">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
    <ImageUploadAddTimePop
        v-model="pageData.addUploadTimePopOpen"
        :table-data="tableData"
        @confirm="addUploadTime"
        @close="pageData.addUploadTimePopOpen = false"
    />
</template>

<script lang="ts" src="./ImageUpload.v.ts"></script>

<style lang="scss" scoped>
.expand {
    height: 100px;
    display: flex;
    flex-wrap: wrap;
    margin: 0 3px;

    &-add {
        margin-left: 6px;
    }

    &-item {
        display: flex;
        width: 185px;
        height: 20px;
        margin-left: 6px;
        text-align: left;
        align-items: center;

        &:hover {
            .expand-del {
                opacity: 1;
            }
        }

        .Icon {
            flex-shrink: 0;
        }
    }

    .expand-del {
        opacity: 0;
        margin-left: 5px;
    }
}
</style>
