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
