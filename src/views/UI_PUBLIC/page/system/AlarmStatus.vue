<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-28 11:45:24
 * @Description: 报警状态
-->
<template>
    <div class="base-flex-box">
        <el-table
            ref="tableRef"
            :data="tableList"
            height="100%"
            :border="false"
            highlight-current-row
            :row-key="getRowKey"
            :current-row-key="pageData.activeIndex"
            :expand-row-keys="pageData.activeRow"
            :show-header="false"
            @cell-click="handleChangeRow"
            @expand-change="handleExpandChange"
        >
            <el-table-column>
                <template #default="{ row }: TableColumn<SystemAlarmStatusList>">
                    <div class="type">{{ row.type }}</div>
                </template>
            </el-table-column>
            <el-table-column>
                <template #default="{ row, $index }: TableColumn<SystemAlarmStatusList>">
                    <div class="status">
                        <div
                            :class="{
                                active: getAlarmStatusActive(row, $index),
                            }"
                        >
                            <BaseImgSprite
                                :index="getAlarmClassName(row, $index)"
                                file="alarm_status"
                                :chunk="5"
                            />
                            <span>{{ row.data.length || '' }}</span>
                        </div>
                        <span
                            :class="{
                                'text-error': row.data.length > 0,
                            }"
                        >
                            {{ row.data.length > 0 ? Translate('IDCS_ABNORMAL') : Translate('IDCS_NORMAL') }}
                        </span>
                    </div>
                </template>
            </el-table-column>
            <el-table-column type="expand">
                <template #default="{ row }: TableColumn<SystemAlarmStatusList>">
                    <div class="expand-box">
                        <div
                            v-show="row.data.length"
                            class="expand"
                        >
                            <div class="left">
                                <div
                                    v-for="(item, key) in row.data[row.index - 1]?.data || []"
                                    :key="`${row.id + (row.index - 1)}${key}`"
                                    :class="[
                                        {
                                            hidden: item.hide,
                                        },
                                        `span${item.span}`,
                                    ]"
                                >
                                    <label v-show="item.key">{{ Translate(item.key) }} :</label>
                                    <span>{{ item.value }}</span>
                                </div>
                            </div>
                            <div class="right">
                                <img
                                    v-if="row.data[row.index - 1]?.img"
                                    :src="row.data[row.index - 1]?.img"
                                />
                                <BaseImgSpriteBtn
                                    v-if="row.data[row.index - 1]?.rec.length"
                                    file="large_play"
                                    :index="[0, 2, 2, 4]"
                                    @click="playRec(row.data[row.index - 1])"
                                />
                            </div>
                        </div>
                        <div
                            v-show="row.data.length"
                            class="base-pagination-box"
                        >
                            <BasePagination
                                v-model:current-page="row.index"
                                :page-size="1"
                                layout="prev, pager, next"
                                :total="row.data.length"
                            />
                        </div>
                    </div>
                </template>
            </el-table-column>
        </el-table>
        <!-- 回放弹窗 -->
        <BasePlaybackPop
            v-model="pageData.isRecord"
            :play-list="pageData.recordPlayList"
            @close="pageData.isRecord = false"
        />
    </div>
</template>

<script lang="ts" src="./AlarmStatus.v.ts"></script>

<style lang="scss" scoped>
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
                color: var(--color-error);
            }
        }

        span:first-child {
            position: absolute;
            top: 3px;
            left: 0;
        }

        span:last-child {
            position: absolute;
            top: 0;
            left: 0;
            text-align: center;
            line-height: 25px;
            color: var(--color-white);
            display: block;
            width: 100%;
            height: 100%;
            font-size: 13px;
        }
    }
}

.expand-box {
    padding: 5px;
}

.expand {
    width: 100%;
    display: flex;
    // margin-bottom: 20px;
    border: 1px solid var(--table-border);
    padding: 20px 10px;

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

.base-pagination-box {
    justify-content: center;
}
</style>
