<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-05-04 12:58:39
 * @Description:
-->
<template>
    <div id="ChannelGroupContent">
        <el-table
            ref="tableRef"
            class="ChannelGroupList"
            border
            stripe
            :data="tableData"
            table-layout="fixed"
            show-overflow-tooltip
            empty-text=" "
            highlight-current-row
            :show-header="false"
            :row-key="(row) => row.id"
            @expand-change="handleExpandChange"
        >
            <el-table-column
                prop="name"
                label="name"
                min-width="300px"
            />
            <el-table-column
                prop="dwellTime"
                label="dwellTime"
                min-width="300px"
            >
                <template #default="scope">
                    {{ formatDwellTime(scope.row.dwellTime) }}
                </template>
            </el-table-column>
            <el-table-column
                prop="chlCount"
                label="chlCount"
                min-width="300px"
            >
                <template #default="scope">
                    {{ Translate('IDCS_CHANNEL_NUM_D').formatForLang(scope.row.chlCount) }}
                </template>
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_EDIT')"
                width="60px"
            >
                <template #default="scope">
                    <BaseImgSprite
                        file="edit (2)"
                        :chunk="4"
                        :index="0"
                        :hover-index="1"
                        :active-index="1"
                        @click="handleEditChlGroup(scope.row)"
                    />
                </template>
            </el-table-column>
            <el-table-column
                :label="Translate('IDCS_DELETE')"
                width="60px"
            >
                <template #default="scope">
                    <BaseImgSprite
                        file="del"
                        :chunk="4"
                        :index="0"
                        :hover-index="1"
                        :active-index="1"
                        @click="handleDelChlGroup(scope.row)"
                    />
                </template>
            </el-table-column>
            <el-table-column
                type="expand"
                min-width="150px"
            >
                <template #default="props">
                    <div class="expandContent">
                        <div
                            v-for="item in props.row.chls"
                            :key="item.value"
                            class="subItem"
                            @mouseover="item.showDelIcon = true"
                            @mouseout="item.showDelIcon = false"
                        >
                            <div class="subItemText">{{ item.text }}</div>
                            <BaseImgSprite
                                v-show="item.showDelIcon"
                                class="subItemIcon"
                                file="delItem"
                                :chunk="1"
                                :index="0"
                                @click="handleDelChl(props.row, item.value)"
                            />
                        </div>
                        <BaseImgSprite
                            class="addIcon"
                            file="addItem"
                            :chunk="2"
                            :index="0"
                            @click="handleAddChl(props.row)"
                        />
                    </div>
                </template>
            </el-table-column>
        </el-table>
        <el-row class="row_pagination">
            <el-pagination
                v-model:current-page="pageIndex"
                v-model:page-size="pageSize"
                :page-sizes="DefaultPagerSizeOptions"
                small
                :background="false"
                :layout="DefaultPagerLayout"
                :total="pageTotal"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            />
        </el-row>
    </div>
    <ChannelGroupEditPop
        v-model="chlGroupEditPopVisiable"
        :edit-item="editItem"
        :call-back="setDataCallBack"
        :close="closeChlGroupEditPop"
    />
    <ChannelGroupAddChlPop
        :pop-visiable="chlGroupAddChlPopVisiable"
        :edit-item="editItemForAddChl"
        :close="closeChlGroupAddChlPop"
    />
</template>

<script lang="ts" src="./ChannelGroup.v.ts"></script>

<style scoped lang="scss">
.ChannelGroupList {
    height: calc(100vh - 263px);

    :deep(.el-table__cell) {
        border-right: none;
    }

    .expandContent {
        height: 100px;
        display: flex;
        align-items: flex-start;
        flex-wrap: wrap;
        padding: 5px;

        .subItem {
            width: 180px;
            display: flex;
            justify-content: flex-start;
            align-items: center;

            .subItemText {
                max-width: 135px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .subItemIcon {
                margin-left: 1px;
                cursor: pointer;
            }
        }
        .addIcon {
            cursor: pointer;
        }
    }
}
</style>
