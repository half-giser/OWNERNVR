<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-01 11:01:04
 * @Description: 查看日志
-->
<template>
    <div class="base-flex-box">
        <el-form
            class="stripe"
            :style="{
                '--form-input-width': '250px',
            }"
        >
            <el-form-item>
                <div class="form-item">
                    <label>{{ Translate('IDCS_MAIN_TYPE') }}</label>
                    <div>
                        <el-button
                            v-for="item in pageData.typeOptions"
                            :key="item.value"
                            :type="formData.type === item.value ? 'primary' : 'default'"
                            link
                            @click="changeMainType(item.value)"
                        >
                            {{ item.label }}
                        </el-button>
                    </div>
                </div>
            </el-form-item>
            <el-form-item>
                <div class="form-item">
                    <label>{{ Translate('IDCS_START_TIME') }}</label>
                    <BaseDatePicker
                        v-model="pageData.startTime"
                        type="datetime"
                        @change="changeStartTime"
                    />
                    <label>{{ Translate('IDCS_END_TIME') }}</label>
                    <BaseDatePicker
                        v-model="pageData.endTime"
                        type="datetime"
                        @change="changeEndTime"
                    />
                    <label></label>
                    <el-button @click="search">{{ Translate('IDCS_SEARCH') }}</el-button>
                    <el-button @click="handleExport">{{ Translate('IDCS_EXPORT') }}</el-button>
                </div>
            </el-form-item>
        </el-form>
        <div class="base-table-box">
            <el-table
                highlight-current-row
                show-overflow-tooltip
                :data="tableList"
                @cell-click="handleChangeRow"
            >
                <el-table-column
                    :label="Translate('IDCS_SERIAL_NUMBER')"
                    width="70"
                    prop="index"
                />
                <el-table-column
                    :label="Translate('IDCS_MAIN_TYPE')"
                    prop="mainType"
                />
                <el-table-column
                    :label="Translate('IDCS_LOG_TIME')"
                    prop="time"
                />
                <el-table-column
                    :label="Translate('IDCS_CONTENT')"
                    prop="subType"
                >
                    <template #header>
                        <el-popover
                            popper-class="no-padding"
                            width="fit-content"
                        >
                            <template #reference>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_CONTENT') }}
                                </BaseTableDropdownLink>
                            </template>
                            <el-scrollbar max-height="300">
                                <el-checkbox-group
                                    v-model="formData.subType"
                                    class="line-break inline"
                                    @change="changeSubType"
                                >
                                    <el-checkbox
                                        v-for="item in subTypeOptions"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.name"
                                    />
                                </el-checkbox-group>
                            </el-scrollbar>
                        </el-popover>
                    </template>
                </el-table-column>
                <el-table-column
                    width="425"
                    :label="Translate('IDCS_DETAIL_INFO')"
                >
                    <template #default="{ row, $index }: TableColumn<SystemLogList>">
                        <div class="detail-info">
                            <div>{{ row.content }}</div>
                            <BaseImgSpriteBtn
                                file="detail"
                                @click="showLogDetail($index)"
                            />
                        </div>
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_PLAY')"
                    width="60"
                >
                    <template #default="{ row }: TableColumn<SystemLogList>">
                        <BaseImgSpriteBtn
                            v-show="displayPlayIcon(row)"
                            file="preview"
                            @click="playRec(row)"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="base-pagination-box">
            <BasePagination
                v-model:current-page="formData.currentPage"
                v-model:page-size="formData.pageSize"
                :total="pageData.totalCount"
                @size-change="changePaginationSize"
                @current-change="changePagination"
            />
        </div>
        <!-- 日志详情弹窗 -->
        <ViewLogDetailPop
            v-model="pageData.isDetail"
            :active-index="pageData.activeTableIndex"
            :data="tableList"
            @change="changeLogDetail"
            @close="closeLogDetail"
        />
        <!-- 回放弹窗 -->
        <BasePlaybackPop
            v-model="pageData.isRecord"
            :play-list="pageData.recordPlayList"
            @close="pageData.isRecord = false"
        />
    </div>
</template>

<script lang="ts" src="./ViewLog.v.ts"></script>

<style lang="scss" scoped>
.form-item {
    display: flex;
    align-items: center;

    label {
        padding-right: 20px;
        font-size: 13px;
        flex-shrink: 0;

        &:not(:first-child) {
            padding-left: 20px;
        }
    }

    .el-button {
        margin-left: 5px;
    }
}

.detail-info {
    width: 100%;
    display: flex;

    div {
        width: 100%;
        height: 23px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        text-align: left;
    }

    span {
        flex-shrink: 0;
    }
}
</style>
