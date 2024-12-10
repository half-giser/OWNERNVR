<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-01 16:57:13
 * @Description: 查看日志详情
-->
<template>
    <el-dialog
        :title="Translate('IDCS_LOG_DETAIL_INFO')"
        width="600"
        @open="handleCombinedType"
    >
        <el-form
            class="stripe"
            :style="{
                '--form-label-width': '150px',
            }"
        >
            <el-form-item :label="Translate('IDCS_SERIAL_NUMBER')">
                {{ item.index }}
            </el-form-item>
            <el-form-item :label="Translate('IDCS_LOG_TIME')">
                {{ item.time }}
            </el-form-item>
            <el-form-item :label="Translate('IDCS_TYPE')">
                {{ `${item.mainType}----${item.subType}` }}
            </el-form-item>
            <el-form-item :label="Translate('IDCS_USER')">
                {{ item.userName }}
            </el-form-item>
            <el-form-item :label="Translate('IDCS_DETAIL_INFO')" />
            <el-form-item v-show="isContentPlainText">
                <el-scrollbar
                    class="text-area"
                    height="100"
                >
                    {{ item.content }}
                </el-scrollbar>
            </el-form-item>
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
        </el-form>
        <div class="base-btn-box">
            <el-button
                :disabled="activeIndex <= 0"
                @click="prev"
            >
                {{ Translate('IDCS_PRE_LOG') }}
            </el-button>
            <el-button
                :disabled="activeIndex >= data.length - 1"
                @click="next"
            >
                {{ Translate('IDCS_NEXT_LOG') }}
            </el-button>
            <el-button @click="close">{{ Translate('IDCS_CLOSE') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./ViewLogDetailPop.v.ts"></script>

<style lang="scss" scoped>
.combined-detail {
    display: block;
    height: fit-content;

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

.text-area {
    padding-right: 10px;
}
</style>
