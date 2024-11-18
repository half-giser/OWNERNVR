<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-07-29 14:15:40
 * @Description: 新建录像模式
-->
<template>
    <el-dialog
        width="700"
        :title="Translate('IDCS_ADD_RECORD_MODE')"
        :destroy-on-close="true"
    >
        <div class="recModeList">
            <el-checkbox-group
                v-model="selectedEvents"
                class="line-break stripe"
            >
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
            <div class="base-btn-box">
                <el-button @click="$emit('confirm', selectedEvents.slice(0))">{{ Translate('IDCS_OK') }}</el-button>
                <el-button @click="$emit('close')">{{ Translate('IDCS_CANCEL') }}</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./RecordModeAdvancePop.v.ts"></script>
