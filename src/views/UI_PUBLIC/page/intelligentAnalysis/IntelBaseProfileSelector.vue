<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-05 19:35:04
 * @Description: 智能分析 属性选择器
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-06 16:43:13
-->
<template>
    <div>
        <div
            class="base-intel-placeholder"
            @click="pageData.isPop = !pageData.isPop"
        >
            <div class="text-ellipsis">{{ content }}</div>
            <BaseImgSprite
                file="arrow"
                :index="0"
                :chunk="4"
            />
        </div>
        <el-dialog
            v-model="pageData.isPop"
            width="1100"
            :title="Translate('IDCS_ATTRIBUTE')"
        >
            <el-scrollbar :height="550">
                <div
                    v-for="item1 in options"
                    :key="item1.value"
                >
                    <div class="title">{{ item1.label }}</div>
                    <div
                        v-for="item2 in item1.children"
                        :key="item2.value"
                        class="sub-box"
                    >
                        <div class="sub-title">{{ item2.label }}</div>
                        <div
                            v-for="item3 in item2.children"
                            :key="item3.value"
                            class="tri-box"
                        >
                            <div class="label">{{ item3.label }}</div>
                            <div class="btn-box">
                                <template v-if="item3.value === 'brand'">
                                    <el-select v-model="selected[item1.value][item3.value][0]">
                                        <el-option
                                            v-for="item4 in item3.children"
                                            :key="item4.value"
                                            :value="item4.value"
                                            :label="item4.label"
                                        />
                                    </el-select>
                                </template>
                                <template v-else>
                                    <div
                                        v-for="item4 in item3.children"
                                        :key="item4.value"
                                        :label="item4.label"
                                        class="btn"
                                        :class="{
                                            active: selected[item1.value][item3.value].includes(item4.value),
                                        }"
                                        @click="change(item1.value, item3.value, item4.value)"
                                    >
                                        {{ item4.label }}
                                    </div>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>
            </el-scrollbar>
            <template #footer>
                <el-row>
                    <el-col
                        :span="24"
                        class="el-col-flex-end"
                    >
                        <el-button @click="reset">{{ Translate('IDCS_RESET') }}</el-button>
                        <el-button @click="confirm">{{ Translate('IDCS_OK') }}</el-button>
                        <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
                    </el-col>
                </el-row>
            </template>
        </el-dialog>
    </div>
</template>

<script lang="ts" src="./IntelBaseProfileSelector.v.ts"></script>

<style lang="scss">
@import '@/views/UI_PUBLIC/publicStyle/intelligentAnalysis.scss';
</style>

<style lang="scss" scoped>
.title {
    font-size: 18px;
    font-weight: bold;
    padding: 0 10px;
    margin: 15px 0;
    border-left: 5px solid var(--border-color8);
}

.sub-box {
    padding-left: 15px;
    width: 100%;
    box-sizing: border-box;
}

.sub-title {
    font-size: 18px;
    font-weight: bold;
    margin: 15px 0;
}

.tri-box {
    display: flex;
    width: 100%;
}

.label {
    width: 200px;
    flex-shrink: 0;
    line-height: 40px;
    &:after {
        content: ' : ';
    }
}

.btn-box {
    display: flex;
    flex-wrap: wrap;
}

.btn {
    width: 100px;
    height: 30px;
    line-height: 30px;
    cursor: pointer;
    margin: 5px 10px;
    text-align: center;
    font-size: 12px;
    border: 1px solid var(--border-color7);

    &.active {
        border-color: var(--primary--04);
        color: var(--primary--04);
    }
}

.el-select {
    width: 102px;
    height: 30px;
    line-height: 30px;
    margin: 5px 10px;
}

:deep(.el-select__wrapper) {
    border-radius: 0;
    font-size: 12px;
    text-align: center;
}
</style>
