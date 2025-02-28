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
                        <BaseImgSpriteBtn
                            file="edit2"
                            @click="editChlGroup(row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_DELETE')"
                    width="60"
                >
                    <template #default="{ row }: TableColumn<ChannelGroupDto>">
                        <BaseImgSpriteBtn
                            file="del"
                            @click="deleteChlGroup(row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    type="expand"
                    width="100"
                >
                    <template #default="{ row }: TableColumn<ChannelGroupDto>">
                        <ChannelPtzTableExpandPanel @add="addChl(row)">
                            <ChannelPtzTableExpandItem
                                v-for="item in row.chls"
                                :key="String(item.value)"
                                :text="String(item.text)"
                                @delete="deleteChl(row, item.value)"
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
                @size-change="changePageSize"
                @current-change="changePage"
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
