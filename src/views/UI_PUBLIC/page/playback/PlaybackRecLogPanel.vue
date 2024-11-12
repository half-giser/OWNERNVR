<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-31 15:32:00
 * @Description: 回放-事件列表
-->
<template>
    <div class="log">
        <el-popover
            v-model:visible="pageData.visible"
            :width="800"
            popper-class="no-padding"
            placement="top-end"
        >
            <template #reference>
                <div>
                    <el-tooltip :content="Translate('IDCS_EVENT_LIST')">
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
                show-overflow-tooltip
                :height="400"
            >
                <el-table-column
                    :label="Translate('IDCS_SERIAL_NUMBER')"
                    type="index"
                    min-width="50"
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
                            popper-class="popper no-padding"
                            width="fit-content"
                        >
                            <template #reference>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_EVENT_TYPE') }}
                                </BaseTableDropdownLink>
                            </template>
                            <el-scrollbar height="300px">
                                <div class="base-subheading-box">{{ Translate('IDCS_EVENT') }}</div>
                                <el-checkbox-group
                                    v-model="pageData.event"
                                    class="line-break inline"
                                >
                                    <el-checkbox
                                        v-for="item in pageData.eventOptions"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                    />
                                </el-checkbox-group>
                                <div class="base-subheading-box">{{ Translate('IDCS_TARGET') }}</div>
                                <el-checkbox-group
                                    v-model="pageData.motion"
                                    class="line-break inline"
                                >
                                    <el-checkbox
                                        v-for="item in pageData.motionTargetOptions"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                    />
                                </el-checkbox-group>
                            </el-scrollbar>
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
                />

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
