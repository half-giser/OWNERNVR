<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-09 15:29:39
 * @Description: 抓拍弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-09 19:25:10
-->
<template>
    <el-dialog
        :title="Translate('IDCS_SNAP_DETAIL')"
        :width="950"
        align-center
        draggable
        @opened="open"
    >
        <div>
            <div class="info">
                <div class="title">{{ Translate('IDCS_BASIC_INFO') }}</div>
                <div class="row">
                    <label>{{ Translate('IDCS_SNAP_TIME') }}</label>
                    <span>{{ displayTime(current.timestamp) }}</span>
                    <label>{{ Translate('IDCS_SNAP_ADDRESS') }}</label>
                    <span>{{ current.chlName }}</span>
                </div>
                <div class="row">
                    <label>{{ Translate('IDCS_EVENT_TYPE') }}</label>
                    <span>{{ displayEventType(current.eventType) }}</span>
                    <label>{{ Translate('IDCS_TARGET_TYPE') }}</label>
                    <span>{{ displayTargetType(current.targetType) }}</span>
                </div>
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
            <!-- <div
                v-show="displayInfo.length"
                class="attr"
            >
                <div class="title">{{ displayInfoTitle }}</div>
                <div class="attr-list">
                    <div
                        v-for="item in displayInfo"
                        :key="item.name + item.value"
                        class="row"
                    >
                        <label>{{ item.name }} :</label><span>{{ item.value }}</span>
                    </div>
                </div>
            </div> -->
        </div>
        <template #footer>
            <el-row>
                <el-col
                    :span="12"
                    class="el-col-flex-start"
                >
                    <el-button @click="playRec">{{ Translate('IDCS_REPLAY') }}</el-button>
                </el-col>
                <el-col
                    :span="12"
                    class="el-col-flex-end"
                >
                    <el-button
                        :disabled="pageData.currentIndex <= 0"
                        @click="previous"
                        >{{ Translate('IDCS_PREVIOUS') }}</el-button
                    >
                    <el-button
                        :disabled="pageData.currentIndex >= list.length - 1"
                        @click="next"
                        >{{ Translate('IDCS_NEXT') }}</el-button
                    >
                    <el-button @click="close">{{ Translate('IDCS_EXIT') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./IntelBaseSnapPop.v.ts"></script>

<style lang="scss" scoped>
.info {
    border-bottom: 1px solid var(--border-color7);
    margin: 10px 0;
    padding-bottom: 20px;
}

.title {
    border-left: 3px solid var(--border-color2);
    height: 30px;
    line-height: 30px;
    padding-left: 15px;
    // margin-left: 15px;
}

.row {
    display: flex;
    padding: 10px 0;

    label {
        width: 15%;

        &:after {
            content: ' : ';
        }
    }

    span {
        width: 35%;
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
}
</style>
