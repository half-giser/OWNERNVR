<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-28 11:45:24
 * @Description: 报警状态
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-04 13:33:40
-->
<template>
    <div class="AlarmStatus">
        <el-table
            ref="tableRef"
            :data="tableList"
            stripe
            :row-key="(item) => item.id"
            :current-row-key="pageData.activeIndex"
            :expand-row-keys="pageData.activeRow"
            :row-class-name="(item) => (item.rowIndex === pageData.activeIndex ? 'active' : '')"
            @cell-click="handleChangeRow"
        >
            <el-table-column prop="type">
                <template #default="scope">
                    <div class="type">{{ scope.row.type }}</div>
                </template>
            </el-table-column>
            <el-table-column>
                <template #default="scope">
                    <div class="status">
                        <div :class="{ active: getAlarmStatusActive(scope.row, scope.$index) }">
                            <BaseImgSprite
                                :index="getAlarmClassName(scope.row, scope.$index)"
                                file="alarm_status"
                                :chunk="5"
                            />
                            <span>{{ scope.row.data.length }}</span>
                        </div>
                        <el-tooltip :content="scope.row.data.length > 0 ? Translate('IDCS_ABNORMAL') : Translate('IDCS_NORMAL')">
                            <span :class="{ alarm: scope.row.data.length > 0 }">{{ scope.row.data.length > 0 ? Translate('IDCS_ABNORMAL') : Translate('IDCS_NORMAL') }}</span>
                        </el-tooltip>
                    </div>
                </template>
            </el-table-column>
            <el-table-column type="expand">
                <template #default="scope">
                    <div>
                        <div class="expand">
                            <div class="left">
                                <div
                                    v-for="(item, key) in scope.row.data[scope.row.index - 1]?.data || []"
                                    :key="`${scope.row.id + (scope.row.index - 1)}${key}`"
                                    :class="[
                                        {
                                            hidden: item.hidden,
                                        },
                                        `span${item.span}`,
                                    ]"
                                >
                                    <label>{{ Translate(item.key) }} :</label>
                                    <span>{{ item.value }}</span>
                                </div>
                            </div>
                            <div class="right">
                                <img
                                    v-if="scope.row.data[scope.row.index - 1]?.img"
                                    :src="scope.row.data[scope.row.index - 1]?.img"
                                />
                                <BaseImgSprite
                                    v-if="scope.row.data[scope.row.index - 1]?.rec.length"
                                    file="large_play"
                                    :index="0"
                                    :hover-index="2"
                                    :chunk="4"
                                    @click="playRec(scope.row.data[scope.row.index - 1])"
                                />
                            </div>
                        </div>
                        <div class="pagination">
                            <el-pagination
                                v-show="scope.row.data.length"
                                v-model:current-page="scope.row.index"
                                :page-size="1"
                                layout="prev, pager, next, total, jumper"
                                :total="scope.row.data.length"
                                size="small"
                            />
                        </div>
                    </div>
                </template>
            </el-table-column>
        </el-table>
        <!-- 回放弹窗 -->
        <RecPop
            v-model="pageData.isRecord"
            :play-list="pageData.recordPlayList"
            @close="pageData.isRecord = false"
        />
    </div>
</template>

<script lang="ts" src="./AlarmStatus.v.ts"></script>

<style lang="scss" scoped>
.AlarmStatus {
    .type {
        text-align: left;
    }

    .status {
        display: flex;

        & > div {
            position: relative;
            width: 20px;
            height: 20px;
            margin-right: 5px;

            &.active {
                span:last-child {
                    color: black;
                }
            }

            span:last-child {
                position: absolute;
                top: 0;
                left: 0;
                text-align: center;
                line-height: 25px;
                color: white;
                display: block;
                width: 100%;
                height: 100%;
                font-size: 13px;
            }
        }
    }

    .expand {
        width: 100%;
        display: flex;
        margin-bottom: 20px;

        .left {
            width: 80%;
            display: flex;
            flex-wrap: wrap;
            line-height: 20px;

            & > div {
                display: flex;
                height: 20px;
                padding-left: 20px;

                span {
                    padding-left: 20px;
                }
            }

            .span1 {
                display: flex;
                width: 50%;
            }

            .span2 {
                display: flex;
                width: 100%;
            }

            .hidden {
                visibility: hidden;
            }
        }

        .right {
            width: 20%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;

            img {
                width: 100%;
            }
        }
    }

    .pagination {
        width: 100%;
        display: flex;
        justify-content: center;
    }
}
</style>
