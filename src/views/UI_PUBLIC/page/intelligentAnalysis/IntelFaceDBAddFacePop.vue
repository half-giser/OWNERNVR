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
        <div>
            <el-form
                :style="{
                    '--form-input-width': '250px',
                }"
            >
                <el-form-item>
                    <el-form-item :label="Translate('IDCS_NAME_PERSON')">
                        <el-input
                            v-model="formData[pageData.formIndex].name"
                            maxlength="31"
                            @blur="handleNameBlur(pageData.formIndex)"
                        />
                    </el-form-item>
                    <el-form-item :label="Translate('IDCS_SEX')">
                        <el-select-v2
                            v-model="formData[pageData.formIndex].sex"
                            :options="pageData.genderOptions"
                        />
                    </el-form-item>
                </el-form-item>
                <el-form-item>
                    <el-form-item :label="Translate('IDCS_BIRTHDAY')">
                        <BaseDatePicker
                            v-model="formData[pageData.formIndex].birthday"
                            :value-format="dateTime.dateFormat"
                            :format="dateTime.dateFormat"
                            type="date"
                        />
                    </el-form-item>
                    <el-form-item :label="Translate('IDCS_ID_TYPE')">
                        <el-select-v2
                            v-model="formData[pageData.formIndex].certificateType"
                            :options="pageData.idTypeOptions"
                        />
                    </el-form-item>
                </el-form-item>
                <el-form-item>
                    <el-form-item :label="Translate('IDCS_ID_NUMBER')">
                        <el-input
                            v-model="formData[pageData.formIndex].certificateNum"
                            maxlength="31"
                        />
                    </el-form-item>
                    <el-form-item :label="Translate('IDCS_PHONE_NUMBER')">
                        <el-input
                            v-model="formData[pageData.formIndex].mobile"
                            :parser="formatDigit"
                            :formatter="formatDigit"
                            maxlength="15"
                        />
                    </el-form-item>
                </el-form-item>
                <el-form-item>
                    <el-form-item :label="Translate('IDCS_NUMBER')">
                        <el-input
                            v-model="formData[pageData.formIndex].number"
                            :parser="formatDigit"
                            :formatter="formatDigit"
                            maxlength="15"
                        />
                    </el-form-item>
                    <el-form-item :label="Translate('IDCS_REMARK')">
                        <el-input v-model="formData[pageData.formIndex].note" />
                    </el-form-item>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_ADD_FACE_GROUP')">
                    <el-select-v2
                        v-model="formData[pageData.formIndex].groupId"
                        :props="{
                            value: 'groupId',
                            label: 'name',
                        }"
                        :options="pageData.groupList"
                    />
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
                                    active: pageData.swiperIndex * 6 + key === pageData.formIndex,
                                }"
                                @click="pageData.formIndex = pageData.swiperIndex * 6 + key"
                            />
                        </template>
                    </div>
                    <div>{{ pageData.errorTip }}</div>
                </div>
                <BaseImgSpriteBtn
                    file="next_page"
                    :index="[0, 1, 1, 2]"
                    :chunk="3"
                    :disabled="pageData.swiperIndex === swiperSize - 1"
                    @click="handleNext"
                />
            </div>
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
                    :disabled="!formData[0].pic"
                    @click="setCurrentData"
                >
                    {{ Translate('IDCS_ENTRY_FACE') }}
                </el-button>
                <el-button
                    :disabled="pageData.formType !== 'import' && totalCount - successCount >= 1"
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
        width: 852px;
        height: 132px;
        display: flex;
        border: 1px solid var(--content-border);
    }
}
</style>
