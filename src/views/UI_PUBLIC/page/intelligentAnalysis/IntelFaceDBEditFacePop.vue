<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-30 09:26:20
 * @Description: 人脸库 - 编辑人脸弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_EDIT')"
        width="550"
        @open="open"
    >
        <div class="edit">
            <el-form
                v-title
                class="stripe"
            >
                <el-form-item :label="Translate('IDCS_NAME_PERSON')">
                    <BaseTextInput
                        v-model="formData.name"
                        :maxlength="limit.name"
                        :disabled
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_SEX')">
                    <BaseSelect
                        v-model="formData.sex"
                        :disabled
                        :options="pageData.genderOptions"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_BIRTHDAY')">
                    <BaseDatePicker
                        v-model="formData.birthday"
                        :range="['1910-01-01', '2037-12-31']"
                        :disabled
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_NATIVE_PLACE')">
                    <BaseTextInput
                        v-model="formData.nativePlace"
                        :maxlength="limit.nativePlace"
                        :disabled
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_ID_TYPE')">
                    <BaseSelect
                        v-model="formData.certificateType"
                        :disabled
                        :options="pageData.idTypeOptions"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_ID_NUMBER')">
                    <BaseTextInput
                        v-model="formData.certificateNum"
                        :maxlength="limit.certificateNum"
                        :disabled
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_PHONE_NUMBER')">
                    <el-input
                        v-model="formData.mobile"
                        :parser="formatDigit"
                        :formatter="formatDigit"
                        :maxlength="limit.mobile"
                        :disabled
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_NUMBER')">
                    <el-input
                        v-model="formData.number"
                        :parser="formatDigit"
                        :formatter="formatDigit"
                        :maxlength="limit.number"
                        :disabled
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_REMARK')">
                    <BaseTextInput
                        v-model="formData.note"
                        :disabled
                        :maxlength="limit.note"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_ADD_FACE_GROUP')">
                    <BaseSelect
                        v-model="formData.groupId"
                        :options="pageData.groupList"
                        :props="{
                            label: 'name',
                            value: 'groupId',
                        }"
                    />
                </el-form-item>
            </el-form>
            <div
                v-show="!disabled"
                class="pic"
            >
                <div class="pic-head">
                    <el-button
                        link
                        @click="chooseFace"
                        >{{ Translate('IDCS_CHANGE') }}</el-button
                    >
                </div>
                <img :src="formData.pic" />
            </div>
            <IntelFaceDBChooseFacePop
                v-model="pageData.isChooseFacePop"
                type="snap"
                @choose="confirmChooseFace"
                @close="pageData.isChooseFacePop = false"
            />
        </div>
        <div class="base-btn-box">
            <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="close()">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./IntelFaceDBEditFacePop.v.ts"></script>

<style lang="scss" scoped>
.edit {
    width: 100%;
    display: flex;

    .el-form {
        width: 100%;
        flex-shrink: 1 !important;
    }

    .pic {
        margin-left: 20px;
        width: 102px;
        height: 120px;
        border: 1px solid var(--content-border);
        flex-shrink: 0;

        &-head {
            height: 20px;
            display: flex;
            justify-content: flex-end;
            align-items: center;
            box-sizing: border-box;
            padding: 0 5px;
        }

        img {
            width: 100%;
            height: 100px;

            &[src=''] {
                opacity: 0;
            }
        }
    }
}
</style>
