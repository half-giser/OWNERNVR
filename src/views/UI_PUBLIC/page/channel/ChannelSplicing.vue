<!--
 * @Date: 2025-05-15 11:38:01
 * @Description: 双目拼接
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <div>
        <AlarmBaseChannelSelector
            v-model="pageData.currentChl"
            :list="pageData.chlList"
            @change="changeChl"
        />
        <div v-if="pageData.requestType === 'success'">
            <el-form
                v-title
                class="form"
                :style="{
                    '--form-input-width': '430px',
                }"
            >
                <el-form-item :label="Translate('IDCS_TYPE')">
                    <BaseSelect
                        v-model="formData.spliceType"
                        :options="formData.spliceTypeList"
                        @visible-change="toggleOCX"
                    />
                </el-form-item>
            </el-form>
            <div class="base-ai-param-box">
                <div class="base-ai-param-box-left">
                    <div class="player">
                        <BaseVideoPlayer
                            ref="playerRef"
                            @ready="handlePlayerReady"
                        />
                    </div>
                </div>
                <div class="base-ai-param-box-right">
                    <div class="example">
                        <BaseImgSprite file="spliceExample" />
                        <div class="example-legend">
                            <div>H: {{ Translate('IDCS_H_INSTALL_HEIGHT') }}</div>
                            <div>D: {{ Translate('IDCS_SPLICE_DISTANCE') }}</div>
                        </div>
                    </div>
                    <el-form
                        ref="formRef"
                        v-title
                        :model="formData"
                        :rules="rules"
                    >
                        <el-form-item
                            :label="`${Translate('IDCS_SPLICE_DISTANCE')}(m)`"
                            prop="spliceDistance"
                        >
                            <BaseNumberInput
                                v-model="formData.spliceDistance"
                                :min="formData.spliceDistanceMin"
                                :max="formData.spliceDistanceMax"
                                mode="blur"
                                @out-of-range="outOfRange"
                            />
                        </el-form-item>
                    </el-form>
                </div>
            </div>
            <div class="base-btn-box fixed">
                <el-button
                    :disabled="watchEdit.disabled.value"
                    @click="setData"
                >
                    {{ Translate('IDCS_APPLY') }}
                </el-button>
            </div>
        </div>
        <AlarmBaseErrorPanel
            v-if="pageData.requestType === 'fail' || pageData.requestType === 'not-support'"
            :type="pageData.requestType"
        />
    </div>
</template>

<script lang="ts" src="./ChannelSplicing.v.ts"></script>

<style lang="scss" scoped>
.form {
    padding-top: 10px;
    padding-bottom: 10px;
    border-top: 1px solid var(--main-border);
    border-bottom: 1px solid var(--main-border);

    .el-select {
        height: 30px;
    }

    :deep(.el-select__wrapper) {
        height: 30px !important;
        line-height: 30px !important;
    }
}

.example {
    position: relative;

    &-legend {
        position: absolute;
        top: 10px;
        left: 390px;
    }
}
</style>
