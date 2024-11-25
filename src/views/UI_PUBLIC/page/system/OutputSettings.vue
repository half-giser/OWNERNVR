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
                :class="{ active: pageData.tabId === 0 }"
                @click="changeTab(0)"
            >
                {{ Translate('IDCS_LOCAL') }}
            </div>
            <div
                v-for="key in Object.keys(decoderCardMap)"
                :key
                :class="{ active: pageData.tabId === Number(key) + 1 }"
                @click="changeTab(Number(key) + 1)"
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
                    v-for="i in pageData.outputScreenCount"
                    :key="i"
                    :class="{ active: pageData.outputIdx === i - 1 }"
                    @click="changeOutput(i - 1)"
                >
                    {{ displayTabName(i) }}
                </div>
            </div>
            <!-- 3535A是否显示辅输出控制开关，只在主输出可能显示 -->
            <div class="top-config">
                <el-switch
                    v-show="pageData.tabId === 0 && pageData.isConfigSwitch"
                    v-model="pageData.configSwitch"
                />
            </div>
            <div
                v-if="pageData.tabId !== 0"
                class="top-hdmi"
            >
                <span>{{ Translate('IDCS_HDMI_IN_EXPORT_TO') }}</span>
                <el-select v-model="decoderCardMap[pageData.tabId].ShowHdmiIn">
                    <el-option :value="0">{{ Translate('IDCS_NULL') }}</el-option>
                    <el-option
                        v-for="key in Object.keys(decoderCardMap[pageData.tabId].decoderDwellData)"
                        :key
                        :value="Number(key) + 1"
                        :label="`${Translate('IDCS_OUTPUT')}${Number(key) + 1}`"
                    />
                </el-select>
            </div>
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
                        <template v-if="decoderCardMap[pageData.tabId]">
                            <div
                                v-for="key in Object.keys(decoderCardMap[pageData.tabId].decoderDwellData)"
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
                            v-show="pageData.tabId === 0 && pageData.isConfigSwitch"
                            v-model="pageData.configSwitch"
                        />
                    </div>
                    <div
                        v-if="pageData.tabId !== 0"
                        class="top-hdmi"
                    >
                        <span>{{ Translate('IDCS_HDMI_IN_EXPORT_TO') }}</span>
                        <el-select v-model="decoderCardMap[pageData.tabId].ShowHdmiIn">
                            <el-option :value="0">{{ Translate('IDCS_NULL') }}</el-option>
                            <el-option
                                v-for="key in Object.keys(decoderCardMap[pageData.tabId].decoderDwellData)"
                                :key
                                :value="Number(key) + 1"
                                :label="`${Translate('IDCS_OUTPUT')}${Number(key) + 1}`"
                            />
                        </el-select>
                    </div>
                </div>
                <div class="panel">
                    <div class="panel-top">
                        <div
                            v-show="(pageData.tabId === 0 && pageData.outputIdx === 0) || pageData.dwellCheckbox"
                            class="panel-left"
                        >
                            <!-- 轮询 -->
                            <div class="panel-title">{{ Translate('IDCS_DWELL') }}</div>
                            <!-- 缩略图列表 -->
                            <div class="panel-thumbnail">
                                <div
                                    v-for="(item, key) in currentViewList.chlGroups"
                                    :key="`${pageData.tabId}-${pageData.outputIdx}-${key}`"
                                    class="panel-thumbnail-item"
                                    @click="changeView(key)"
                                >
                                    <OutputSplitTemplate
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
                            </div>
                            <!-- 新增视图按钮 -->
                            <div
                                class="panel-thumbnail-add"
                                @click="addView"
                            >
                                <BaseImgSprite
                                    file="SpeedQuick"
                                    :index="0"
                                    :chunk="4"
                                />
                            </div>
                        </div>
                        <!-- 视窗区域 -->
                        <div class="panel-center">
                            <OutputSplitTemplate
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
                                v-show="pageData.tabId !== 0 || pageData.outputIdx !== 0"
                                v-model="pageData.dwellCheckbox"
                                :label="Translate('IDCS_DWELL')"
                                @change="changeOutputType"
                            />
                        </div>
                        <!-- 分屏切换按钮 -->
                        <div class="panel-btns">
                            <el-tooltip :content="Translate('IDCS_FAVOURITE')">
                                <BaseImgSprite
                                    v-show="pageData.tabId === 0 && pageData.outputIdx === 0"
                                    class="panel-collect"
                                    :index="0"
                                    :hover-index="1"
                                    :chunk="4"
                                    file="collect (2)"
                                    @click="collectView"
                                />
                            </el-tooltip>
                            <div class="panel-seg">
                                <BaseImgSprite
                                    v-for="seg in pageData.segList"
                                    :key="seg"
                                    :file="`seg_${seg}`"
                                    :index="currentSegment === seg ? 2 : 0"
                                    :hover-index="currentSegment === seg ? 2 : 1"
                                    :chunk="4"
                                    @click="changeSplit(seg)"
                                />
                            </div>
                            <el-select
                                v-show="outputType === 'dwell'"
                                :model-value="currentTimeInterval"
                                class="panel-dwell-time"
                                @change="changeTimeInterval"
                            >
                                <el-option
                                    v-for="value in pageData.dwellTimeOptions"
                                    :key="value"
                                    :value
                                    :label="displayDwellTimeLabel(value)"
                                />
                            </el-select>
                            <el-tooltip :content="Translate('IDCS_CLEAR_AWAY')">
                                <BaseImgSprite
                                    class="panel-clear"
                                    file="clear"
                                    :index="0"
                                    :hover-index="1"
                                    :chunk="4"
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
                            <span>{{ listItem.value }}</span>
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
                            :class="{ active: pageData.activeChlGroup === groupItem.id }"
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
                            <span>{{ groupItem.value }}</span>
                        </BaseListBoxItem>
                    </BaseListBox>
                    <div class="chl-btns">
                        <el-button @click="addChlGroup">{{ Translate('IDCS_ADD') }}</el-button>
                        <el-button @click="editChlGroup">{{ Translate('IDCS_EDIT') }}</el-button>
                        <el-button @click="deleteChlGroup">{{ Translate('IDCS_DELETE') }}</el-button>
                    </div>
                    <div class="chl-list">
                        <ul>
                            <li
                                v-for="listItem in pageData.chlListOfGroup"
                                :key="listItem.id"
                                draggable
                                @dragstart="handleDragChl(listItem.id)"
                                @dblclick="setWinFromChl(listItem.id)"
                            >
                                <span>{{ listItem.value }}</span>
                            </li>
                        </ul>
                    </div>
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
    min-width: 1200px;
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
        margin-left: 10px;
    }

    &-hdmi {
        margin-left: 10px;
        width: 100px;
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
        // flex-grow: 1;
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
        overflow-y: scroll;

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

        span {
            cursor: pointer;
        }
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
        height: 80px;
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
        // height: 0px;
        flex-shrink: 0;
        padding: 10px 0;
        border-top: 1px solid var(--content-border);
        border-bottom: 1px solid var(--content-border);
        display: flex;
        justify-content: center;
    }

    &-list {
        width: 100%;
        height: calc(100% - 80px);
        overflow-y: scroll;

        ul {
            margin: 0;
            padding: 0;
        }

        li {
            list-style: none;
            padding: 5px;
            border: 1px solid transparent;
            cursor: pointer;
            font-size: 13px;

            span:last-child {
                margin-left: 10px;
            }

            &:hover,
            &.active {
                border-color: var(--primary);
            }

            &.active {
                background-color: var(--primary);
                color: var(--color-white);
            }
        }
    }
}
</style>
