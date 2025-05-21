<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-30 14:08:41
 * @Description: 回放-事件类型视图
-->
<template>
    <fieldset>
        <legend>{{ Translate('IDCS_RECORD_TYPE') }}</legend>
        <div class="list">
            <div class="event-normal">
                <div
                    v-for="item in pageData.normalEvent"
                    :key="item.value"
                    class="event-normal-item"
                    :class="{
                        active: item.selected,
                    }"
                    @click="item.selected = !item.selected"
                >
                    <BaseImgSprite :file="item.icon" />
                    <span class="event-normal-item-text">{{ item.name }}</span>
                </div>
            </div>
            <!-- <div></div> -->
            <el-popover
                v-model:visible="pageData.isPlayModePop"
                popper-class="no-padding"
            >
                <template #reference>
                    <BaseImgSpriteBtn
                        class="btn"
                        file="arrow"
                    />
                </template>
                <div class="play-mode">
                    <div
                        v-for="item in pageData.playModeList"
                        :key="item.value"
                        class="play-mode-item"
                        :class="{
                            active: item.value === pageData.playMode,
                        }"
                        @click="changePlayMode(item.value)"
                    >
                        <BaseImgSprite
                            file="check_mark"
                            :index="0"
                            :chunk="4"
                        />
                        <span>{{ item.label }}</span>
                    </div>
                </div>
            </el-popover>

            <!-- <div
                v-for="item in pageData.events[pageData.eventIndex]"
                v-show="item.enable"
                :key="item.value"
                class="item"
                @click="changeEvent(item.value)"
            >
                <BaseImgSprite
                    :file="pageData.eventList.includes(item.value) ? item.checked : item.unchecked"
                    :title="item.name"
                    :chunk="4"
                />
            </div> -->
            <!-- <el-popover
                v-model:visible="pageData.isEventPop"
                placement="right"
                width="440"
                popper-class="no-padding"
            >
                <template #reference>
                    <BaseImgSpriteBtn
                        v-show="pageData.isEventPopBtn"
                        file="event_type_menu"
                        class="btn"
                    />
                </template>
                <div class="event">
                    <div class="event-title">{{ Translate('IDCS_MODE_SELECT') }}</div>
                    <div class="event-list">
                        <div
                            v-for="(item, index) in pageData.events"
                            :key="index"
                            :class="{
                                active: index === pageData.activeEventIndex,
                            }"
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
                    <div class="base-btn-box">
                        <el-button
                            class="event-btn"
                            @click="changeEventList"
                        >
                            {{ Translate('IDCS_OK') }}
                        </el-button>
                        <el-button
                            class="event-btn"
                            @click="closeEventPop"
                        >
                            {{ Translate('IDCS_CLOSE') }}
                        </el-button>
                    </div>
                </div>
            </el-popover> -->
        </div>
        <el-input
            v-show="pageData.isPosInput"
            v-model="pageData.posKeyword"
            :disabled="!pageData.eventList.includes('POS')"
            :placeholder="Translate('IDCS_POS_KEY')"
            class="pos"
        />
    </fieldset>
</template>

<script lang="ts" src="./PlaybackEventPanel.v.ts"></script>

<style lang="scss" scoped>
fieldset {
    flex-shrink: 0;
    border: 1px solid var(--input-border);
    margin: 15px;
    padding-bottom: 15px;
}

.list {
    display: flex;
    // padding: 5px 10px 5px 0;
    position: relative;
    height: 34px;
    width: 100%;
    justify-content: space-between;
    padding: 0 5px;
    align-items: center;
    box-sizing: border-box;
    border: 1px solid var(--content-border);
}

.event-normal {
    display: flex;
    width: 100%;
    height: 25px;

    &-item {
        display: flex;
        width: 50%;
        height: 100%;
        border: 1px solid var(--input-border);
        cursor: pointer;
        align-items: center;
        border-radius: 2px;
        margin-right: 5px;
        justify-content: flex-start;

        &:hover {
            background-color: var(--primary-light);
            // border-color: var(--primary-light);
        }

        &.active,
        &.active:hover {
            background-color: var(--primary);
            border-color: var(--primary);
            color: var(--main-text-active);
        }

        .Sprite {
            transform: scale(0.4);
            background-color: var(--color-white);
            border-radius: 4px;
            margin-left: -10px;
        }

        &-text {
            margin-left: -10px;
        }
    }
}

.play-mode {
    width: 207px;

    &-item {
        display: flex;
        width: 100%;
        cursor: pointer;

        .Sprite {
            opacity: 0;
        }

        &:not(:last-child) {
            border-bottom: 1px solid var(--content-border);
        }

        &.active {
            .Sprite {
                opacity: 1;
            }
        }
    }
}

// .item {
//     margin: 0 5px;
// }

.pos {
    margin-top: 10px;
}

.btn {
    flex-shrink: 0;
    // position: absolute;
    // right: -5px;
}

// .event {
//     padding-bottom: 10px;
//     background-color: var(--panel-event-bg);
//     color: var(--panel-event-text);

//     &-title {
//         width: 100%;
//         background-color: var(--panel-event-title-bg);
//         text-align: center;
//         line-height: 30px;
//         color: var(--panel-event-title-text);
//     }

//     &-list {
//         & > div {
//             display: flex;
//             padding: 10px;
//             cursor: pointer;

//             &:hover {
//                 background-color: var(--panel-event-bg-hover);
//                 color: var(--main-text-active);
//             }

//             &.active {
//                 background-color: var(--panel-event-bg-active);
//                 color: var(--main-text-active);
//             }

//             & > div {
//                 width: 100px;
//                 display: flex;
//                 flex-direction: column;
//                 justify-content: center;
//                 align-items: center;
//             }
//         }

//         p {
//             margin: 0;
//             padding: 0;
//             margin-top: 5px;
//             width: 100%;
//             text-align: center;
//             font-size: 12px;
//         }
//     }

//     &-info {
//         margin-bottom: 20px;

//         h3 {
//             margin: 10px;
//             font-size: 14px;
//             font-weight: normal;
//         }

//         p {
//             margin: 10px;
//             padding: 0;
//         }
//     }

//     &-btn {
//         margin-right: 10px;
//         margin-left: 0;
//     }
// }
</style>
