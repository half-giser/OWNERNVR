<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-07-31 16:36:16
 * @Description: 排程管理弹框
-->
<template>
    <el-dialog
        width="960"
        :title="Translate('IDCS_SCHEDULE')"
        :destroy-on-close="true"
        @open="onOpen"
    >
        <div class="base-btn-box">
            <div>
                <div class="base-subheading-box">
                    <span class="scheduleTitle">{{ scheduleTitle }}</span>
                    <BaseImgSprite
                        file="toolbar_add"
                        @click="openScheduleEditPop()"
                    />
                </div>
                <BaseScheduleWeek
                    ref="scheduleWeekRef"
                    :width="600"
                    :readonly="true"
                />
            </div>
            <div>
                <el-table
                    ref="scheduleTable"
                    stripe
                    border
                    :data="pageData.scheduleList"
                    highlight-current-row
                    width="305"
                    height="481"
                    @current-change="tableRowChange"
                >
                    <el-table-column
                        :label="Translate('IDCS_SCHEDULE_NAME')"
                        prop="name"
                        width="146"
                    />

                    <el-table-column
                        :label="Translate('IDCS_EDIT')"
                        width="80"
                    >
                        <template #default="scope">
                            <BaseImgSprite
                                v-if="pageData.defaultSchedules.indexOf(scope.row.name)"
                                file="edit (2)"
                                :chunk="4"
                                :index="0"
                                :hover-index="1"
                                :active-index="1"
                                @click="openScheduleEditPop(scope.row)"
                            />
                        </template>
                    </el-table-column>

                    <el-table-column
                        :label="Translate('IDCS_DELETE')"
                        width="80"
                    >
                        <template #default="scope">
                            <BaseImgSprite
                                v-if="pageData.defaultSchedules.indexOf(scope.row.name)"
                                file="del"
                                :chunk="4"
                                :index="0"
                                :hover-index="1"
                                :active-index="1"
                                @click="deleteSchedule(scope.row)"
                            />
                        </template>
                    </el-table-column>
                </el-table>
            </div>
        </div>
        <Teleport to="body">
            <!-- 排程编辑弹窗 -->
            <ScheduleEditPop
                v-model="pageData.scheduleEditPopOpen"
                :schedule-dtail="pageData.editScheduleInfo"
                :day-enum="pageData.dayEnum"
                @close="editPopClose"
            />
        </Teleport>
        <template #footer>
            <div class="base-btn-box">
                <el-button @click="$emit('close')">{{ Translate('IDCS_CLOSE') }}</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./ScheduleManagPop.v.ts"></script>

<style lang="scss" scoped>
.base-subheading-box {
    width: 600px;
    height: 35px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    margin-right: 10px;

    .scheduleTitle {
        color: var(--subheading-text);
    }

    .Sprite {
        margin: 5px 10px 0 0;
        cursor: pointer;
    }
}
</style>
