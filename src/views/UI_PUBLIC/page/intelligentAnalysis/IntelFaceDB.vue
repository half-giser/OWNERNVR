<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-29 10:06:12
 * @Description: 人脸库
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-14 11:08:51
-->
<template>
    <div class="base-flex-box">
        <div class="base-table-box">
            <el-table
                ref="tableRef"
                :data="tableData"
                :row-key="getRowKey"
                :expand-row-key="pageData.expandRowKey"
                highlight-current-row
                border
                stripe
                @row-click="handleRowClick"
                @expand-change="handleExpandChange"
            >
                <el-table-column
                    :label="Translate('IDCS_SERIAL_NUMBER')"
                    :width="80"
                    type="index"
                />
                <el-table-column :label="Translate('IDCS_GROUP')">
                    <template #default="scope"> {{ scope.row.name }} ({{ scope.row.count }}) </template>
                </el-table-column>
                <el-table-column>
                    <!-- <template #default="scope">
                        <div :class="getAlarmClassName(scope.row.id, scope.row.property)">{{ displayAlarmText(scope.row.property) }}</div>
                    </template> -->
                </el-table-column>
                <el-table-column :label="Translate('IDCS_EDIT')">
                    <template #default="scope">
                        <BaseImgSprite
                            file="edit (2)"
                            :index="0"
                            :hover-index="1"
                            :chunk="4"
                            @click="editGroup(scope.row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column :label="Translate('IDCS_DELETE')">
                    <template #default="scope">
                        <BaseImgSprite
                            file="del"
                            :index="0"
                            :hover-index="1"
                            :chunk="4"
                            @click="deleteGroup(scope.row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_EXPAND_OR_COLLAPSE')"
                    type="expand"
                    :width="200"
                >
                    <template #default="scope">
                        <div
                            v-if="pageData.expandRowKey.includes(scope.row.groupId)"
                            class="expand"
                        >
                            <div class="expand-btns">
                                <el-button @click="addFace(scope.row.groupId)">{{ Translate('IDCS_ADD') }}</el-button>
                                <el-button
                                    :disabled="!formData.faceIndex.length"
                                    @click="editFace(scope.row.groupId)"
                                    >{{ Translate('IDCS_CHANGE') }}</el-button
                                >
                                <!-- <el-button>{{ Translate('IDCS_COPY_TO') }}</el-button> -->
                                <el-button
                                    :disabled="!formData.faceIndex.length"
                                    @click="deleteFace"
                                    >{{ Translate('IDCS_DELETE') }}</el-button
                                >
                                <el-button
                                    :disabled="!groupTableData.length"
                                    @click="deleteAllFace"
                                    >{{ Translate('IDCS_CLEAR_ALL') }}</el-button
                                >
                                <el-button
                                    :disabled="!groupTableData.length"
                                    @click="selectAllFace"
                                    >{{ Translate('IDCS_SELECT_ALL') }}</el-button
                                >
                                <el-input
                                    v-model="formData.name"
                                    :placeholder="Translate('IDCS_SEARCH_TARGET_PERSON')"
                                />
                                <el-button @click="searchFace(scope.row.groupId)">{{ Translate('IDCS_SEARCH') }}</el-button>
                            </div>
                            <div class="expand-content">
                                <div class="expand-list">
                                    <div>
                                        <IntelBaseFaceItem
                                            v-for="(item, index) in groupTableData"
                                            :key="item.id"
                                            :src="item.pic[0] || ''"
                                            :model-value="formData.faceIndex.includes(index)"
                                            @update:model-value="selectFace(index, $event)"
                                        >
                                            {{ hideSensitiveInfo(item.name, 'medium', 'name') }}
                                        </IntelBaseFaceItem>
                                    </div>
                                    <div class="row_pagination">
                                        <el-pagination
                                            v-model:current-page="formData.pageIndex"
                                            :page-size="16"
                                            layout="prev, pager, next, total"
                                            :total="scope.row.count"
                                            size="small"
                                            @current-change="changeFacePage($event, scope.row.groupId)"
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
                                        label-position="left"
                                        class="stripe narrow inline-message"
                                    >
                                        <el-form-item :label="Translate('IDCS_NAME_PERSON')">
                                            <el-input
                                                :model-value="currentFace.name"
                                                disabled
                                            />
                                        </el-form-item>
                                        <el-form-item :label="Translate('IDCS_BIRTHDAY')">
                                            <el-input
                                                :model-value="currentFace.birthday"
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
        <div
            class="base-btn-box padding"
            :span="2"
        >
            <div>
                <el-button @click="handleFaceRecognition">{{ Translate('IDCS_FACE_RECOGNITION') }}</el-button>
            </div>
            <div>
                <el-button
                    :disabled="!tableData.length"
                    @click="addFace('')"
                    >{{ Translate('IDCS_ADD_FACE') }}</el-button
                >
                <el-button @click="addGroup">{{ Translate('IDCS_ADD_GROUP') }}</el-button>
                <el-button v-show="!pageData.isExportDisabled">{{ Translate('IDCS_EXPORT') }}</el-button>
            </div>
        </div>
        <BaseNotification v-model:notifications="pageData.notifications" />
        <IntelFaceDBEditPop
            v-model="pageData.isEditPop"
            :data="pageData.editData"
            :type="pageData.editType"
            @confirm="confirmEditGroup"
            @close="pageData.isEditPop = false"
        />
        <el-dialog v-model="pageData.isExportTipPop">
            <div>
                <div>{{ Translate('IDCS_FILE_TYPE') }}: CSV+JPG</div>
                <div class="text-error">{{ Translate('IDCS_EXPORT_UNENCRYPTED_TIP') }}</div>
            </div>
            <template #footer>
                <el-row>
                    <el-col
                        :span="24"
                        class="el-col-flex-end"
                    >
                        <el-button @click="confirmExportGroup">{{ Translate('IDCS_OK') }}</el-button>
                        <el-button @click="pageData.isExportTipPop = false">{{ Translate('IDCS_CANCEL') }}</el-button>
                    </el-col>
                </el-row>
            </template>
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
        padding: 5px 10px 10px;
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
        justify-content: space-between;
    }

    &-list {
        width: 580px;
        display: flex;
        flex-shrink: 0;
        flex-direction: column;
        border: 1px solid var(--content-border);
        justify-content: space-between;
        margin: 0 10px;

        & > div:first-child {
            display: flex;
            flex-wrap: wrap;
        }

        & > div:last-child {
            display: flex;
            justify-content: flex-end;
            padding: 2px 10px;
            box-sizing: border-box;
            height: 30px;
        }
    }

    &-info {
        width: 500px;
        border: 1px solid var(--content-border);
        margin-right: 10px;
        flex-shrink: 0;
    }

    &-avatar {
        box-sizing: border-box;
        width: 100%;
        height: 300px;
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

.row_pagination {
    border-top: 1px solid var(--content-border);
}
</style>
