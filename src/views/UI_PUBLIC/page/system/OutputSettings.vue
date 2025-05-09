<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-25 09:59:16
 * @Description: 输出配置
-->
<template>
    <div class="OutputSetting">
        <!-- 主Tab，切换主机、解码卡 -->
        <div
            v-if="pageData.hasDecoder"
            class="eth_list"
        >
            <div
                :class="{ active: pageData.tabId === -1 }"
                @click="changeTab(-1)"
            >
                {{ Translate('IDCS_LOCAL') }}
            </div>
            <div
                v-for="(item, key) in formData.decoder"
                :key
                :class="{
                    active: pageData.tabId === Number(key),
                    disabled: !item.onlineStatus,
                }"
                @click="changeTab(Number(key))"
            >
                {{ Translate('IDCS_DECODE_CARD') + (Number(key) + 1) }}
            </div>
        </div>
        <!-- 主副输出Tab -->
        <div
            v-if="!pageData.hasDecoder"
            class="top no-decoder"
        >
            <div class="top-tabs">
                <div
                    :class="{ active: pageData.outputIdx === -1 }"
                    @click="changeOutput(-1)"
                >
                    {{ displayTabName(1) }}
                </div>
                <div
                    v-for="(item, index) in formData.sub"
                    :key="item.id"
                    :class="{ active: pageData.outputIdx === index }"
                    @click="changeOutput(index)"
                >
                    {{ displayTabName(index + 2) }}
                </div>
            </div>
            <!-- 3535A是否显示辅输出控制开关，只在主输出可能显示 -->
            <div class="top-config">
                <el-switch
                    v-show="pageData.tabId === -1 && pageData.isConfigSwitch"
                    v-model="pageData.configSwitch"
                />
            </div>
            <!-- <div
                v-if="pageData.tabId !== -1"
                class="top-hdmi"
            >
                <span>{{ Translate('IDCS_HDMI_IN_EXPORT_TO') }}</span>
                <el-select-v2
                    v-model="formData.decoder[pageData.tabId].ShowHdmiIn"
                    :options="hdmiInOptions"
                />
            </div> -->
        </div>
        <main class="main">
            <div class="left">
                <div
                    v-if="pageData.hasDecoder"
                    class="top"
                >
                    <!-- 解码卡Tab -->
                    <div
                        v-if="pageData.hasDecoder"
                        class="top-tabs"
                    >
                        <template v-if="pageData.tabId === -1">
                            <div
                                :class="{ active: pageData.outputIdx === -1 }"
                                class="typeBtn"
                                @click="changeOutput(-1)"
                            >
                                {{ displayTabName(1) }}
                            </div>
                            <div
                                v-for="(item, index) in formData.sub"
                                :key="item.id"
                                class="typeBtn"
                                :class="{ active: pageData.outputIdx === index }"
                                @click="changeOutput(index)"
                            >
                                {{ displayTabName(index + 2) }}
                            </div>
                        </template>
                        <template v-else-if="formData.decoder[pageData.tabId]">
                            <div
                                v-for="(_item, key) in formData.decoder[pageData.tabId].output"
                                :key
                                class="typeBtn"
                                :class="{ active: pageData.decoderIdx === Number(key) }"
                                @click="changeDecoderIndex(Number(key))"
                            >
                                {{ Translate('IDCS_OUTPUT') + (Number(key) + 1) }}
                            </div>
                        </template>
                    </div>
                    <!-- 3535A是否显示辅输出控制开关，只在主输出可能显示 -->
                    <div class="top-config">
                        <el-switch
                            v-show="pageData.tabId === -1 && pageData.isConfigSwitch"
                            v-model="pageData.configSwitch"
                        />
                    </div>
                    <!-- <div
                        v-if="pageData.tabId !== -1"
                        class="top-hdmi"
                    >
                        <span>{{ Translate('IDCS_HDMI_IN_EXPORT_TO') }}</span>
                        <el-select-v2
                            v-model="formData.decoder[pageData.tabId].ShowHdmiIn"
                            :options="hdmiInOptions"
                        />
                    </div> -->
                </div>
                <div class="panel">
                    <div class="panel-top">
                        <div
                            v-show="(pageData.tabId === -1 && pageData.outputIdx === -1) || isDwell"
                            class="panel-left"
                        >
                            <!-- 轮询 -->
                            <div class="panel-title">{{ Translate('IDCS_DWELL') }}</div>
                            <!-- 缩略图列表 -->
                            <el-scrollbar class="panel-thumbnail">
                                <div
                                    v-for="(item, key) in getCurrentOutput().chlGroups"
                                    :key="`${pageData.tabId}-${pageData.outputIdx}-${key}`"
                                    class="panel-thumbnail-item"
                                    @click="changeView(key)"
                                >
                                    <OutputTemplateItem
                                        type="thumbail"
                                        :segment="item.segNum"
                                        :active-win="0"
                                        :active-view="pageData.activeView === key"
                                        :win-data="[]"
                                    />
                                    <div class="panel-thumbnail-index">
                                        {{ key + 1 }}
                                    </div>
                                    <div
                                        class="panel-thumbnail-del"
                                        @click.stop="delView(key)"
                                    >
                                        ×
                                    </div>
                                </div>
                            </el-scrollbar>
                            <!-- 新增视图按钮 -->
                            <div
                                class="panel-thumbnail-add"
                                @click="addView"
                            >
                                <BaseImgSprite
                                    file="SpeedQuick"
                                    :chunk="4"
                                />
                            </div>
                        </div>
                        <!-- 视窗区域 -->
                        <div class="panel-center">
                            <OutputTemplateItem
                                type="screen"
                                :segment="currentSegment"
                                :active-win="pageData.activeWinIndex"
                                :win-data="currentViewData"
                                :active-view="false"
                                @clear="clearSplitData"
                                @change="changeWinIndex"
                                @drop="handleDrop"
                            />
                            <div class="panel-center-index">
                                {{ pageData.activeView + 1 }}
                            </div>
                        </div>
                    </div>
                    <div class="panel-bottom">
                        <!-- 轮询开关 -->
                        <div class="panel-dwell">
                            <el-checkbox
                                v-show="pageData.tabId !== -1 || pageData.outputIdx !== -1"
                                :model-value="isDwell"
                                :label="Translate('IDCS_DWELL')"
                                @update:model-value="changeOutputType"
                            />
                        </div>
                        <!-- 分屏切换按钮 -->
                        <div class="panel-btns">
                            <el-tooltip :content="Translate('IDCS_FAVOURITE')">
                                <BaseImgSpriteBtn
                                    v-show="pageData.tabId === -1 && pageData.outputIdx === -1"
                                    class="panel-collect"
                                    file="collect_view"
                                    @click="collectView"
                                />
                            </el-tooltip>
                            <div class="panel-seg">
                                <BaseImgSpriteBtn
                                    v-for="seg in segList"
                                    :key="seg"
                                    :file="`seg_${seg}`"
                                    :active="currentSegment === seg"
                                    @click="changeSplit(seg)"
                                />
                            </div>
                            <el-select-v2
                                v-show="isDwell && (pageData.tabId !== -1 || pageData.outputIdx !== -1)"
                                :model-value="currentTimeInterval"
                                :options="pageData.dwellTimeOptions"
                                class="panel-dwell-time"
                                @change="changeTimeInterval"
                            />
                            <el-tooltip :content="Translate('IDCS_CLEAR_AWAY')">
                                <BaseImgSpriteBtn
                                    class="panel-clear"
                                    file="clear"
                                    @click="clearAllSplitData"
                                />
                            </el-tooltip>
                        </div>
                    </div>
                    <div v-show="isHDMIShadow">
                        {{ Translate('IDCS_HDMI_IN') }}
                    </div>
                </div>
            </div>
            <div class="chl">
                <!-- 切换通道和通道组 -->
                <div class="chl-menu">
                    <div
                        v-for="(item, key) in pageData.chlMenu"
                        :key
                        :class="{ active: pageData.activeChlMenu === key }"
                        @click="pageData.activeChlMenu = key"
                    >
                        {{ item }}
                    </div>
                </div>
                <!-- 通道列表 -->
                <div
                    v-show="pageData.activeChlMenu === 0"
                    class="chl-wrap"
                >
                    <BaseListBox>
                        <BaseListBoxItem
                            v-for="listItem in pageData.chlList"
                            :key="listItem.id"
                            draggable="true"
                            icon="chl_icon"
                            @dragstart="handleDragChl(listItem.id)"
                            @dblclick="setWinFromChl(listItem.id)"
                            @mouseenter="pageData.activeChl = listItem.id"
                            @mouseleave="pageData.activeChl = ''"
                        >
                            <BaseImgSprite
                                file="chl_icon"
                                :index="pageData.activeChl === listItem.id ? 1 : 0"
                                :chunk="4"
                            />
                            <div class="text-ellipsis">{{ listItem.value }}</div>
                        </BaseListBoxItem>
                    </BaseListBox>
                </div>
                <!-- 通道组列表 -->
                <div
                    v-show="pageData.activeChlMenu === 1"
                    class="chl-wrap"
                >
                    <BaseListBox>
                        <BaseListBoxItem
                            v-for="groupItem in pageData.chlGroupList"
                            :key="groupItem.id"
                            :active="pageData.activeChlGroup === groupItem.id"
                            draggable="true"
                            icon="chlGroup"
                            @click="getChlListOfGroup(groupItem.id)"
                            @dblclick="setWinFromChlGroup(groupItem.id)"
                            @dragstart="handleDragChlGroup(groupItem.id)"
                        >
                            <BaseImgSprite
                                file="chlGroup"
                                :index="pageData.activeChlGroup === groupItem.id ? 1 : 0"
                                :chunk="2"
                            />
                            <div class="text-ellipsis">{{ groupItem.name }}</div>
                        </BaseListBoxItem>
                    </BaseListBox>
                    <div class="chl-btns">
                        <el-button @click="addChlGroup">{{ Translate('IDCS_ADD') }}</el-button>
                        <el-button @click="editChlGroup">{{ Translate('IDCS_EDIT') }}</el-button>
                        <el-button @click="deleteChlGroup">{{ Translate('IDCS_DELETE') }}</el-button>
                    </div>
                    <BaseListBox>
                        <BaseListBoxItem
                            v-for="listItem in pageData.chlListOfGroup"
                            :key="listItem.id"
                            draggable="true"
                            @dragstart="handleDragChl(listItem.id)"
                            @dblclick="setWinFromChl(listItem.id)"
                        >
                            <div class="text-ellipsis">{{ listItem.value }}</div>
                        </BaseListBoxItem>
                    </BaseListBox>
                </div>
            </div>
        </main>
        <div class="base-btn-box">
            <el-button @click="setDwellData">{{ Translate('IDCS_APPLY') }}</el-button>
        </div>
        <BaseCheckAuthPop
            v-model="pageData.isCheckAuth"
            @confirm="handleCheckAuthByConfigSwitchChange"
            @close="pageData.isCheckAuth = false"
        />
        <OutputAddViewPop
            v-model="pageData.isAddView"
            :chl="activeViewItem"
            @close="pageData.isAddView = false"
        />
        <ChannelGroupEditPop
            v-model="pageData.isEditChlGroup"
            :edit-item="pageData.editChlGroup"
            @close="closeEditChlGroup"
            @call-back="getChlGroupList"
        />
        <ChannelGroupAddPop
            v-model="pageData.isAddChlGroup"
            @close="closeAddChlGroup"
            @call-back="getChlGroupList"
        />
    </div>
</template>

<script lang="ts" src="./OutputSettings.v.ts"></script>

<style lang="scss" scoped>
.OutputSetting {
    font-size: 15px;
    user-select: none;
    height: var(--content-height);
    display: flex;
    flex-direction: column;
}

.eth_list {
    width: 100%;
    height: 50px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    background-color: var(--output-eth-bg);
    border: 1px solid var(--content-border);

    & > div {
        padding: 0 20px;
        cursor: pointer;
        border-bottom: 5px solid transparent;

        &.active {
            border-color: var(--primary);
        }

        &.disabled {
            color: var(--table-text-disabled);
            cursor: not-allowed;
        }
    }
}

.main {
    height: 100%;
    overflow-y: hidden;
    width: 100%;
    display: flex;
    border: 1px solid var(--content-border);
}

.left {
    width: 100%;
    height: 100%;
    border-right: 1px solid var(--content-border);
    display: flex;
    flex-direction: column;
}

.top {
    position: relative;
    border-bottom: 1px solid var(--content-border);
    display: flex;
    width: 100%;
    height: 60px;
    flex-shrink: 0;
    background-color: var(--output-tab-bg);
    justify-content: space-between;
    align-items: center;

    &.no-decoder {
        border: 1px solid var(--content-border);
        border-bottom: none;
        background-color: var(--output-eth-bg);
    }

    &-tabs {
        display: flex;
        align-items: center;
        height: 60px;

        & > div {
            display: inline-block;
            height: 40px;
            line-height: 40px;
            text-align: center;
            cursor: pointer;
            padding: 0 20px;
            margin-left: 10px;
            background-color: var(--output-tab-btn-bg);
            border: 1px solid var(--content-border);

            &.active,
            &:hover {
                background-color: var(--primary);
                color: var(--color-white);
            }
        }
    }

    &-config {
        align-items: center;
        // margin-left: 10px;
    }

    &-hdmi {
        align-items: center;
        display: flex;
        justify-content: flex-end;
        width: 250px;
        margin-right: 10px;

        & > span {
            flex-shrink: 0;
            margin-right: 10px;
        }
        // width: 100px;
    }
}

.panel {
    width: 100%;
    flex-grow: 1;
    height: calc(100% - 60px);
    display: flex;
    flex-direction: column;

    &-top {
        display: flex;
        width: 100%;
        height: calc(100% - 50px);
        border-bottom: 1px solid var(--content-border);
    }

    &-left {
        width: 260px;
        height: 100%;
        border-right: 1px solid var(--content-border);
        display: flex;
        flex-direction: column;
        align-items: center;
        flex-shrink: 0;
    }

    &-title {
        height: 50px;
        text-align: center;
        flex-shrink: 0;
        width: 100%;
        line-height: 50px;
        border-bottom: 1px solid var(--content-border);
    }

    &-thumbnail {
        width: 100%;
        height: calc(100% - 120px);

        &-item {
            width: 220px;
            height: 150px;
            margin: 10px auto;
            position: relative;

            &:hover .panel-thumbnail-del {
                opacity: 1;
            }
        }

        &-del {
            position: absolute;
            opacity: 0;
            right: 0;
            top: 0;
            width: 20px;
            height: 20px;
            line-height: 20px;
            text-align: center;
            background-color: var(--output-tab-btn-bg);
            cursor: pointer;
        }

        &-index {
            position: absolute;
            top: 5px;
            left: 5px;
        }
    }

    &-thumbnail-add {
        flex-shrink: 0;
        height: 30px;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 120px;
        margin: 10px 0;
        background-color: var(--output-tab-btn-bg);
        border: 1px solid var(--content-border);
        cursor: pointer;
    }

    &-center {
        position: relative;
        width: 100%;
        height: 100%;

        &-index {
            position: absolute;
            top: 5px;
            left: 5px;
            color: var(--color-white);
        }
    }

    &-bottom {
        width: 100%;
        height: 50px;
        flex-shrink: 0;
        display: flex;
    }

    &-dwell {
        width: 260px;
        height: 100%;
        flex-shrink: 0;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    &-btns {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        border-left: 1px solid var(--content-border);
    }

    &-collect {
        margin: 0 10px;
        flex-shrink: 0;
    }

    &-seg {
        display: flex;
        margin: 0 10px;
        width: 100%;

        & > span {
            margin: 0 5px;
        }
    }

    &-dwell-time {
        width: 100px;
        margin: 0 10px;
        flex-shrink: 0;
    }

    &-clear {
        margin: 0 10px;
        flex-shrink: 0;
    }
}

.chl {
    width: 260px;
    height: 100%;
    display: flex;
    flex-direction: column;
    flex-shrink: 0;

    &-menu {
        width: 100%;
        height: 82px;
        flex-shrink: 0;
        cursor: pointer;

        & > div {
            height: 40px;
            line-height: 40px;
            border-bottom: 1px solid var(--content-border);
            text-align: center;

            &.active {
                background-color: var(--primary);
                color: var(--color-white);
            }
        }
    }

    &-wrap {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    &-btns {
        flex-shrink: 0;
        padding: 10px 0;
        border-top: 1px solid var(--content-border);
        border-bottom: 1px solid var(--content-border);
        display: flex;
        justify-content: center;
    }
}
</style>
