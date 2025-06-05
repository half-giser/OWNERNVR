<!--
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2025-05-13 15:53:18
 * @Description: 查看ipc升级信息详情
-->
<template>
    <el-dialog
        :title="Translate('IDCS_DETAIL')"
        width="600"
    >
        <el-form class="stripe">
            <el-form-item :label="Translate('IDCS_CHANNEL_NAME')">
                {{ item.chlName }}
            </el-form-item>
            <el-form-item :label="Translate('IDCS_ADDRESS')">
                {{ item.ip }}
            </el-form-item>
            <el-form-item :label="Translate('IDCS_ONLINE_UPGRADE_CURRENT_VER')">
                {{ item.version }}
            </el-form-item>
            <el-form-item :label="Translate('IDCS_UPGRADE_NEW_VER')">
                {{ item.newVersion }}
            </el-form-item>
            <el-form-item :label="Translate('IDCS_NEW_FEATURES')">
                <el-input
                    type="textarea"
                    :readonly="true"
                    :model-value="item.newVersionNote"
                />
            </el-form-item>
        </el-form>
        <div class="base-btn-box">
            <el-button
                :disabled="activeIndex <= 0"
                @click="prev"
            >
                {{ Translate('IDCS_PREVIOUS') }}
            </el-button>
            <el-button
                :disabled="activeIndex >= data.length - 1"
                @click="next"
            >
                {{ Translate('IDCS_NEXT') }}
            </el-button>
            <el-button @click="close">{{ Translate('IDCS_CLOSE') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./IpcInfoDetailPop.v.ts"></script>

<style lang="scss" scoped></style>
