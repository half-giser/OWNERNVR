<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-27 15:43:26
 * @Description:  周界防范/人车检测
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
            class="base-ai-menu-tabs"
        >
            <div
                v-if="pageData.notSupport"
                class="base-ai-not-support-box"
            >
                {{ Translate('IDCS_CURRENT_INTEL_EVENT_UNSUPORT') }}
            </div>
            <!-- tripwire -->
            <el-tab-pane
                :disabled="!chlData.supportTripwire && !chlData.supportBackTripwire && !chlData.supportPeaTrigger"
                name="Tripwire"
                :label="Translate('IDCS_BEYOND_DETECTION')"
            >
                <TripwirePanel
                    v-if="pageData.tab === 'Tripwire'"
                    :curr-chl-id="pageData.currChlId"
                    :chl-data="chlData"
                    :voice-list="pageData.voiceList"
                    :online-channel-list="pageData.onlineChannelList"
                />
            </el-tab-pane>
            <!-- pea -->
            <el-tab-pane
                :disabled="!chlData.supportPea && !chlData.supportBackPea && !chlData.supportPeaTrigger"
                name="Pea"
                :label="Translate('IDCS_INVADE_DETECTION')"
            >
                <PeaPanel
                    v-if="pageData.tab === 'Pea'"
                    :curr-chl-id="pageData.currChlId"
                    :chl-data="chlData"
                    :voice-list="pageData.voiceList"
                    :online-channel-list="pageData.onlineChannelList"
                />
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script lang="ts" src="./PerimeterDetection.v.ts"></script>
