<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-31 15:32:00
 * @Description: 回放-事件列表
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-08 11:16:49
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
                <el-table-column
                    :label="Translate('IDCS_START_TIME')"
                    prop="startTime"
                >
                    <template #default="scope">{{ displayTime(scope.row.startTime) }}</template>
                </el-table-column>

                <el-table-column
                    :label="Translate('IDCS_END_TIME')"
                    prop="endTime"
                >
                    <template #default="scope">{{ displayTime(scope.row.endTime) }}</template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_EVENT_TYPE')"
                    prop="event"
                >
                    <template #header>
                        <el-popover
                            v-model:visible="pageData.eventVisible"
                            trigger="click"
                            popper-class="popper"
                            width="fit-content"
                        >
                            <template #reference>
                                <span class="el-dropdown-link">
                                    {{ Translate('IDCS_EVENT_TYPE') }}
                                    <BaseImgSprite
                                        class="ddn"
                                        file="ddn"
                                    />
                                </span>
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
                <el-table-column
                    :label="Translate('IDCS_PLAY')"
                    prop="play"
                >
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
                    prop="download"
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
        background-color: white;
        max-height: 50vh;
        overflow: auto;

        :deep(.el-checkbox) {
            padding-right: 10px;
            margin-right: 0;
            display: block;
            display: flex;
            align-items: center;
        }

        &::-webkit-scrollbar {
            width: 2px;
            background-color: #f5f5f5;
        }

        &::-webkit-scrollbar-track {
            -webkit-box-shadow: inset 0 0 6px rgba(255, 255, 255, 0.3);
            border-radius: 10px;
            background-color: #f5f5f5;
        }

        &::-webkit-scrollbar-thumb {
            border-radius: 10px;
            -webkit-box-shadow: inset 0 0 6px rgba(255, 255, 255, 0.3);
            background-color: #999;
        }
    }
}
</style>
