<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-22 16:34:10
 * @Description: 抓拍注册弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_REGISTER')"
        width="750"
        @open="open"
        @closed="formRef?.resetFields()"
    >
        <div>
            <div class="title">{{ Translate('IDCS_SNAP_PICTURE') }}</div>
            <img
                class="snap-img"
                :src="pic"
            />
            <el-form
                ref="formRef"
                v-title
                :rules="formRule"
                :model="formData"
                class="stripe"
                :style="{
                    '--form-input-width': '250px',
                }"
            >
                <el-form-item
                    :label="Translate('IDCS_NAME_PERSON')"
                    prop="name"
                >
                    <el-input
                        v-model="formData.name"
                        maxlength="32"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_SEX')">
                    <el-select-v2
                        v-model="formData.sex"
                        :options="pageData.genderOptions"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_BIRTHDAY')">
                    <BaseDatePicker
                        v-model="formData.birthday"
                        :range="['1910-01-01', '2037-12-31']"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_NATIVE_PLACE')">
                    <el-input
                        v-model="formData.nativePlace"
                        maxlength="15"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_ID_TYPE')">
                    <el-select-v2
                        v-model="formData.certificateType"
                        :options="pageData.idTypeOptions"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_ID_NUMBER')">
                    <el-input
                        v-model="formData.certificateNum"
                        maxlength="31"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_PHONE_NUMBER')">
                    <el-input
                        v-model="formData.mobile"
                        :parser="formatDigit"
                        :formatter="formatDigit"
                        maxlength="15"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_NUMBER')">
                    <el-input
                        v-model="formData.number"
                        :parser="formatDigit"
                        :formatter="formatDigit"
                        maxlength="15"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_REMARK')">
                    <el-input
                        v-model="formData.note"
                        maxlength="15"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_ADD_FACE_GROUP')">
                    <el-select-v2
                        v-model="formData.groupId"
                        :options="pageData.faceDatabaseList"
                        :props="{
                            label: 'name',
                            value: 'groupId',
                        }"
                    />
                    <el-button @click="addGroup">{{ Translate('IDCS_ADD_GROUP') }}</el-button>
                </el-form-item>
            </el-form>
            <IntelFaceDBEditPop
                v-model="pageData.isAddGroupPop"
                type="add"
                @close="pageData.isAddGroupPop = false"
                @confirm="confirmAddGroup"
            />
        </div>
        <div class="base-btn-box">
            <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./IntelFaceDBSnapRegisterPop.v.ts"></script>

<style lang="scss" scoped>
.title {
    border-left: 3px solid var(--content-border);
    height: 30px;
    line-height: 30px;
    padding-left: 15px;
    margin-bottom: 10px;
}

.snap-img {
    width: 185px;
    height: 215px;
    margin-bottom: 10px;
}
</style>
