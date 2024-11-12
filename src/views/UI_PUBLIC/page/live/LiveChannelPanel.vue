<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-17 11:11:44
 * @Description: 现场预览-通道视图
-->
<template>
    <div class="left">
        <div
            v-show="pageData.isOpen"
            class="left-content"
        >
            <div
                class="left-top"
                @click="pageData.isOpen = false"
            >
                <div>
                    <span>{{ pageData.chlMenu[pageData.activeChlMenu].label }}</span>
                    <span
                        v-show="pageData.activeChlMenu === 0"
                        class="left-top-online"
                    >
                        ( {{ pageData.onlineChlList.length }} / {{ pageData.cacheChlList.length }} )
                    </span>
                </div>
                <i></i>
            </div>
            <div class="left-menu">
                <div
                    v-for="(item, index) in pageData.chlMenu"
                    :key="item.tab"
                    :class="{
                        active: pageData.activeChlMenu === index,
                    }"
                    @click="changeChlMenu(index)"
                    @dblclick="changeChlMenu(index)"
                >
                    <el-tooltip :content="item.label">
                        <BaseImgSprite
                            :file="item.file"
                            :index="pageData.activeChlMenu === index ? 1 : 0"
                            :hover-index="1"
                            :disabled-index="3"
                            :chunk="4"
                        />
                    </el-tooltip>
                </div>
            </div>
            <div class="left-bottom">
                <!-- 通道列表 -->
                <div
                    v-show="pageData.activeChlMenu === 0"
                    class="left-chl"
                >
                    <div class="left-chl-form">
                        <el-input
                            v-model="pageData.chlKeyword"
                            :placeholder="Translate('IDCS_SEARCH_CHANNEL')"
                            @keydown.enter="searchChl"
                        />
                        <BaseImgSprite
                            class="left-chl-search"
                            file="toolbar_search"
                            @click="searchChl"
                        />
                        <BaseImgSprite
                            class="left-chl-search"
                            file="toolbar_refresh"
                            @click="refreshChl"
                        />
                    </div>
                    <BaseListBox class="left-chl-box">
                        <BaseListBoxItem
                            v-for="listItem in chlList"
                            :key="listItem.id"
                            draggable="true"
                            icon="chl_icon"
                            @mouseenter="pageData.activeChl = listItem.id"
                            @mouseleave="pageData.activeChl = ''"
                            @click="setWinFromChl(listItem.id)"
                        >
                            <BaseImgSprite
                                file="chl_icon"
                                :index="getChlIconStatus(listItem.id)"
                                :hover-index="1"
                                :chunk="4"
                            />
                            <span>{{ listItem.value }}</span>
                        </BaseListBoxItem>
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
                                @dblclick="setWinFromChlGroup(groupItem.id, groupItem.dwellTime)"
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
                            @click="setWinFormChlOfGroup(listItem.id)"
                        >
                            <span>{{ listItem.value }}</span>
                        </BaseListBoxItem>
                    </BaseListBox>
                </div>
                <!-- 自定义视图列表 -->
                <div
                    v-show="pageData.activeChlMenu === 2"
                    class="left-customview"
                >
                    <BaseListBox>
                        <BaseListBoxItem
                            v-for="viewItem in pageData.customViewList"
                            :key="viewItem.id"
                            :class="{ active: pageData.activeCustomView === viewItem.id }"
                            icon="chlGroup"
                            @dblclick="setWinFormCustomView(viewItem)"
                            @click="pageData.activeCustomView = viewItem.id"
                        >
                            <BaseImgSprite
                                file="chlGroup"
                                :index="pageData.activeCustomView === viewItem.id ? 1 : 0"
                                :chunk="2"
                            />
                            <span>{{ viewItem.value }}</span>
                        </BaseListBoxItem>
                    </BaseListBox>
                </div>
            </div>
        </div>
        <div
            v-show="!pageData.isOpen"
            class="left-hide"
        >
            <div
                class="left-top"
                @click="pageData.isOpen = true"
            >
                <div></div>
                <i class="hide"></i>
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

<script lang="ts" src="./LiveChannelPanel.v.ts"></script>

<style lang="scss" scoped>
.left {
    height: 100%;
    flex-shrink: 0;
    background-color: var(--panel-bg);

    &-content {
        width: 260px;
        height: 100%;
    }

    &-hide {
        width: 16px;
        height: 100%;
    }

    &-top {
        display: flex;
        width: 100%;
        height: 50px;
        align-items: center;
        justify-content: space-between;
        color: var(--panel-header-text);
        background-color: var(--panel-header-bg);

        & > div {
            margin-left: 10px;
        }

        &-online {
            color: var(--panel-header-text-02);
        }

        i {
            border-right: 8px solid var(--panel-header-text);
            border-top: 8px solid transparent;
            border-bottom: 8px solid transparent;
            border-left: 8px solid transparent;
            font-size: 0;
            width: 0;
            height: 0;
            line-height: 0;
            cursor: pointer;
            margin-right: 10px;
            position: relative;

            &::after {
                content: '';
                border-right: 4px solid var(--panel-header-bg);
                border-top: 4px solid transparent;
                border-bottom: 4px solid transparent;
                border-left: 4px solid transparent;
                position: absolute;
                width: 0;
                height: 0;
                left: 0;
                top: -4px;
            }

            &.hide {
                transform: rotate(180deg);
                left: -5px;
            }
        }

        &:hover i {
            border-right-color: var(--primary);
        }
    }

    &-menu {
        height: 50px;
        background-color: var(--panel-menu-bg);
        display: flex;
        align-items: flex-end;
        justify-content: center;
        flex-shrink: 0;

        & > div {
            background-color: transparent;
            width: 42px;
            height: 38px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 10px;
            border-top: 3px solid transparent;

            &.active {
                background-color: var(--panel-menu-bg-active);
                border-top-color: var(--primary);
            }
        }
    }

    &-bottom {
        height: calc(100% - 100px);
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
            height: 50px;
            flex-shrink: 0;

            :deep(.el-button) {
                margin: 0 2px;
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
}
</style>
