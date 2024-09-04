<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-28 17:54:08
 * @Description: 智能分析-引擎配置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-29 09:41:17
-->
<template>
    <div class="base-flex-box">
        <el-form label-position="left">
            <el-form-item>
                <template #label>
                    <el-checkbox v-model="formData.supportAI">{{ Translate('IDCS_ENABLE_AI') }}</el-checkbox>
                </template>
                <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_AI_ENGINE_USAGE')">{{ pageData.isDetail ? Translate('IDCS_ENABLE') : Translate('IDCS_DISABLE') }}</el-form-item>
        </el-form>
        <div
            v-show="pageData.isDetail"
            class="base-table-box"
        >
            <el-table>
                <el-table-column
                    :label="Translate('IDCS_CHANNEL')"
                    prop="name"
                />
                <el-table-column
                    :label="Translate('IDCS_EVENT_TYPE')"
                    prop="type"
                />
            </el-table>
        </div>
        <!-- <div v-show="pageData.isDetail" >
            <BaseImgSprite file="caution" />
            {{ Translate('IDCS_OPEN_AI_TIP') }}
        </div> -->
        <BaseCheckAuthPop
            v-model="pageData.isCheckAuthPop"
            @confirm="confirmSetData"
            @close="pageData.isCheckAuthPop = false"
        />
    </div>
</template>

<script lang="ts" src="./IntelEngineCfg.v.ts"></script>
