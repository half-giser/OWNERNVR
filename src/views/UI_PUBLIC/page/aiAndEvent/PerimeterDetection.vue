<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-27 15:43:26
 * @Description:  周界防范/人车检测
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-09-25 16:34:25
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

// 保留
.content {
    // 保留
    .content_top {
        #row_channel {
            width: 540px;
            padding: 10px 0 10px 20px;
        }
        .span_txt {
            font-size: 15px;
            display: flex;
            align-items: center;
        }
    }
    :deep() {
        .el-tabs__item {
            width: 170px;
            border: 2px solid var(--border-color2);
            margin-right: -2px; /* 处理border重合 */
            padding: 0;
            text-align: center;
            span {
                display: block;
                line-height: 36px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }
        .el-form-item__label {
            display: inline-block;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        /* 长分割线 */
        .el-tabs__nav-wrap::after {
            /* position: static !important; 可以去掉长分割线 */
            background-color: var(--border-color2);
        }

        /* 去掉下划线 */
        .el-tabs__active-bar {
            background-color: transparent !important;
        }

        .el-tabs__item:first-child {
            border: 1px solid var(--border-color2);
        }

        .el-tabs__item.is-active {
            color: #fff;
            background-color: var(--primary--04);
            border: 1px solid var(--border-color2);
        }

        .el-tabs__item:hover {
            color: #fff;
            background-color: var(--primary--04);
        }

        .el-tabs__item.is-disabled {
            background: #aeabab;
            color: #797979;
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
                height: 567px;
                z-index: 2;
                font-size: 20px;
            }
        }
    }
}
</style>
