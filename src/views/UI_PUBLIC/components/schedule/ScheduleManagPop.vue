<template>
    <el-dialog
        draggable
        center
        width="960px"
        :title="Translate('IDCS_SCHEDULE')"
        :close-on-click-modal="false"
        :destroy-on-close="true"
        @open="onOpen"
    >
        <el-row>
            <el-col :span="16">
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
                ></BaseScheduleWeek>
            </el-col>
            <el-col :span="8">
                <el-table
                    ref="scheduleTable"
                    stripe
                    border
                    :data="pageData.scheduleList"
                    highlight-current-row
                    height="481"
                    @current-change="tableRowChange"
                >
                    <el-table-column
                        :label="Translate('IDCS_SCHEDULE_NAME')"
                        prop="name"
                        width="146px"
                    />

                    <el-table-column
                        :label="Translate('IDCS_EDIT')"
                        width="80px"
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
                        width="80px"
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
            </el-col>
        </el-row>
        <Teleport to="body">
            <!-- 排程编辑弹窗 -->
            <ScheduleEditPop
                v-model="pageData.scheduleEditPopOpen"
                :schedule-dtail="pageData.editScheduleInfo"
                :day-enum="pageData.dayEnum"
                @close="editPopClose"
            >
            </ScheduleEditPop>
        </Teleport>
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="$emit('close')">{{ Translate('IDCS_CLOSE') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./ScheduleManagPop.v.ts"></script>

<style lang="scss" scoped>
.base-subheading-box {
    .scheduleTitle {
        float: left;
        color: var(--subheading-text);
    }
    .Sprite {
        float: right;
        margin: 5px 10px 0px 0px;
        cursor: pointer;
    }

    width: 600px;
    height: 35px;
    margin-bottom: 20px;
}
#n9web .el-row {
    align-items: start;
    justify-content: space-between;
}
</style>
