<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-07-29 14:15:40
 * @Description: 自动模式通道码流参数配置
 * @LastEditors: tengxiang tengxiang@tvt.net.cn
 * @LastEditTime: 2024-07-31 16:18:20
-->
<template>
    <el-dialog
        draggable
        center
        width="1270px"
        :title="pageData.mainTitle"
        :close-on-click-modal="false"
        :destroy-on-close="true"
        @open="onOpen"
    >
        <el-menu
            v-show="pageData.tabs.length > 1"
            :default-active="pageData.tabs.length > 0 ? pageData.tabs[0].value : ''"
            class="el-menu-demo"
            mode="horizontal"
            @select="tabSeleced"
        >
            <el-menu-item
                v-for="item in pageData.tabs"
                :key="item.value"
                :index="item.value"
            >
                {{ item.label }}
            </el-menu-item>
        </el-menu>
        <!-- TODO: 引用录像码流配置公共组件 -->
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="setData">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="$emit('close', false)">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./RecordModeStreamPop.v"></script>

<style lang="scss" scoped>
.el-menu {
    --el-menu-horizontal-height: 30px;
}
</style>
