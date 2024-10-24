<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-05 17:32:15
 * @Description: 存储模式新增通道弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-24 09:14:04
-->
<template>
    <el-dialog
        :title="Translate('IDCS_ADD_CHANNEL')"
        width="600"
        align-center
        draggable
        @open="open"
    >
        <div>
            <el-table
                :data="tableData"
                border
                stripe
                height="400"
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
                    <template #default="scope">
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
        <template #footer>
            <el-row>
                <el-col
                    :span="12"
                    class="el-col-flex-start"
                >
                    {{ Translate('IDCS_SELECT_CHANNEL_COUNT').formatForLang(pageData.selection.length, tableData.length) }}
                </el-col>
                <el-col
                    :span="12"
                    class="el-col-flex-end"
                >
                    <el-button @click="confirm">{{ Translate('IDCS_ADD') }}</el-button>
                    <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./StorageModeAddChlPop.v.ts"></script>
