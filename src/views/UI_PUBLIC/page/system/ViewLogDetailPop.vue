<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-01 16:57:13
 * @Description: 查看日志详情
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-04 19:29:55
-->
<template>
    <el-dialog
        :title="Translate('IDCS_LOG_DETAIL_INFO')"
        width="600"
        draggable
        center
        @open="handleCombinedType"
    >
        <div class="ViewLogDetail stripe">
            <div>
                <label>{{ Translate('IDCS_SERIAL_NUMBER') }}</label>
                <span>{{ item.index }}</span>
            </div>
            <div>
                <label>{{ Translate('IDCS_LOG_TIME') }}</label>
                <span>{{ item.time }}</span>
            </div>
            <div>
                <label>{{ Translate('IDCS_TYPE') }}</label>
                <span>{{ `${item.mainType}----${item.subType}` }}</span>
            </div>
            <div>
                <label>{{ Translate('IDCS_USER') }}</label>
                <span>{{ item.userName }}</span>
            </div>
            <div>
                <label>{{ Translate('IDCS_DETAIL_INFO') }}</label>
                <span></span>
            </div>
            <div
                v-show="isContentPlainText"
                class="text-area"
            >
                <div>{{ item.content }}</div>
            </div>
            <div
                v-show="!isContentPlainText"
                class="combined-detail"
            >
                <div class="pic">
                    <div>
                        <div>{{ Translate('IDCS_SNAP_PICTURE') }}</div>
                        <div class="capture">
                            <img
                                v-show="pageData.captureImg"
                                :src="pageData.captureImg"
                            />
                        </div>
                    </div>
                    <div>
                        <div>{{ Translate('IDCS_ORIGINAL') }}</div>
                        <div class="scenes">
                            <img
                                v-show="pageData.scenesImg"
                                :src="pageData.scenesImg"
                            />
                        </div>
                    </div>
                </div>
                <div>
                    <span>{{ Translate('IDCS_NAME_PERSON') }} : </span>
                    <span>{{ pageData.imgName || Translate('IDCS_NULL') }}</span>
                </div>
                <div>
                    <span>{{ pageData.type1 || Translate('IDCS_FACE_MATCH') }} : </span>
                    <span>{{ pageData.name1 }}</span>
                </div>
                <div>
                    <span>{{ pageData.type2 || Translate('IDCS_SENSOR') }} : </span>
                    <span>{{ pageData.name2 }}</span>
                </div>
            </div>
        </div>
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button
                        :disabled="activeIndex <= 0"
                        @click="prev"
                        >{{ Translate('IDCS_PRE_LOG') }}</el-button
                    >
                    <el-button
                        :disabled="activeIndex >= data.length - 1"
                        @click="next"
                        >{{ Translate('IDCS_NEXT_LOG') }}</el-button
                    >
                    <el-button @click="close">{{ Translate('IDCS_CLOSE') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./ViewLogDetailPop.v.ts"></script>

<style lang="scss" scoped>
.ViewLogDetail {
    width: 100%;

    & > div {
        padding: 5px 10px;
        height: 40px;
        line-height: 30px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        font-size: 15px;

        label {
            width: 150px;
            flex-shrink: 0;
        }

        &:nth-child(even) {
            background-color: var(--table-stripe);
        }

        &.text-area {
            align-items: flex-start;
        }

        &.combined-detail {
            display: block;
            height: fit-content;
        }
    }

    .text-area {
        width: 100%;
        height: 100px;
        overflow-y: auto;
    }

    .combined-detail {
        .pic {
            display: flex;

            & > div:first-child {
                width: 150px;
            }

            & > div:last-child {
                margin-left: 10px;
                width: 210px;
            }
        }

        .capture {
            width: 100px;
            height: 100px;
            background-color: var(--subheading-bg);
        }

        .scenes {
            width: 210px;
            height: 140px;
            background-color: var(--subheading-bg);
        }

        img {
            width: 100%;
            height: 100%;
        }
    }
}
</style>
