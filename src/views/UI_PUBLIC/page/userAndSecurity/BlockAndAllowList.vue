<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-18 18:42:53
 * @Description: 黑白名单
-->
<template>
    <div class="base-flex-box">
        <el-form class="stripe">
            <el-form-item>
                <el-checkbox
                    v-model="formData.switch"
                    :label="Translate('IDCS_ENABLE')"
                />
            </el-form-item>
            <el-form-item>
                <el-radio-group
                    v-model="formData.filterType"
                    :disabled="!formData.switch"
                >
                    <el-radio
                        value="allow"
                        :label="Translate('IDCS_ENABLE_WHITE_LIST')"
                    />
                    <el-radio
                        value="refuse"
                        :label="Translate('IDCS_ENABLE_BLACK_LIST')"
                    />
                </el-radio-group>
            </el-form-item>
        </el-form>
        <div class="base-table-box">
            <el-table
                v-title
                flexible
                :data="tableData"
                show-overflow-tooltip
            >
                <el-table-column :label="Translate('IDCS_ENABLE')">
                    <template #default="{ row }: TableColumn<UserEditBlackAllowListForm>">
                        {{ row.switch ? Translate('IDCS_YES') : Translate('IDCS_NO') }}
                    </template>
                </el-table-column>
                <el-table-column :label="Translate('IDCS_IP_MAC_ADDRESS')">
                    <template #default="{ row }: TableColumn<UserEditBlackAllowListForm>">
                        {{ formatIpMacAddress(row) }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_EDIT')"
                    width="150"
                >
                    <template #default="{ row, $index }: TableColumn<UserEditBlackAllowListForm>">
                        <BaseImgSpriteBtn
                            file="edit2"
                            @click="openEditPop(row, $index)"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_DELETE')"
                    width="150"
                >
                    <template #default="{ $index }: TableColumn<UserEditBlackAllowListForm>">
                        <BaseImgSpriteBtn
                            file="del"
                            @click="delItem($index)"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="base-btn-box">
            <el-button
                :disabled="!formData.switch"
                @click="addIp"
            >
                {{ Translate('IDCS_ADD_IP') }}
            </el-button>
            <el-button
                :disabled="!formData.switch"
                @click="addMac"
            >
                {{ Translate('IDCS_ADD_MAC') }}
            </el-button>
            <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
        </div>
        <BlockAndAllowEditPop
            v-model="pageData.isEditPop"
            :index="pageData.editIndex"
            :table-data="tableData"
            :data="pageData.editData"
            @confirm="confirmEditItem"
            @close="pageData.isEditPop = false"
        />
    </div>
</template>

<script lang="ts" src="./BlockAndAllowList.v.ts"></script>
