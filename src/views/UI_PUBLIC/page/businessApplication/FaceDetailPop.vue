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
                        <div>{{ Translate('IDCS_FIRST') }}</div>
                        <img :src="pageData.pic1" />
                        <div>{{ item1.chlName }}</div>
                        <div>{{ displayTime(item1.timestamp) }}</div>
                    </div>
                    <div
                        v-show="item2.timestamp"
                        class="pic-item"
                    >
                        <div>{{ Translate('IDCS_LAST') }}</div>
                        <img :src="pageData.pic2" />
                        <div>{{ item2.chlName }}</div>
                        <div>{{ displayTime(item2.timestamp) }}</div>
                    </div>
                </div>
                <div
                    class="base-btn-box"
                    span="2"
                >
                    <div>{{ current?.date || '' }}</div>
                    <div>
                        <el-button
                            :disabled="!current.date"
                            @click="search"
                        >
                            <BaseImgSprite
                                file="toolbar_search"
                                :index="0"
                                :chunk="1"
                            />
                        </el-button>
                    </div>
                </div>
            </div>
            <div class="right">
                <el-table
                    ref="tableRef"
                    highlight-current-row
                    :row-keys="getRowKey"
                    :data="data.detail"
                    height="500"
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
                        <template #default="scope">
                            <span
                                :class="{
                                    'text-error': scope.row.alarm,
                                }"
                                >{{ scope.row.type }}</span
                            >
                        </template>
                    </el-table-column>
                    <el-table-column :label="Translate('IDCS_ATTENDANCE_DETAIL')">
                        <template #default="scope">
                            {{ displayDetail(scope.row.detail) }}
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
    }
}

.right {
    width: 600px;
}
</style>
