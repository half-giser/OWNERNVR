<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-10 17:50:24
 * @Description: 更多功能页面的框架
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-30 10:44:13
-->
<template>
    <div>
        <el-form
            class="stripe narrow"
            :style="{
                '--form-input-width': '430px',
            }"
            label-position="left"
            inline-message
        >
            <el-form-item
                :label="Translate('IDCS_CHANNEL_NAME')"
                label-width="108px"
            >
                <el-select
                    v-model="pageData.currChlId"
                    class="base-ai-chl-select"
                    value-key="id"
                    popper-class="base-ai-chl-option"
                    @change="handleChangeChannel"
                >
                    <el-option
                        v-for="item in pageData.onlineChannelList"
                        :key="item.id"
                        :label="item.name"
                        :value="item.id"
                    />
                </el-select>
            </el-form-item>
        </el-form>
        <el-tabs
            :key="pageData.tabKey"
            v-model="pageData.chosenFunction"
            class="base-ai-menu-tabs"
            @tab-click="handleTabClick"
        >
            <!-- fireDetection -->
            <el-tab-pane
                :disabled="pageData.fireDetectionDisable"
                name="fireDetection"
                :label="Translate('IDCS_FIRE_POINT_DETECTION')"
            >
                <FireDetection
                    v-if="pageData.chosenFunction === 'fireDetection'"
                    :curr-chl-id="pageData.currChlId"
                    :chl-data="pageData.chlData"
                    :voice-list="pageData.voiceList"
                    :online-channel-list="pageData.onlineChannelList"
                />
            </el-tab-pane>

            <!-- videoStructure -->
            <el-tab-pane
                name="videoStructure"
                :label="Translate('IDCS_VSD_DETECTION')"
            >
                <VideoStructure
                    v-if="pageData.chosenFunction === 'videoStructure'"
                    :curr-chl-id="pageData.currChlId"
                    :chl-data="pageData.chlData"
                    :voice-list="pageData.voiceList"
                />
            </el-tab-pane>

            <!-- passLine -->
            <el-tab-pane
                :disabled="pageData.passLineDisable"
                name="passLine"
                :label="Translate('IDCS_PASS_LINE_COUNT_DETECTION')"
            >
                <PassLine
                    v-if="pageData.chosenFunction === 'passLine'"
                    :curr-chl-id="pageData.currChlId"
                    :chl-data="pageData.chlData"
                    :voice-list="pageData.voiceList"
                    :online-channel-list="pageData.onlineChannelList"
                />
            </el-tab-pane>

            <!-- cdd -->
            <el-tab-pane
                :disabled="pageData.cddDisable"
                name="cdd"
                :label="Translate('IDCS_CROWD_DENSITY_DETECTION')"
            >
                <Cdd
                    v-if="pageData.chosenFunction === 'cdd'"
                    :curr-chl-id="pageData.currChlId"
                    :chl-data="pageData.chlData"
                    :voice-list="pageData.voiceList"
                    :online-channel-list="pageData.onlineChannelList"
                />
            </el-tab-pane>

            <!-- temperatureDetection -->
            <el-tab-pane
                :disabled="pageData.temperatureDetectionDisable"
                name="temperatureDetection"
                :label="Translate('IDCS_TEMPERATURE_DETECTION')"
            >
                <TemperatureDetection
                    v-if="pageData.chosenFunction === 'temperatureDetection'"
                    :curr-chl-id="pageData.currChlId"
                    :chl-data="pageData.chlData"
                    :voice-list="pageData.voiceList"
                />
            </el-tab-pane>

            <!-- objectLeft -->
            <el-tab-pane
                :disabled="pageData.objectLeftDisable"
                name="objectLeft"
                :label="Translate('IDCS_WATCH_DETECTION')"
            >
                <ObjectLeft
                    v-if="pageData.chosenFunction === 'objectLeft'"
                    :curr-chl-id="pageData.currChlId"
                    :chl-data="pageData.chlData"
                    :voice-list="pageData.voiceList"
                />
            </el-tab-pane>

            <!-- avd -->
            <el-tab-pane
                :disabled="pageData.avdDisable"
                name="avd"
                :label="Translate('IDCS_ABNORMAL_DISPOSE_WAY')"
            >
                <AbnormalDispose
                    v-if="pageData.chosenFunction === 'avd'"
                    :curr-chl-id="pageData.currChlId"
                    :chl-data="pageData.chlData"
                    :voice-list="pageData.voiceList"
                />
            </el-tab-pane>

            <div
                v-if="pageData.chosenFunction === ''"
                class="base-ai-not-support-box"
            >
                {{ Translate('IDCS_CURRENT_INTEL_EVENT_UNSUPORT') }}
            </div>
        </el-tabs>
    </div>
</template>

<script lang="ts" src="./More.v.ts"></script>

<style>
@import '@/views/UI_PUBLIC/publicStyle/aiAndEvent.scss';
</style>
