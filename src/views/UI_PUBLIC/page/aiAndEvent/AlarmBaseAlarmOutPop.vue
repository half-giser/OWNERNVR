<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-11-08 10:15:46
 * @Description: 普通事件-联动-报警输出
-->
<template>
    <div>
        <BasePopover
            v-model:visible="pageData.isDropdown"
            width="fit-content"
            popper-class="no-padding"
        >
            <template #reference>
                <BaseTableDropdownLink>
                    {{ Translate('IDCS_ALARM_OUT') }}
                </BaseTableDropdownLink>
            </template>
            <BaseTransferPopover
                source-title="IDCS_ALARM_OUT"
                target-title="IDCS_ALARM_OUT"
                :visible="pageData.isDropdown"
                :source-data="pageData.alarmOutList"
                :linked-list="[]"
                limit-tip="IDCS_ALARMOUT_LIMIT"
                @confirm="confirmAll"
                @close="closeAll"
            />
        </BasePopover>
        <BaseTransferPop
            :model-value="pageData.isPop"
            header-title="IDCS_TRIGGER_ALARM_OUT"
            source-title="IDCS_ALARM_OUT"
            target-title="IDCS_TRIGGER_ALARM_OUT"
            :source-data="chlSourceList"
            :linked-list="chlLinkList"
            limit-tip="IDCS_ALARMOUT_LIMIT"
            append-to-body
            @confirm="confirm"
            @close="close"
            @update:model-value="close"
        />
    </div>
</template>

<script lang="ts" src="./AlarmBaseAlarmOutPop.v.ts"></script>
