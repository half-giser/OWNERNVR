<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-30 09:26:01
 * @Description: 人脸库 - 添加人脸
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-14 11:13:11
-->
<template>
    <el-dialog
        :title="Translate('IDCS_ADD')"
        :width="1000"
        align-center
        draggable
        @open="open"
    >
        <div>
            <el-form
                ref="formRef"
                label-position="left"
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
                        <el-select v-model="formData[0].sex">
                            <el-option
                                v-for="item in pageData.genderOptions"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                    </el-form-item>
                </el-form-item>
                <el-form-item>
                    <el-form-item :label="Translate('IDCS_BIRTHDAY')">
                        <el-date-picker
                            v-model="formData[pageData.formIndex].birthday"
                            :value-format="dateTime.dateFormat"
                            :format="dateTime.dateFormat"
                            :cell-class-name="highlightWeekend"
                            clear-icon=""
                            type="date"
                            :placeholder="Translate('IDCS_BIRTHDAY')"
                        />
                    </el-form-item>
                    <el-form-item :label="Translate('IDCS_ID_TYPE')">
                        <el-select v-model="formData[pageData.formIndex].certificateType">
                            <el-option
                                v-for="item in pageData.idTypeOptions"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
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
                        <el-input-number
                            v-model="formData[pageData.formIndex].mobile"
                            :min="1"
                            :max="999999999999999"
                            :controls="false"
                            :value-on-clear="null"
                        />
                    </el-form-item>
                </el-form-item>
                <el-form-item>
                    <el-form-item :label="Translate('IDCS_NUMBER')">
                        <el-input-number
                            v-model="formData[pageData.formIndex].number"
                            :min="1"
                            :max="999999999999999"
                            :controls="false"
                            :value-on-clear="null"
                        />
                    </el-form-item>
                    <el-form-item :label="Translate('IDCS_REMARK')">
                        <el-input v-model="formData[pageData.formIndex].note" />
                    </el-form-item>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_ADD_FACE_GROUP')">
                    <el-select v-model="formData[pageData.formIndex].groupId">
                        <el-option
                            v-for="item in pageData.groupList"
                            :key="item.groupId"
                            :label="item.name"
                            :value="item.groupId"
                        />
                    </el-select>
                </el-form-item>
            </el-form>
            <div class="swiper">
                <BaseImgSprite
                    file="prev_page"
                    :index="0"
                    :hover-index="1"
                    :disabled-index="2"
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
                <BaseImgSprite
                    file="next_page"
                    :index="0"
                    :hover-index="1"
                    :disabled-index="2"
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
        <template #footer>
            <el-row>
                <el-col
                    :span="12"
                    class="el-col-flex-start"
                    >{{ progress }}</el-col
                >
                <el-col
                    :span="12"
                    class="el-col-flex-end"
                >
                    <el-button @click="chooseFace">{{ Translate('IDCS_SELECT_FACE') }}</el-button>
                    <el-button
                        :disabled="!formData[0].pic"
                        @click="setCurrentData"
                        >{{ Translate('IDCS_ENTRY_FACE') }}</el-button
                    >
                    <el-button
                        :disabled="pageData.formType !== 'import' && totalCount - successCount >= 1"
                        @click="setAllData"
                        >{{ Translate('IDCS_FACE_ENTRY_ALL') }}</el-button
                    >
                    <el-button @click="close()">{{ Translate('IDCS_CLOSE') }}</el-button>
                    <!-- <el-button @click="close()">{{ Translate('IDCS_DELETE') }}</el-button> -->
                </el-col>
            </el-row>
        </template>
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
