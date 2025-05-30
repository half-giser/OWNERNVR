<!--
 * @Date: 2025-05-04 16:02:54
 * @Description: RS485
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <div class="base-flex-box">
        <el-form
            ref="formRef"
            :model="formData"
            :rules="formRules"
            class="stripe"
        >
            <el-form-item>
                <el-checkbox
                    v-model="formData.switch"
                    :label="Translate('IDCS_ENABLE')"
                />
            </el-form-item>
            <el-form-item
                :label="Translate('IDCS_NAME')"
                prop="name"
            >
                <BaseTextInput
                    v-model="formData.name"
                    :disabled="!pageData.switch"
                    :maxlength="32"
                    :formatter="formatName"
                    @out-of-range="handleNameOutOfRange"
                />
            </el-form-item>
        </el-form>
        <div class="base-btn-box space-between gap">
            <div>{{ Translate('IDCS_OPERATION_LIST') }}</div>
            <el-button
                :disabled="!pageData.switch"
                @click="add"
            >
                {{ Translate('IDCS_ADD') }}
            </el-button>
        </div>
        <div class="base-table-box">
            <el-table
                :data="tableData"
                :row-class-name="() => (!pageData.switch ? 'disabled' : '')"
            >
                <el-table-column
                    :label="Translate('IDCS_OPERATION')"
                    prop="name"
                    width="200"
                />
                <el-table-column
                    :label="Translate('IDCS_CONFIGURATION')"
                    min-width="200"
                    prop="settingInfos"
                />
                <el-table-column
                    :label="Translate('IDCS_TEST')"
                    width="120"
                >
                    <template #default="{ row }: TableColumn<SystemRS485Dto>">
                        <el-button
                            :disabled="!pageData.switch"
                            @click="test(row.id)"
                            >{{ Translate('IDCS_TEST') }}</el-button
                        >
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_EDIT')"
                    width="100"
                >
                    <template #default="{ row }: TableColumn<SystemRS485Dto>">
                        <BaseImgSpriteBtn
                            file="edit2"
                            :disabled="!pageData.switch"
                            @click="edit(row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_DELETE')"
                    width="100"
                >
                    <template #header>
                        <el-dropdown :disabled="!pageData.switch">
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
                        </el-dropdown>
                    </template>
                    <template #default="{ row }: TableColumn<SystemRS485Dto>">
                        <BaseImgSpriteBtn
                            file="del"
                            :disabled="!pageData.switch"
                            @click="del(row)"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="base-btn-box">
            <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
        </div>
        <RS485AddPop
            v-model="pageData.isAddPop"
            :type="pageData.addPopType"
            :row="pageData.popData"
            :protocol-type-list="pageData.protocolTypeList"
            :operate-type-list="pageData.operateTypeList"
            :forbidden-chars-list="pageData.forbiddenCharsList"
            :baud-rate-type-list="pageData.baudRateTypeList"
            :max-count="pageData.maxCount"
            :count="pageData.count"
            @confirm="confirmAdd"
            @close="pageData.isAddPop = false"
        />
    </div>
</template>

<script lang="ts" src="./RS485.v.ts"></script>
