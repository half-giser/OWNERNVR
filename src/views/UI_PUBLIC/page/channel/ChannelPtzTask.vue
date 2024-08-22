<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-20 13:58:09
 * @Description: 云台-任务
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-22 18:04:30
-->
<template>
    <div class="task">
        <div class="left">
            <div class="player">
                <BaseVideoPlayer
                    ref="playerRef"
                    type="live"
                    @onready="handlePlayerReady"
                />
            </div>
            <el-form
                ref="formRef"
                label-position="left"
                :style="{
                    '--form-label-width': '100px',
                }"
                :model="formData"
                :rules="formRule"
            >
                <el-form-item :label="Translate('IDCS_CHANNEL_SELECT')">
                    <el-select
                        v-model="pageData.tableIndex"
                        @change="changeChl"
                    >
                        <el-option
                            v-for="(item, index) in tableData"
                            :key="item.chlId"
                            :value="index"
                            :label="item.chlName"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_FUNCTION')">
                    <el-select
                        v-model="formData.type"
                        @change="changeType"
                    >
                        <el-option
                            v-for="item in pageData.typeOptions"
                            :key="item.value"
                            :value="item.value"
                            :label="item.label"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item
                    :label="Translate('IDCS_NAME')"
                    prop="name"
                >
                    <el-select v-model="formData.name">
                        <el-option
                            v-for="item in pageData.nameOptions"
                            :key="item.value"
                            :value="item.value"
                            :label="item.label"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_START_TIME')">
                    <el-time-picker
                        v-model="formData.startTime"
                        format="HH:mm"
                        value-format="HH:mm"
                        editable
                        prefix-icon=""
                        :placeholder="Translate('IDCS_POINT_TIME')"
                    />
                </el-form-item>
                <el-form-item
                    :label="Translate('IDCS_END_TIME')"
                    prop="endTime"
                >
                    <el-time-picker
                        v-model="formData.endTime"
                        format="HH:mm"
                        value-format="HH:mm"
                        editable
                        prefix-icon=""
                        :placeholder="Translate('IDCS_POINT_TIME')"
                    />
                </el-form-item>
                <div class="base-btn-box">
                    <el-button
                        :disabled="!tableData.length || !formData.name"
                        @click="setData"
                        >{{ Translate('IDCS_ADD') }}</el-button
                    >
                </div>
            </el-form>
        </div>
        <div class="right">
            <div class="base-flex-box">
                <el-table
                    ref="tableRef"
                    :show-header="false"
                    :data="tableData"
                    :row-key="(row) => row.chlId"
                    :expand-row-key="pageData.expandRowKey"
                    highlight-current-row
                    border
                    stripe
                    @row-click="handleRowClick"
                    @expand-change="handleExpandChange"
                >
                    <el-table-column prop="chlName" />
                    <el-table-column>
                        <template #default="scope">
                            {{ Translate('IDCS_TASK_NUM_D').formatForLang(scope.row.taskItemCount) }}
                        </template>
                    </el-table-column>
                    <el-table-column type="expand">
                        <template #default="data">
                            <el-table
                                :data="pageData.expandRowKey.includes(data.row.chlId) ? taskTableData : []"
                                highlight-current-row
                                border
                                stripe
                                height="300px"
                                class="expand-table"
                            >
                                <el-table-column
                                    :label="Translate('IDCS_SEQUENCE')"
                                    type="index"
                                >
                                </el-table-column>
                                <el-table-column
                                    :label="Translate('IDCS_ENABLE')"
                                    prop="enable"
                                >
                                    <template #header>
                                        <el-dropdown trigger="click">
                                            <span class="el-dropdown-link">
                                                {{ Translate('IDCS_ENABLE') }}
                                                <BaseImgSprite
                                                    class="ddn"
                                                    file="ddn"
                                                />
                                            </span>
                                            <template #dropdown>
                                                <el-dropdown-menu>
                                                    <el-dropdown-item @click="changeTaskStatus">
                                                        {{ pageData.taskStatus ? Translate('IDCS_OFF') : Translate('IDCS_ON') }}
                                                    </el-dropdown-item>
                                                </el-dropdown-menu>
                                            </template>
                                        </el-dropdown>
                                    </template>
                                </el-table-column>
                                <el-table-column :label="Translate('IDCS_START_TIME')">
                                    <template #default="scope">
                                        {{ displayTime(scope.row.startTime) }}
                                    </template>
                                </el-table-column>
                                <el-table-column :label="Translate('IDCS_END_TIME')">
                                    <template #default="scope">
                                        {{ displayTime(scope.row.endTime) }}
                                    </template>
                                </el-table-column>
                                <el-table-column :label="Translate('IDCS_FUNCTION')">
                                    <template #default="scope">
                                        {{ displayType(scope.row.type) }}
                                    </template>
                                </el-table-column>
                                <el-table-column :label="Translate('IDCS_NAME')">
                                    <template #default="scope">
                                        {{ displayName(scope.row.name) }}
                                    </template>
                                </el-table-column>
                                <el-table-column>
                                    <template #header>
                                        <el-dropdown trigger="click">
                                            <span class="el-dropdown-link">
                                                {{ Translate('IDCS_OPERATION') }}
                                                <BaseImgSprite
                                                    class="ddn"
                                                    file="ddn"
                                                />
                                            </span>
                                            <template #dropdown>
                                                <el-dropdown-menu>
                                                    <el-dropdown-item @click="deleteAllTask">{{ Translate('IDCS_DELETE_ALL') }}</el-dropdown-item>
                                                </el-dropdown-menu>
                                            </template>
                                        </el-dropdown>
                                    </template>
                                    <template #default="scope">
                                        <BaseImgSprite
                                            file="edit (2)"
                                            :index="0"
                                            :hover-index="1"
                                            :chunk="4"
                                            @click="editTask(scope.row)"
                                        />
                                    </template>
                                </el-table-column>
                            </el-table>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
        <ChannelPtzTaskEditPop
            v-model="pageData.isEditPop"
            :chl-id="pageData.editChlId"
            :data="pageData.editData"
            @confirm="confirmEditTask"
            @close="closeEditTask"
        />
        <BaseNotification v-model:notification="pageData.notification" />
    </div>
</template>

<script lang="ts" src="./ChannelPtzTask.v.ts"></script>

<style lang="scss" scoped>
.task {
    width: 100%;
    height: var(--content-height);
    display: flex;
}

.left {
    width: 400px;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.player {
    width: 400px;
    height: 300px;
    flex-shrink: 0;
}

.right {
    width: 100%;
    height: 100%;
    margin-left: 10px;
}

.el-table :deep(.cell) {
    width: 100%;
}
</style>
