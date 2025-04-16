<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-29 10:06:12
 * @Description: 人脸库
-->
<template>
    <div class="base-flex-box">
        <div class="base-table-box">
            <el-table
                ref="tableRef"
                v-title
                :data="tableData"
                :row-key="getRowKey"
                :expand-row-key="pageData.expandRowKey"
                highlight-current-row
                @row-click="handleRowClick"
                @expand-change="handleExpandChange"
            >
                <el-table-column
                    :label="Translate('IDCS_SERIAL_NUMBER')"
                    :width="80"
                    type="index"
                />
                <el-table-column :label="Translate('IDCS_GROUP')">
                    <template #default="{ row }: TableColumn<IntelFaceDBGroupList>"> {{ row.name }} ({{ row.count }}) </template>
                </el-table-column>
                <el-table-column>
                    <!-- <template #default="{ row }: TableColumn<IntelFaceDBGroupList>">
                        <div :class="getAlarmClassName(row.id, row.property)">{{ displayAlarmText(row.property) }}</div>
                    </template> -->
                </el-table-column>
                <el-table-column :label="Translate('IDCS_EDIT')">
                    <template #default="{ row }: TableColumn<IntelFaceDBGroupList>">
                        <BaseImgSpriteBtn
                            file="edit2"
                            @click="editGroup(row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column :label="Translate('IDCS_DELETE')">
                    <template #default="{ row }: TableColumn<IntelFaceDBGroupList>">
                        <BaseImgSpriteBtn
                            file="del"
                            @click="deleteGroup(row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_EXPAND_OR_COLLAPSE')"
                    type="expand"
                    :width="200"
                >
                    <template #default="{ row }: TableColumn<IntelFaceDBGroupList>">
                        <div
                            v-if="pageData.expandRowKey.includes(row.groupId)"
                            class="expand"
                        >
                            <div class="expand-btns">
                                <el-button @click="addFace(row.groupId)">{{ Translate('IDCS_ADD') }}</el-button>
                                <el-button
                                    :disabled="!formData.faceIndex.length"
                                    @click="editFace(row.groupId)"
                                >
                                    {{ Translate('IDCS_CHANGE') }}
                                </el-button>
                                <!-- <el-button>{{ Translate('IDCS_COPY_TO') }}</el-button> -->
                                <el-button
                                    :disabled="!formData.faceIndex.length"
                                    @click="deleteFace"
                                >
                                    {{ Translate('IDCS_DELETE') }}
                                </el-button>
                                <el-button
                                    :disabled="!groupTableData.length"
                                    @click="deleteAllFace"
                                >
                                    {{ Translate('IDCS_CLEAR_ALL') }}
                                </el-button>
                                <el-button
                                    :disabled="!groupTableData.length"
                                    @click="selectAllFace"
                                >
                                    {{ Translate('IDCS_SELECT_ALL') }}
                                </el-button>
                                <el-input
                                    v-model="formData.name"
                                    :placeholder="Translate('IDCS_SEARCH_TARGET_PERSON')"
                                />
                                <el-button @click="searchFace(row.groupId)">{{ Translate('IDCS_SEARCH') }}</el-button>
                            </div>
                            <div class="expand-content">
                                <div class="expand-list">
                                    <div>
                                        <div>
                                            <IntelBaseFaceItem
                                                v-for="(item, index) in groupTableData"
                                                :key="item.id"
                                                :src="item.pic[0] || ''"
                                                :model-value="formData.faceIndex.includes(index)"
                                                @update:model-value="selectFace(index, $event)"
                                            >
                                                <div
                                                    v-title
                                                    class="text-ellipsis"
                                                >
                                                    {{ hideSensitiveInfo(item.name, 'medium', 'name') }}
                                                </div>
                                            </IntelBaseFaceItem>
                                        </div>
                                    </div>
                                    <div class="base-pagination-box">
                                        <BasePagination
                                            v-model:current-page="formData.pageIndex"
                                            v-model:page-size="pageData.pageSize"
                                            :page-sizes="[pageData.pageSize]"
                                            :total="row.count"
                                            @current-change="changeFacePage($event, row.groupId)"
                                        />
                                    </div>
                                </div>
                                <div class="expand-info">
                                    <div class="expand-avatar">
                                        <img
                                            v-for="(src, key) in currentFace.pic"
                                            :key
                                            :src
                                        />
                                    </div>
                                    <el-form
                                        v-title
                                        class="stripe"
                                    >
                                        <el-form-item :label="Translate('IDCS_NAME_PERSON')">
                                            <el-input
                                                :model-value="currentFace.name"
                                                disabled
                                            />
                                        </el-form-item>
                                        <el-form-item :label="Translate('IDCS_BIRTHDAY')">
                                            <el-input
                                                :model-value="displayDate(currentFace.birthday)"
                                                disabled
                                            />
                                        </el-form-item>
                                        <el-form-item :label="Translate('IDCS_ID_TYPE')">
                                            <el-input
                                                :model-value="displayIDCard(currentFace.certificateType)"
                                                disabled
                                            />
                                        </el-form-item>
                                        <el-form-item :label="Translate('IDCS_ID_NUMBER')">
                                            <el-input
                                                :model-value="currentFace.certificateNum"
                                                disabled
                                            />
                                        </el-form-item>
                                        <el-form-item :label="Translate('IDCS_PHONE_NUMBER')">
                                            <el-input
                                                :model-value="currentFace.mobile"
                                                disabled
                                            />
                                        </el-form-item>
                                        <el-form-item :label="Translate('IDCS_NUMBER')">
                                            <el-input
                                                :model-value="currentFace.number"
                                                disabled
                                            />
                                        </el-form-item>
                                        <el-form-item :label="Translate('IDCS_REMARK')">
                                            <el-input
                                                :model-value="currentFace.note"
                                                disabled
                                            />
                                        </el-form-item>
                                    </el-form>
                                </div>
                            </div>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="base-btn-box space-between padding">
            <el-button @click="handleFaceRecognition">{{ Translate('IDCS_FACE_RECOGNITION') }}</el-button>
            <div>
                <el-button
                    :disabled="!tableData.length"
                    @click="addFace('')"
                >
                    {{ Translate('IDCS_ADD_FACE') }}
                </el-button>
                <el-button @click="addGroup">{{ Translate('IDCS_ADD_GROUP') }}</el-button>
                <el-button
                    v-show="!pageData.isExportDisabled"
                    @click="exportGroup"
                >
                    {{ Translate('IDCS_EXPORT') }}
                </el-button>
            </div>
        </div>
        <IntelFaceDBEditPop
            v-model="pageData.isEditPop"
            :data="pageData.editData"
            :type="pageData.editType"
            @confirm="confirmEditGroup"
            @close="pageData.isEditPop = false"
        />
        <el-dialog
            v-model="pageData.isExportTipPop"
            :title="Translate('IDCS_INFORMATION_MSG')"
            width="400"
        >
            <div>
                <div>{{ Translate('IDCS_FILE_TYPE') }}: CSV+JPG</div>
                <div class="text-error">{{ Translate('IDCS_EXPORT_UNENCRYPTED_TIP') }}</div>
            </div>
            <div class="base-btn-box">
                <el-button @click="confirmExportGroup">{{ Translate('IDCS_OK') }}</el-button>
                <el-button @click="pageData.isExportTipPop = false">{{ Translate('IDCS_CANCEL') }}</el-button>
            </div>
        </el-dialog>
        <IntelFaceDBExportPop
            v-model="pageData.isExportPop"
            :data="pageData.exportMap"
            @close="pageData.isExportPop = false"
        />
        <IntelFaceDBAddFacePop
            v-model="pageData.isAddFacePop"
            :group-id="pageData.addFaceGroupId"
            @close="confirmAddFace"
        />
        <IntelFaceDBEditFacePop
            v-model="pageData.isEditFacePop"
            :list="pageData.editFaceData"
            :group-id="pageData.editFaceGroupId"
            @confirm="confirmEditFace"
            @close="pageData.isEditFacePop = false"
        />
    </div>
</template>

<script lang="ts" src="./IntelFaceDB.v.ts"></script>

<style lang="scss" scoped>
.expand {
    width: 100%;

    &-btns {
        width: 100%;
        padding: 5px 15px 10px;
        box-sizing: border-box;
        display: flex;
        justify-content: flex-start;

        .el-input {
            width: 250px;
            margin: 0 10px;
        }
    }

    &-content {
        width: 100%;
        display: flex;
        justify-content: space-around;
    }

    &-list {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        margin: 0 15px;

        & > div:first-child {
            border: 1px solid var(--table-border);
            height: 100%;

            & > div {
                display: flex;
                flex-wrap: wrap;
            }
        }
    }

    &-info {
        width: 500px;
        border: 1px solid var(--table-border);
        margin-right: 15px;
        flex-shrink: 0;
    }

    &-avatar {
        box-sizing: border-box;
        width: 100%;
        height: 200px;
        display: flex;
        flex-wrap: wrap;

        img {
            width: 100px;
            height: 100px;
            border: 1px solid var(--intel-snap-border);
            margin: 20px;
        }
    }
}

.base-pagination-box {
    border-top: 1px solid var(--content-border);
}
</style>
