<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-31 15:32:00
 * @Description: 回放-事件列表
-->
<template>
    <div class="log">
        <el-popover
            v-model:visible="pageData.visible"
            :width="950"
            popper-class="no-padding"
            placement="top-end"
        >
            <template #reference>
                <BaseImgSpriteBtn
                    file="list"
                    :title="Translate('IDCS_EVENT_LIST')"
                />
            </template>
            <el-table
                v-title
                :data="filterTableData"
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
                    <template #default="{ row }: TableColumn<PlaybackRecLogList>">{{ displayTime(row.startTime) }}</template>
                </el-table-column>

                <el-table-column :label="Translate('IDCS_END_TIME')">
                    <template #default="{ row }: TableColumn<PlaybackRecLogList>">{{ displayTime(row.endTime) }}</template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_EVENT_TYPE')"
                    width="180"
                >
                    <template #header>
                        <el-popover
                            v-model:visible="pageData.eventVisible"
                            popper-class="no-padding"
                            width="fit-content"
                        >
                            <template #reference>
                                <BaseTableDropdownLink>
                                    {{ Translate('IDCS_EVENT_TYPE') }}
                                </BaseTableDropdownLink>
                            </template>
                            <el-scrollbar height="300">
                                <div class="base-head-box">{{ Translate('IDCS_EVENT') }}</div>
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
                                <div class="base-head-box">{{ Translate('IDCS_TARGET') }}</div>
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

                    <template #default="{ row }: TableColumn<PlaybackRecLogList>">
                        <el-text>{{ displayEvent(row) }}</el-text>
                        <BaseImgSprite
                            v-show="displayEventIcon(row)"
                            :file="[row.event, row.recSubType].includes('SMDHUMAN') ? 'SMDHUMAN' : 'SMDVEHICLE'"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_RECORD_TIME')"
                    prop="duration"
                />

                <el-table-column
                    :label="Translate('IDCS_PLAY')"
                    width="90"
                >
                    <template #default="{ row }: TableColumn<PlaybackRecLogList>">
                        <BaseImgSpriteBtn
                            file="preview"
                            @click="play(row)"
                        />
                    </template>
                </el-table-column>

                <el-table-column
                    v-show="!isMac"
                    :label="Translate('IDCS_DOWNLOAD')"
                    width="90"
                >
                    <template #default="{ row }: TableColumn<PlaybackRecLogList>">
                        <BaseImgSpriteBtn
                            file="download"
                            @click="download(row)"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </el-popover>
    </div>
</template>

<script lang="ts" src="./PlaybackRecLogPanel.v.ts"></script>
