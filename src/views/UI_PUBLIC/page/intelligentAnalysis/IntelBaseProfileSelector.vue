<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-05 19:35:04
 * @Description: 智能分析 属性选择器
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
                :chunk="4"
            />
        </div>
        <el-dialog
            v-model="pageData.isPop"
            width="1000"
            :title="Translate('IDCS_ATTRIBUTE')"
        >
            <el-scrollbar :height="650">
                <div
                    v-for="item1 in options"
                    :key="item1.value"
                >
                    <div
                        v-for="item2 in item1.children"
                        :key="item2.value"
                        class="sub-box"
                    >
                        <el-checkbox
                            v-if="!(item2.value === 'upperClothColor' || item2.value === 'hat' || item2.value === 'glasses')"
                            v-model="attrCheckVals[item1.value][item2.value]"
                            :label="item2.value === 'upperClothType' ? Translate('IDCS_UPPER_CLOTH') : item2.value === 'mask' ? Translate('IDCS_DECORATE') : item2.label"
                            @change="handleCheckboxChange(item1.value, item2.value)"
                        />
                        <div
                            v-if="item2.value === 'upperClothType' || item2.value === 'upperClothColor'"
                            class="label"
                        >
                            {{ Translate(item2.value === 'upperClothType' ? 'IDCS_TYPE' : 'IDCS_COLOR') }}
                        </div>
                        <div class="btn-box">
                            <template v-if="item2.showType === 'color'">
                                <div
                                    v-for="item3 in item2.children"
                                    :key="item3.value"
                                    :title="item3.label"
                                    :class="`color-btn ${item3.value}`"
                                >
                                    <BaseImgSpriteBtn
                                        :file="`${item3.value}Btn`"
                                        :title="item3.label"
                                        :active="selected[item1.value][item2.value].includes(item3.value)"
                                        @click="change(item1.value, item2.value, item3.value)"
                                    />
                                    <div
                                        class="color-btn-border"
                                        :class="{
                                            active: selected[item1.value][item2.value].includes(item3.value),
                                        }"
                                        @click="change(item1.value, item2.value, item3.value)"
                                    ></div>
                                </div>
                            </template>
                            <template v-else-if="item2.showType === 'select'">
                                <el-select-v2
                                    v-model="selected[item1.value][item2.value][0]"
                                    :options="item2.children"
                                />
                            </template>
                            <template v-else>
                                <div
                                    v-for="item3 in item2.children"
                                    :key="item3.value"
                                    :label="item3.label"
                                    class="btn"
                                    :class="{
                                        active: selected[item1.value][item2.value].includes(item3.value),
                                    }"
                                    @click="change(item1.value, item2.value, item3.value)"
                                >
                                    {{ item3.label }}
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
            </el-scrollbar>
            <div class="base-btn-box">
                <el-button @click="reset">{{ Translate('IDCS_RESET') }}</el-button>
                <el-button @click="confirm">{{ Translate('IDCS_OK') }}</el-button>
                <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script lang="ts" src="./IntelBaseProfileSelector.v.ts"></script>

<style lang="scss" scoped>
.title {
    font-size: 18px;
    font-weight: bold;
    padding: 0 10px;
    margin: 15px 0;
    border-left: 5px solid var(--content-border);
}

.sub-box {
    padding-left: 15px;
    width: 100%;
    box-sizing: border-box;
}

.tri-box {
    display: flex;
    width: 100%;
}

.label {
    width: 200px;
    flex-shrink: 0;
    line-height: 150%;
    margin-left: 20px;
}

.btn-box {
    display: flex;
    flex-wrap: wrap;
    margin-left: 10px;
}

.btn {
    width: 100px;
    height: 24px;
    line-height: 24px;
    cursor: pointer;
    margin: 5px 10px;
    text-align: center;
    font-size: 12px;
    border: 1px solid var(--input-border);
    user-select: none;

    &.active {
        border-color: var(--primary);
        color: var(--primary);
    }
}

.color-btn {
    margin: 5px;
    position: relative;

    .color-btn-border {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 1px solid var(--input-border);
        position: absolute;
        top: 5px;
        left: 5px;
        box-sizing: border-box;
        cursor: pointer;

        &.active {
            border-color: var(--primary);
        }
    }
}

.el-select {
    width: 102px;
    margin: 5px 10px;
}

:deep(.el-select__wrapper) {
    border-radius: 0;
    font-size: 12px;
    text-align: center;
    height: 26px;
}

.el-checkbox {
    margin: 15px 0;
}

:deep(.el-checkbox__label) {
    font-size: 18px;
    font-weight: bold;
}
</style>
