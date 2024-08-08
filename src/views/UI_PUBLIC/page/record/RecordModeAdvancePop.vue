<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-07-29 14:15:40
 * @Description: 新建录像模式
 * @LastEditors: tengxiang tengxiang@tvt.net.cn
 * @LastEditTime: 2024-08-02 14:37:24
-->
<template>
    <el-dialog
        draggable
        center
        width="700px"
        :title="Translate('IDCS_ADD_RECORD_MODE')"
        :close-on-click-modal="false"
        :destroy-on-close="true"
    >
        <div class="recModeList">
            <el-checkbox-group v-model="selectedEvents">
                <template
                    v-for="item in advanceRecModes"
                    :key="item.id"
                >
                    <el-checkbox
                        v-if="item.id === 'INTENSIVE'"
                        :label="item.text"
                        :value="item.id"
                        :disabled="isIntensiveDisabled"
                    />
                    <el-checkbox
                        v-else
                        :label="item.text"
                        :value="item.id"
                    />
                </template>
            </el-checkbox-group>
        </div>
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="$emit('confirm', selectedEvents.slice(0))">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="$emit('close')">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./RecordModeAdvancePop.v.ts"></script>

<style lang="scss" scoped>
.el-checkbox-group {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    label {
        box-sizing: border-box;
        width: 100%;
        padding: 3px 0px 3px 30px;
    }

    label.el-checkbox:nth-child(odd) {
        background-color: unset;
    }

    label.el-checkbox:nth-child(even) {
        background-color: var(--bg-color5);
    }
}
</style>
