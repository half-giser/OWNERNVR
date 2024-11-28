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
                    <template #default="scope"> {{ scope.row.name }} ({{ scope.row.plateNum }}) </template>
                </el-table-column>
                <el-table-column />
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
                            v-if="pageData.expandRowKey.includes(scope.row.id)"
                            class="expand"
                        >
                            <div class="base-btn-box form">
                                <el-input
                                    v-model="formData.name"
                                    class="search"
                                    :placeholder="Translate('IDCS_SEARCH_TARGET_LICENSE_PLATE')"
                                    @focus="handleNameFocus"
                                    @blur="searchPlate(scope.row.id)"
                                    @keydown.enter="searchPlate(scope.row.id)"
                                />
                                <el-button @click="addPlate(scope.row.id)">{{ Translate('IDCS_ADD_LICENSE_PLATE') }}</el-button>
                            </div>
                            <el-table
                                :data="groupTableData"
                                highlight-current-row
                                height="300"
                                @row-click="handleExpandRowClick"
                            >
                                <el-table-column :label="Translate('IDCS_LICENSE_PLATE_NUM')">
                                    <template #default="data">
                                        {{ displayPlateNumber(data.row) }}
                                    </template>
                                </el-table-column>
                                <el-table-column
                                    :label="Translate('IDCS_VEHICLE_TYPE')"
                                    prop="vehicleType"
                                />
                                <el-table-column :label="Translate('IDCS_VEHICLE_OWNER')">
                                    <template #default="data">
                                        {{ displayOwner(data.row) }}
                                    </template>
                                </el-table-column>
                                <el-table-column :label="Translate('IDCS_PHONE_NUMBER')">
                                    <template #default="data">
                                        {{ displayPhone(data.row) }}
                                    </template>
                                </el-table-column>
                                <el-table-column :label="Translate('IDCS_EDIT')">
                                    <template #default="data">
                                        <BaseImgSprite
                                            file="edit (2)"
                                            :index="0"
                                            :hover-index="1"
                                            :chunk="4"
                                            @click="editPlate(data.row)"
                                        />
                                    </template>
                                </el-table-column>
                                <el-table-column :label="Translate('IDCS_DELETE')">
                                    <template #default="data">
                                        <BaseImgSprite
                                            file="del"
                                            :index="0"
                                            :hover-index="1"
                                            :chunk="4"
                                            @click="deletePlate(data.row)"
                                        />
                                    </template>
                                </el-table-column>
                            </el-table>
                            <div class="base-pagination-box">
                                <el-pagination
                                    v-model:current-page="formData.pageIndex"
                                    v-model:page-size="formData.pageSize"
                                    :page-sizes="[15, 20, 30]"
                                    :total="formData.total"
                                    @current-change="changePlatePage($event, scope.row.id)"
                                    @size-change="changePlatePageSize($event, scope.row.id)"
                                />
                            </div>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div
            class="base-btn-box padding"
            span="2"
        >
            <div>
                <el-button @click="handleVehicleRecognition">{{ Translate('IDCS_VEHICLE_DETECTION') }}</el-button>
            </div>
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
