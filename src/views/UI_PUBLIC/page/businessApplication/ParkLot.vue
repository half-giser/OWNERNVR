<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-09 18:39:25
 * @Description: 实时过车记录
-->
<template>
    <div class="lot">
        <div class="container">
            <div class="top">
                <div class="park">
                    <!-- 停车场名称 -->
                    <div
                        v-title
                        class="park-name text-ellipsis"
                    >
                        {{ pageData.parkName }}
                    </div>
                    <!-- 设备时间 -->
                    <div class="park-time text-ellipsis">
                        {{ pageData.currentTime }}
                    </div>
                </div>
                <!-- 剩余车位/总车位 -->
                <div class="count">
                    <div>{{ restOfTotal }}</div>
                    <div>{{ Translate('IDCS_REMAIN_VEHICLE_NUM') }} / {{ Translate('IDCS_TOTAL_VEHICLE_NUM') }}</div>
                </div>
                <!-- 今日入场车辆数 -->
                <div class="count">
                    <div>{{ pageData.enterCount || 0 }}</div>
                    <div>{{ Translate('IDCS_TODAY_VEHICLE_IN_NUM') }}</div>
                </div>
                <!-- 今日出场车辆数 -->
                <div class="count">
                    <div>{{ pageData.exitCount || 0 }}</div>
                    <div>{{ Translate('IDCS_TODAY_VEHICLE_OUT_NUM') }}</div>
                </div>
                <div class="back">
                    <el-tooltip :content="Translate('IDCS_PLATFORM_OPERATE_RETURN')">
                        <BaseImgSpriteBtn
                            file="park_back"
                            :index="[0, 1, 1, 0]"
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
                    <img :src="current.enterImg" />
                    <div
                        v-show="!(current.isEnter && current.enterImg) && current.type === 'nonEnter-exit'"
                        class="panel-wrap"
                    >
                        {{ Translate('IDCS_NONE_VEHICLE_IN_TIPS') }}
                    </div>
                </div>
                <div class="panel">
                    <div
                        v-show="current.isExit"
                        class="panel-top"
                    >
                        <div>
                            <span class="panel-type">{{ current.type === 'out-nonEnter-nonExit' ? ' ' : Translate('IDCS_VEHICLE_OUT') }}</span>
                            <span class="panel-door">{{ current.exitChl }}</span>
                        </div>
                        <div class="panel-time">{{ displayDateTime(current.exitTime) }}</div>
                    </div>
                    <img :src="current.exitImg" />
                    <div
                        v-show="!(current.isExit && current.exitImg) && current.type === 'enter-nonExit'"
                        class="panel-wrap"
                    >
                        {{ Translate('IDCS_NONE_VEHICLE_OUT_TIPS') }}
                    </div>
                </div>
                <div class="data">
                    <el-form class="no-padding">
                        <el-form-item>
                            <el-input
                                v-model="formData.plateNum"
                                maxlength="31"
                            />
                            <el-button
                                class="btn"
                                @click="commit"
                            >
                                {{ Translate('IDCS_EDIT_SUBMIT_AND_OPEN') }}
                            </el-button>
                        </el-form-item>
                        <el-form-item>
                            <el-input
                                class="hide"
                                disabled
                            />
                            <el-dropdown>
                                <el-button class="btn">
                                    {{ Translate('IDCS_MANUAL_OPEN_BARRIER') }}
                                </el-button>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="opt in pageData.entryLeaveOption"
                                            :key="opt.value"
                                            @click="handleManualOpen(opt.value)"
                                        >
                                            <div class="btn-item">{{ opt.label }}</div>
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </el-form-item>
                    </el-form>
                    <div class="data-box">
                        <div class="data-item">
                            <label>{{ Translate('IDCS_DIRECTION') }}</label>
                            <span class="bold">{{ displayDirection(current.direction) }}</span>
                        </div>
                    </div>
                    <div class="data-box">
                        <div class="data-item">
                            <label>{{ Translate('IDCS_VEHICLE_IN_TIME') }}</label>
                            <span>{{ current.type !== 'nonEnter-nonExit' ? displayDateTime(current.enterTime) : '--' }}</span>
                        </div>
                        <div class="data-item">
                            <label>{{ Translate('IDCS_VEHICLE_OUT_TIME') }}</label>
                            <span>{{ current.type !== 'out-nonEnter-nonExit' ? displayDateTime(current.exitTime) : '--' }}</span>
                        </div>
                        <div class="data-item">
                            <label>{{ Translate('IDCS_VEHICLE_PARKING_TIME') }}</label>
                            <span class="bold">{{ displayDuration(current) }}</span>
                        </div>
                    </div>
                    <div class="data-box">
                        <div class="data-item">
                            <label>{{ Translate('IDCS_VEHICLE_IN_OUT_RESULT') }}</label>
                            <span>{{ displayType(current.type) }}</span>
                        </div>
                    </div>
                    <div class="data-box">
                        <div class="data-item">
                            <label>{{ Translate('IDCS_EFFECTIVE_ENTERING_TIM') }}</label>
                            <span :class="{ 'text-error': getPlateStartTimeState() }">{{ displayDateTime(current.plateStartTime) }}</span>
                        </div>
                        <div class="data-item">
                            <label>{{ Translate('IDCS_EFFECTIVE_EXITING_TIME') }}</label>
                            <span :class="{ 'text-error': getPlateEndTimeState() }">{{ displayDateTime(current.plateEndTime) }}</span>
                        </div>
                        <!-- 超出有效出场时间的提示信息 -->
                        <div class="data-item">
                            <span class="text-error">{{ getTimeoutTip() }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="base-btn-box space-between padding">
                <div>{{ Translate('IDCS_MORE_VEHICLE_RECORD') }}</div>
                <el-tooltip :content="Translate('IDCS_VEHICLE_RECORD_REARCH')">
                    <BaseImgSpriteBtn
                        file="park_record"
                        @click="search"
                    />
                </el-tooltip>
            </div>
            <div class="base-table-box">
                <el-table
                    v-title
                    :data="tableData"
                    show-overflow-tooltip
                >
                    <el-table-column :label="Translate('IDCS_LICENSE_PLATE_NUM')">
                        <template #default="{ row }: TableColumn<BusinessParkingLotList>">
                            {{ displayPlateNum(row.plateNum) }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="Translate('IDCS_VEHICLE_PARKING_TIME')">
                        <template #default="{ row }: TableColumn<BusinessParkingLotList>">
                            {{ displayDuration(row) }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="Translate('IDCS_VEHICLE_IN_OUT_RESULT')">
                        <template #default="{ row }: TableColumn<BusinessParkingLotList>">
                            {{ displayType(row.type) }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="Translate('IDCS_VEHICLE_ENTRANCE')">
                        <template #default="{ row }: TableColumn<BusinessParkingLotList>">
                            {{ row.enterChl || '--' }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="Translate('IDCS_VEHICLE_IN_TIME')">
                        <template #default="{ row }: TableColumn<BusinessParkingLotList>">
                            {{ row.type !== 'nonEnter-nonExit' ? displayDateTime(row.enterTime) : '--' }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="Translate('IDCS_VEHICLE_IN_RELEASE_METHOD')">
                        <template #default="{ row }: TableColumn<BusinessParkingLotList>">
                            {{ displayOpenGateType(row.enterType) }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="Translate('IDCS_VEHICLE_EXIT')">
                        <template #default="{ row }: TableColumn<BusinessParkingLotList>">
                            {{ row.exitChl || '--' }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="Translate('IDCS_VEHICLE_OUT_TIME')">
                        <template #default="{ row }: TableColumn<BusinessParkingLotList>">
                            {{ row.type !== 'out-nonEnter-nonExit' ? displayDateTime(row.exitTime) : '--' }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="Translate('IDCS_VEHICLE_OUT_RELEASE_METHOD')">
                        <template #default="{ row }: TableColumn<BusinessParkingLotList>">
                            {{ displayOpenGateType(row.exitType) }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="Translate('IDCS_DETAIL')">
                        <template #default="{ $index }: TableColumn<BusinessParkingLotList>">
                            <el-button @click="showDetail($index)">{{ Translate('IDCS_VIEW') }}</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
        <div class="copyright">{{ Translate('IDCS_COPYRIGHT') }}</div>
        <ParkLotPop
            v-model="pageData.isDetailPop"
            :list="tableData"
            :index="pageData.detailIndex"
            :remark-switch="pageData.remarkSwitch"
            @update-plate="handleUpdatePlate"
            @close="pageData.isDetailPop = false"
        />
        <ParkLotRemarkPop
            v-model="pageData.isRemarkPop"
            @confirm="confirmRemark"
        />
        <ParkLotSearchTargetPop v-if="pageData.isSearchPop" />
    </div>
</template>

<script lang="ts" src="./ParkLot.v.ts"></script>

<style lang="scss" scoped>
.lot {
    width: 100vw;
    height: 100vh;
    min-height: var(--main-min-height);
    display: flex;
    flex-direction: column;
}

.hide {
    opacity: 0;
}

.btn {
    width: 140px;

    &-item {
        width: 108px;
    }
}

.container {
    width: calc(100% - 60px);
    height: 100%;
    margin: 30px;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    border: 1px solid var(--content-border);
    min-width: var(--main-min-width);
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
    position: relative;

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

    &-wrap {
        background-color: var(--parklog-box-bg);
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
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
        padding: 5px 0;
        border-top: 1px solid var(--content-border);
    }

    &-item {
        line-height: 30px;
        height: 30px;
        display: flex;

        label {
            width: 150px;
            flex-shrink: 0;
            color: var(--parklog-label-text);
        }

        span {
            width: 100%;

            &.bold {
                font-weight: bolder;
            }
        }
    }
}

.base-btn-box {
    margin-bottom: 10px;
}

.copyright {
    text-align: center;
    font-size: 11px;
    padding: 1px 0;
    height: 18px;
    width: 100%;
    color: var(--header-menu-text);
    background-color: var(--main-bg);
    border-top: 1px solid var(--main-border);
    flex-shrink: 0;
}
</style>
