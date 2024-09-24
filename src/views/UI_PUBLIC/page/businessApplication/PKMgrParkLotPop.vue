<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-28 14:12:40
 * @Description:  实时过车记录 - 详情弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-03 20:05:47
-->
<template>
    <el-dialog
        :title="Translate('IDCS_VEHICLE_IN_OUT_DETAIL')"
        width="860"
        align-center
        draggable
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
            </div>
            <div class="data">
                <div class="data-box">
                    <div class="data-item">
                        <label>{{ Translate('IDCS_LICENSE_PLATE_NUM') }}</label>
                        <span>
                            <el-input
                                v-model="formData.plateNum"
                                maxlength="31"
                                size="small"
                            />
                        </span>
                    </div>
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
                        <label>{{ Translate('IDCS_VEHICLE_OWNER') }}</label>
                        <span>{{ current.master }}</span>
                    </div>
                    <div class="data-item">
                        <label>{{ Translate('IDCS_PHONE_NUMBER') }}</label>
                        <span>{{ current.phoneNum }}</span>
                    </div>
                    <div class="data-item">
                        <label>{{ Translate('IDCS_VEHICLE_IN_OUT_RESULT') }}</label>
                        <span>{{ displayType(current.type) }}</span>
                    </div>
                </div>
                <div class="base-btn-box">
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
        />
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button
                        :disabled="!formData.plateNum"
                        @click="addPlate"
                        >{{ Translate('IDCS_ENTRY') }}</el-button
                    >
                    <el-button @click="close">{{ Translate('IDCS_EXIT') }}</el-button>
                    <el-button
                        :disabled="pageData.index === pageData.list.length - 1"
                        @click="handleNext"
                        >{{ Translate('IDCS_NEXT') }}</el-button
                    >
                    <el-button
                        :disabled="pageData.index === 0"
                        @click="handlePrev"
                        >{{ Translate('IDCS_PREVIOUS') }}</el-button
                    >
                </el-col>
            </el-row>
        </template>
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
    border: 1px solid var(--bg-color4);
    margin: 5px;

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

    img {
        width: 100%;
        height: 214px;

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
            border-bottom: 1px solid var(--border-color8);
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
</style>
