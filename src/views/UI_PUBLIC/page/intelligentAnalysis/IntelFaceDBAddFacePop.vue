<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-30 09:26:01
 * @Description: 人脸库 - 添加人脸
-->
<template>
    <el-dialog
        :title="Translate('IDCS_ADD')"
        :width="1000"
        @open="open"
    >
        <el-form
            v-title
            class="stripe"
            :style="{
                '--form-input-width': '250px',
            }"
        >
            <el-form-item>
                <el-form-item :label="Translate('IDCS_NAME_PERSON')">
                    <BaseTextInput
                        v-model="formData[pageData.formIndex].name"
                        :maxlength="limit.name"
                        :disabled="formData[pageData.formIndex].success"
                        @blur="handleNameBlur(pageData.formIndex)"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_SEX')">
                    <BaseSelect
                        v-model="formData[pageData.formIndex].sex"
                        :disabled="formData[pageData.formIndex].success"
                        :options="pageData.genderOptions"
                    />
                </el-form-item>
            </el-form-item>
            <el-form-item>
                <el-form-item :label="Translate('IDCS_BIRTHDAY')">
                    <BaseDatePicker
                        v-model="formData[pageData.formIndex].birthday"
                        :disabled="formData[pageData.formIndex].success"
                        :range="['1910-01-01', '2037-12-31']"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_NATIVE_PLACE')">
                    <BaseTextInput
                        v-model="formData[pageData.formIndex].nativePlace"
                        :disabled="formData[pageData.formIndex].success"
                        :maxlength="limit.nativePlace"
                    />
                </el-form-item>
            </el-form-item>
            <el-form-item>
                <el-form-item :label="Translate('IDCS_ID_TYPE')">
                    <BaseSelect
                        v-model="formData[pageData.formIndex].certificateType"
                        :options="pageData.idTypeOptions"
                        :disabled="formData[pageData.formIndex].success"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_ID_NUMBER')">
                    <BaseTextInput
                        v-model="formData[pageData.formIndex].certificateNum"
                        :disabled="formData[pageData.formIndex].success"
                        :maxlength="limit.certificateNum"
                    />
                </el-form-item>
            </el-form-item>
            <el-form-item>
                <el-form-item :label="Translate('IDCS_PHONE_NUMBER')">
                    <el-input
                        v-model="formData[pageData.formIndex].mobile"
                        :parser="formatDigit"
                        :formatter="formatDigit"
                        :disabled="formData[pageData.formIndex].success"
                        :maxlength="limit.mobile"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_NUMBER')">
                    <el-input
                        v-model="formData[pageData.formIndex].number"
                        :parser="formatDigit"
                        :formatter="formatDigit"
                        :disabled="formData[pageData.formIndex].success"
                        :maxlength="limit.number"
                    />
                </el-form-item>
            </el-form-item>
            <el-form-item>
                <el-form-item :label="Translate('IDCS_REMARK')">
                    <BaseTextInput
                        v-model="formData[pageData.formIndex].note"
                        :disabled="formData[pageData.formIndex].success"
                        :maxlength="limit.note"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_ADD_FACE_GROUP')">
                    <BaseSelect
                        v-model="formData[pageData.formIndex].groupId"
                        :props="{
                            value: 'groupId',
                            label: 'name',
                        }"
                        :options="pageData.groupList"
                        :disabled="formData[pageData.formIndex].success"
                    />
                </el-form-item>
            </el-form-item>
        </el-form>
        <div class="swiper">
            <BaseImgSpriteBtn
                file="prev_page"
                :index="[0, 1, 1, 2]"
                :chunk="3"
                :disabled="pageData.swiperIndex === 0"
                @click="handlePrev"
            />
            <div>
                <div class="swiper-container">
                    <template v-if="formData[0].pic">
                        <IntelBaseFaceItem
                            v-for="(item, key) in picList"
                            :key
                            type="status"
                            :src="item.pic"
                            :icon="item.success ? 'success' : item.error ? 'error' : ''"
                            :class="{
                                active: pageData.swiperIndex * 7 + key === pageData.formIndex,
                            }"
                            @click="pageData.formIndex = pageData.swiperIndex * 7 + key"
                        />
                    </template>
                </div>
                <div>{{ formData[pageData.formIndex].errorTip }}</div>
            </div>
            <BaseImgSpriteBtn
                file="next_page"
                :index="[0, 1, 1, 2]"
                :chunk="3"
                :disabled="pageData.swiperIndex === swiperSize - 1"
                @click="handleNext"
            />

            <IntelFaceDBChooseFacePop
                v-model="pageData.isChooseFacePop"
                @choose="confirmChooseFace"
                @import-files="confirmImportFace"
                @close="pageData.isChooseFacePop = false"
            />
        </div>
        <div class="base-btn-box space-between">
            <div>{{ progress }}</div>
            <div>
                <el-button @click="chooseFace">{{ Translate('IDCS_SELECT_FACE') }}</el-button>
                <el-button
                    :disabled="formData[pageData.formIndex].success || !formData[pageData.formIndex].pic"
                    @click="setCurrentData"
                >
                    {{ Translate('IDCS_ENTRY_FACE') }}
                </el-button>
                <el-button
                    :disabled="pageData.formType !== 'import' || totalCount <= successCount"
                    @click="setAllData"
                >
                    {{ Translate('IDCS_FACE_ENTRY_ALL') }}
                </el-button>
                <el-button @click="close()">{{ Translate('IDCS_CLOSE') }}</el-button>
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./IntelFaceDBAddFacePop.v.ts"></script>

<style lang="scss" scoped>
.swiper {
    display: flex;
    width: 100%;
    height: 132px;
    margin-top: 20px;
    justify-content: space-between;
    align-items: center;

    &-container {
        width: 780px;
        height: 132px;
        display: flex;
        border: 1px solid var(--content-border);

        .avatar {
            margin: 5px !important;
        }
    }

    & > .Sprite:first-child {
        margin-left: 30px;
    }

    & > .Sprite:last-child {
        margin-right: 30px;
    }
}
</style>
