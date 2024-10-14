<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-18 13:37:21
 * @Description: 现场预览-底部视图-手动报警
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-29 16:39:24
-->
<template>
    <div>
        <el-popover
            v-model:visible="pageData.isAlarmPop"
            placement="top"
            width="600px"
            trigger="click"
        >
            <template #reference>
                <div>
                    <el-tooltip
                        :content="Translate('IDCS_MANUAL_ALARM')"
                        :show-after="500"
                    >
                        <BaseImgSprite
                            file="manual_trigger_alarm"
                            :index="pageData.isAlarmPop ? 2 : 0"
                            :hover-index="1"
                            :chunk="4"
                        />
                    </el-tooltip>
                </div>
            </template>
            <div>
                <el-table
                    :data="tableData"
                    border
                    stripe
                    height="400px"
                >
                    <el-table-column
                        :label="Translate('IDCS_ALARM_OUT_NAME')"
                        prop="name"
                    />
                    <el-table-column
                        :label="Translate('IDCS_STATE')"
                        prop="switch"
                    >
                        <template #default="scope">
                            {{ displaySwitch(scope.row.switch) }}
                        </template>
                    </el-table-column>
                    <el-table-column :label="Translate('IDCS_MANUAL_TRIGGER')">
                        <template #default="scope">
                            <el-button
                                :disabled
                                @click="setStatus(scope.row.id, scope.$index, true)"
                                >{{ Translate('IDCS_MANUAL_TRIGGER') }}</el-button
                            >
                        </template>
                    </el-table-column>
                    <el-table-column
                        v-if="theme.name === 'UI2-A'"
                        :label="Translate('IDCS_DELAY')"
                        prop="delay"
                    >
                        <template #header>
                            <el-dropdown
                                trigger="click"
                                :disabled
                            >
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_DELAY') }}
                                </BaseTableDropdownLink>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="item in pageData.delayList"
                                            :key="item.value"
                                            @click="changeAllDelay(item.value)"
                                            >{{ item.label }}</el-dropdown-item
                                        >
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="scope">
                            <el-select
                                v-model="scope.row.delay"
                                :disabled
                            >
                                <el-option
                                    v-for="item in pageData.delayList"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value"
                                />
                            </el-select>
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_CLEAR_AWAY')"
                        prop="clear"
                    >
                        <template #header>
                            <el-dropdown
                                trigger="click"
                                :disabled
                            >
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_CLEAR_AWAY') }}
                                </BaseTableDropdownLink>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item @click="setStatus('', -1, false)">{{ Translate('IDCS_CLEAR_ALL') }}</el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>
                        <template #default="scope">
                            <el-button
                                :disabled
                                @click="setStatus(scope.row.id, scope.$index, false)"
                                >{{ Translate('IDCS_CLEAR_AWAY') }}</el-button
                            >
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </el-popover>
    </div>
</template>

<script lang="ts" src="./LiveScreenAlarmOut.v.ts"></script>
