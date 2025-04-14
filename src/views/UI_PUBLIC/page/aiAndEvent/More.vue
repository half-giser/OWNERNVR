<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-09-10 17:50:24
 * @Description: 更多功能页面的框架
-->
<template>
    <div>
        <AlarmBaseChannelSelector
            v-model="pageData.currChlId"
            :list="pageData.onlineChannelList"
            :height="pageData.tab === 'avd' ? 100 : 140"
            @change="changeChannel"
        />
        <el-tabs
            :key="pageData.currChlId"
            v-model="pageData.tab"
            v-title
            class="base-ai-menu-tabs"
        >
            <div
                v-show="pageData.notSupport"
                class="base-ai-not-support-box"
            >
                {{ Translate('IDCS_ADD_INTEL_CHANNEL_TIP').formatForLang(Translate('IDCS_INTELLIGENT')) }}
            </div>
            <!-- fireDetection -->
            <el-tab-pane
                :disabled="!chlData.supportFire"
                name="fireDetection"
                :label="Translate('IDCS_FIRE_POINT_DETECTION')"
            >
                <FireDetectionPanel
                    v-if="pageData.tab === 'fireDetection'"
                    :curr-chl-id="pageData.currChlId"
                    :chl-data="chlData"
                    :voice-list="pageData.voiceList"
                    :online-channel-list="pageData.onlineChannelList"
                />
            </el-tab-pane>

            <!-- videoStructure -->
            <el-tab-pane
                :disabled="!chlData.supportVideoMetadata"
                name="videoStructure"
                :label="Translate('IDCS_VSD_DETECTION')"
            >
                <VideoStructurePanel
                    v-if="pageData.tab === 'videoStructure'"
                    :curr-chl-id="pageData.currChlId"
                    :chl-data="chlData"
                    :voice-list="pageData.voiceList"
                />
            </el-tab-pane>

            <!-- passLine -->
            <el-tab-pane
                :disabled="!chlData.supportPassLine && !chlData.supportCpc"
                name="passLine"
                :label="Translate('IDCS_PASS_LINE_COUNT_DETECTION')"
            >
                <PassLinePanel
                    v-if="pageData.tab === 'passLine'"
                    :curr-chl-id="pageData.currChlId"
                    :chl-data="chlData"
                    :voice-list="pageData.voiceList"
                    :online-channel-list="pageData.onlineChannelList"
                />
            </el-tab-pane>

            <!-- cdd -->
            <el-tab-pane
                :disabled="!chlData.supportCdd"
                name="cdd"
                :label="Translate('IDCS_CROWD_DENSITY_DETECTION')"
            >
                <CddPanel
                    v-if="pageData.tab === 'cdd'"
                    :curr-chl-id="pageData.currChlId"
                    :chl-data="chlData"
                    :voice-list="pageData.voiceList"
                />
            </el-tab-pane>

            <!-- temperatureDetection -->
            <el-tab-pane
                :disabled="!chlData.supportTemperature"
                name="temperatureDetection"
                :label="Translate('IDCS_TEMPERATURE_DETECTION')"
            >
                <TemperatureDetectionPanel
                    v-if="pageData.tab === 'temperatureDetection'"
                    :curr-chl-id="pageData.currChlId"
                    :chl-data="chlData"
                    :voice-list="pageData.voiceList"
                />
            </el-tab-pane>

            <!-- objectLeft -->
            <el-tab-pane
                :disabled="!chlData.supportOsc"
                name="objectLeft"
                :label="Translate('IDCS_WATCH_DETECTION')"
            >
                <ObjectLeftPanel
                    v-if="pageData.tab === 'objectLeft'"
                    :curr-chl-id="pageData.currChlId"
                    :chl-data="chlData"
                    :voice-list="pageData.voiceList"
                />
            </el-tab-pane>

            <!-- avd -->
            <el-tab-pane
                :disabled="!chlData.supportAvd"
                name="avd"
                :label="Translate('IDCS_ABNORMAL_DISPOSE_WAY')"
            >
                <AbnormalDisposePanel
                    v-if="pageData.tab === 'avd'"
                    :curr-chl-id="pageData.currChlId"
                    :chl-data="chlData"
                    :voice-list="pageData.voiceList"
                />
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script lang="ts" src="./More.v.ts"></script>
