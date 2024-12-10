<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-09 15:29:39
 * @Description: 抓拍弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_SNAP_DETAIL')"
        :width="950"
        @opened="open"
    >
        <div>
            <div class="info">
                <div class="title">{{ Translate('IDCS_BASIC_INFO') }}</div>
                <el-form>
                    <el-form-item>
                        <el-form-item :label="Translate('IDCS_SNAP_TIME')">{{ displayTime(current.timestamp) }}</el-form-item>
                        <el-form-item :label="Translate('IDCS_SNAP_ADDRESS')">{{ current.chlName }}</el-form-item>
                    </el-form-item>
                    <el-form-item>
                        <el-form-item :label="Translate('IDCS_EVENT_TYPE')">{{ displayEventType(current.eventType) }}</el-form-item>
                        <el-form-item :label="Translate('IDCS_TARGET_TYPE')">{{ displayTargetType(current.targetType) }}</el-form-item>
                    </el-form-item>
                </el-form>
            </div>
            <div class="snap">
                <div>
                    <div class="title">{{ Translate('IDCS_FACE_SNAP_IMAGE') }}</div>
                    <img
                        :src="current.pic"
                        class="snap-img"
                    />
                </div>
                <div>
                    <div class="title">{{ Translate('IDCS_PANORAMA') }}</div>
                    <div class="panorama">
                        <img
                            :src="current.panorama"
                            class="panorama-img"
                        />
                        <canvas
                            ref="canvas"
                            :width="pageData.canvasWidth"
                            :height="pageData.canvasHeight"
                        ></canvas>
                    </div>
                </div>
            </div>
            <div
                v-show="infoList.length"
                class="attr"
            >
                <div class="title">{{ infoListTitle }}</div>
                <div class="attr-list">
                    <div
                        v-for="item in infoList"
                        :key="`${item.label}-${item.value}`"
                        class="row"
                    >
                        <label>{{ item.label }}</label>
                        <span>{{ item.value }}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="base-btn-box space-between">
            <div>
                <el-button
                    v-show="isAddBtn"
                    @click="add"
                >
                    {{ Translate('IDCS_REGISTER') }}
                </el-button>
                <el-button
                    v-show="showSearch"
                    @click="search"
                >
                    {{ Translate('IDCS_SEARCH') }}
                </el-button>
                <el-button @click="playRec">{{ Translate('IDCS_REPLAY') }}</el-button>
            </div>
            <div>
                <el-button
                    :disabled="pageData.currentIndex <= 0"
                    @click="previous"
                >
                    {{ Translate('IDCS_PREVIOUS') }}
                </el-button>
                <el-button
                    :disabled="pageData.currentIndex >= list.length - 1"
                    @click="next"
                >
                    {{ Translate('IDCS_NEXT') }}
                </el-button>
                <el-button @click="close">{{ Translate('IDCS_EXIT') }}</el-button>
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./IntelBaseSnapPop.v.ts"></script>

<style lang="scss" scoped>
.info {
    border-bottom: 1px solid var(--input-border);
    margin: 10px 0;
}

.title {
    border-left: 3px solid var(--content-border);
    height: 30px;
    line-height: 30px;
    padding-left: 15px;
}

.row {
    display: flex;
    padding: 10px 0;

    label {
        width: 135px;
        flex-shrink: 0;

        &::after {
            content: ' : ';
        }
    }

    span {
        width: 100%;
    }
}

.snap {
    display: flex;
    margin: 10px 0;

    & > div {
        width: 50%;
    }

    &-img {
        width: 185px;
        height: 215px;
        margin: 10px 0 0 10px;
        background-color: var(--bg-button-disabled);
    }
}

.panorama {
    position: relative;
    background-color: var(--bg-button-disabled);
    width: 400px;
    height: 215px;
    margin: 10px 0 0 10px;

    img {
        width: 100%;
        height: 100%;
    }

    canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }
}

.attr {
    margin: 10px 0;
    width: 100%;

    &-list {
        margin-top: 10px;
        box-sizing: border-box;
        padding: 10px;
        border: 1px solid var(--content-border);
        display: flex;
        flex-wrap: wrap;
    }

    .row {
        width: 50%;
    }
}
</style>
