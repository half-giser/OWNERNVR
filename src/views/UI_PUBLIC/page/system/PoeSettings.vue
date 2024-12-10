<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-19 17:29:22
 * @Description: POE电源管理
-->
<template>
    <div class="base-flex-box">
        <div class="base-table-box">
            <el-table :data="tableData">
                <el-table-column
                    :label="Translate('IDCS_POE_NAME')"
                    prop="poeName"
                />
                <el-table-column :label="Translate('IDCS_ENABLE')">
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_SCHEDULE') }}
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
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select-v2
                            v-model="scope.row.switch"
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
        <div class="base-btn-box space-between">
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
</style>
