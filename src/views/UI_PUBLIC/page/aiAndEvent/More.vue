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
            :height="pageData.chosenFunction === 'avd' ? 100 : 140"
            @change="handleChangeChannel"
        />
        <el-tabs
            :key="pageData.currChlId"
            v-model="pageData.chosenFunction"
            class="base-ai-menu-tabs"
        >
            <!-- fireDetection -->
            <el-tab-pane
                :disabled="pageData.fireDetectionDisable"
                name="fireDetection"
                :label="Translate('IDCS_FIRE_POINT_DETECTION')"
            >
                <FireDetectionPanel
                    v-if="pageData.chosenFunction === 'fireDetection'"
                    :curr-chl-id="pageData.currChlId"
                    :chl-data="chlData"
                    :voice-list="pageData.voiceList"
                    :online-channel-list="pageData.onlineChannelList"
                />
            </el-tab-pane>

            <!-- videoStructure -->
            <el-tab-pane
                :disabled="pageData.videoStructureDisable"
                name="videoStructure"
                :label="Translate('IDCS_VSD_DETECTION')"
            >
                <VideoStructurePanel
                    v-if="pageData.chosenFunction === 'videoStructure'"
                    :curr-chl-id="pageData.currChlId"
                    :chl-data="chlData"
                    :voice-list="pageData.voiceList"
                />
            </el-tab-pane>

            <!-- passLine -->
            <el-tab-pane
                :disabled="pageData.passLineDisable"
                name="passLine"
                :label="Translate('IDCS_PASS_LINE_COUNT_DETECTION')"
            >
                <PassLinePanel
                    v-if="pageData.chosenFunction === 'passLine'"
                    :curr-chl-id="pageData.currChlId"
                    :chl-data="chlData"
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
                <CddPanel
                    v-if="pageData.chosenFunction === 'cdd'"
                    :curr-chl-id="pageData.currChlId"
                    :chl-data="chlData"
                    :voice-list="pageData.voiceList"
                />
            </el-tab-pane>

            <!-- temperatureDetection -->
            <el-tab-pane
                :disabled="pageData.temperatureDetectionDisable"
                name="temperatureDetection"
                :label="Translate('IDCS_TEMPERATURE_DETECTION')"
            >
                <TemperatureDetectionPanel
                    v-if="pageData.chosenFunction === 'temperatureDetection'"
                    :curr-chl-id="pageData.currChlId"
                    :chl-data="chlData"
                    :voice-list="pageData.voiceList"
                />
            </el-tab-pane>

            <!-- objectLeft -->
            <el-tab-pane
                :disabled="pageData.objectLeftDisable"
                name="objectLeft"
                :label="Translate('IDCS_WATCH_DETECTION')"
            >
                <ObjectLeftPanel
                    v-if="pageData.chosenFunction === 'objectLeft'"
                    :curr-chl-id="pageData.currChlId"
                    :chl-data="chlData"
                    :voice-list="pageData.voiceList"
                />
            </el-tab-pane>

            <!-- avd -->
            <el-tab-pane
                :disabled="pageData.avdDisable"
                name="avd"
                :label="Translate('IDCS_ABNORMAL_DISPOSE_WAY')"
            >
                <AbnormalDisposePanel
                    v-if="pageData.chosenFunction === 'avd'"
                    :curr-chl-id="pageData.currChlId"
                    :chl-data="chlData"
                    :voice-list="pageData.voiceList"
                />
            </el-tab-pane>

            <div
                v-if="pageData.chosenFunction === ''"
                class="base-ai-not-support-box"
            >
                {{ Translate('IDCS_ADD_INTEL_CHANNEL_TIP').formatForLang(Translate('IDCS_INTELLIGENT')) }}
            </div>
        </el-tabs>
    </div>
</template>

<script lang="ts" src="./More.v.ts"></script>
