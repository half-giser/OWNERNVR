<!--
 * @Author: liyanqi a11219@tvt.net.cn
 * @Date: 2025-05-14 20:05:32
 * @Description: 视频结构化入口
-->
<template>
    <div>
        <AlarmBaseChannelSelector
            v-model="pageData.currChlId"
            :list="pageData.onlineChannelList"
            :height="140"
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
                {{ Translate('IDCS_ADD_INTEL_CHANNEL_TIP').formatForLang(Translate('IDCS_VSD_DETECTION')) }}
            </div>
            <!-- 视频结构化 -->
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
                    :online-channel-list="pageData.onlineChannelList"
                />
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script lang="ts" src="./VideoStructure.v.ts"></script>

<style lang="scss" scoped></style>
