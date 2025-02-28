<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-30 09:32:36
 * @Description: 回放-通道视图
-->
<template>
    <div class="base-home-panel left">
        <div
            v-show="pageData.isOpen"
            class="base-home-panel-content"
        >
            <div
                class="base-home-panel-top"
                @click="pageData.isOpen = false"
            >
                <div>
                    {{ pageData.chlMenu[pageData.activeChlMenu].label }}
                </div>
                <i class="base-home-panel-arrow"></i>
            </div>
            <div class="base-home-panel-menu">
                <div
                    v-for="(item, index) in pageData.chlMenu"
                    :key="item.tab"
                    class="base-home-panel-menu-item"
                    :class="{
                        active: pageData.activeChlMenu === index,
                    }"
                    :title="item.label"
                    @click="changeChlMenu(index)"
                    @dblclick="changeChlMenu(index)"
                >
                    <BaseImgSpriteBtn
                        :file="item.file"
                        :active="pageData.activeChlMenu === index"
                    />
                </div>
            </div>
            <slot></slot>
            <div class="left-bottom">
                <!-- 通道列表 -->
                <div
                    v-show="pageData.activeChlMenu === 0"
                    class="left-chl"
                >
                    <div class="left-chl-form">
                        <el-input
                            v-model="pageData.chlKeyword"
                            class="middle"
                            :placeholder="Translate('IDCS_SEARCH_CHANNEL')"
                            @keyup.enter="searchChl"
                        />
                        <BaseImgSprite
                            class="left-chl-search"
                            file="toolbar_search"
                            :title="Translate('IDCS_SEARCH')"
                            @click="searchChl"
                        />
                        <BaseImgSprite
                            class="left-chl-search"
                            file="toolbar_refresh"
                            :title="Translate('IDCS_REFRESH')"
                            @click="refreshChl"
                        />
                    </div>
                    <el-checkbox
                        :model-value="isChlAll"
                        :label="Translate('IDCS_ALL')"
                        class="left-chl-check-all"
                        @change="toggleAllChl"
                    />
                    <BaseListBox class="left-chl-box">
                        <el-checkbox-group v-model="pageData.selectedChl">
                            <BaseListBoxItem
                                v-for="item in pageData.cacheChlList"
                                :key="item.id"
                            >
                                <el-checkbox
                                    v-show="chlList.includes(item.id)"
                                    :key="item.id"
                                    :value="item.id"
                                    :disabled="isChlAll && !pageData.selectedChl.includes(item.id)"
                                >
                                    <BaseImgSprite
                                        file="chl_rec_icon"
                                        :index="1"
                                        :chunk="2"
                                    />
                                    <span>{{ item.value }}</span>
                                </el-checkbox>
                            </BaseListBoxItem>
                        </el-checkbox-group>
                    </BaseListBox>
                </div>
                <!-- 通道组列表 -->
                <div
                    v-show="pageData.activeChlMenu === 1"
                    ref="chlGroupElement"
                    class="left-chlgroup"
                >
                    <div
                        class="left-chlgroup-group"
                        :style="{
                            height: pageData.chlGroupHeight,
                        }"
                    >
                        <BaseListBox>
                            <BaseListBoxItem
                                v-for="groupItem in pageData.chlGroupList"
                                :key="groupItem.id"
                                :class="{ active: pageData.activeChlGroup === groupItem.id }"
                                icon="chlGroup"
                                @click="getChlListOfGroup(groupItem.id)"
                                @dblclick="setWinFromChlGroup(groupItem.id)"
                            >
                                <BaseImgSprite
                                    file="chlGroup"
                                    :index="pageData.activeChlGroup === groupItem.id ? 1 : 0"
                                    :chunk="2"
                                />
                                <span>{{ groupItem.value }}</span>
                            </BaseListBoxItem>
                        </BaseListBox>
                        <div class="left-chlgroup-btns">
                            <el-button @click="addChlGroup">{{ Translate('IDCS_ADD') }}</el-button>
                            <el-button @click="editChlGroup">{{ Translate('IDCS_EDIT') }}</el-button>
                            <el-button @click="deleteChlGroup">{{ Translate('IDCS_DELETE') }}</el-button>
                        </div>
                    </div>
                    <div
                        class="left-chlgroup-thumb"
                        @mousedown="mousedownChlGroupPosition"
                    ></div>
                    <BaseListBox>
                        <BaseListBoxItem
                            v-for="listItem in pageData.chlListOfGroup"
                            :key="listItem.id"
                            class="left-chlgroup-items"
                        >
                            <span>{{ listItem.value }}</span>
                        </BaseListBoxItem>
                    </BaseListBox>
                </div>
            </div>
            <div class="left-btns">
                <div :title="Translate('IDCS_SEARCH')">
                    <BaseImgSpriteBtn
                        file="search"
                        :index="[0, 2, 2, 3]"
                        :disabled="!pageData.selectedChl.length"
                        @click="search"
                    />
                </div>
                <div :title="Translate('IDCS_PLAY')">
                    <BaseImgSpriteBtn
                        file="play (2)"
                        :index="[0, 2, 2, 3]"
                        :disabled="!pageData.selectedChl.length"
                        @click="play"
                    />
                </div>
            </div>
        </div>
        <div
            v-show="!pageData.isOpen"
            class="base-home-panel-hide"
        >
            <div
                class="base-home-panel-top"
                @click="pageData.isOpen = true"
            >
                <div></div>
                <i class="base-home-panel-arrow hide"></i>
            </div>
        </div>
        <!-- 新增通道组 -->
        <ChannelGroupEditPop
            v-model="pageData.isEditChlGroup"
            :edit-item="pageData.editChlGroup"
            @close="closeEditChlGroup"
            @call-back="getChlGroupList"
        />
        <!-- 编辑通道组 -->
        <ChannelGroupAddPop
            v-model="pageData.isAddChlGroup"
            @close="closeAddChlGroup"
            @call-back="getChlGroupList"
        />
    </div>
</template>

<script lang="ts" src="./PlaybackChannelPanel.v.ts"></script>

<style lang="scss" scoped>
.left {
    &-bottom {
        height: calc(100% - 300px);
    }

    &-chl {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;

        &-form {
            margin: 10px;
            display: flex;
            flex-shrink: 0;
            align-items: center;
        }

        &-search {
            background-color: var(--btn-bg);
            margin-left: 5px;
            cursor: pointer;
            flex-shrink: 0;

            &:hover {
                background-color: var(--btn-bg-hover);
            }
        }

        &-box {
            height: 100%;
            margin-left: 10px;
            width: calc(100% - 10px);

            .Sprite {
                margin-right: 3px;
            }
        }

        &-check-all {
            margin-left: 21px;
            height: 32px;
        }
    }

    &-chlgroup {
        display: flex;
        height: 100%;
        width: 100%;
        flex-direction: column;

        &-btns {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 33px;
            flex-shrink: 0;

            :deep(.el-button) {
                min-width: unset !important;
            }
        }

        &-group {
            height: 50%;
            display: flex;
            flex-direction: column;
            flex-shrink: 0;
        }

        &-thumb {
            padding-top: 10px;
            padding-bottom: 10px;
            width: 90%;
            height: 1px;
            border-top: 1px solid var(--content-border);
            position: relative;
            margin: 0 auto;
            cursor: n-resize;

            &::before {
                content: '';
                position: absolute;
                top: -10px;
                left: calc(50% - 15px);
                width: 30px;
                height: 1px;
                border-top: 1px solid var(--content-border);
            }

            &::after {
                content: '';
                position: absolute;
                bottom: 10px;
                left: calc(50% - 15px);
                width: 30px;
                height: 1px;
                border-top: 1px solid var(--content-border);
            }
        }
    }

    &-btns {
        width: 100%;
        justify-content: center;
        display: flex;
        margin-top: 10px;

        & > div {
            cursor: pointer;
            width: 100px;
            height: 25px;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0 4px;

            span {
                position: relative;

                &::after {
                    content: '';
                    width: 100px;
                    height: 25px;
                    border: 2px solid var(--panel-btn-bg);
                    position: absolute;
                    right: -40px;
                    top: -3px;
                    border-radius: 3px;
                }

                &:hover::after {
                    border-color: var(--primary);
                }

                &.disabled::after {
                    border-color: var(--panel-btn-bg-disabled);

                    &:hover {
                        border-color: var(--panel-btn-bg-disabled);
                    }
                }
            }
        }
    }
}
</style>
