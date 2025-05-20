<!--
 * @Date: 2025-05-17 10:11:33
 * @Description: 目标侦测
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <div class="base-flex-box">
        <el-form>
            <el-form-item>
                <el-checkbox
                    v-model="formData.switch"
                    :label="Translate('IDCS_ENABLE')"
                />
            </el-form-item>
            <div class="base-btn-box">
                <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
            </div>
        </el-form>
        <div class="base-btn-box space-between">
            <div>
                <BaseImgSprite
                    class="warnIcon"
                    file="warnIcon"
                />
                <span>{{ Translate('IDCS_PICTURE_COMPARSION_ENABLE_TIP').formatForLang(Translate('IDCS_RECORD'), Translate('IDCS_MODE_SET'), Translate('IDCS_AI_RECORD')) }}</span>
            </div>
        </div>
        <div class="base-btn-box gap flex-start">
            <span>{{ Translate('IDCS_DETAIL_LIST') }}</span>
        </div>
        <div class="base-table-box">
            <el-table
                v-title
                :data="tableData"
                show-overflow-tooltip
                :row-class-name="handleRowClassName"
            >
                <el-table-column :label="Translate('IDCS_CHANNEL')">
                    <template #default="{ row }: TableColumn<AlarmDetectTargetDto>">
                        <!--
                    * NTA1-4387 旧协议的IPC 支持人脸侦测 和 视频结构化的能力集时（不管人脸侦测或 视频结构化启用与否），即支持目标侦测
                    * 但此时，如果人脸侦测 或 视频结构化未启用(workMode == MANUAL)，则在此旧协议的IPC通道名称后增加如下提示语：
                    * 该IPC需要手动启用“视频结构化”和“人脸侦测”功能才能支持目标侦测。
                    -->
                        <div class="base-cell-box">
                            <span>{{ row.chlName }}</span>
                            <BaseImgSprite
                                v-show="row.workMode === 'MANUAL'"
                                file="aq"
                                :chunk="3"
                                :index="1"
                                :hover-index="2"
                                :title="Translate('IDCS_MANUAL_ENABLE_EVENT_TIP').formatForLang(Translate('IDCS_VSD_DETECTION'), Translate('IDCS_FACE_DETECTION'))"
                            />
                        </div>
                    </template>
                </el-table-column>
                <el-table-column :label="Translate('IDCS_TARGET_DETECT_FRONT')">
                    <template #default="{ row }: TableColumn<AlarmDetectTargetDto>">
                        {{ displayDetectTarget(row.front) }}
                    </template>
                </el-table-column>
                <el-table-column :label="Translate('IDCS_TARGET_DETECT_BACK')">
                    <template #default="{ row }: TableColumn<AlarmDetectTargetDto>">
                        {{ displayDetectTarget(row.back) }}
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </div>
</template>

<script lang="ts" src="./DetectTarget.v.ts"></script>

<style lang="scss" scoped>
.warnIcon {
    margin-right: 5px;
}
</style>
