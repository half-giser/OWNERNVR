<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-28 14:12:40
 * @Description:  实时过车记录 - 详情弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_VEHICLE_IN_OUT_DETAIL')"
        width="1200"
        @open="open"
    >
        <div class="dialog">
            <ParkLotSnapPanel
                :current="current"
                :current-index="pageData.index"
                :total="pageData.list.length"
                :show-enter-loading="pageData.isEnterImgLoading"
                :show-exit-loading="pageData.isExitImgLoading"
                @prev="handlePrev"
                @next="handleNext"
            />
            <div class="right">
                <ParkLotInfoPanel
                    :remark-switch="remarkSwitch"
                    type="edit"
                    :current="current"
                    @update-plate="$emit('updatePlate', pageData.index, $event)"
                />
                <div class="base-btn-box no-padding">
                    <BaseImgSpriteBtn
                        file="snap_exit"
                        :title="Translate('IDCS_EXIT')"
                        @click="close"
                    />
                </div>
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./ParkLotDetailPop.v.ts"></script>

<style lang="scss" scoped>
.wrap {
    width: 100%;
    display: flex;
}

.dialog {
    width: 100%;
    display: flex;
}

.right {
    margin-top: 30px;
    margin-left: 10px;

    .data {
        background-color: var(--parklog-bg);
    }
}
</style>
