<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-12 14:37:28
 * @Description: POS信息弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-27 10:44:11
-->
<template>
    <el-dialog
        :title="Translate('IDCS_POS_INFORMATION')"
        :width="600"
        @open="open"
    >
        <div>
            <div class="form">
                <div>
                    <label>{{ Translate('IDCS_POS_SOURCE') }}</label>
                    <span>{{ pageData.name || item.chlName }}</span>
                </div>
                <div>
                    <label>{{ Translate('IDCS_START_TIME') }}</label>
                    <span>{{ displayDateTime(item.startTime) }}</span>
                </div>
                <div>
                    <label>{{ Translate('IDCS_END_TIME') }}</label>
                    <span>{{ displayDateTime(item.endTime) }}</span>
                </div>
                <div>
                    <label>{{ Translate('IDCS_INFORMATION') }}</label>
                </div>
                <div
                    v-clean-html="pageData.info"
                    class="textarea"
                ></div>
            </div>
        </div>
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="close()">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./BackupPosInfoPop.v.ts"></script>

<style lang="scss" scoped>
.form {
    & > div {
        padding: 0;
        height: 30px;
        line-height: 30px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        font-size: 15px;

        label {
            width: 150px;
            flex-shrink: 0;
        }

        &.textarea {
            display: block;
            width: 100%;
            height: 330px;
            margin-top: 5px;
            border: 1px solid var(--content-border);
            box-sizing: border-box;
            padding: 5px;
        }
    }
}
</style>
