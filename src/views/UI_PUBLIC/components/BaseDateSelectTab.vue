<!--
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-06-24 17:04:15
 * @Description: 通用的日期选择选项卡组件
-->

<template>
    <el-menu
        class="tab-style"
        mode="horizontal"
        :default-active="selectedDateInfo.currentDateIndex"
        @select="handleSelect"
    >
        <el-menu-item index="day">{{ Translate('IDCS_DAY_ALL') }}</el-menu-item>
        <el-menu-item index="week">{{ Translate('IDCS_WEEK') }}</el-menu-item>
        <el-menu-item index="month">{{ Translate('IDCS_MONTH_ALL') }}</el-menu-item>
        <el-menu-item index="custom">{{ Translate('IDCS_REPLAY_CUSTOMIZE') }}</el-menu-item>
        <el-menu-item index="today">{{ `${Translate('IDCS_CALENDAR_TODAY')} ${new Date().format(dateTimeFormat.dateFormat)}` }}</el-menu-item>
    </el-menu>
</template>

<script lang="ts" src="./BaseDateSelectTab.v.ts"></script>

<style scoped lang="scss"></style>
