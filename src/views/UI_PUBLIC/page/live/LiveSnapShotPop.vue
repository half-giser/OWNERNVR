<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-23 21:22:11
 * @Description: 查看原图弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-29 17:52:44
-->
<template>
    <el-dialog
        :title="Translate('IDCS_VIEW_SNAPSHOT')"
        align-center
        draggable
        width="540px"
        @opened="open"
    >
        <div class="img">
            <img :src="displayBase64Img(pic)" />
            <canvas
                ref="canvas"
                :width="pageData.canvasWidth"
                :height="pageData.canvasHeight"
            ></canvas>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./LiveSnapShotPop.v.ts"></script>

<style lang="scss" scoped>
.img {
    position: relative;
    width: 500px;
    height: 300px;
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
</style>
