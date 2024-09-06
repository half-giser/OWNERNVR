<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-02 16:42:23
 * @Description: 导出车牌库弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-03 19:57:24
-->
<template>
    <el-dialog
        :title="Translate('IDCS_EXPORT')"
        :show-close="false"
        :width="600"
        align-center
        draggable
        @open="open"
    >
        <div>
            <el-progress
                :percentage="progress"
                :stroke-width="14"
            />
            <div class="chunk">{{ progress }} %</div>
            <p class="tip">{{ Translate('IDCS_DOWNLOADING') }}</p>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./IntelLicencePlateDBExportPop.v.ts"></script>

<style lang="scss" scoped>
.chunk {
    margin-top: 10px;
}

.tip {
    text-align: center;
}
</style>
