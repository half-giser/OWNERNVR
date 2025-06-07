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
                @error="handleError"
            />
            <div class="btns">
                <BaseImgSpriteBtn
                    file="image_preview_export"
                    :disabled="!pageData.paused"
                    :title="Translate('IDCS_EXPORT')"
                    @click="$emit('export')"
                />
                <BaseImgSpriteBtn
                    file="image_preview_pre"
                    :title="Translate('IDCS_PREVIOUS_IMAGE')"
                    :disabled="item.index === 1 || !pageData.paused"
                    :disabled-index="3"
                    @click="$emit('prev')"
                />
                <BaseImgSpriteBtn
                    v-show="pageData.paused"
                    :title="Translate('IDCS_PLAY')"
                    file="image_preview_play"
                    @click="play"
                />
                <BaseImgSpriteBtn
                    v-show="!pageData.paused"
                    :title="Translate('IDCS_PAUSE')"
                    file="image_preview_pause"
                    @click="pause"
                />
                <BaseImgSpriteBtn
                    file="image_preview_next"
                    :title="Translate('IDCS_NEXT_IMAGE')"
                    :disabled="item.index === total || !pageData.paused"
                    @click="$emit('next')"
                />
                <BaseImgSpriteBtn
                    file="image_preview_delete"
                    :disabled="!pageData.paused"
                    :title="Translate('IDCS_DELETE')"
                    @click="$emit('delete')"
                />
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
