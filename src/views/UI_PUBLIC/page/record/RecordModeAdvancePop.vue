<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-07-29 14:15:40
 * @Description: 新建录像模式
-->
<template>
    <el-dialog
        width="700"
        :title="Translate('IDCS_ADD_RECORD_MODE')"
        @open="open"
    >
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
                    :disabled="!!item.disabled"
                >
                    <div class="checkbox">
                        {{ item.text }}
                        <BaseImgSprite
                            v-if="item.id === 'INTELLIGENT'"
                            :key="item.id"
                            file="aq"
                            :index="1"
                            :hover-index="0"
                            :chunk="3"
                            :title="Translate('IDCS_INTELLIGETN_RECORD_TIPS').formatForLang(Translate('IDCS_AI_AND_EVENT'), Translate('IDCS_INTELLIGENT_CONFIG'), Translate('IDCS_PICTURE_COMPARSION'))"
                        />
                    </div>
                </el-checkbox>
            </template>
        </el-checkbox-group>
        <div class="base-btn-box">
            <el-button @click="$emit('confirm', selectedEvents.slice(0))">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="$emit('close')">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./RecordModeAdvancePop.v.ts"></script>
