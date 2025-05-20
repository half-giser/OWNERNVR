<!--
 * @Date: 2025-05-16 14:29:31
 * @Description: 普通事件-联动-IPC闪灯
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <div>
        <el-popover
            v-model:visible="pageData.isDropdown"
            width="fit-content"
            popper-class="no-padding"
        >
            <template #reference>
                <BaseTableDropdownLink> IPC_{{ Translate('IDCS_LIGHT') }} </BaseTableDropdownLink>
            </template>
            <BaseTransferPopover
                source-title="IDCS_CHANNEL"
                target-title="IDCS_CHANNEL_TRGGER"
                :visible="pageData.isDropdown"
                :source-data="pageData.chlList"
                :linked-list="[]"
                limit-tip="IDCS_RECORD_CHANNEL_LIMIT"
                @confirm="confirmAll"
                @close="closeAll"
            />
        </el-popover>
        <BaseTransferPop
            :model-value="pageData.isPop"
            :header-title="Translate('IDCS_CHANNEL_TRGGER_XXX').formatForLang(Translate('IDCS_LIGHT'))"
            source-title="IDCS_CHANNEL"
            target-title="IDCS_CHANNEL_TRGGER"
            :source-data="pageData.chlList"
            :linked-list="chlLinkList"
            limit-tip="IDCS_RECORD_CHANNEL_LIMIT"
            append-to-body
            @confirm="confirm"
            @close="close"
            @update:model-value="close"
        />
    </div>
</template>

<script lang="ts" src="./AlarmBaseTriggerWhiteLightPop.v.ts"></script>
