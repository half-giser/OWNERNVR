<!--
 * @Date: 2025-04-18 15:41:30
 * @Description: 排程表格下拉，包含排程管理选项
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <el-dropdown :disabled>
        <BaseTableDropdownLink>
            {{ label ? label : Translate('IDCS_SCHEDULE') }}
        </BaseTableDropdownLink>
        <template #dropdown>
            <el-dropdown-menu>
                <el-dropdown-item
                    v-for="opt in scheduleList"
                    :key="opt.value"
                    @click="update(opt.value)"
                >
                    {{ opt.label }}
                </el-dropdown-item>
            </el-dropdown-menu>
        </template>
    </el-dropdown>
</template>

<script lang="ts" src="./BaseScheduleTableDropdown.v.ts"></script>
