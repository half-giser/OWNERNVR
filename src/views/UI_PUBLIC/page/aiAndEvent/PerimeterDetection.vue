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
            v-model="pageData.chosenFunction"
            class="base-ai-menu-tabs"
        >
            <!-- tripwire -->
            <el-tab-pane
                :disabled="pageData.tripwireDisable"
                name="Tripwire"
                :label="Translate('IDCS_BEYOND_DETECTION')"
            >
                <TripwirePanel
                    v-if="pageData.chosenFunction === 'Tripwire'"
                    :curr-chl-id="pageData.currChlId"
                    :chl-data="chlData"
                    :voice-list="pageData.voiceList"
                    :online-channel-list="pageData.onlineChannelList"
                />
            </el-tab-pane>
            <!-- pea -->
            <el-tab-pane
                :disabled="pageData.peaDisable"
                name="Pea"
                :label="Translate('IDCS_INVADE_DETECTION')"
            >
                <PeaPanel
                    v-if="pageData.chosenFunction === 'Pea'"
                    :curr-chl-id="pageData.currChlId"
                    :chl-data="chlData"
                    :voice-list="pageData.voiceList"
                    :online-channel-list="pageData.onlineChannelList"
                />
            </el-tab-pane>
            <div
                v-if="pageData.chosenFunction === ''"
                class="notSupportBox"
            >
                {{ Translate('IDCS_CURRENT_INTEL_EVENT_UNSUPORT') }}
            </div>
        </el-tabs>
    </div>
</template>

<script lang="ts" src="./PerimeterDetection.v.ts"></script>
