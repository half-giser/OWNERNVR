<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-28 14:12:40
 * @Description:  实时过车记录 - 详情弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_VEHICLE_IN_OUT_DETAIL')"
        width="860"
        @open="open"
    >
        <div class="dialog">
            <div class="left">
                <div class="panel">
                    <div
                        v-show="current.isEnter"
                        class="panel-top"
                    >
                        <div>
                            <span class="panel-type">{{ current.type === 'nonEnter-nonExit' ? '' : Translate('IDCS_VEHICLE_IN') }}</span>
                            <span class="panel-door">{{ current.enterChl }}</span>
                        </div>
                        <div class="panel-time">{{ displayOpenGateType(current.enterType) }}</div>
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
                            <span class="panel-type">{{ Translate('IDCS_VEHICLE_OUT') }}</span>
                            <span class="panel-door">{{ current.exitChl }}</span>
                        </div>
                        <div class="panel-time">{{ displayOpenGateType(current.exitType) }}</div>
                    </div>
                    <img :src="current.exitImg" />
                    <div
                        v-show="!(current.isExit && current.exitImg) && current.type === 'enter-nonExit'"
                        class="panel-wrap"
                    >
                        {{ Translate('IDCS_NONE_VEHICLE_OUT_TIPS') }}
                    </div>
                </div>
            </div>
            <div class="data">
                <div class="data-box">
                    <div class="data-item">
                        <label>{{ Translate('IDCS_LICENSE_PLATE_NUM') }}</label>
                        <span v-if="type === 'edit'">
                            <el-input
                                v-model="formData.plateNum"
                                maxlength="31"
                            />
                        </span>
                        <span v-else>{{ formData.plateNum }}</span>
                    </div>
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
                        <span>{{ current.type !== 'nonEnter-nonExit' ? displayDateTime(current.exitTime) : '--' }}</span>
                    </div>
                    <div class="data-item">
                        <label>{{ Translate('IDCS_VEHICLE_PARKING_TIME') }}</label>
                        <span class="bold">{{ displayDuration(current) }}</span>
                    </div>
                </div>
                <div class="data-box">
                    <div class="data-item">
                        <label>{{ Translate('IDCS_VEHICLE_OWNER') }}</label>
                        <span>{{ current.master || '--' }}</span>
                    </div>
                    <div class="data-item">
                        <label>{{ Translate('IDCS_PHONE_NUMBER') }}</label>
                        <span>{{ current.phoneNum || '--' }}</span>
                    </div>
                    <div class="data-item">
                        <label>{{ Translate('IDCS_VEHICLE_IN_OUT_RESULT') }}</label>
                        <span>{{ displayType(current.type) }}</span>
                    </div>
                </div>
                <div
                    v-if="type === 'edit'"
                    class="base-btn-box"
                >
                    <el-button @click="commit">{{ Translate('IDCS_EDIT_SUBMIT') }}</el-button>
                    <el-button @click="handleOpenGate">{{ Translate('IDCS_OPEN_GATE_RELEASE') }}</el-button>
                </div>
            </div>
        </div>
        <IntelLicencePlateDBAddPlatePop
            v-model="pageData.isAddPlatePop"
            type="register"
            :data="{
                plateNumber: pageData.plateNum,
            }"
            append-to-body
            @close="pageData.isAddPlatePop = false"
        />
        <div class="base-btn-box space-between">
            <div>
                <el-button
                    :disabled="!formData.plateNum"
                    @click="addPlate"
                >
                    {{ Translate('IDCS_ENTRY') }}
                </el-button>
            </div>
            <div>
                <el-button
                    :disabled="pageData.index === 0"
                    @click="handlePrev"
                >
                    {{ Translate('IDCS_PREVIOUS') }}
                </el-button>
                <el-button
                    :disabled="pageData.index === pageData.list.length - 1"
                    @click="handleNext"
                >
                    {{ Translate('IDCS_NEXT') }}
                </el-button>
                <el-button @click="close">{{ Translate('IDCS_EXIT') }}</el-button>
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./PKMgrParkLotPop.v.ts"></script>

<style lang="scss" scoped>
.dialog {
    width: 100%;
    display: flex;
}

.left {
    display: flex;
    flex-direction: column;
    width: 384px;
    flex-shrink: 0;
}

.panel {
    width: 380px;
    height: 242px;
    border: 1px solid var(--subheading-bg);
    margin: 5px;
    background-color: var(--parklog-box-bg);
    position: relative;

    &-top {
        width: 100%;
        height: 28px;
        padding: 0 10px;
        display: flex;
        justify-content: space-between;
        box-sizing: border-box;
        font-size: 14px;
        line-height: 28px;
        background: var(--parklog-title-bg);
    }

    &-door {
        padding-left: 20px;
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

    img {
        width: 100%;
        height: 214px;

        &[src=''] {
            opacity: 0;
        }
    }
}

.data {
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
    margin: 5px 0 5px 10px;
    background-color: var(--parklog-bg);

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

            &.bold {
                font-weight: bolder;
            }
        }
    }
}
</style>
