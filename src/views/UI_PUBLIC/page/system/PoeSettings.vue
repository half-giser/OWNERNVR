<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-19 17:29:22
 * @Description: POE电源管理
-->
<template>
    <div class="base-flex-box">
        <BaseTab
            v-model="pageData.tab"
            :options="pageData.tabOptions"
            @change="changeTab"
        />

        <div
            v-show="pageData.tab === 'poePower'"
            class="base-table-box"
        >
            <el-table
                v-title
                :data="tableData"
                show-overflow-tooltip
            >
                <el-table-column
                    :label="Translate('IDCS_POE_NAME')"
                    prop="poeName"
                />
                <el-table-column>
                    <template #header>
                        <BaseDropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_ENABLE') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.switchOptions"
                                        :key="item.value"
                                        @click="changeAllSwitch(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </BaseDropdown>
                    </template>
                    <template #default="{ row }: TableColumn<SystemPoeList>">
                        <BaseSelect
                            v-model="row.switch"
                            :options="pageData.switchOptions"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_CURRENT_POWER')"
                    prop="power"
                />
            </el-table>
        </div>
        <div
            v-show="pageData.tab === 'poePower'"
            class="base-btn-box space-between"
        >
            <div class="sum">
                <div>
                    <span>{{ Translate('IDCS_TOTAL_POWER') }}: </span>
                    <span>{{ pageData.totalPower }}W</span>
                </div>
                <div>
                    <span>{{ Translate('IDCS_REMAIN_POWER') }}: </span>
                    <span>{{ pageData.remainPower }}W</span>
                </div>
            </div>
            <el-button
                :disabled="!tableData.length"
                @click="setData"
            >
                {{ Translate('IDCS_APPLY') }}
            </el-button>
        </div>
        <div
            v-show="pageData.tab === 'poeExtensionSetup'"
            class="base-table-box"
        >
            <el-table
                ref="poeTableRef"
                v-title
                :data="poeTableData"
            >
                <el-table-column
                    type="selection"
                    width="120"
                    :label="Translate('IDCS_ENABLE')"
                />
                <el-table-column
                    :label="Translate('IDCS_POE_EXTENSION_NAME')"
                    prop="poeName"
                />
            </el-table>
        </div>
        <div
            v-show="pageData.tab === 'poeExtensionSetup'"
            class="base-btn-box space-between"
        >
            <span>{{ Translate('IDCS_SYSTEM_POE_EXTENSION_TIP') }}</span>
            <el-button
                :disabled="!tableData.length"
                @click="setPoeData"
            >
                {{ Translate('IDCS_APPLY') }}
            </el-button>
        </div>
    </div>
</template>

<script lang="ts" src="./PoeSettings.v.ts"></script>

<style lang="scss" scoped>
.sum {
    display: flex;

    & > div {
        margin-right: 10px;
    }
}

:deep(.el-table__header) {
    .el-table-column--selection .el-checkbox::after {
        content: attr(aria-label);
        margin-left: 5px;
        font-weight: bolder;
    }
}
</style>
