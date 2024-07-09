<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-13 13:58:06
 * @Description:
-->
<template>
    <el-dialog
        v-model="dialogOpened"
        :title="Translate('IDCS_CHANNEL_PREVIEW')"
        width="642"
        align-center
        draggable
        @opened="opened"
        @close="close"
    >
        <div class="playerWrap">
            <BaseVideoPlayer
                v-if="dialogOpened"
                ref="playerRef"
                :split="1"
                @onready="ready"
            />
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./BaseLivePop.v.ts"></script>

<style scoped lang="scss">
.playerWrap {
    width: 600px;
    height: 450px;
    background-color: var(--bg-color5);
}
</style>
