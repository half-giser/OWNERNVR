<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-09 18:39:25
 * @Description: 实时过车记录
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-11-01 14:57:20
-->
<template>
    <div class="lot">
        <div class="container">
            <div class="top">
                <div class="park">
                    <!-- 停车场名称 -->
                    <div class="park-name text-ellipsis">{{ pageData.parkName }}</div>
                    <!-- 设备时间 -->
                    <div class="park-time text-ellipsis">{{ pageData.currentTime }}</div>
                </div>
                <!-- 剩余车位/总车位 -->
                <div class="count">
                    <div>{{ restOfTotal }}</div>
                    <div>{{ Translate('IDCS_REMAIN_VEHICLE_NUM') }} / {{ Translate('IDCS_TOTAL_VEHICLE_NUM') }}</div>
                </div>
                <!-- 今日入场车辆数 -->
                <div class="count">
                    <div>{{ pageData.enterCount || '&nbsp;' }}</div>
                    <div>{{ Translate('IDCS_TODAY_VEHICLE_IN_NUM') }}</div>
                </div>
                <!-- 今日出场车辆数 -->
                <div class="count">
                    <div>{{ pageData.exitCount || '&nbsp;' }}</div>
                    <div>{{ Translate('IDCS_TODAY_VEHICLE_OUT_NUM') }}</div>
                </div>
                <div class="back">
                    <el-tooltip :content="Translate('IDCS_PLATFORM_OPERATE_RETURN')">
                        <BaseImgSprite
                            file="park_back"
                            :index="0"
                            :hover-index="1"
                            :chunk="2"
                            @click="goBack"
                        />
                    </el-tooltip>
                </div>
            </div>
            <div class="center">
                <div class="panel">
                    <div
                        v-show="current.isEnter"
                        class="panel-top"
                    >
                        <div>
                            <span class="panel-type">{{ current.type === 'nonEnter-nonExit' ? '' : Translate('IDCS_VEHICLE_IN') }}</span>
                            <span class="panel-door">{{ current.enterChl }}</span>
                        </div>
                        <div class="panel-time">{{ displayDateTime(current.enterTime) }}</div>
                    </div>
                    <img src="" />
                </div>
                <div class="panel">
                    <div
                        v-show="current.isExit"
                        class="panel-top"
                    >
                        <div>
                            <span class="panel-type">{{ Translate('IDCS_VEHICLE_OUT') }}</span>
                            <span class="panel-door">{{ current.exitChl }}</span>
                        </div>
                        <div class="panel-time">{{ displayDateTime(current.exitTime) }}</div>
                    </div>
                    <img src="" />
                </div>
                <div class="data">
                    <el-form class="inline-message">
                        <el-form-item>
                            <el-input
                                v-model="formData.plateNum"
                                maxlength="31"
                            />
                            <el-button @click="commit">{{ Translate('IDCS_EDIT_SUBMIT') }}</el-button>
                            <el-button @click="handleOpenGate">{{ Translate('IDCS_OPEN_GATE_RELEASE') }}</el-button>
                        </el-form-item>
                    </el-form>
                    <div class="data-box">
                        <div class="data-item">
                            <label>{{ Translate('IDCS_DIRECTION') }}</label>
                            <span>{{ displayDirection(current.direction) }}</span>
                        </div>
                    </div>
                    <div class="data-box">
                        <div class="data-item">
                            <label>{{ Translate('IDCS_VEHICLE_IN_TIME') }}</label>
                            <span>{{ displayDateTime(current.enterTime) }}</span>
                        </div>
                        <div class="data-item">
                            <label>{{ Translate('IDCS_VEHICLE_OUT_TIME') }}</label>
                            <span>{{ displayDateTime(current.exitTime) }}</span>
                        </div>
                        <div class="data-item">
                            <label>{{ Translate('IDCS_VEHICLE_PARKING_TIME') }}</label>
                            <span>{{ displayDuration(current) }}</span>
                        </div>
                    </div>
                    <div class="data-box">
                        <div class="data-item">
                            <label>{{ Translate('IDCS_VEHICLE_IN_OUT_RESULT') }}</label>
                            <span>{{ displayType(current.type) }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div
                class="base-btn-box padding"
                :span="2"
            >
                <div>{{ Translate('IDCS_MORE_VEHICLE_RECORD') }}</div>
                <div>
                    <el-tooltip :content="Translate('IDCS_VEHICLE_RECORD_REARCH')">
                        <BaseImgSprite
                            file="park_record"
                            :index="0"
                            :hover-index="1"
                            :chunk="4"
                            @click="search"
                        />
                    </el-tooltip>
                </div>
            </div>
            <div class="base-table-box">
                <el-table
                    :data="tableData"
                    border
                    stripe
                >
                    <el-table-column :label="Translate('IDCS_LICENSE_PLATE_NUM')">
                        <template #default="scope">
                            {{ displayPlateNum(scope.row.plateNum) }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="Translate('IDCS_VEHICLE_PARKING_TIME')">
                        <template #default="scope">
                            <span :class="{ 'text-error': scope.row.abnormal }">{{ displayDuration(scope.row) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="Translate('IDCS_VEHICLE_IN_OUT_RESULT')">
                        <template #default="scope">
                            <span :class="{ 'text-error': scope.row.abnormal }">{{ displayType(scope.row.type) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="Translate('IDCS_VEHICLE_ENTRANCE')">
                        <template #default="scope">
                            <span :class="{ 'text-error': scope.row.abnormal }">{{ scope.row.enterChl || '--' }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="Translate('IDCS_VEHICLE_IN_TIME')">
                        <template #default="scope">
                            <span :class="{ 'text-error': scope.row.abnormal }">{{ displayDateTime(scope.row.enterTime) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="Translate('IDCS_VEHICLE_IN_RELEASE_METHOD')">
                        <template #default="scope">
                            <span :class="{ 'text-error': scope.row.abnormal }">{{ displayOpenGateType(scope.row.enterType) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="Translate('IDCS_VEHICLE_EXIT')">
                        <template #default="scope">
                            <span :class="{ 'text-error': scope.row.abnormal }">{{ scope.row.exitChl || '--' }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="Translate('IDCS_VEHICLE_OUT_TIME')">
                        <template #default="scope">
                            <span :class="{ 'text-error': scope.row.abnormal }">{{ displayDateTime(scope.row.exitTime) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="Translate('IDCS_VEHICLE_OUT_RELEASE_METHOD')">
                        <template #default="scope">
                            <span :class="{ 'text-error': scope.row.abnormal }">{{ displayOpenGateType(scope.row.exitType) }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="Translate('IDCS_DETAIL')">
                        <template #default="scope">
                            <el-button @click="showDetail(scope.$index)">{{ Translate('IDCS_VIEW') }}</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
        <div class="copyright">{{ Translate('IDCS_COPYRIGHT') }}</div>
        <PKMgrParkLotPop
            v-model="pageData.isDetailPop"
            :list="tableData"
            :index="pageData.detailIndex"
            @update-plate="handleUpdatePlate"
            @close="pageData.isDetailPop = false"
        />
    </div>
</template>

<script lang="ts" src="./PkMgrParkLot.v.ts"></script>

<style lang="scss" scoped>
.lot {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
}

.container {
    width: calc(100vw - 80px);
    height: calc(100vh - 60px);
    box-sizing: border-box;
    margin: 15px auto;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    border: 1px solid var(--content-border);
    min-width: 1400px;
}

.top {
    width: 100%;
    height: 95px;
    display: flex;
    align-items: center;
    background-color: var(--parklog-bg);
    box-sizing: border-box;
    padding: 5px 20px;
    margin-bottom: 3px;
}

.park {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    font-weight: bolder;
    width: 420px;
    margin-right: 10px;

    &-name {
        font-size: 20px;
        line-height: 1.6;
    }

    &-time {
        font-size: 16px;
        line-height: 1.6;
    }
}

.count {
    width: 400px;
    height: 80px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: var(--parklog-box-bg);
    margin: 0 4px;

    & > div {
        &:first-child {
            font-size: 28px;
            font-weight: bolder;
        }

        &:last-child {
            font-size: 14px;
            text-align: center;
        }
    }
}

.back {
    width: 100px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.center {
    width: 100%;
    height: 380px;
    background-color: var(--parklog-bg);
    box-sizing: border-box;
    display: flex;
    padding: 0 10px;
}

.panel {
    width: 664px;
    height: 365px;
    margin: 5px;
    background-color: var(--parklog-box-bg);

    &-top {
        width: 100%;
        height: 40px;
        padding: 0 20px;
        display: flex;
        justify-content: space-between;
        box-sizing: border-box;
        font-size: 16px;
        line-height: 40px;
        background: var(--parklog-title-bg);
    }

    &-door {
        padding-left: 20px;
    }

    img {
        width: 100%;
        height: 325px;

        &[src=''] {
            opacity: 0;
        }
    }
}

.data {
    width: 440px;
    flex-shrink: 0;
    padding: 0 20px;
    box-sizing: border-box;
    margin: 5px 0;

    &-box {
        padding: 10px 0;

        &:not(:last-child) {
            border-bottom: 1px solid var(--content-border);
        }
    }

    &-item {
        line-height: 40px;
        height: 40px;
        display: flex;

        label {
            width: 150px;
            flex-shrink: 0;
            color: var(--parklog-label-text);
        }

        span {
            width: 100%;
            font-weight: bolder;
        }
    }
}

.base-btn-box {
    margin-bottom: 10px;
}

.copyright {
    text-align: center;
    font-size: 11px;
    padding: 1px 0px 1px 0px;
    height: 18px;
    width: 100%;
    color: var(--header-menu-text);
    background-color: var(--main-bg);
    border-top: 1px solid var(--main-border);
    flex-shrink: 0;
}
</style>
