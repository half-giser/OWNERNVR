<!--
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2025-05-21 10:30:00
 * @Description: 智能分析-人、车
-->
<template>
    <div
        class="snap"
        :style="{
            '--snap-item-grid': grid,
            '--snap-item-ratio': ratio,
        }"
    >
        <!-- 封面图区域 -->
        <div
            class="pic_show_container"
            :class="{
                checked: targetData.checked,
                selected: targetData.index === detailIndex,
            }"
        >
            <div
                v-if="targetData.isNoData"
                class="noData_pic"
            >
                <BaseImgSprite file="noData" />
                <span class="tip_text">{{ Translate('IDCS_NO_RECORD_DATA') }}</span>
            </div>
            <div
                v-else-if="targetData.isDelete"
                class="deleted_pic"
            >
                <BaseImgSprite
                    :scale="0.5"
                    file="hasDeleted"
                />
                <span class="tip_text">{{ Translate('IDCS_DELETED') }}</span>
            </div>
            <div
                v-else
                class="normal_pic"
                @click="handleClickCover"
            >
                <div class="snap_pic">
                    <!-- 封面图 -->
                    <img
                        :src="targetData.objPicData.data"
                        @load="loadImg"
                    />
                </div>
                <div
                    v-if="showCompare"
                    class="compare_pic"
                >
                    <!-- 封面图 -->
                    <img
                        :src="comparePicInfo?.pic"
                        @load="loadImg"
                    />
                </div>
                <!-- 顶部操作区域（checkbox选择框） -->
                <div class="top_operate">
                    <el-checkbox
                        v-model="targetData.checked"
                        @change="handleChecked"
                        @click.stop=""
                    />
                </div>
                <!-- 底部操作区域（搜索、导出、注册） -->
                <div class="bottom_operate">
                    <BaseImgSprite
                        v-if="showSearch"
                        file="snap_search"
                        :chunk="4"
                        :hover-index="1"
                        :title="Translate('IDCS_SEARCH')"
                        class="operate_icon"
                        :scale="0.7"
                        @click.stop="handleSearch"
                    />
                    <BaseImgSprite
                        v-if="showExport"
                        file="export_btn"
                        :chunk="4"
                        :hover-index="1"
                        :title="Translate('IDCS_EXPORT')"
                        class="operate_icon"
                        :scale="0.7"
                        @click.stop="handleExport"
                    />
                    <BaseImgSprite
                        v-if="showRegister"
                        file="register"
                        :chunk="4"
                        :hover-index="1"
                        class="operate_icon"
                        :title="Translate('IDCS_REGISTER')"
                        :scale="0.7"
                        @click.stop="handleRegister"
                    />
                </div>
            </div>
        </div>
        <!-- 描述信息区域 -->
        <div class="info_show_container">
            <div class="info_show_snap">
                <div :title="displayDateTime(targetData.timeStamp * 1000)">
                    {{ displayDateTime(targetData.timeStamp * 1000) }}
                </div>
                <div :title="targetData.channelName">
                    {{ targetData.channelName }}
                </div>
                <div
                    v-if="showPlateNumber"
                    :title="targetData.plateAttrInfo.plateNumber"
                >
                    {{ targetData.plateAttrInfo.plateNumber }}
                </div>
            </div>
            <div
                v-if="showCompare"
                class="info_show_snap"
            >
                <div :title="comparePicInfo?.name || comparePicInfo?.note || Translate('IDCS_SAMPLE')">
                    {{ comparePicInfo?.name || comparePicInfo?.note || Translate('IDCS_SAMPLE') }}
                </div>
            </div>
            <span
                v-if="showSimilarity"
                class="similarity"
            >
                <span class="similarity-value">{{ `(${targetData.similarity} %)` }}</span>
                <BaseImgSprite
                    file="Rectangle"
                    :chunk="1"
                />
            </span>
        </div>
    </div>
</template>

<script lang="ts" src="./IntelBaseSnapItem.v.ts"></script>

<style lang="scss" scoped>
.snap {
    width: calc((100% - var(--snap-item-grid) * 10px) / var(--snap-item-grid));
    margin: 5px;
    user-select: none;
}

.pic_show_container {
    width: 100%;
    position: relative;
    border: 2px solid var(--content-border);
    padding-top: var(--snap-item-ratio);

    &.checked {
        .top_operate {
            visibility: visible;
        }
    }

    &.selected {
        border-color: var(--primary);
    }

    &:hover {
        .top_operate,
        .bottom_operate {
            visibility: visible;
        }
    }
}

.noData_pic,
.deleted_pic {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.tip_text {
    font-size: 14px;
    color: var(--main-text-light);
}

.normal_pic {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;

    img {
        width: 100%;
        height: 100%;

        &[src=''] {
            opacity: 0;
        }
    }
}

.top_operate,
.bottom_operate {
    position: absolute;
    z-index: 4;
    margin: auto;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    visibility: hidden;
}

.top_operate {
    top: 0;
    padding: 2px 5px;
}

.bottom_operate {
    bottom: 4px;

    .operate_icon {
        margin-left: 4px;
    }
}

.snap_pic,
.compare_pic {
    width: 100%;
}

.info_show_container {
    width: 100%;
    display: flex;
    font-size: 14px;
    position: relative;

    .info_show_snap {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        flex-shrink: 1;

        & > div {
            margin-top: 4px;
            width: 100%;
            text-align: center;
        }
    }
}

.similarity {
    width: 110px;
    height: 24px;
    position: absolute;
    top: -25px;
    left: 0;
    right: 0;
    margin: auto;
    margin-top: 0;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;

    &-value {
        z-index: 1;
        font-size: 15px;
        color: var(--color-white);
    }

    .Sprite {
        width: 100%;
        height: 100%;
        position: absolute;
        left: 0;
        right: 0;
        margin: auto;
        z-index: 0;
    }
}
</style>
