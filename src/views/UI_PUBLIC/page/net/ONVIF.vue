<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-15 09:09:46
 * @Description: OVNIF
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-16 10:47:37
-->
<template>
    <div class="base-flex-box">
        <el-form label-position="left">
            <el-form-item>
                <el-checkbox v-model="formData.switch">{{ Translate('IDCS_ENABLE_ONVIF_SERVER') }}</el-checkbox>
            </el-form-item>
        </el-form>
        <div
            class="base-btn-box add-user"
            span="2"
        >
            <div>{{ Translate('IDCS_USER_LIST') }}</div>
            <div>
                <el-button @click="addUser">{{ Translate('IDCS_ADD') }}</el-button>
            </div>
        </div>
        <div class="base-table-box">
            <el-table
                :data="tableData"
                border
                stripe
            >
                <el-table-column
                    :label="Translate('IDCS_SERIAL_NUMBER')"
                    type="index"
                    width="70"
                />
                <el-table-column
                    :label="Translate('IDCS_USER_NAME')"
                    prop="userName"
                />
                <el-table-column
                    :label="Translate('IDCS_USER_TYPE')"
                    prop="userLevel"
                >
                    <template #default="scope">{{ displayUserLevel(scope.row.userLevel) }}</template>
                </el-table-column>
                <el-table-column :label="Translate('IDCS_EDIT')">
                    <template #default="scope">
                        <BaseImgSprite
                            file="edit (2)"
                            :index="0"
                            :hover-index="1"
                            :chunk="4"
                            @click="editUser(scope.row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column :label="Translate('IDCS_DELETE')">
                    <template #header>
                        <el-dropdown trigger="click">
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_DELETE') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click="deleteAllUser">{{ Translate('IDCS_DELETE_ALL') }} </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <BaseImgSprite
                            file="del"
                            :index="0"
                            :hover-index="1"
                            :chunk="4"
                            @click="deleteUser(scope.row)"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="base-btn-box">
            <el-button @click="verify">{{ Translate('IDCS_APPLY') }}</el-button>
        </div>
        <ONVIFUserAddPop
            v-model="pageData.isUserPop"
            :type="pageData.userPopType"
            :user-data="pageData.userData"
            @confirm="confirmUser"
            @close="pageData.isUserPop = false"
        />
    </div>
</template>

<script lang="ts" src="./ONVIF.v.ts"></script>

<style lang="scss" scoped>
.add-user {
    margin-bottom: 10px;
}
</style>
