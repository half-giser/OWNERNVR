<!--
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-06-24 20:38:29
 * @Description: 通用的日期选择，前一个/后一个日期组件
-->

<template>
    <div id="BaseDateSelectPreNextBtnView">
        <BaseImgSprite
            file="datePicker"
            :chunk="4"
            :index="0"
            :hover-index="0"
            :active-index="0"
            @click="handlePre"
        />
        <el-text
            class="label padding_label"
            :title="selectedDateInfo.selectedDateForShow"
            truncated
        >
            {{ selectedDateInfo.selectedDateForShow }}
        </el-text>
        <BaseImgSprite
            file="datePicker"
            :chunk="4"
            :index="3"
            :hover-index="3"
            :active-index="3"
            @click="handleNext"
        />
    </div>
</template>

<script lang="ts" src="./BaseDateSelectPreNextBtn.v.ts"></script>

<style scoped lang="scss">
#BaseDateSelectPreNextBtnView {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    .label {
        color: var(--text-dark);
        cursor: text;
    }
    .padding_label {
        margin: 0px;
        padding: 0px 20px;
    }
}
</style>
