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
                v-title
                :data="tableData"
                height="250"
                highlight-current-row
                show-overflow-tooltip
            >
                <el-table-column
                    prop="aiResType"
                    :label="Translate('IDCS_INTELLIGENT')"
                    width="270"
                >
                    <template #default="{ row }: TableColumn<AlarmAIResourceDto>">
                        {{ aiResTypeMapping[row.aiResType] }}
                        <BaseImgSprite
                            file="warning"
                            :index="1"
                            :hover-index="2"
                            :title="row.aiResDetailTips"
                            :chunk="3"
                    /></template>
                </el-table-column>
                <el-table-column
                    prop="aiResPercent"
                    :label="Translate('IDCS_USAGE_RATE')"
                    width="150"
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
