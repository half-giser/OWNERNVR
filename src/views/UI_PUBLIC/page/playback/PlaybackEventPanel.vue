<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-30 14:08:41
 * @Description: 回放-事件类型视图
-->
<template>
    <fieldset>
        <legend>{{ Translate('IDCS_RECORD_TYPE') }}</legend>
        <div class="list">
            <div
                v-show="pageData.playMode === 'normal'"
                class="event-normal"
            >
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
            <div
                v-show="pageData.playMode === 'event'"
                class="event-type"
            >
                <PlaybackEventSelector v-model="pageData.eventList" />
                <div class="event-type-btn-box">
                    <BaseImgSprite
                        file="setFilterTypeIcon"
                        :hover-index="0"
                        class="event-type-btn"
                        @click="pageData.isFilterPop = true"
                    />
                </div>
            </div>
            <BaseImgSpriteBtn
                class="btn"
                file="arrow"
                @click="pageData.isPlayModePop = true"
            />
        </div>
        <div class="popover">
            <el-popover
                v-model:visible="pageData.isPlayModePop"
                popper-class="no-padding"
                width="207"
            >
                <template #reference>
                    <span></span>
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
            <el-popover
                v-model:visible="pageData.isFilterPop"
                width="207"
            >
                <template #reference>
                    <span></span>
                </template>
                <div class="filter">
                    <el-radio-group
                        v-model="pageData.filterType"
                        class="filter-group"
                    >
                        <el-radio
                            v-for="item in pageData.filterTypeList"
                            :key="item.value"
                            :value="item.value"
                            :label="item.label"
                        >
                            <span class="filter-label">{{ item.label }}</span>
                            <div
                                v-for="child in item.children"
                                v-show="!child.hidden"
                                :key="child.value"
                                class="filter-item"
                            >
                                <span
                                    class="filter-item-color"
                                    :style="{
                                        backgroundColor: child.color,
                                    }"
                                ></span>
                                <span class="filter-item-text">{{ child.name }}</span>
                            </div>
                        </el-radio>
                    </el-radio-group>
                    <div class="base-btn-box center">
                        <el-button @click="pageData.isFilterPop = false">{{ Translate('IDCS_CLOSE') }}</el-button>
                    </div>
                </div>
            </el-popover>
        </div>
        <el-input
            v-show="systemCaps.supportPOS"
            v-model="pageData.posKeyword"
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
        user-select: none;

        &:hover {
            background-color: var(--primary-light);
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

.event-type {
    display: flex;
    width: 100%;
    height: 25px;
    align-items: center;

    &-btn {
        transform: scale(0.2);

        &:hover {
            opacity: 0.7;
        }
    }

    &-btn-box {
        width: 25px;
        height: 25px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
}

.play-mode {
    &-item {
        display: flex;
        width: 100%;
        cursor: pointer;
        align-items: center;

        .Sprite {
            opacity: 0;
            transform: scale(0.5);
        }

        &:not(:last-child) {
            border-bottom: 1px solid var(--content-border);
        }

        &.active {
            .Sprite {
                opacity: 1;
            }
        }

        &:hover {
            background-color: var(--primary);
            color: var(--main-text-active);

            .Sprite {
                filter: brightness(25);
            }
        }
    }
}

.popover {
    display: flex;
    justify-content: center;
    width: 100%;
}

.filter {
    &-group {
        display: flex;
        flex-wrap: wrap;

        .el-radio {
            width: 100%;
            height: auto;
            display: flex;
            align-items: flex-start;
        }

        :deep(.el-radio__input) {
            margin-top: 2px;
        }
    }

    &-item {
        display: flex;
        margin: 10px 0;
        align-items: center;

        &-color {
            width: 14px;
            height: 14px;
        }

        &-text {
            margin-left: 5px;
        }
    }
}

.pos {
    margin-top: 10px;
}

.btn {
    flex-shrink: 0;
}
</style>
