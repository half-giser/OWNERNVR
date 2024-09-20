<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-27 15:43:26
 * @Description:  周界防范/人车检测
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-09-19 15:16:50
-->
<template>
    <div class="content">
        <div class="content_top">
            <el-row id="row_channel">
                <el-col :span="5">
                    <span class="span_txt">{{ Translate('IDCS_CHANNEL_NAME') }}</span>
                </el-col>
                <el-col :span="18">
                    <el-select
                        v-model="pageData.currChlId"
                        value-key="id"
                        class="chl_select"
                        popper-class="eloption"
                        :options="pageData.onlineChannelList"
                        @change="handleChangeChannel"
                    >
                        <el-option
                            v-for="item in pageData.onlineChannelList"
                            :key="item.id"
                            :label="item.name"
                            :value="item.id"
                            class="chl_item"
                        ></el-option>
                    </el-select>
                </el-col>
            </el-row>
        </div>
        <div class="content_main">
            <el-tabs
                :key="pageData.tabKey"
                v-model="pageData.chosenFunction"
                type="border-card"
                class="demo-tabs"
                @tab-click="handleTabClick"
            >
                <!-- tripwire -->
                <el-tab-pane
                    :disabled="pageData.tripwireDisable"
                    name="Tripwire"
                >
                    <template #label>
                        <span
                            :style="{
                                backgroundColor: pageData.tripwireDisable ? '#AEABAB' : '',
                                color: pageData.tripwireDisable ? '#797979' : '',
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }"
                            >{{ Translate('IDCS_BEYOND_DETECTION') }}</span
                        >
                    </template>
                    <template #default>
                        <Tripwire
                            v-if="pageData.chosenFunction === 'Tripwire'"
                            :curr-chl-id="pageData.currChlId"
                            :chl-data="pageData.chlData"
                            :voice-list="pageData.voiceList"
                            :online-channel-list="pageData.onlineChannelList"
                        ></Tripwire>
                    </template>
                </el-tab-pane>
                <!-- pea -->
                <el-tab-pane
                    :disabled="pageData.peaDisable"
                    name="Pea"
                >
                    <template #label>
                        <span
                            :style="{
                                backgroundColor: pageData.peaDisable ? '#AEABAB' : '',
                                color: pageData.peaDisable ? '#797979' : '',
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }"
                            >{{ Translate('IDCS_INVADE_DETECTION') }}</span
                        >
                    </template>
                    <template #default>
                        <Pea
                            v-if="pageData.chosenFunction === 'Pea'"
                            :curr-chl-id="pageData.currChlId"
                            :chl-data="pageData.chlData"
                            :voice-list="pageData.voiceList"
                            :online-channel-list="pageData.onlineChannelList"
                        ></Pea>
                    </template>
                </el-tab-pane>
                <div
                    v-if="pageData.chosenFunction === ''"
                    class="notSupportBox"
                >
                    {{ Translate('IDCS_CURRENT_INTEL_EVENT_UNSUPORT') }}
                </div>
            </el-tabs>
        </div>
    </div>
</template>

<script lang="ts" src="./PerimeterDetection.v.ts"></script>

<style>
/* 选择器的下拉框样式必须全局才能生效 */
.eloption .el-select-dropdown {
    max-width: 430px;
    height: 150px;
}
</style>

<style lang="scss" scoped>
// 保留
.chl_select {
    width: 430px;
    :deep(.el-select__selection) {
        text-align: center;
    }
}
.chl_item {
    float: left;
    width: 120px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    margin: 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
    border: 1px solid var(--border-color2);
}
.el-divider--vertical {
    border-right-width: 3px;
    height: 30px;
    color: #999;
    width: 3px;
    margin: 0;
    border-left: 3px solid #999;
    padding-left: 5px;
}
#draw_tip {
    color: #8d8d8d;
    font-size: 12px;
}
.alert_surface_btn {
    width: 50px;
    height: 22px;
    margin-right: 0 15px 0 0;
    padding: 0;
    background-color: white;
    color: black;
}
.ChannelPtzCtrlPanel {
    padding: 0 10px;
}
.lock_row {
    margin: 10px 0 0 14px;
}
.lock_btn {
    width: 80px;
    height: 25px;
    margin-right: 5px;
}
.triggerTrack_checkBox {
    margin-left: 14px;
}
.apply_btn {
    width: 80px;
    height: 25px;
}
.dropdown_btn {
    width: 80px;
    height: 25px;
    right: -20px;
}
#n9web .el-form .el-checkbox + * {
    margin-left: 5px;
}
.el-form-item {
    --font-size: 15px;
}
#n9web .el-form .el-slider {
    margin-left: 15px;
}
.table_cell_span {
    margin-right: 5px;
    font-size: 15px;
}
:deep(.el-dropdown-menu__item) {
    cursor: default;
    width: 300px;
    height: 180px;
    background-color: #e5e5e5;
}

.moreDropDownBox {
    width: 300px;
    height: 180px;
    background-color: #e5e5e5;
    .dropDownHeader {
        margin-top: 5px;
    }
    .checkboxes {
        margin-left: 10px;
    }
    .base-btn-box {
        display: flex;
        justify-content: flex-end;
        align-items: flex-end;
        margin-top: 40px;
    }
}
.clear_btns {
    display: flex;
    align-items: center;
    justify-content: flex-end;
}
.showAllArea {
    display: flex;
    align-items: center;
    justify-content: flex-start;
}
.player_config {
    margin-top: 5px;
}
// 保留
.content {
    .aiResourcePop {
        height: 400px;
    }
    .span_txt {
        font-size: 15px;
    }
    .el-dropdown-link {
        cursor: pointer;
        display: flex;
        font-size: 15px;
        align-items: center;
        color: black;
        justify-content: center;
    }
    // 保留
    .content_top {
        #row_channel {
            width: 540px;
            padding: 10px 0 10px 20px;
        }
    }
    .form {
        width: 600px;
    }
    :deep() {
        .el-tabs--border-card > .el-tabs__header .el-tabs__item {
            padding: 0px;
            border: 1px solid #999999;
            margin-top: 0px;
            margin-left: 0px;
        }
    }
    // 保留
    .content_main {
        // 保留
        .demo-tabs {
            width: 1562px;
            min-height: 627px;
            margin-top: 10px;
            .notSupportBox {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 100%;
                background-color: #fff;
                height: 568px;
                z-index: 2;
                font-size: 20px;
            }
        }
        // tab区域
        :deep(.demo-tabs > .el-tabs__content) {
            padding: 10px 20px;
            color: black;
            font-size: 15px;
        }
        // tab标题
        :deep(.el-tabs__item) {
            font-size: 15px;
            width: 154px;
            color: black;
        }
        // tab标题选中
        :deep(.el-tabs--border-card > .el-tabs__header .el-tabs__item.is-active) {
            color: white;
            background-color: #00bbdb;
        }
    }
}
</style>
