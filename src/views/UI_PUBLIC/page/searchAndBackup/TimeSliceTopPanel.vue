<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-12 17:39:00
 * @Description: 时间切片-概览界面(按通道/按时间)
-->
<template>
    <div class="top">
        <div class="base-btn-box collapse">
            <el-form
                :style="{
                    '--form-label-width': 'auto',
                    '--form-input-width': '150px',
                }"
            >
                <el-form-item :label="Translate('IDCS_VIEW_WAY')">
                    <BaseSelect
                        v-model="pageData.viewOption"
                        :options="viewOptions"
                    />
                </el-form-item>
            </el-form>
        </div>
        <el-scrollbar class="list">
            <div
                v-show="pageData.viewOption === 'time'"
                class="time-list"
            >
                <div
                    v-for="item in pageData.chlTimeSliceList"
                    :key="item.startTime"
                >
                    <div class="time-date">{{ displayDate(item.startTime) }}</div>
                    <div class="list-box">
                        <TimeSliceItem
                            v-for="(chl, key) in item.chlList"
                            :key="key"
                            :mode="timeSliceCardMode"
                            :chl-name="chl.chlName"
                            :time="displayTime(chl.frameTime)"
                            :pic="chl.imgUrl"
                            :active="pageData.select?.taskId === chl.taskId"
                            @click="handleSelect(chl, item.startTime)"
                            @dblclick="handleOpen()"
                        />
                    </div>
                </div>
            </div>
            <div
                v-show="pageData.viewOption === 'chl'"
                class="list-box"
            >
                <TimeSliceItem
                    v-for="(chl, key) in pageData.chlList"
                    :key="key"
                    :mode="chlCardMode"
                    :chl-name="chl.chlName"
                    :pic="chl.imgUrl"
                    :active="pageData.select?.chlId === chl.chlId"
                    :show-time="false"
                    time=""
                    @click="handleSelect(chl)"
                    @dblclick="handleOpen()"
                />
            </div>
        </el-scrollbar>
        <div class="base-btn-box padding">
            <el-button
                :disabled="pageData.select === null"
                @click="handleOpen"
            >
                {{ Translate('IDCS_OPEN') }}
            </el-button>
        </div>
    </div>
</template>

<script lang="ts" src="./TimeSliceTopPanel.v.ts"></script>

<style lang="scss" scoped>
.top {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.list {
    width: 100%;
    height: 100%;

    &-box {
        padding: 0 20px;
        display: flex;
        flex-wrap: wrap;
        margin: 10px 0;
    }
}

.time {
    &-list {
        width: 100%;
        box-sizing: border-box;
        padding: 0 20px;
    }

    &-date {
        font-size: 16px;
        position: relative;
        line-height: 32px;

        &::after {
            width: calc(100% - 100px);
            right: 100px;
            height: 1px;
            top: 16px;
            left: 100px;
            background-color: var(--subheading-bg);
            content: '';
            position: absolute;
        }
    }
}
</style>
