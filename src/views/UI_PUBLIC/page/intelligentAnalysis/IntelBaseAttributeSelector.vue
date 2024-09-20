<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-04 14:36:21
 * @Description: 智能分析 属性选择器
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-19 17:03:12
-->
<template>
    <div>
        <el-popover
            v-model:visible="pageData.isPop"
            placement="bottom"
            :width="range.length === 1 ? 300 : 400"
            trigger="click"
            :show-after="0"
            :hide-after="0"
        >
            <template #reference>
                <div class="base-intel-placeholder">
                    <div class="text-ellipsis">{{ content }}</div>
                    <BaseImgSprite
                        file="arrow"
                        :index="0"
                        :chunk="4"
                    />
                </div>
            </template>
            <el-scrollbar max-height="300">
                <el-checkbox-group
                    v-if="range.length === 1 && range[0] === 'vehicle'"
                    v-model="selectedVehicle"
                    class="base-intel-checkbox-group"
                >
                    <el-checkbox
                        v-for="item in pageData.vehicleOptions"
                        :key="item.value"
                        :value="item.value"
                        >{{ item.label }}</el-checkbox
                    >
                </el-checkbox-group>
                <el-form
                    v-else-if="range.length > 1"
                    label-position="left"
                    :style="{
                        '--form-label-width': '100px',
                    }"
                >
                    <el-form-item :label="Translate('IDCS_FIGURE')">
                        <el-checkbox-group
                            v-model="selectedPerson"
                            class="base-intel-checkbox-group"
                        >
                            <el-checkbox
                                v-for="item in pageData.personOptions"
                                :key="item.value"
                                :value="item.value"
                                >{{ item.label }}</el-checkbox
                            >
                        </el-checkbox-group>
                    </el-form-item>
                    <el-form-item :label="Translate('IDCS_VEHICLE')">
                        <el-checkbox-group
                            v-model="selectedVehicle"
                            class="base-intel-checkbox-group"
                        >
                            <el-checkbox
                                v-for="item in pageData.vehicleOptions"
                                :key="item.value"
                                :value="item.value"
                                >{{ item.label }}</el-checkbox
                            >
                        </el-checkbox-group>
                    </el-form-item>
                </el-form>
            </el-scrollbar>
            <div class="base-btn-box">
                <el-button @click="reset">{{ Translate('IDCS_RESET') }}</el-button>
                <el-button @click="confirm">{{ Translate('IDCS_OK') }}</el-button>
            </div>
        </el-popover>
    </div>
</template>

<script lang="ts" src="./IntelBaseAttributeSelector.v.ts"></script>

<style lang="scss">
@import '@/views/UI_PUBLIC/publicStyle/intelligentAnalysis.scss';
</style>
