<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-05 17:32:15
 * @Description: 存储模式新增通道弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_ADD_CHANNEL')"
        width="600"
        @open="open"
    >
        <div>
            <el-table
                :data="tableData"
                height="400"
                show-overflow-tooltip
                @selection-change="changeSelection"
            >
                <el-table-column
                    :label="Translate('IDCS_SERIAL_NUMBER')"
                    type="index"
                    width="70"
                />
                <el-table-column
                    type="selection"
                    width="55"
                />
                <el-table-column
                    :label="Translate('IDCS_CHANNEL_NAME')"
                    prop="name"
                />
                <el-table-column
                    :label="Translate('IDCS_ADDRESS')"
                    prop="ip"
                />
                <el-table-column :label="Translate('IDCS_PREVIEW')">
                    <template #default="scope: TableColumn<StorageModeChlList>">
                        <BaseImgSprite
                            file="play (3)"
                            :chunk="4"
                            :index="0"
                            :hover-index="1"
                            @click="preview(scope.row)"
                        />
                    </template>
                </el-table-column>
            </el-table>
            <BaseLivePop ref="liveRef" />
        </div>
        <div class="base-btn-box space-between">
            <div>
                {{ Translate('IDCS_SELECT_CHANNEL_COUNT').formatForLang(pageData.selection.length, tableData.length) }}
            </div>
            <div>
                <el-button @click="confirm">{{ Translate('IDCS_ADD') }}</el-button>
                <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./StorageModeAddChlPop.v.ts"></script>
