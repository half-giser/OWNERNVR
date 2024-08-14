<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-08-10 11:05:51
 * @Description: 报警输出
 * @LastEditors: tengxiang tengxiang@tvt.net.cn
 * @LastEditTime: 2024-08-12 11:25:11
-->
<template>
    <div class="base-flex-box">
        <div class="base-table-box">
            <el-table
                stripe
                border
                :data="tableData"
            >
                <!-- 状态列 -->
                <el-table-column
                    label=" "
                    width="50px"
                    class-name="custom_cell"
                >
                    <template #default="scope">
                        <div
                            v-if="scope.row.status === 'loading'"
                            class="table_status_col_loading"
                            :title="tableRowStatusToolTip[scope.row.statusTip]"
                        ></div>
                        <BaseImgSprite
                            v-else-if="scope.row.status === 'success'"
                            file="success"
                            :chunk="1"
                            :index="0"
                            :title="tableRowStatusToolTip[scope.row.statusTip]"
                        />
                        <BaseImgSprite
                            v-else-if="scope.row.status === 'error'"
                            file="error"
                            :chunk="1"
                            :index="0"
                            :title="tableRowStatusToolTip[scope.row.statusTip]"
                        />
                    </template>
                </el-table-column>

                <!-- 序号 -->
                <el-table-column
                    :label="Translate('IDCS_SERIAL_NUMBER')"
                    prop="serialNum"
                    width="146px"
                />

                <!-- 名称 -->
                <el-table-column
                    width="210px"
                    :label="Translate('IDCS_NAME')"
                >
                    <template #default="scope">
                        <el-input
                            v-model="scope.row.name"
                            size="small"
                        />
                    </template>
                </el-table-column>

                <!-- 延时 -->
                <el-table-column width="210px">
                    <template #header>
                        <el-dropdown trigger="click">
                            <span class="el-dropdown-link">
                                {{ Translate('IDCS_DELAY') }}
                                <BaseImgSprite
                                    class="ddn"
                                    file="ddn"
                                />
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="opt in pageData.delayList"
                                        :key="opt.value"
                                        @click="changeAllValue(opt.value, 'delayTime')"
                                    >
                                        {{ Translate(opt.label) }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.delayTime"
                            size="small"
                        >
                            <el-option
                                v-for="opt in pageData.delayList"
                                :key="opt.value"
                                :label="Translate(opt.label)"
                                :value="opt.value"
                            />
                        </el-select>
                    </template>
                </el-table-column>

                <!-- 排程 -->
                <el-table-column width="210px">
                    <template #header>
                        <el-dropdown trigger="click">
                            <span class="el-dropdown-link">
                                {{ Translate('IDCS_SCHEDULE') }}
                                <BaseImgSprite
                                    class="ddn"
                                    file="ddn"
                                />
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="opt in pageData.scheduleList"
                                        :key="opt.value"
                                        @click="changeAllValue(opt.value, 'scheduleId')"
                                    >
                                        {{ Translate(opt.label) }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.scheduleId"
                            size="small"
                            :empty-values="[undefined, null]"
                        >
                            <el-option
                                v-for="opt in pageData.scheduleList"
                                :key="opt.value"
                                :label="Translate(opt.label)"
                                :value="opt.value"
                            />
                        </el-select>
                    </template>
                </el-table-column>

                <!-- 类型 -->
                <el-table-column
                    width="210px"
                    :formatter="
                        (row) => {
                            return row.devDesc ? '--' : pageData.alarmoutTypeText[curAlarmoutType]
                        }
                    "
                >
                    <template #header>
                        <el-dropdown trigger="click">
                            <span class="el-dropdown-link">
                                {{ Translate('IDCS_TYPE') }}
                                <BaseImgSprite
                                    class="ddn"
                                    file="ddn"
                                />
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu :disabled="pageData.localAlarmOutCount === 0">
                                    <el-dropdown-item
                                        v-for="opt in pageData.typeList"
                                        :key="opt.value"
                                        @click="changeType(opt.value)"
                                    >
                                        {{ Translate(opt.label) }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="base-btn-box">
            <el-pagination
                v-model:current-page="pageData.pageIndex"
                v-model:page-size="pageData.pageSize"
                :page-sizes="[10, 20, 30]"
                layout="prev, pager, next, sizes, total, jumper"
                :total="pageData.totalCount"
                size="small"
                @size-change="changePaginationSize"
                @current-change="changePagination"
            />
        </div>
        <div class="base-btn-box">
            <el-button
                :disabled="pageData.applyDisabled"
                @click="setData()"
                >{{ Translate('IDCS_APPLY') }}</el-button
            >
        </div>
    </div>
</template>

<script lang="ts" src="./AlarmOut.v.ts"></script>

<style scoped></style>
