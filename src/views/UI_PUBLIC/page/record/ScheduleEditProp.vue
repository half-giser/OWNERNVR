<template>
    <div>
        <div>
            <el-radio-group
                v-model="dragAction"
                class="radio-group"
            >
                <el-radio value="del">{{ Translate('IDCS_ERASE') }}</el-radio>
                <el-radio value="add">{{ Translate('IDCS_ADD') }}</el-radio>
            </el-radio-group>
        </div>
        <BaseScheduleWeek
            :width="903"
            :drag-action="dragAction"
        ></BaseScheduleWeek>
    </div>
</template>

<script lang="ts" src="./ScheduleManagProp.v.ts"></script>

<style lang="scss" scoped></style>
