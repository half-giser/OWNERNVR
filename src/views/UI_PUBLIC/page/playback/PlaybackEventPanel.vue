<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-30 14:08:41
 * @Description: 回放-事件类型视图
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-25 11:11:17
-->
<template>
    <fieldset>
        <legend>{{ Translate('IDCS_RECORD_TYPE') }}</legend>
        <div class="list">
            <div
                v-for="item in pageData.events[pageData.eventIndex]"
                v-show="item.enable"
                :key="item.value"
                class="item"
                @click="changeEvent(item.value)"
            >
                <el-tooltip
                    :content="item.name"
                    :show-after="500"
                >
                    <BaseImgSprite
                        :file="pageData.eventList.includes(item.value) ? item.checked : item.unchecked"
                        :index="0"
                        :chunk="4"
                    />
                </el-tooltip>
            </div>

            <el-popover
                v-model:visible="pageData.isEventPop"
                placement="right"
                width="420px"
                trigger="click"
                popper-class="no-padding"
                :hide-after="0"
                :show-after="0"
            >
                <template #reference>
                    <BaseImgSprite
                        v-show="pageData.isEventPopBtn"
                        file="event_type_menu"
                        :chunk="4"
                        :hover-index="1"
                        class="btn"
                    />
                </template>
                <div class="event-title">{{ Translate('IDCS_MODE_SELECT') }}</div>
                <div class="event-list">
                    <div
                        v-for="(item, index) in pageData.events"
                        :key="index"
                        :class="{ active: index === pageData.activeEventIndex }"
                        @click="pageData.activeEventIndex = index"
                    >
                        <div
                            v-for="event in item"
                            v-show="event.enablePop"
                            :key="event.value"
                        >
                            <BaseImgSprite :file="event.file" />
                            <p>{{ event.name }}</p>
                        </div>
                    </div>
                </div>
                <div class="event-info">
                    <h3>{{ Translate('IDCS_DESCRIPTION') }}</h3>
                    <p
                        v-for="(tip, key) in pageData.eventTips"
                        :key
                    >
                        {{ tip }}
                    </p>
                </div>
                <el-row>
                    <el-col
                        :span="24"
                        class="el-col-flex-end"
                    >
                        <el-button
                            class="event-btn"
                            @click="changeEventList"
                            >{{ Translate('IDCS_OK') }}</el-button
                        >
                        <el-button
                            class="event-btn"
                            @click="closeEventPop"
                            >{{ Translate('IDCS_CLOSE') }}</el-button
                        >
                    </el-col>
                </el-row>
            </el-popover>
        </div>
    </fieldset>
</template>

<script lang="ts" src="./PlaybackEventPanel.v.ts"></script>

<style lang="scss" scoped>
fieldset {
    flex-shrink: 0;
    border: 1px solid var(--border-color7);
    margin: 15px 15px;
}

.list {
    display: flex;
    justify-content: center;
    padding: 5px 10px 0 0;
    position: relative;
}

.item {
    margin: 0 5px;
}

.btn {
    position: absolute;
    right: -5px;
    cursor: pointer;
}

.event {
    padding: 0;
    padding-bottom: 10px;

    &-title {
        width: 100%;
        background-color: var(--bg-table-thead);
        text-align: center;
        line-height: 30px;
    }

    &-list {
        & > div {
            color: var(--text-primary);
            display: flex;
            padding: 10px 0;
            cursor: pointer;

            &:hover {
                background-color: var(--primary--01);
            }

            &.active {
                background-color: var(--primary--04);

                p {
                    color: var(--color-white);
                }
            }

            & > div {
                width: 100px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }
        }

        p {
            margin: 0;
            padding: 0;
            margin-top: 5px;
            width: 100%;
            text-align: center;
            font-size: 12px;
        }
    }

    &-info {
        margin-bottom: 20px;
        color: var(--text-primary);

        h3 {
            margin: 10px;
            font-size: 14px;
            font-weight: normal;
        }

        p {
            margin: 10px;
            padding: 0;
            // margin-bottom: 10px;
            // width: 100%;
        }
    }

    &-btn {
        margin-right: 10px;
        margin-left: 0;
    }
}
</style>
