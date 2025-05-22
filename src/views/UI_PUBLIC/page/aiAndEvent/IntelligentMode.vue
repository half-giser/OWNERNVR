<!--
 * @Description: AI 事件——事件启用
 * @Author: luoyiming a11593@tvt.net.cn
 * @Date: 2025-05-20 10:52:39
-->
<template>
    <div>
        <AlarmBaseChannelSelector
            v-model="pageData.currChlId"
            :list="pageData.intelligentModeChlList"
            @change="changeChannel"
        />
        <div id="intelligentModeList">
            <div
                v-for="item in pageData.intelligentModeList"
                :key="item.event"
                :title="item.title"
                class="intelligentModeItem"
                :class="{ selected: item.event === pageData.enableEventType }"
                @click="selectIntelligentMode(item.event)"
            >
                <span class="select_circle"></span>
                <div class="intelligentMode_logo">
                    <BaseImgSprite
                        :file="item.iconFile"
                        :index="item.event === pageData.enableEventType ? 1 : 0"
                        :hover-index="1"
                        :chunk="2"
                    />
                </div>
            </div>
        </div>
        <div class="base-btn-box fixed">
            <el-button
                :disabled="pageData.applyDisabled"
                @click="applyData"
            >
                {{ Translate('IDCS_APPLY') }}
            </el-button>
        </div>
        <div
            v-if="pageData.notSupport"
            class="base-ai-not-support-box"
        >
            <BaseImgSprite file="chl_error" />
            {{ Translate('IDCS_NOT_SUPPORTFUNC') }}
        </div>
    </div>
</template>

<script lang="ts" src="./IntelligentMode.v.ts"></script>

<style lang="scss" scoped>
/* 智能模式 */
#intelligentModeList {
    padding: 4px 20px;
}

.intelligentModeItem {
    display: inline-block;
    width: 200px;
    height: 200px;
    border-radius: 4px;
    text-align: center;
    position: relative;
    cursor: pointer;
    margin: 10px;
    border: 1px solid var(--content-border);

    span.select_circle {
        display: inline-block;
        position: absolute;
        width: 24px;
        height: 24px;
        top: 10px;
        right: 10px;
        border-radius: 50%;
        border: 1px solid var(--content-border);
    }

    .intelligentMode_logo {
        position: absolute;
        inset: 0;
        margin: auto;
        height: 80px;
    }
}

.intelligentModeItem.selected {
    cursor: default;

    span.select_circle::after {
        content: '';
        display: inline-block;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        position: absolute;
        inset: 0;
        margin: auto;
        background-color: var(--radio-btn-bg-active);
    }
}

.intelligentModeItem:hover span.select_circle,
.intelligentModeItem.selected span.select_circle {
    border: 1px solid var(--radio-btn-bg-active);
}
</style>
