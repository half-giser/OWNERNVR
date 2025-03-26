<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-02 14:00:27
 * @Description: 车牌库
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
                @row-click="handleRowClick"
                @expand-change="handleExpandChange"
            >
                <el-table-column
                    :label="Translate('IDCS_SERIAL_NUMBER')"
                    :width="80"
                    type="index"
                />
                <el-table-column :label="Translate('IDCS_GROUP')">
                    <template #default="{ row }: TableColumn<IntelPlateDBGroupList>"> {{ row.name }} ({{ row.plateNum }}) </template>
                </el-table-column>
                <el-table-column />
                <el-table-column :label="Translate('IDCS_EDIT')">
                    <template #default="{ row }: TableColumn<IntelPlateDBGroupList>">
                        <BaseImgSpriteBtn
                            file="edit2"
                            @click="editGroup(row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column :label="Translate('IDCS_DELETE')">
                    <template #default="{ row }: TableColumn<IntelPlateDBGroupList>">
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
                    <template #default="{ row }: TableColumn<IntelPlateDBGroupList>">
                        <div
                            v-if="pageData.expandRowKey.includes(row.id)"
                            class="expand"
                        >
                            <div class="base-btn-box form">
                                <el-input
                                    v-model="formData.name"
                                    class="search"
                                    :placeholder="Translate('IDCS_SEARCH_TARGET_LICENSE_PLATE')"
                                    @focus="handleNameFocus"
                                    @keyup="bounceSearchPlate(row.id)"
                                />
                                <el-button @click="addPlate(row.id)">{{ Translate('IDCS_ADD_LICENSE_PLATE') }}</el-button>
                            </div>
                            <el-table
                                :data="groupTableData"
                                highlight-current-row
                                height="300"
                                @row-click="handleExpandRowClick"
                            >
                                <el-table-column :label="Translate('IDCS_LICENSE_PLATE_NUM')">
                                    <template #default="data: TableColumn<IntelPlateDBPlateInfo>">
                                        {{ displayPlateNumber(data.row) }}
                                    </template>
                                </el-table-column>
                                <el-table-column
                                    :label="Translate('IDCS_VEHICLE_TYPE')"
                                    prop="vehicleType"
                                />
                                <el-table-column :label="Translate('IDCS_VEHICLE_OWNER')">
                                    <template #default="data: TableColumn<IntelPlateDBPlateInfo>">
                                        {{ displayOwner(data.row) }}
                                    </template>
                                </el-table-column>
                                <el-table-column :label="Translate('IDCS_PHONE_NUMBER')">
                                    <template #default="data: TableColumn<IntelPlateDBPlateInfo>">
                                        {{ displayPhone(data.row) }}
                                    </template>
                                </el-table-column>
                                <el-table-column :label="Translate('IDCS_EDIT')">
                                    <template #default="data: TableColumn<IntelPlateDBPlateInfo>">
                                        <BaseImgSpriteBtn
                                            file="edit2"
                                            @click="editPlate(data.row)"
                                        />
                                    </template>
                                </el-table-column>
                                <el-table-column :label="Translate('IDCS_DELETE')">
                                    <template #default="data: TableColumn<IntelPlateDBPlateInfo>">
                                        <BaseImgSpriteBtn
                                            file="del"
                                            @click="deletePlate(data.row)"
                                        />
                                    </template>
                                </el-table-column>
                            </el-table>
                            <div class="base-pagination-box">
                                <BasePagination
                                    v-model:current-page="formData.pageIndex"
                                    v-model:page-size="formData.pageSize"
                                    :page-sizes="[15, 20, 30]"
                                    :total="formData.total"
                                    @current-change="changePlatePage($event, row.id)"
                                    @size-change="changePlatePageSize($event, row.id)"
                                />
                            </div>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="base-btn-box space-between padding">
            <el-button @click="handleVehicleRecognition">{{ Translate('IDCS_VEHICLE_DETECTION') }}</el-button>
            <div>
                <el-button
                    :disabled="!tableData.length"
                    @click="addPlate('')"
                >
                    {{ Translate('IDCS_ADD_LICENSE_PLATE') }}
                </el-button>
                <el-button @click="addGroup">{{ Translate('IDCS_ADD_GROUP') }}</el-button>
                <el-button
                    v-show="!pageData.isExportDisabled"
                    :disabled="!tableData.length"
                    @click="exportGroup"
                >
                    {{ Translate('IDCS_EXPORT') }}
                </el-button>
            </div>
        </div>
        <IntelLicencePlateDBExportPop
            v-model="pageData.isExportPop"
            :data="pageData.exportMap"
            :total="pageData.exportTotal"
            @close="pageData.isExportPop = false"
        />
        <IntelLicencePlateDBEditPop
            v-model="pageData.isEditPop"
            :data="pageData.editData"
            :type="pageData.editType"
            @confirm="confirmEditGroup"
            @close="pageData.isEditPop = false"
        />
        <IntelLicencePlateDBAddPlatePop
            v-model="pageData.isEditPlatePop"
            :data="pageData.editPlateData"
            :type="pageData.editPlateType"
            @confirm="confirmEditPlate"
            @close="pageData.isEditPlatePop = false"
        />
    </div>
</template>

<script lang="ts" src="./IntelLicencePlateDB.v.ts"></script>

<style lang="scss" scoped>
.form {
    margin-bottom: 10px;
}

.expand {
    padding: 15px;
}

.search {
    margin-right: 10px;
    width: 200px;
}
</style>
