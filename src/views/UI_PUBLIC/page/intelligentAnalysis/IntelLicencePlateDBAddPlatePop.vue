<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-03 09:08:22
 * @Description: 新增车牌弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-19 17:08:54
-->
<template>
    <el-dialog
        :title="displayTitle"
        width="600"
        align-center
        draggable
        @open="open"
    >
        <div v-show="type === 'add' && !pageData.disabledTab">
            <el-button
                v-for="button in pageData.tabs"
                :key="button.value"
                :type="pageData.tab === button.value ? 'primary' : 'default'"
                link
                @click="pageData.tab = button.value"
            >
                {{ button.label }}
            </el-button>
        </div>
        <div
            v-show="pageData.tab === 'form'"
            class="single"
        >
            <el-form
                ref="formRef"
                label-position="left"
                :model="formData"
                :rules="formRule"
                :style="{
                    '--form-label-width': '130px',
                    '--form-input-width': '280px',
                }"
            >
                <el-form-item
                    :label="Translate('IDCS_LICENSE_PLATE_NUM')"
                    prop="plateNumber"
                >
                    <el-input
                        v-model="formData.plateNumber"
                        maxlength="31"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_VEHICLE_TYPE')">
                    <el-input
                        v-model="formData.vehicleType"
                        maxlength="31"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_VEHICLE_OWNER')">
                    <el-input
                        v-model="formData.owner"
                        maxlength="31"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_PHONE_NUMBER')">
                    <el-input
                        v-model="formData.ownerPhone"
                        type="tel"
                        maxlength="31"
                    />
                </el-form-item>
                <el-form-item :label="Translate('IDCS_ADD_FACE_GROUP')">
                    <el-select
                        v-model="formData.groupId"
                        prop="groupId"
                    >
                        <el-option
                            v-for="item in pageData.groupList"
                            :key="item.value"
                            :value="item.value"
                            :label="item.label"
                        />
                    </el-select>
                    <el-button @click="addGroup">{{ Translate('IDCS_ADD_GROUP') }}</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div
            v-show="pageData.tab === 'import'"
            class="import"
        >
            <el-form
                label-position="left"
                class="inline-message"
                :style="{
                    '--form-label-width': '100px',
                }"
            >
                <el-form-item :label="Translate('IDCS_ADD_FACE_GROUP')">
                    <el-select v-model="formData.groupId">
                        <el-option
                            v-for="item in pageData.groupList"
                            :key="item.value"
                            :value="item.value"
                            :label="item.label"
                        />
                    </el-select>
                    <el-button @click="addGroup">{{ Translate('IDCS_ADD_GROUP') }}</el-button>
                </el-form-item>
            </el-form>
            <label
                :for="mode === 'h5' ? 'upload-import' : 'ocx-import'"
                class="label-upload"
                :class="{ drag: pageData.isDrag }"
                draggable
                @dragover="handleDragOver"
                @dragleave="handleDragLeave"
                @drop="handleDrop"
            >
                <div class="tip">
                    <span>{{ Translate('IDCS_DRAG_CSV_TIPS').formatForLang('*.csv') }}</span>
                    <strong> / </strong>
                    <span class="highlight">{{ Translate('IDCS_CLICK_UPLOAD') }}</span>
                </div>
                <div>{{ pageData.fileName }}</div>
            </label>
            <input
                id="upload-import"
                type="file"
                hidden
                accept=".csv"
                multiple
                @change="handleH5Import"
            />
            <input
                id="ocx-import"
                hidden
                @click="handleOCXImport"
            />
            <div class="remark">
                <div>{{ Translate('IDCS_FILE_TYPE') }} *.csv</div>
                <div>{{ Translate('IDCS_FOR_EXAMPLE') }} CSV</div>
                <div class="indent">{{ pageData.csvTitle.join(', ') }}</div>
                <div class="indent">A888888, user, 18888888888, suv</div>
                <div>{{ Translate('IDCS_REMARK') }}</div>
                <div class="indent">1. {{ Translate('IDCS_PERSONAL_EXPLAIN_NUM1') }}</div>
                <div class="indent">2. {{ Translate('IDCS_PLATE_EXPLAIN') }}</div>
                <div class="indent">3. {{ Translate('IDCS_PLATE_LIST_FILE') }}</div>
            </div>
        </div>
        <IntelLicenceDBEditPop
            v-model="pageData.isAddPop"
            @confirm="confirmAddGroup"
            @close="pageData.isAddPop = false"
        />
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

<script lang="ts" src="./IntelLicencePlateDBAddPlatePop.v.ts"></script>

<style lang="scss" scoped>
:deep(.el-button) {
    &.is-link {
        color: var(--primary--04);

        &.el-button--default {
            color: var(--text-primary);
        }

        &:hover {
            color: var(--primary--04);
        }
    }
}

.label-upload {
    width: 100%;
    height: 150px;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background-color: var(--bg-color5);
    border: 1px solid var(--border-color7);

    &:hover,
    &.drag {
        background-color: var(--bg-upload-hover);
    }

    .highlight {
        color: var(--primary--04);
    }
}

.single,
.import {
    margin-top: 10px;
}

.remark {
    margin-top: 10px;
    line-height: 1.6;
}

.indent {
    text-indent: 12px;
}
</style>
