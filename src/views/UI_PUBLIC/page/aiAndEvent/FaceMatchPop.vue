<!--
 * @Description: 普通事件——组合报警——人脸识别edit弹窗
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-26 16:18:39
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-24 10:00:03
-->
<template>
    <el-dialog
        :title="Translate('IDCS_CONFIG')"
        width="900"
        hight="470"
        @open="open"
        @close="close"
    >
        <el-row>
            <el-col :span="12">
                <div class="faceMatchParam box">
                    <div class="box_title">{{ Translate('IDCS_FACE_MATCH_SELECT_CHL') }}</div>
                    <el-form
                        ref="formRef"
                        :style="{
                            '--form-label-width': '150px',
                        }"
                    >
                        <el-form-item :label="Translate('IDCD_RULE')">
                            <el-select v-model="pageData.rule">
                                <el-option
                                    v-for="item in pageData.ruleOptions"
                                    :key="item.value"
                                    :value="item.value"
                                    :label="item.label"
                                />
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_FEATURE_LIBRARY')">
                            <div class="faceData">
                                <el-checkbox-group v-model="pageData.faceDataIds">
                                    <el-checkbox
                                        v-for="item in pageData.faceList"
                                        :key="item.value"
                                        class="faceCheckBox"
                                        :value="item.value"
                                        :label="item.label"
                                    />
                                </el-checkbox-group>
                            </div>
                        </el-form-item>
                    </el-form>
                </div>
            </el-col>
            <el-col :span="12">
                <div class="faceCompare box">
                    <div class="box_title">{{ Translate('IDCS_MATCH_START_AND_END') }}</div>
                    <el-form
                        ref="formRef"
                        :style="{
                            '--form-label-width': '220px',
                        }"
                    >
                        <el-form-item :label="Translate('IDCS_PREALARM_BEFORE')">
                            <el-select v-model="pageData.duration">
                                <el-option
                                    v-for="value in pageData.durationOptions"
                                    :key="value"
                                    :value
                                    :label="getTranslateForSecond(value)"
                                />
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_PREALARM_AFTER')">
                            <el-select v-model="pageData.delay">
                                <el-option
                                    v-for="value in pageData.durationOptions"
                                    :key="value"
                                    :value
                                    :label="getTranslateForSecond(value)"
                                />
                            </el-select>
                        </el-form-item>
                    </el-form>
                </div>
            </el-col>
        </el-row>
        <el-form
            :style="{
                '--form-input-width': '400px',
            }"
        >
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
        <template #footer>
            <el-row>
                <el-col class="el-col-flex-end">
                    <el-button @click="save">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./FaceMatchPop.v.ts"></script>

<style lang="scss" scoped>
.box {
    height: 285px;
    border: solid 1px var(--content-border);
}

.box_title {
    text-align: center;
    padding-block: 5px;
    border-bottom: solid 1px var(--content-border);
}

.faceCompare {
    margin-left: -1px;
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
// 除第一个，其他的会加左右margin拉开距离，这里去掉
#n9web .el-form .el-checkbox + * {
    margin: 0;
}
</style>
