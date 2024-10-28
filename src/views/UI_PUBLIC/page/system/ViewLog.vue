<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-01 11:01:04
 * @Description: 查看日志
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-16 10:51:20
-->
<template>
    <div class="base-flex-box">
        <el-form
            class="stripe narrow"
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
                    <el-date-picker
                        v-model="pageData.startTime"
                        :value-format="dateTime.dateTimeFormat"
                        :format="dateTime.dateTimeFormat"
                        :cell-class-name="highlightWeekend"
                        clear-icon=""
                        type="datetime"
                        @change="changeStartTime"
                    ></el-date-picker>
                    <label>{{ Translate('IDCS_END_TIME') }}</label>
                    <el-date-picker
                        v-model="pageData.endTime"
                        :value-format="dateTime.dateTimeFormat"
                        :format="dateTime.dateTimeFormat"
                        :cell-class-name="highlightWeekend"
                        clear-icon=""
                        type="datetime"
                        @change="changeEndTime"
                    ></el-date-picker>
                    <label></label>
                    <el-button @click="search">{{ Translate('IDCS_SEARCH') }}</el-button>
                    <el-button @click="handleExport">{{ Translate('IDCS_EXPORT') }}</el-button>
                </div>
            </el-form-item>
        </el-form>
        <div class="base-table-box">
            <el-table
                stripe
                border
                :data="tableList"
                :current-row-key="pageData.activeTableIndex"
                :row-class-name="(item) => (item.rowIndex === pageData.activeTableIndex ? 'active' : '')"
                @cell-click="handleChangeRow"
            >
                <el-table-column
                    :label="Translate('IDCS_SERIAL_NUMBER')"
                    width="70"
                >
                    <template #default="scope">
                        {{ (formData.currentPage - 1) * formData.pageSize + scope.$index + 1 }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_MAIN_TYPE')"
                    prop="mainType"
                />
                <el-table-column
                    :label="Translate('IDCS_LOG_TIME')"
                    prop="time"
                />
                <el-table-column :label="Translate('IDCS_CONTENT')">
                    <template #header>
                        <el-popover
                            popper-class="popper no-padding"
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
                    <template #default="scope">
                        <el-text>{{ scope.row.subType }}</el-text>
                    </template>
                </el-table-column>
                <el-table-column
                    width="425"
                    :label="Translate('IDCS_DETAIL_INFO')"
                >
                    <template #default="scope">
                        <div class="detail-info">
                            <el-tooltip :content="scope.row.content">
                                <div>{{ scope.row.content }}</div>
                            </el-tooltip>
                            <BaseImgSprite
                                file="detail"
                                :index="0"
                                :hover-index="1"
                                :chunk="4"
                                @click="showLogDetail(scope.row)"
                            />
                        </div>
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_PLAY')"
                    width="60"
                >
                    <template #default="scope">
                        <BaseImgSprite
                            v-show="displayPlayIcon(scope.row)"
                            file="play (3)"
                            :index="0"
                            :hover-index="1"
                            :chunk="4"
                            @click="playRec(scope.row)"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="row_pagination">
            <el-pagination
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

.el-checkbox-group {
    :deep(.el-checkbox) {
        display: flex;
        padding-left: 10px;
    }
}
</style>
