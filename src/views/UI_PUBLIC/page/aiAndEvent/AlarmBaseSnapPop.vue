<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-11-08 11:23:39
 * @Description: 普通事件-联动-抓图
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
                    {{ Translate('IDCS_SNAP') }}
                </BaseTableDropdownLink>
            </template>
            <BaseTransferPopover
                source-title="IDCS_CHANNEL"
                target-title="IDCS_CHANNEL_TRGGER"
                :visible="pageData.isDropdown"
                :source-data="pageData.snapList"
                :linked-list="[]"
                limit-tip="IDCS_ALARMOUT_LIMIT"
                @confirm="confirmAll"
                @close="closeAll"
            />
        </BasePopover>
        <BaseTransferPop
            :model-value="pageData.isPop"
            header-title="IDCS_TRIGGER_CHANNEL_SNAP"
            source-title="IDCS_CHANNEL"
            target-title="IDCS_CHANNEL_TRGGER"
            :source-data="chlSourceList"
            :linked-list="chlLinkList"
            limit-tip="IDCS_SNAP_CHANNEL_LIMIT"
            append-to-body
            @confirm="confirm"
            @close="close"
            @update:model-value="close"
        />
    </div>
</template>

<script lang="ts" src="./AlarmBaseSnapPop.v.ts"></script>
