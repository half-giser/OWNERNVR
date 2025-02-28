<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-11-06 19:27:38
 * @Description: AI资源按钮与详情
-->
<template>
    <div>
        <span>{{ Translate('IDCS_USAGE_RATE') }} {{ pageData.totalResourceOccupancy }}%</span>
        <BaseImgSpriteBtn
            class="detailBtn"
            file="detail"
            @click="pageData.isPop = true"
        />
        <el-dialog
            v-model="pageData.isPop"
            :title="Translate('IDCS_DETAIL')"
            width="600"
            hight="400"
            append-to-body
        >
            <el-table
                :data="tableData"
                height="250"
                highlight-current-row
                show-overflow-tooltip
            >
                <el-table-column
                    prop="name"
                    :label="Translate('IDCS_CHANNEL')"
                    width="110"
                />
                <el-table-column
                    prop="eventTypeText"
                    :label="Translate('IDCS_EVENT_TYPE')"
                    width="110"
                />
                <el-table-column
                    :label="Translate('IDCS_USAGE_RATE')"
                    width="110"
                    prop="percent"
                />
                <el-table-column
                    prop="decodeResourceText"
                    :label="Translate('IDCS_DECODE_RESOURCE')"
                    width="110"
                />
                <el-table-column
                    :label="Translate('IDCS_FREE_AI_RESOURCE')"
                    width="118"
                >
                    <template #default="{ row }: TableColumn<AlarmAIResourceDto>">
                        <BaseImgSpriteBtn
                            file="del"
                            @click="deleteResource(row)"
                        />
                    </template>
                </el-table-column>
            </el-table>
            <div class="base-btn-box">
                <el-button @click="pageData.isPop = false">{{ Translate('IDCS_CLOSE') }}</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script lang="ts" src="./AlarmBaseResourceData.v.ts"></script>
