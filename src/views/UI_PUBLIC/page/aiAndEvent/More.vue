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
            @change="changeChannel"
        />
        <el-tabs
            :key="pageData.currChlId"
            v-model="pageData.tab"
            v-title
            class="base-ai-menu-tabs"
        >
            <AlarmBaseErrorPanel
                v-show="pageData.notSupport"
                type="not-support"
            />
            <!-- 徘徊检测 -->
            <el-tab-pane
                :disabled="!chlData.supportLoitering"
                name="loiter"
                :label="Translate('IDCS_LOITERING_DETECTION')"
            >
                <LoiterPanel
                    v-if="pageData.tab === 'loiter'"
                    :curr-chl-id="pageData.currChlId"
                    :chl-data="chlData"
                    :voice-list="pageData.voiceList"
                    :online-channel-list="pageData.onlineChannelList"
                />
            </el-tab-pane>
            <!-- 违停检测 -->
            <el-tab-pane
                :disabled="!chlData.supportPvd"
                name="pvd"
                :label="Translate('IDCS_PARKING_DETECTION')"
            >
                <PvdPanel
                    v-if="pageData.tab === 'pvd'"
                    :curr-chl-id="pageData.currChlId"
                    :chl-data="chlData"
                    :voice-list="pageData.voiceList"
                    :online-channel-list="pageData.onlineChannelList"
                />
            </el-tab-pane>
            <!-- 过线统计 -->
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
            <!-- 区域统计 -->
            <el-tab-pane
                :disabled="!chlData.supportRegionStatistics"
                name="areaStatis"
                :label="Translate('IDCS_REGION_STATISTICS')"
            >
                <AreaStatisPanel
                    v-if="pageData.tab === 'areaStatis'"
                    :curr-chl-id="pageData.currChlId"
                    :chl-data="chlData"
                    :voice-list="pageData.voiceList"
                    :online-channel-list="pageData.onlineChannelList"
                />
            </el-tab-pane>
            <!-- 人员聚集 -->
            <el-tab-pane
                :disabled="!chlData.supportCrowdGathering"
                name="cgd"
                :label="Translate('IDCS_CROWD_GATHERING')"
            >
                <CrowdGatherPanel
                    v-if="pageData.tab === 'cgd'"
                    :curr-chl-id="pageData.currChlId"
                    :chl-data="chlData"
                    :voice-list="pageData.voiceList"
                    :online-channel-list="pageData.onlineChannelList"
                />
            </el-tab-pane>

            <!-- 火点检测 -->
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

            <!-- 温度检测 -->
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

            <!-- 物品看護 -->
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

            <!-- 人群密度检测 -->
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

            <!-- 声音异常 -->
            <el-tab-pane
                :disabled="!chlData.supportASD"
                name="asd"
                :label="Translate('IDCS_AUDIO_EXCEPTION_DETECTION')"
            >
                <AsdPanel
                    v-if="pageData.tab === 'asd'"
                    :curr-chl-id="pageData.currChlId"
                    :chl-data="chlData"
                    :voice-list="pageData.voiceList"
                    :online-channel-list="pageData.onlineChannelList"
                />
            </el-tab-pane>

            <!-- 热力图 -->
            <el-tab-pane
                :disabled="!chlData.supportHeatMap"
                name="heatMap"
                :label="Translate('IDCS_HEAT_MAP')"
            >
                <HeatMapPanel
                    v-if="pageData.tab === 'heatMap'"
                    :curr-chl-id="pageData.currChlId"
                    :chl-data="chlData"
                    :voice-list="pageData.voiceList"
                    :online-channel-list="pageData.onlineChannelList"
                />
            </el-tab-pane>

            <!-- 客流统计 -->
            <el-tab-pane
                :disabled="!chlData.supportBinocularCountConfig"
                name="sbc"
                :label="Translate('IDCS_PASSENGER_FLOW_STATIST')"
            >
                <BinocularCountPanel
                    v-if="pageData.tab === 'sbc'"
                    :curr-chl-id="pageData.currChlId"
                    :chl-data="chlData"
                    :voice-list="pageData.voiceList"
                    :online-channel-list="pageData.onlineChannelList"
                />
            </el-tab-pane>

            <!-- 視頻異常 -->
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
