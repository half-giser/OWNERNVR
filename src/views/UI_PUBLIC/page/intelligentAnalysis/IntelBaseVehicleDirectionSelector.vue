<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-06 11:18:03
 * @Description: 智能分析 - 进出口方向 选择框
-->
<template>
    <div>
        <el-popover
            v-model:visible="pageData.isPop"
            :width="300"
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
            <el-checkbox-group
                v-model="selected"
                class="base-intel-checkbox-group"
            >
                <el-checkbox
                    v-for="item in pageData.options"
                    :key="item.value"
                    :value="item.value"
                    :label="item.label"
                />
            </el-checkbox-group>
            <div class="base-btn-box">
                <el-button @click="reset">{{ Translate('IDCS_RESET') }}</el-button>
                <el-button @click="confirm">{{ Translate('IDCS_OK') }}</el-button>
            </div>
        </el-popover>
    </div>
</template>

<script lang="ts" src="./IntelBaseVehicleDirectionSelector.v.ts"></script>
