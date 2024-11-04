<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-08-27 15:43:26
 * @Description:  周界防范/人车检测
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-30 10:41:04
-->
<template>
    <div>
        <el-form
            class="stripe"
            :style="{
                '--form-input-width': '430px',
            }"
            inline-message
        >
            <el-form-item
                :label="Translate('IDCS_CHANNEL_NAME')"
                label-width="108"
            >
                <el-select
                    v-model="pageData.currChlId"
                    class="base-ai-chl-select"
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
            <!-- tripwire -->
            <el-tab-pane
                :disabled="pageData.tripwireDisable"
                name="Tripwire"
                :label="Translate('IDCS_BEYOND_DETECTION')"
            >
                <Tripwire
                    v-if="pageData.chosenFunction === 'Tripwire'"
                    :curr-chl-id="pageData.currChlId"
                    :chl-data="pageData.chlData"
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
                <Pea
                    v-if="pageData.chosenFunction === 'Pea'"
                    :curr-chl-id="pageData.currChlId"
                    :chl-data="pageData.chlData"
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

<style>
@import '@/views/UI_PUBLIC/publicStyle/aiAndEvent.scss';
</style>
