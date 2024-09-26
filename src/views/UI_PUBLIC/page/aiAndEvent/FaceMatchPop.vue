<!--
 * @Description: 普通事件——组合报警——人脸识别edit弹窗
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-26 16:18:39
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-09-26 15:31:39
-->
<template>
    <el-dialog
        :title="Translate('IDCS_CONFIG')"
        width="660"
        hight="470"
        align-center
        draggable
        @open="open"
        @close="close"
    >
        <el-row>
            <el-col :span="12">
                <div class="faceMatchParam box">
                    <div class="box_title">{{ Translate('IDCS_FACE_MATCH_SELECT_CHL') }}</div>
                    <el-form
                        ref="formRef"
                        label-position="left"
                        :style="{
                            '--form-label-width': '100px',
                        }"
                    >
                        <el-form-item :label="Translate('IDCD_RULE')">
                            <el-select v-model="pageData.rule">
                                <el-option
                                    value="1"
                                    :label="Translate('IDCS_SUCCESSFUL_RECOGNITION')"
                                ></el-option>
                                <el-option
                                    value="0"
                                    :label="Translate('IDCS_GROUP_STRANGER')"
                                ></el-option>
                                <el-option
                                    value="2"
                                    :label="Translate('IDCS_WORKTIME_MISS_HIT')"
                                ></el-option>
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
                                        >{{ item.label }}</el-checkbox
                                    >
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
                        label-position="left"
                        :style="{
                            '--form-label-width': '130px',
                        }"
                    >
                        <el-form-item :label="Translate('IDCS_PREALARM_BEFORE')">
                            <el-select v-model="pageData.duration">
                                <el-option
                                    :value="5"
                                    :label="`5${Translate('IDCS_SECONDS')}`"
                                ></el-option>
                                <el-option
                                    :value="1"
                                    :label="`1${Translate('IDCS_SECONDS')}`"
                                ></el-option>
                                <el-option
                                    :value="3"
                                    :label="`3${Translate('IDCS_SECONDS')}`"
                                ></el-option>
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_PREALARM_AFTER')">
                            <el-select v-model="pageData.delay">
                                <el-option
                                    :value="5"
                                    :label="`5${Translate('IDCS_SECONDS')}`"
                                ></el-option>
                                <el-option
                                    :value="1"
                                    :label="`1${Translate('IDCS_SECONDS')}`"
                                ></el-option>
                                <el-option
                                    :value="3"
                                    :label="`3${Translate('IDCS_SECONDS')}`"
                                ></el-option>
                            </el-select>
                        </el-form-item>
                    </el-form>
                </div>
            </el-col>
        </el-row>
        <div class="btnBox">
            <el-checkbox v-model="pageData.noShowDisplay">{{ Translate('IDCS_NO_REALTIME_DISPLAY') }}</el-checkbox>
        </div>
        <div class="btnBox">
            <span>{{ Translate('IDCS_TEXT_PROMPT') }}</span>
            <el-input
                v-model="pageData.displayText"
                size="small"
                class="tipInput"
            ></el-input>
        </div>
        <el-row>
            <el-col class="el-col-flex-end btnBox">
                <el-button @click="save">{{ Translate('IDCS_OK') }}</el-button>
                <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
            </el-col>
        </el-row>
    </el-dialog>
</template>

<script lang="ts" src="./FaceMatchPop.v.ts"></script>

<style lang="scss" scoped>
.box {
    height: 285px;
    border: solid 1px black;
}
:deep(.el-form-item__label) {
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
.box_title {
    text-align: center;
    border-bottom: solid 1px black;
}
.faceCompare {
    margin-left: -1px;
}
.faceData {
    width: 180px;
    height: 180px;
    border: solid 1px black;
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
.tipInput {
    margin-left: 80px;
    width: 400px;
}
.btnBox {
    margin-top: 10px;
}
</style>
