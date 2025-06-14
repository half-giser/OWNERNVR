<!--
 * @Date: 2025-05-19 13:38:48
 * @Description: 现场预览 - RS485
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <div>
        <BasePopover
            v-model:visible="pageData.isRS485Pop"
            placement="top"
            :width="Math.ceil(pageData.list.length / 9) * 110"
            popper-class="no-padding"
            :disabled="!pageData.switch"
        >
            <template #reference>
                <div class="refer">
                    <BaseImgSpriteBtn
                        file="custom_operate"
                        :title="pageData.name"
                        :active="pageData.isRS485Pop"
                        :disabled="!pageData.switch"
                    />
                </div>
            </template>
            <div>
                <div class="base-head-box title">{{ pageData.name }}</div>
                <div class="box">
                    <el-button
                        v-for="item in pageData.list"
                        :key="item.value"
                        @click="setData(item.value)"
                    >
                        {{ item.label }}
                    </el-button>
                </div>
            </div>
        </BasePopover>
    </div>
</template>

<script lang="ts" src="./LiveScreenRS485Pop.v.ts"></script>

<style lang="less" scoped>
.refer {
    width: 34px;
    height: 50px;
    display: flex;
    align-items: center;
    margin: 0 5px;
}

.title {
    padding-left: 0;
    text-align: center;
}

.box {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    height: 36px * 9;
    flex-wrap: wrap;

    .el-button {
        margin: 5px;
        width: 100px;
        max-width: 100px;
        overflow: hidden;
    }
}
</style>
