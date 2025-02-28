<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-15 09:09:46
 * @Description: OVNIF
-->
<template>
    <div class="base-flex-box">
        <el-form>
            <el-form-item>
                <el-checkbox
                    v-model="formData.switch"
                    :label="Translate('IDCS_ENABLE_ONVIF_SERVER')"
                />
            </el-form-item>
        </el-form>
        <div class="base-btn-box space-between add-user">
            <div>{{ Translate('IDCS_USER_LIST') }}</div>
            <el-button @click="addUser">{{ Translate('IDCS_ADD') }}</el-button>
        </div>
        <div class="base-table-box">
            <el-table
                :data="tableData"
                show-overflow-tooltip
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
                    <template #default="{ row }: TableColumn<NetOnvifUserList>">{{ displayUserLevel(row.userLevel) }}</template>
                </el-table-column>
                <el-table-column :label="Translate('IDCS_EDIT')">
                    <template #default="{ row }: TableColumn<NetOnvifUserList>">
                        <BaseImgSpriteBtn
                            file="edit (2)"
                            @click="editUser(row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column :label="Translate('IDCS_DELETE')">
                    <template #header>
                        <el-dropdown>
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
                    <template #default="{ row }: TableColumn<NetOnvifUserList>">
                        <BaseImgSpriteBtn
                            file="del"
                            @click="deleteUser(row)"
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
