<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-10 17:50:24
 * @Description: 更多功能页面的框架
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-09-25 11:15:44
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-09-25 09:30:51
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
                        popper-class="eloption_more"
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
                <!-- fireDetection -->
                <el-tab-pane
                    :disabled="pageData.fireDetectionDisable"
                    name="fireDetection"
                    class="tripwire_setting_pane"
                >
                    <template #label>
                        <span
                            :style="{
                                backgroundColor: pageData.fireDetectionDisable ? '#AEABAB' : '',
                                color: pageData.fireDetectionDisable ? '#797979' : '',
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }"
                            >{{ Translate('IDCS_FIRE_POINT_DETECTION') }}</span
                        >
                    </template>
                    <template #default>
                        <fireDetection
                            v-if="pageData.chosenFunction === 'fireDetection'"
                            :curr-chl-id="pageData.currChlId"
                            :chl-data="pageData.chlData"
                            :voice-list="pageData.voiceList"
                            :online-channel-list="pageData.onlineChannelList"
                        ></fireDetection>
                    </template>
                </el-tab-pane>
                <!-- videoStructure -->
                <el-tab-pane
                    :disabled="pageData.videoStructureDisable"
                    name="videoStructure"
                    class="tripwire_setting_pane"
                >
                    <template #label>
                        <span
                            :style="{
                                backgroundColor: pageData.videoStructureDisable ? '#AEABAB' : '',
                                color: pageData.videoStructureDisable ? '#797979' : '',
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }"
                            >{{ Translate('IDCS_VSD_DETECTION') }}</span
                        >
                    </template>
                    <template #default>
                        <VideoStructure
                            v-if="pageData.chosenFunction === 'videoStructure'"
                            :curr-chl-id="pageData.currChlId"
                            :chl-data="pageData.chlData"
                            :voice-list="pageData.voiceList"
                        ></VideoStructure>
                    </template>
                </el-tab-pane>

                <!-- passLine -->
                <el-tab-pane
                    :disabled="pageData.passLineDisable"
                    name="passLine"
                    class="tripwire_setting_pane"
                >
                    <template #label>
                        <span
                            :style="{
                                backgroundColor: pageData.passLineDisable ? '#AEABAB' : '',
                                color: pageData.passLineDisable ? '#797979' : '',
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }"
                            >{{ Translate('IDCS_PASS_LINE_COUNT_DETECTION') }}</span
                        >
                    </template>
                    <template #default>
                        <passLine
                            v-if="pageData.chosenFunction === 'passLine'"
                            :curr-chl-id="pageData.currChlId"
                            :chl-data="pageData.chlData"
                            :voice-list="pageData.voiceList"
                            :online-channel-list="pageData.onlineChannelList"
                        ></passLine>
                    </template>
                </el-tab-pane>

                <!-- cdd -->
                <el-tab-pane
                    :disabled="pageData.cddDisable"
                    name="cdd"
                    class="tripwire_setting_pane"
                >
                    <template #label>
                        <span
                            :style="{
                                backgroundColor: pageData.cddDisable ? '#AEABAB' : '',
                                color: pageData.cddDisable ? '#797979' : '',
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }"
                            >{{ Translate('IDCS_CROWD_DENSITY_DETECTION') }}</span
                        >
                    </template>
                    <template #default>
                        <Cdd
                            v-if="pageData.chosenFunction === 'cdd'"
                            :curr-chl-id="pageData.currChlId"
                            :chl-data="pageData.chlData"
                            :voice-list="pageData.voiceList"
                            :online-channel-list="pageData.onlineChannelList"
                        ></Cdd>
                    </template>
                </el-tab-pane>

                <!-- temperatureDetection -->
                <el-tab-pane
                    :disabled="pageData.temperatureDetectionDisable"
                    name="temperatureDetection"
                    class="tripwire_setting_pane"
                >
                    <template #label>
                        <span
                            :style="{
                                backgroundColor: pageData.temperatureDetectionDisable ? '#AEABAB' : '',
                                color: pageData.temperatureDetectionDisable ? '#797979' : '',
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }"
                            >{{ Translate('IDCS_TEMPERATURE_DETECTION') }}</span
                        >
                    </template>
                    <template #default>
                        <TemperatureDetection
                            v-if="pageData.chosenFunction === 'temperatureDetection'"
                            :curr-chl-id="pageData.currChlId"
                            :chl-data="pageData.chlData"
                            :voice-list="pageData.voiceList"
                        ></TemperatureDetection>
                    </template>
                </el-tab-pane>

                <!-- objectLeft -->
                <el-tab-pane
                    :disabled="pageData.objectLeftDisable"
                    name="objectLeft"
                    class="tripwire_setting_pane"
                >
                    <template #label>
                        <span
                            :style="{
                                backgroundColor: pageData.objectLeftDisable ? '#AEABAB' : '',
                                color: pageData.objectLeftDisable ? '#797979' : '',
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }"
                            >{{ Translate('IDCS_WATCH_DETECTION') }}</span
                        >
                    </template>
                    <template #default>
                        <ObjectLeft
                            v-if="pageData.chosenFunction === 'objectLeft'"
                            :curr-chl-id="pageData.currChlId"
                            :chl-data="pageData.chlData"
                            :voice-list="pageData.voiceList"
                        ></ObjectLeft>
                    </template>
                </el-tab-pane>

                <!-- avd -->
                <el-tab-pane
                    :disabled="pageData.avdDisable"
                    name="avd"
                    class="tripwire_setting_pane"
                >
                    <template #label>
                        <span
                            :style="{
                                backgroundColor: pageData.avdDisable ? '#AEABAB' : '',
                                color: pageData.avdDisable ? '#797979' : '',
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }"
                            >{{ Translate('IDCS_ABNORMAL_DISPOSE_WAY') }}</span
                        >
                    </template>
                    <template #default>
                        <AbnormalDispose
                            v-if="pageData.chosenFunction === 'avd'"
                            :curr-chl-id="pageData.currChlId"
                            :chl-data="pageData.chlData"
                            :voice-list="pageData.voiceList"
                        ></AbnormalDispose>
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

<script lang="ts" src="./More.v.ts"></script>

<style>
/* 选择器的下拉框样式必须全局才能生效 */
.eloption_more .el-select-dropdown {
    max-width: 430px;
    height: 120px;
}
</style>

<style lang="scss" scoped>
.chl_select {
    z-index: 9999;
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
    margin: 5px 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
    border: 1px solid var(--border-color2);
}
.content {
    .content_top {
        #row_channel {
            width: 540px;
            padding: 10px 0 10px 20px;
        }
        .span_txt {
            font-size: 15px;
        }
    }
    :deep() {
        .el-tabs__item {
            width: 150px;
            border: 2px solid var(--border-color2);
            margin-right: -2px; /* 处理border重合 */
            padding: 0 20px !important;
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
    .content_main {
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
    }
}
</style>
