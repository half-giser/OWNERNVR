<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-05 17:02:01
 * @Description: 智能分析 - 时间日期选择器
-->
<template>
    <div>
        <el-popover
            v-model:visible="pageData.isPop"
            width="388"
            popper-class="selector"
        >
            <template #reference>
                <div class="base-intel-placeholder">
                    <div class="text-ellipsis">{{ content }}</div>
                    <BaseImgSprite
                        file="arrow"
                        :chunk="4"
                    />
                </div>
            </template>
            <div class="btns">
                <div
                    v-for="item in pageData.buttons"
                    :key="item.value"
                    class="btn"
                    :class="{
                        active: pageData.dateRangeType === item.value,
                    }"
                    @click="changeType(item.value)"
                >
                    {{ item.label }}
                </div>
            </div>
            <el-form
                :style="{
                    '--form-label-width': '80px',
                }"
            >
                <el-form-item :label="Translate('IDCS_START_TIME')">
                    <BaseDatePicker
                        v-model="formData.startTime"
                        type="datetime"
                        :teleported="false"
                        @change="changeType('custom')"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_END_TIME')">
                    <BaseDatePicker
                        v-model="formData.endTime"
                        type="datetime"
                        :teleported="false"
                        @change="changeType('custom')"
                    />
                </el-form-item>
            </el-form>
            <div class="base-btn-box">
                <el-button @click="confirm">{{ Translate('IDCS_OK') }}</el-button>
            </div>
        </el-popover>
    </div>
</template>

<script lang="ts" src="./IntelBaseDateTimeSelector.v.ts"></script>

<style lang="scss" scoped>
.btns {
    display: flex;
    flex-wrap: wrap;
}

.btn {
    width: 100px;
    height: 30px;
    background-color: var(--btn-bg);
    line-height: 30px;
    cursor: pointer;
    margin-right: 7px;
    margin-bottom: 5px;
    color: var(--btn-text);
    text-align: center;
    font-size: 12px;
    user-select: none;

    &:nth-child(3n) {
        margin-right: 0;
    }

    &.active {
        background-color: var(--primary);
    }
}
</style>
