<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-05-04 12:58:39
 * @Description: 通道组
-->
<template>
    <div class="base-flex-box">
        <div class="base-table-box">
            <el-table
                ref="tableRef"
                :data="tableData"
                show-overflow-tooltip
                highlight-current-row
                :show-header="false"
                :border="false"
                :row-key="(row) => row.id"
                @expand-change="handleExpandChange"
            >
                <el-table-column
                    prop="name"
                    label="name"
                    width="300"
                />
                <el-table-column label="dwellTime">
                    <template #default="{ row }: TableColumn<ChannelGroupDto>">
                        {{ formatDwellTime(row.dwellTime) }}
                    </template>
                </el-table-column>
                <el-table-column label="chlCount">
                    <template #default="{ row }: TableColumn<ChannelGroupDto>">
                        {{ Translate('IDCS_CHANNEL_NUM_D').formatForLang(row.chlCount) }}
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_EDIT')"
                    width="60"
                >
                    <template #default="{ row }: TableColumn<ChannelGroupDto>">
                        <BaseImgSprite
                            file="edit (2)"
                            :chunk="4"
                            :index="0"
                            :hover-index="1"
                            :active-index="1"
                            @click="handleEditChlGroup(row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_DELETE')"
                    width="60"
                >
                    <template #default="{ row }: TableColumn<ChannelGroupDto>">
                        <BaseImgSprite
                            file="del"
                            :chunk="4"
                            :index="0"
                            :hover-index="1"
                            :active-index="1"
                            @click="handleDelChlGroup(row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    type="expand"
                    width="100"
                >
                    <template #default="{ row }: TableColumn<ChannelGroupDto>">
                        <ChannelPtzTableExpandPanel @add="handleAddChl(row)">
                            <ChannelPtzTableExpandItem
                                v-for="item in row.chls"
                                :key="String(item.value)"
                                :text="String(item.text)"
                                @delete="handleDelChl(row, item.value)"
                            />
                        </ChannelPtzTableExpandPanel>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="base-pagination-box">
            <BasePagination
                v-model:current-page="pageIndex"
                v-model:page-size="pageSize"
                :total="pageTotal"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            />
        </div>
        <ChannelGroupEditPop
            v-model="isEditPop"
            :edit-item="editItem"
            @call-back="setDataCallBack"
            @close="closeChlGroupEditPop"
        />
        <ChannelGroupAddChlPop
            v-model="isAddChlPop"
            :edit-item="editItemForAddChl"
            @close="closeChlGroupAddChlPop"
        />
    </div>
</template>

<script lang="ts" src="./ChannelGroup.v.ts"></script>
