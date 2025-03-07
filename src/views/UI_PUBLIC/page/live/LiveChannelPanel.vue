<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-17 11:11:44
 * @Description: 现场预览-通道视图
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
                    <span>{{ pageData.chlMenu[pageData.activeChlMenu].label }}</span>
                    <span
                        v-show="pageData.activeChlMenu === 0"
                        class="left-top-online"
                    >
                        ({{ pageData.onlineChlList.length }}/{{ pageData.cacheChlList.length }})
                    </span>
                </div>
                <i class="base-home-panel-arrow"></i>
            </div>
            <div class="base-home-panel-menu">
                <div
                    v-for="(item, index) in pageData.chlMenu"
                    :key="item.tab"
                    class="base-home-panel-menu-item stroke"
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
            <div class="base-home-panel-bottom">
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
                        <div class="left-chl-search">
                            <BaseImgSprite
                                file="toolbar_search"
                                :title="Translate('IDCS_SEARCH')"
                                @click="searchChl"
                            />
                        </div>
                        <div class="left-chl-search">
                            <BaseImgSprite
                                file="toolbar_refresh"
                                :title="Translate('IDCS_REFRESH')"
                                @click="refreshChl"
                            />
                        </div>
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

<script lang="ts" src="./LiveChannelPanel.v.ts"></script>

<style lang="scss" scoped>
.left {
    &-top {
        &-online {
            color: var(--panel-header-text-02);
        }
    }

    &-chl {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;

        &-form {
            margin: 10px 10px 5px;
            display: flex;
            flex-shrink: 0;
            align-items: center;

            .el-input {
                width: 162px;
            }
        }

        &-search {
            background-color: var(--btn-bg);
            margin-left: 5px;
            cursor: pointer;
            flex-shrink: 0;
            width: 27px;
            height: 27px;
            display: flex;
            justify-content: center;
            align-items: center;

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
            margin-top: 10px;
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

        .BaseListBox {
            li.active {
                background-color: var(--primary);

                &:hover {
                    background-color: var(--primary);
                }
            }
        }
    }

    .BaseListBox {
        width: calc(100% - 10px);
        height: calc(100% - 52px);
        margin-left: 10px;

        li {
            border: 1px solid var(--panel-chl-border);
            background-color: var(--panel-chl-bg);
            box-sizing: border-box;

            &:hover {
                border-color: var(--panel-chl-border-hover);
                background-color: var(--panel-chl-bg-hover);
            }
        }
    }
}
</style>
