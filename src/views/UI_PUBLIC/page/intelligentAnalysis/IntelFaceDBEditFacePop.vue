<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-30 09:26:20
 * @Description: 人脸库 - 编辑人脸弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-30 17:30:17
-->
<template>
    <el-dialog
        :title="Translate('IDCS_EDIT')"
        width="800"
        @open="open"
    >
        <div class="edit">
            <el-form
                ref="formRef"
                class="stripe narrow"
            >
                <el-form-item :label="Translate('IDCS_NAME_PERSON')">
                    <el-input
                        v-model="formData.name"
                        :formatter="formatName"
                        :parser="formatName"
                        maxlength="31"
                        :disabled
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_SEX')">
                    <el-select
                        v-model="formData.sex"
                        :disabled
                    >
                        <el-option
                            v-for="item in pageData.genderOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_BIRTHDAY')">
                    <el-date-picker
                        v-model="formData.birthday"
                        :value-format="dateTime.dateFormat"
                        :format="dateTime.dateFormat"
                        type="date"
                        :disabled
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_ID_TYPE')">
                    <el-select
                        v-model="formData.certificateType"
                        :disabled
                    >
                        <el-option
                            v-for="item in pageData.idTypeOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_ID_NUMBER')">
                    <el-input
                        v-model="formData.certificateNum"
                        maxlength="31"
                        :disabled
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_PHONE_NUMBER')">
                    <el-input
                        v-model="formData.mobile"
                        :parser="formatDigit"
                        :formatter="formatDigit"
                        maxlength="15"
                        :disabled
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_NUMBER')">
                    <el-input
                        v-model="formData.number"
                        :parser="formatDigit"
                        :formatter="formatDigit"
                        maxlength="15"
                        :disabled
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_REMARK')">
                    <el-input
                        v-model="formData.note"
                        :disabled
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_ADD_FACE_GROUP')">
                    <el-select v-model="formData.groupId">
                        <el-option
                            v-for="item in pageData.groupList"
                            :key="item.groupId"
                            :label="item.name"
                            :value="item.groupId"
                        />
                    </el-select>
                </el-form-item>
            </el-form>
            <div class="pics">
                <div class="pics-list">
                    <IntelBaseFaceItem
                        v-show="!disabled"
                        type="status"
                        :src="formData.pic"
                        :icon="formData.success ? 'success' : formData.error ? 'error' : ''"
                    />
                </div>
                <div class="base-btn-box">
                    <el-button
                        :disabled="disabled"
                        @click="chooseFace"
                        >{{ Translate('IDCS_ADD') }}</el-button
                    >
                </div>
            </div>
            <IntelFaceDBChooseFacePop
                v-model="pageData.isChooseFacePop"
                type="snap"
                @choose="confirmChooseFace"
                @close="pageData.isChooseFacePop = false"
            />
        </div>
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="close()">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./IntelFaceDBEditFacePop.v.ts"></script>

<style lang="scss" scoped>
.edit {
    display: flex;

    .el-form {
        width: 50%;
        flex-shrink: 0;
    }

    .pics {
        margin-left: 10px;
        width: 100%;
        height: 100%;
        border: 1px solid var(--content-border);
        padding: 10px;
        box-sizing: border-box;
    }
}
</style>
