<!--
 * @Description: 普通事件——组合报警——人脸识别edit弹窗
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-26 16:18:39
-->
<template>
    <el-dialog
        :title="Translate('IDCS_CONFIG')"
        width="900"
        hight="470"
        @open="open"
        @close="close"
    >
        <div class="wrapper">
            <div class="box">
                <div class="box_title">{{ Translate('IDCS_FACE_MATCH_SELECT_CHL') }}</div>
                <el-form v-title>
                    <el-form-item :label="Translate('IDCD_RULE')">
                        <el-select-v2
                            v-model="pageData.rule"
                            :options="pageData.ruleOptions"
                        />
                    </el-form-item>
                    <el-form-item :label="Translate('IDCS_FEATURE_LIBRARY')">
                        <el-checkbox-group
                            v-model="pageData.faceDataIds"
                            class="line-break"
                        >
                            <el-checkbox
                                v-for="item in pageData.faceList"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            />
                        </el-checkbox-group>
                    </el-form-item>
                </el-form>
            </div>
            <div class="box">
                <div class="box_title">{{ Translate('IDCS_MATCH_START_AND_END') }}</div>
                <el-form v-title>
                    <el-form-item :label="Translate('IDCS_PREALARM_BEFORE')">
                        <el-select-v2
                            v-model="pageData.duration"
                            :options="pageData.durationOptions"
                        />
                    </el-form-item>
                    <el-form-item :label="Translate('IDCS_PREALARM_AFTER')">
                        <el-select-v2
                            v-model="pageData.delay"
                            :options="pageData.durationOptions"
                        />
                    </el-form-item>
                </el-form>
            </div>
        </div>
        <el-form v-title>
            <el-form-item>
                <el-checkbox
                    v-model="pageData.noShowDisplay"
                    :label="Translate('IDCS_NO_REALTIME_DISPLAY')"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_TEXT_PROMPT')">
                <el-input v-model="pageData.displayText" />
            </el-form-item>
        </el-form>
        <div class="base-btn-box">
            <el-button @click="save">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./CombinationAlarmFaceMatchPop.v.ts"></script>

<style lang="scss" scoped>
.wrapper {
    width: 100%;
    display: flex;
}

.box {
    width: 50%;
    height: 285px;
    border: solid 1px var(--content-border);

    &:not(:first-child) {
        border-left: none;
    }
}

.box_title {
    text-align: center;
    padding-block: 5px;
    border-bottom: solid 1px var(--content-border);
}

.faceData {
    width: 180px;
    height: 180px;
    border: solid 1px var(--content-border);
    padding-left: 5px;
    overflow: auto;
}

.faceCheckBox {
    width: 120px;
}
</style>
