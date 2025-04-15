<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-27 09:17:16
 * @Description: 业务应用-人脸考勤-详情弹窗
-->
<template>
    <el-dialog
        :title="data.name"
        width="800"
        @open="open"
    >
        <div class="dialog">
            <div class="left">
                <div>
                    <div
                        v-show="item1.timestamp"
                        class="pic-item"
                    >
                        <div>{{ type === 'check' ? Translate('IDCS_FIRST') : Translate('IDCS_SIGN_IN') }}</div>
                        <img :src="pageData.pic1" />
                        <div>
                            <span>{{ item1.chlName }}</span>
                            <span>{{ displayTime(item1.timestamp) }}</span>
                        </div>
                    </div>
                    <div
                        v-show="item2.timestamp && type === 'check'"
                        class="pic-item"
                    >
                        <div>{{ Translate('IDCS_LAST') }}</div>
                        <img :src="pageData.pic2" />
                        <div>
                            <span>{{ item2.chlName }}</span>
                            <span>{{ displayTime(item2.timestamp) }}</span>
                        </div>
                    </div>
                </div>
                <div class="base-btn-box space-between">
                    <div>{{ current?.date || '' }}</div>
                    <el-button
                        :disabled="!current?.date"
                        @click="search"
                    >
                        <BaseImgSprite file="toolbar_search" />
                    </el-button>
                </div>
            </div>
            <div class="right">
                <el-table
                    ref="tableRef"
                    v-title
                    highlight-current-row
                    show-overflow-tooltip
                    :row-keys="getRowKey"
                    :data="data.detail"
                    height="400"
                    @current-change="handleCurrentChange"
                >
                    <el-table-column
                        :label="Translate('IDCS_DATE')"
                        prop="date"
                    />
                    <el-table-column
                        :label="Translate('IDCS_WEEK')"
                        prop="day"
                    />
                    <el-table-column :label="Translate('IDCS_TYPE')">
                        <template #default="{ row }: TableColumn<BusinessFaceDetailList>">
                            <span
                                :class="{
                                    'text-error': row.alarm === 'leftEarly' || row.alarm === 'unchecked',
                                    'text-online': row.alarm === 'late' || row.alarm === 'checked',
                                    'text-exception': row.alarm === 'abnormal',
                                }"
                            >
                                {{ row.type }}
                            </span>
                        </template>
                    </el-table-column>
                    <el-table-column :label="Translate('IDCS_ATTENDANCE_DETAIL')">
                        <template #default="{ row }: TableColumn<BusinessFaceDetailList>">
                            {{ displayDetail(row.detail) }}
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
        <div class="base-btn-box">
            <el-button @click="$emit('close')">{{ Translate('IDCS_OK') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./FaceDetailPop.v.ts"></script>

<style lang="scss" scoped>
.dialog {
    display: flex;
    width: 100%;
}

.left {
    width: 200px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-right: 5px;
}

.pic-item {
    width: 196px;
    text-align: center;
    margin-bottom: 10px;

    img {
        width: 196px;
        height: 130px;

        &[src=''] {
            opacity: 0;
        }
    }

    div:first-child {
        text-align: left;
    }

    div:last-child {
        display: flex;
        justify-content: space-between;
    }
}

.right {
    width: 600px;
}
</style>
