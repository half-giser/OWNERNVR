<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-01 11:01:04
 * @Description: 查看日志
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-09 20:48:24
-->
<template>
    <div class="ViewLog">
        <div class="form">
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
            <div class="form-item">
                <label>{{ Translate('IDCS_START_TIME') }}</label>
                <el-date-picker
                    v-model="pageData.startTime"
                    :value-format="dateTime.dateTimeFormat.value"
                    :format="dateTime.dateTimeFormat.value"
                    :cell-class-name="dateTime.highlightWeekend"
                    clear-icon=""
                    type="datetime"
                    @change="changeStartTime"
                ></el-date-picker>
                <label>{{ Translate('IDCS_END_TIME') }}</label>
                <el-date-picker
                    v-model="pageData.endTime"
                    :value-format="dateTime.dateTimeFormat.value"
                    :format="dateTime.dateTimeFormat.value"
                    :cell-class-name="dateTime.highlightWeekend"
                    clear-icon=""
                    type="datetime"
                    @change="changeEndTime"
                ></el-date-picker>
                <el-button @click="search">{{ Translate('IDCS_SEARCH') }}</el-button>
                <el-button @click="handleExport">{{ Translate('IDCS_EXPORT') }}</el-button>
            </div>
        </div>
        <el-table
            stripe
            border
            :data="tableList"
            :current-row-key="pageData.activeTableIndex"
            :row-class-name="(item) => (item.rowIndex === pageData.activeTableIndex ? 'active' : '')"
            @cell-click="handleChangeRow"
        >
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
                        trigger="click"
                        popper-class="popper"
                        width="fit-content"
                    >
                        <template #reference>
                            <span class="el-dropdown-link">
                                {{ Translate('IDCS_CONTENT') }}
                                <BaseImgSprite
                                    class="ddn"
                                    file="ddn"
                                />
                            </span>
                        </template>
                        <div class="sub-types">
                            <el-checkbox-group
                                v-model="formData.subType"
                                @change="changeSubType"
                            >
                                <el-checkbox
                                    v-for="item in subTypeOptions"
                                    :key="item.value"
                                    :value="item.value"
                                >
                                    {{ item.name }}
                                </el-checkbox>
                            </el-checkbox-group>
                        </div>
                    </el-popover>
                </template>
                <template #default="scope">
                    <el-text>{{ scope.row.subType }}</el-text>
                </template>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_DETAIL_INFO')">
                <template #default="scope">
                    <div class="detail-info">
                        <div>{{ scope.row.content }}</div>
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
                width="60px"
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
        <div class="pagination">
            <el-pagination
                v-model:current-page="formData.currentPage"
                v-model:page-size="formData.pageSize"
                :page-sizes="pageData.pageSizes"
                layout="prev, pager, next, sizes, total, jumper"
                :total="pageData.totalCount"
                size="small"
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
        <RecPop
            v-model="pageData.isRecord"
            :play-list="pageData.recordPlayList"
            @close="pageData.isRecord = false"
        />
    </div>
</template>

<script lang="ts" src="./ViewLog.v.ts"></script>

<style lang="scss" scoped>
.ViewLog {
    :deep(.el-table) {
        height: calc(100vh - 350px);
    }

    :deep(.el-button) {
        &.is-link {
            color: var(--text-primary);

            &.el-button--primary {
                color: var(--primary--04);
            }

            &:hover {
                text-decoration: underline;
            }
        }
    }

    .form-item {
        display: flex;
        align-items: center;
        margin-bottom: 10px;

        label {
            padding-right: 20px;
            font-size: 13px;

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
            // max-width: 135px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            text-align: left;
        }

        span {
            flex-shrink: 0;
        }
    }

    .pagination {
        display: flex;
        width: 100%;
        justify-content: flex-end;
        margin-top: 10px;
    }
}

.popper {
    width: fit-content;

    .sub-types {
        width: fit-content;
        background-color: white;
        max-height: 50vh;
        overflow: auto;
        padding-right: 20px;

        :deep(.el-checkbox) {
            padding-right: 0;
            margin-right: 0;
            display: block;
            display: flex;
            align-items: center;
        }

        &::-webkit-scrollbar {
            width: 2px;
            background-color: #f5f5f5;
        }

        &::-webkit-scrollbar-track {
            -webkit-box-shadow: inset 0 0 6px rgba(255, 255, 255, 0.3);
            border-radius: 10px;
            background-color: #f5f5f5;
        }

        &::-webkit-scrollbar-thumb {
            border-radius: 10px;
            -webkit-box-shadow: inset 0 0 6px rgba(255, 255, 255, 0.3);
            background-color: #999;
        }
    }
}
</style>
