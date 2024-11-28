<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-09 17:38:29
 * @Description: 图片浏览器
-->
<template>
    <el-dialog
        :title="Translate('IDCS_IMAGE_BROWSE')"
        :width="600"
        @open="open"
        @close="close"
    >
        <div>
            <el-form>
                <el-form-item :label="Translate('IDCS_IP_CHANNEL_NAME')">
                    {{ item.chlName }}
                </el-form-item>
                <el-form-item :label="Translate('IDCS_TIME')">
                    {{ displayDateTime(item.captureTimeStamp) }}
                </el-form-item>
                <el-form-item :label="Translate('IDCS_CREATE_USER')">
                    {{ item.creator }}
                </el-form-item>
            </el-form>
            <img
                class="pic"
                :src="getImg()"
            />
            <div class="btns">
                <el-tooltip :content="Translate('IDCS_EXPORT')">
                    <BaseImgSprite
                        file="image_preview_export"
                        :index="0"
                        :hover-index="1"
                        :chunk="4"
                        :disabled="!pageData.paused"
                        @click="$emit('export')"
                    />
                </el-tooltip>
                <el-tooltip :content="Translate('IDCS_PREVIOUS_IMAGE')">
                    <BaseImgSprite
                        file="image_preview_pre"
                        :index="0"
                        :hover-index="1"
                        :chunk="4"
                        :disabled="item.index === 1 || !pageData.paused"
                        :disabled-index="3"
                        @click="$emit('prev')"
                    />
                </el-tooltip>
                <el-tooltip :content="Translate('IDCS_PLAY')">
                    <BaseImgSprite
                        v-show="pageData.paused"
                        file="image_preview_play"
                        :index="0"
                        :hover-index="1"
                        :chunk="4"
                        @click="play"
                    />
                </el-tooltip>
                <el-tooltip :content="Translate('IDCS_PAUSE')">
                    <BaseImgSprite
                        v-show="!pageData.paused"
                        file="image_preview_pause"
                        :index="0"
                        :hover-index="1"
                        :chunk="4"
                        @click="pause"
                    />
                </el-tooltip>
                <el-tooltip :content="Translate('IDCS_NEXT_IMAGE')">
                    <BaseImgSprite
                        file="image_preview_next"
                        :index="0"
                        :hover-index="1"
                        :chunk="4"
                        :disabled="item.index === total || !pageData.paused"
                        :disabled-index="3"
                        @click="$emit('next')"
                    />
                </el-tooltip>
                <el-tooltip :content="Translate('IDCS_DELETE')">
                    <BaseImgSprite
                        file="image_preview_delete"
                        :index="0"
                        :hover-index="1"
                        :chunk="4"
                        :disabled="!pageData.paused"
                        :disabled-index="3"
                        @click="$emit('delete')"
                    />
                </el-tooltip>
            </div>
        </div>
        <div class="base-btn-box">
            <el-button @click="close()">{{ Translate('IDCS_CLOSE') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./BackupImgPlayerPop.v.ts"></script>

<style lang="scss" scoped>
.pic {
    width: 100%;
    height: 381px;
    padding: 0 10px;
    box-sizing: border-box;
}

.btns {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 10px;

    & > * {
        margin: 0 5px;
    }
}
</style>
