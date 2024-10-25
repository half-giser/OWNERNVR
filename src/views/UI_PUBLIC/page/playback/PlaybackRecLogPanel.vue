<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-31 15:32:00
 * @Description: 回放-事件列表
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-10-24 09:26:33
-->
<template>
    <div class="log">
        <el-popover
            v-model:visible="pageData.visible"
            trigger="click"
            :width="800"
            placement="top-end"
            :hide-after="0"
            :show-after="0"
        >
            <template #reference>
                <div>
                    <el-tooltip
                        :content="Translate('IDCS_EVENT_LIST')"
                        :show-after="500"
                    >
                        <BaseImgSprite
                            file="list"
                            :index="0"
                            :hover-index="1"
                            :disabled-index="3"
                            :chunk="4"
                        />
                    </el-tooltip>
                </div>
            </template>
            <el-table
                :data="filterTableData"
                border
                stripe
                :height="400"
            >
                <el-table-column
                    :label="Translate('IDCS_SERIAL_NUMBER')"
                    type="index"
                />
                <el-table-column
                    :label="Translate('IDCS_CHANNEL_NAME')"
                    prop="chlName"
                />
                <el-table-column :label="Translate('IDCS_START_TIME')">
                    <template #default="scope">{{ displayTime(scope.row.startTime) }}</template>
                </el-table-column>

                <el-table-column :label="Translate('IDCS_END_TIME')">
                    <template #default="scope">{{ displayTime(scope.row.endTime) }}</template>
                </el-table-column>
                <el-table-column :label="Translate('IDCS_EVENT_TYPE')">
                    <template #header>
                        <el-popover
                            v-model:visible="pageData.eventVisible"
                            trigger="click"
                            popper-class="popper"
                            width="fit-content"
                        >
                            <template #reference>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_EVENT_TYPE') }}
                                </BaseTableDropdownLink>
                            </template>
                            <div class="sub-types">
                                <div class="base-subheading-box">{{ Translate('IDCS_EVENT') }}</div>
                                <el-checkbox-group v-model="pageData.event">
                                    <el-checkbox
                                        v-for="item in pageData.eventOptions"
                                        :key="item.value"
                                        :value="item.value"
                                    >
                                        {{ item.label }}
                                    </el-checkbox>
                                </el-checkbox-group>
                                <div class="base-subheading-box">{{ Translate('IDCS_TARGET') }}</div>
                                <el-checkbox-group v-model="pageData.motion">
                                    <el-checkbox
                                        v-for="item in pageData.motionTargetOptions"
                                        :key="item.value"
                                        :value="item.value"
                                    >
                                        {{ item.label }}
                                    </el-checkbox>
                                </el-checkbox-group>
                            </div>
                        </el-popover>
                    </template>
                    <template #default="scope">
                        <el-text>{{ displayEvent(scope.row) }}</el-text>
                        <BaseImgSprite
                            v-show="displayEventIcon(scope.row)"
                            :file="[scope.row.event, scope.row.recSubType].includes('SMDHUMAN') ? 'SMDHUMAN' : 'SMDVEHICLE'"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_RECORD_TIME')"
                    prop="duration"
                >
                </el-table-column>
                <el-table-column :label="Translate('IDCS_PLAY')">
                    <template #default="scope">
                        <BaseImgSprite
                            file="play (3)"
                            :index="0"
                            :hover-index="1"
                            :chunk="4"
                            @click="play(scope.row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    v-show="!isMac"
                    :label="Translate('IDCS_DOWNLOAD')"
                >
                    <template #default="scope">
                        <BaseImgSprite
                            file="download"
                            :index="0"
                            :hover-index="1"
                            :chunk="4"
                            @click="download(scope.row)"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </el-popover>
    </div>
</template>

<script lang="ts" src="./PlaybackRecLogPanel.v.ts"></script>

<style lang="scss" scoped>
.popper {
    width: fit-content;
    padding: 0;

    .sub-types {
        width: fit-content;
        max-height: 50vh;
        overflow: auto;

        :deep(.el-checkbox) {
            padding-right: 10px;
            margin-right: 0;
            display: block;
            display: flex;
            align-items: center;
        }
    }
}
</style>
