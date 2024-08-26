<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-18 18:05:25
 * @Description:
-->
<template>
    <el-dialog
        v-model="popVisiable"
        :title="Translate('IDCS_ADD_CHANNEL')"
        width="600"
        align-center
        draggable
        @opened="opened"
    >
        <el-table
            ref="tableRef"
            border
            stripe
            :data="tableData"
            table-layout="fixed"
            show-overflow-tooltip
            empty-text=" "
            highlight-current-row
            height="500px"
            @row-click="handleRowClick"
            @selection-change="handleSelectionChange"
        >
            <el-table-column
                type="index"
                :label="Translate('IDCS_SERIAL_NUMBER')"
                width="80px"
            />
            <el-table-column
                type="selection"
                width="50px"
            />
            <el-table-column
                prop="name"
                :label="Translate('IDCS_CHANNEL_NAME')"
                min-width="140px"
            />
            <el-table-column
                prop="ip"
                :label="Translate('IDCS_ADDRESS')"
                min-width="140px"
            />
            <el-table-column
                :label="Translate('IDCS_PREVIEW')"
                width="80px"
            >
                <template #default="scope">
                    <BaseImgSprite
                        file="play (3)"
                        :chunk="4"
                        :index="0"
                        :hover-index="1"
                        :active-index="1"
                        @click="handlePreview(scope.row)"
                    />
                </template>
            </el-table-column>
        </el-table>
        <template #footer>
            <el-row>
                <el-col
                    :span="12"
                    class="el-col-flex-start"
                >
                    <span>{{ Translate('IDCS_SELECT_CHANNEL_COUNT').formatForLang(selNum, total) }}</span>
                </el-col>
                <el-col
                    :span="12"
                    class="el-col-flex-end"
                >
                    <el-button @click="save()">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="$emit('close')">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
    <BaseLivePop ref="baseLivePopRef"></BaseLivePop>
</template>

<script lang="ts" src="./ChannelGroupAddChlPop.v.ts"></script>

<style scoped lang="scss"></style>
