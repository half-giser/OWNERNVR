<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-11-08 12:02:04
 * @Description: 普通事件-联动-录像
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
                    {{ Translate('IDCS_RECORD') }}
                </BaseTableDropdownLink>
            </template>
            <BaseTransferPopover
                source-title="IDCS_CHANNEL"
                target-title="IDCS_CHANNEL_TRGGER"
                :visible="pageData.isDropdown"
                :source-data="pageData.recordList"
                :linked-list="[]"
                limit-tip="IDCS_RECORD_CHANNEL_LIMIT"
                @confirm="confirmAll"
                @close="closeAll"
            />
        </BasePopover>
        <BaseTransferPop
            :model-value="pageData.isPop"
            header-title="IDCS_TRIGGER_CHANNEL_RECORD"
            source-title="IDCS_CHANNEL"
            target-title="IDCS_CHANNEL_TRGGER"
            :source-data="pageData.recordList"
            :linked-list="chlLinkList"
            limit-tip="IDCS_RECORD_CHANNEL_LIMIT"
            append-to-body
            @confirm="confirm"
            @close="close"
            @update:model-value="close"
        />
    </div>
</template>

<script lang="ts" src="./AlarmBaseRecordPop.v.ts"></script>
