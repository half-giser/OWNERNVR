<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-22 16:34:10
 * @Description: 抓拍注册弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-30 17:31:10
-->
<template>
    <el-dialog
        :title="Translate('IDCS_REGISTER')"
        width="750"
        @open="open"
    >
        <div>
            <div class="title">{{ Translate('IDCS_SNAP_PICTURE') }}</div>
            <img
                class="snap-img"
                :src="pic"
            />
            <el-form
                ref="formRef"
                :rules="formRule"
                :model="formData"
                class="stripe"
                inline-message
                :style="{
                    '--form-input-width': '340px',
                }"
            >
                <el-form-item
                    :label="Translate('IDCS_NAME_PERSON')"
                    prop="name"
                >
                    <el-input v-model="formData.name" />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_SEX')">
                    <el-select v-model="formData.sex">
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
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_ID_TYPE')">
                    <el-select v-model="formData.certificateType">
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
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_PHONE_NUMBER')">
                    <BaseNumberInput
                        v-model="formData.mobile"
                        :parser="formatDigit"
                        :formatter="formatDigit"
                        maxlength="15"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_NUMBER')">
                    <BaseNumberInput
                        v-model="formData.number"
                        :parser="formatDigit"
                        :formatter="formatDigit"
                        maxlength="15"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_REMARK')">
                    <el-input v-model="formData.note" />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_ADD_FACE_GROUP')">
                    <el-select v-model="formData.groupId">
                        <el-option
                            v-for="item in pageData.faceDatabaseList"
                            :key="item.groupId"
                            :label="item.name"
                            :value="item.groupId"
                        />
                    </el-select>
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
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
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
