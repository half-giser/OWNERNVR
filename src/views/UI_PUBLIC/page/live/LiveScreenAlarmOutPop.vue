<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-18 13:37:21
 * @Description: 现场预览-底部视图-手动报警
-->
<template>
    <div>
        <BasePopover
            v-model:visible="pageData.isAlarmPop"
            placement="top"
            width="600"
            popper-class="no-padding"
        >
            <template #reference>
                <div class="refer">
                    <BaseImgSpriteBtn
                        file="manual_trigger_alarm"
                        :title="Translate('IDCS_MANUAL_ALARM')"
                        :active="pageData.isAlarmPop"
                    />
                </div>
            </template>
            <el-table
                v-title
                :data="tableData"
                height="400"
                show-overflow-tooltip
            >
                <el-table-column
                    :label="Translate('IDCS_ALARM_OUT_NAME')"
                    prop="name"
                />
                <el-table-column :label="Translate('IDCS_STATE')">
                    <template #default="{ row }: TableColumn<LiveAlarmList>">
                        {{ displaySwitch(row.switch) }}
                    </template>
                </el-table-column>
                <el-table-column :label="Translate('IDCS_MANUAL_TRIGGER')">
                    <template #default="{ row, $index }: TableColumn<LiveAlarmList>">
                        <el-button
                            :disabled
                            @click="setStatus(row.id, $index, true)"
                        >
                            {{ Translate('IDCS_MANUAL_TRIGGER') }}
                        </el-button>
                    </template>
                </el-table-column>
                <el-table-column
                    v-if="isDelay"
                    :label="Translate('IDCS_DELAY')"
                >
                    <template #header>
                        <BaseDropdown :disabled>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_DELAY') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.delayList"
                                        :key="item.value"
                                        @click="changeAllDelay(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </BaseDropdown>
                    </template>
                    <template #default="{ row }: TableColumn<LiveAlarmList>">
                        <BaseSelect
                            v-model="row.delay"
                            :disabled
                            :options="pageData.delayList"
                        />
                    </template>
                </el-table-column>
                <el-table-column :label="Translate('IDCS_CLEAR_AWAY')">
                    <template #header>
                        <BaseDropdown :disabled>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_CLEAR_AWAY') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click="clearAllStatus">{{ Translate('IDCS_CLEAR_ALL') }}</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </BaseDropdown>
                    </template>
                    <template #default="{ row, $index }: TableColumn<LiveAlarmList>">
                        <el-button
                            :disabled
                            @click="setStatus(row.id, $index, false)"
                        >
                            {{ Translate('IDCS_CLEAR_AWAY') }}
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </BasePopover>
    </div>
</template>

<script lang="ts" src="./LiveScreenAlarmOutPop.v.ts"></script>

<style lang="less" scoped>
.refer {
    width: 34px;
    height: 50px;
    display: flex;
    align-items: center;
    margin: 0 5px;
}
</style>
