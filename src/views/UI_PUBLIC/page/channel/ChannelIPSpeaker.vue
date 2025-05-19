<!--
 * @Date: 2025-05-07 20:30:45
 * @Description: IP Speaker
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <div class="base-flex-box">
        <div class="base-table-box">
            <el-table
                ref="tableRef"
                v-title
                :data="tableData"
                show-overflow-tooltip
            >
                <el-table-column
                    type="selection"
                    width="80"
                />
                <el-table-column
                    :label="Translate('IDCS_IPSPEAKER_NAME').formatForLang(Translate('IDCS_IPSPEAKER'))"
                    prop="name"
                    min-width="200"
                />
                <el-table-column
                    :label="Translate('IDCS_IP_ADDRESS')"
                    prop="ip"
                    min-width="140"
                />
                <el-table-column
                    :label="Translate('IDCS_PORT')"
                    prop="port"
                    min-width="90"
                />
                <el-table-column :label="Translate('IDCS_CONNECT_STATUS')">
                    <template #default="{ row }: TableColumn<ChannelIpSpeakerDto>">
                        <span
                            class="status"
                            :class="row.status ? 'text-online' : 'text-offline'"
                        >
                            {{ row.status ? Translate('IDCS_ONLINE') : Translate('IDCS_OFFLINE') }}
                        </span>
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_EDIT')"
                    width="100"
                >
                    <template #default="{ row }: TableColumn<ChannelIpSpeakerDto>">
                        <BaseImgSpriteBtn
                            file="edit2"
                            @click="handleEdit(row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_DELETE')"
                    width="100"
                >
                    <template #default="{ row }: TableColumn<ChannelIpSpeakerDto>">
                        <BaseImgSpriteBtn
                            file="del"
                            @click="handleDel(row)"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_IPSPEAKER_ASSOCIATION')"
                    prop="associatedDeviceName"
                    min-width="140"
                />
            </el-table>
        </div>
        <div class="base-btn-box flex-start">
            <div>{{ Translate('IDCS_IPSPEAKER_MAX_NUM').formatForLang(Translate('IDCS_IPSPEAKER')) }} : {{ systemCaps.voiceDevMaxCount }}</div>
        </div>
        <ChannelIpSpeakerAddPop
            v-model="pageData.isAddPop"
            @close="confirmAdd"
        />
        <ChannelIpSpeakerEditPop
            v-model="pageData.isEditPop"
            :data="pageData.editData"
            @confirm="confirmEdit"
            @close="pageData.isEditPop = false"
        />
    </div>
</template>

<script lang="ts" src="./ChannelIpSpeaker.v.ts"></script>
