<!--
 * @Date: 2025-05-06 09:12:00
 * @Description: 
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <div class="base-flex-box">
        <el-form class="no-padding">
            <el-form-item>
                <el-checkbox
                    v-model="formData.switch"
                    :label="Translate('IDCS_ENABLE')"
                />
            </el-form-item>
        </el-form>
        <div class="header base-btn-box space-between">
            <div>{{ Translate('IDCS_USER_LIST') }}</div>
            <el-button @click="add">{{ Translate('IDCS_ADD') }}</el-button>
        </div>
        <div class="base-table-box">
            <el-table
                :data="tableData"
                show-overflow-tooltip
            >
                <el-table-column
                    :label="Translate('IDCS_DOUBLE_VERIFICATION_USER')"
                    min-width="200"
                    prop="userName"
                />
                <el-table-column
                    :label="Translate('IDCS_LOGIN_USER')"
                    min-width="400"
                >
                    <template #default="{ row }: TableColumn<UserDualAuthUserDto>">
                        <span>{{ row.limitLoginUsers.length ? row.limitLoginUsers.map((item) => item.userName).join('; ') : `<${Translate('IDCS_NULL')}>` }}</span>
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_EDIT')"
                    width="100"
                >
                    <template #default="{ row }: TableColumn<UserDualAuthUserDto>">
                        <BaseImgSpriteBtn
                            file="edit2"
                            @click="edit(row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_DELETE')"
                    width="100"
                >
                    <template #header>
                        <BaseDropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_DELETE') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click="delAll">
                                        {{ Translate('IDCS_DELETE_ALL') }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </BaseDropdown>
                    </template>
                    <template #default="{ row }: TableColumn<UserDualAuthUserDto>">
                        <BaseImgSpriteBtn
                            file="del"
                            @click="del(row)"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="base-btn-box">
            <el-button @click="setDualAuthCfg">{{ Translate('IDCS_APPLY') }}</el-button>
        </div>
        <BaseCheckAuthPop
            v-model="pageData.isCheckAuthPop"
            @confirm="confirmCheckAuth"
            @close="pageData.isCheckAuthPop = false"
        />
        <DualAuthConfigAddPop
            v-model="pageData.isAddPop"
            :type="pageData.addPopType"
            :row="pageData.popData"
            @confirm="confirmAdd"
            @close="pageData.isAddPop = false"
        />
    </div>
</template>

<script lang="ts" src="./DualAuthConfig.v.ts"></script>

<style lang="scss" scoped>
.header {
    margin: 0 0 10px;
}
</style>
