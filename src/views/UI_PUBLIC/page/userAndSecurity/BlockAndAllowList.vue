<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-18 18:42:53
 * @Description: 黑白名单
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-04 19:32:23
-->
<template>
    <div class="BlackAllowList">
        <div>
            <el-checkbox v-model="formData.switch">
                {{ Translate('IDCS_ENABLE') }}
            </el-checkbox>
        </div>
        <div>
            <el-radio-group
                v-model="formData.filterType"
                :disabled="!formData.switch"
            >
                <el-radio value="allow">{{ Translate('IDCS_ENABLE_WHITE_LIST') }}</el-radio>
                <el-radio value="refuse">{{ Translate('IDCS_ENABLE_BLACK_LIST') }}</el-radio>
            </el-radio-group>
        </div>
        <el-table
            border
            stripe
            flexible
            :data="tableData"
        >
            <el-table-column :label="Translate('IDCS_ENABLE')">
                <template #default="scope">
                    {{ scope.switch ? Translate('IDCS_YES') : Translate('IDCS_NO') }}
                </template>
            </el-table-column>
            <el-table-column :label="Translate('IDCS_IP_MAC_ADDRESS')">
                <template #default="scope">
                    {{ formatIpMacAddress(scope.row) }}
                </template>
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_EDIT')"
                width="150px"
            >
                <template #default="scope">
                    <BaseImgSprite
                        file="edit (2)"
                        :index="0"
                        :hover-index="1"
                        :chunk="4"
                        @click.stop="handleEdit(scope.row, scope.$index)"
                    />
                </template>
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_DELETE')"
                width="150px"
            >
                <template #default="scope">
                    <BaseImgSprite
                        file="del"
                        :index="0"
                        :hover-index="1"
                        :chunk="4"
                        @click.stop="handleDelete(scope.$index)"
                    />
                </template>
            </el-table-column>
        </el-table>
        <div class="btns">
            <el-button
                :disabled="!formData.switch"
                @click="handleAddIp"
                >{{ Translate('IDCS_ADD_IP') }}</el-button
            >
            <el-button
                :disabled="!formData.switch"
                @click="handleAddMac"
                >{{ Translate('IDCS_ADD_MAC') }}</el-button
            >
            <el-button
                :disabled="pageData.submitDisabled"
                @click="setData"
                >{{ Translate('IDCS_APPLY') }}</el-button
            >
        </div>
        <BlockAndAllowEditPop
            v-model="pageData.isEditDialog"
            :index="pageData.editIndex"
            :table-data="tableData"
            :data="pageData.editData"
            @close="handleCloseEdit"
        />
    </div>
</template>

<script lang="ts" src="./BlockAndAllowList.v.ts"></script>

<style lang="scss" scoped>
.BlackAllowList {
    :deep(.el-table) {
        height: calc(100vh - 350px);
    }
    .btns {
        margin-top: 10px;
        width: 100%;
        display: flex;
        justify-content: flex-end;
    }
}
</style>
