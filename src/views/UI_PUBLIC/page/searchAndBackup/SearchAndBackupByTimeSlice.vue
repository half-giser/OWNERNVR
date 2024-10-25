<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-12 16:25:05
 * @Description: 按时间切片搜索
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-25 14:30:12
-->
<template>
    <div class="time-slice">
        <div class="breadcrumb">
            <!-- 按通道 -->
            <div @click="changeMode('chl')">{{ Translate('IDCS_CHANNEL_THUMBNAIL') }}</div>
            <!-- 按年 -->
            <div
                v-show="navIndex > 0"
                @click="changeMode('year')"
            >
                {{ pageData.chlName }}
            </div>
            <!-- 按月 -->
            <div
                v-show="navIndex > 1"
                @click="changeMode('month')"
            >
                {{ displayYearMonth }}
            </div>
            <!-- 按日 -->
            <div v-show="navIndex > 2">
                {{ displayDate }}
            </div>
        </div>
        <div class="main">
            <TimeSliceTopPanel
                v-show="pageData.mode === 'chl'"
                @start-time="pageData.startTime = $event"
                @change="handleChlChange"
            />
            <TimeSliceTimelinePanel
                v-show="pageData.mode !== 'chl'"
                :mode="pageData.mode"
                :chl-id="pageData.chlId"
                :chl-name="pageData.chlName"
                :rec-start-time="pageData.startTime"
                :chl-start-time="pageData.chlTime"
                @change="handleSliceChange"
            />
        </div>
    </div>
</template>

<script lang="ts" src="./SearchAndBackupByTimeSlice.v.ts"></script>

<style lang="scss" scoped>
.time-slice {
    width: 100%;
    display: flex;
    flex-direction: column;
}

.main {
    width: 100%;
    height: calc(100% - 40px);
    overflow: hidden;
}

.breadcrumb {
    height: 40px;
    line-height: 40px;
    width: 100%;
    border-bottom: 1px solid var(--input-border);
    display: flex;
    align-items: center;
    box-sizing: border-box;
    padding: 0 20px;
    font-size: 14px;
    flex-shrink: 0;

    & > div {
        cursor: pointer;

        &:not(:last-child):hover {
            color: var(--primary);
        }

        &:not(:last-child)::after {
            content: '>';
            padding-left: 10px;
            padding-right: 10px;
            font-family: consolas;
        }
    }
}

.timeline {
    width: 100%;
    height: 100%;

    &-view {
        height: calc(100% - 20px);
    }
}

.legend {
    background-color: var(--timeline-legend-bg);
    color: var(--timeline-scale-text-01);
    height: 20px;
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    box-sizing: border-box;
    margin-right: 10px;
    font-size: 12px;

    div {
        margin: 0 10px;
        display: flex;
        align-items: center;
        height: 100%;

        span:first-child {
            width: 12px;
            height: 12px;
            margin-right: 5px;
        }
    }
}
</style>
