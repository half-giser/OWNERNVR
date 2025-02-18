<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-11 08:56:00
 * @Description: UPnP配置
-->
<template>
    <div class="base-flex-box">
        <el-form
            class="stripe"
            :style="{
                '--form-input-width': '200px',
            }"
        >
            <el-form-item>
                <el-checkbox
                    v-model="formData.switch"
                    :disabled="pageData.wirelessSwitch || pageData.pppoeSwitch"
                    :label="Translate('IDCS_ENABLE')"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_MAP_TYPE')">
                <el-select-v2
                    v-model="formData.mappingType"
                    :disabled="!formData.switch || pageData.wirelessSwitch"
                    :options="pageData.mapTypeOptions"
                    @change="changeMappingType"
                />
            </el-form-item>
        </el-form>
        <div class="base-table-box">
            <el-table
                :data="tableData"
                :row-class-name="handleRowClassName"
            >
                <el-table-column :label="Translate('IDCS_PORT_TYPE')">
                    <template #default="{ row }: TableColumn<NetUPnPPortDto>">
                        {{ displayPortType(row.portType) }}
                    </template>
                </el-table-column>
                <el-table-column :label="Translate('IDCS_EXT_PORT')">
                    <template #default="{ row }: TableColumn<NetUPnPPortDto>">
                        <BaseNumberInput
                            v-model="row.externalPort"
                            :min="10"
                            :max="65535"
                            :disabled="pageData.wirelessSwitch || !formData.switch || formData.mappingType !== 'manually'"
                        />
                    </template>
                </el-table-column>
                <el-table-column
                    :label="Translate('IDCS_EXT_IP')"
                    prop="externalIP"
                />
                <el-table-column
                    :label="Translate('IDCS_PORT')"
                    prop="localPort"
                />

                <el-table-column
                    :label="Translate('IDCS_UPNP_STATUS')"
                    prop="status"
                />
            </el-table>
        </div>
        <div class="base-btn-box">
            <el-button
                :disabled="pageData.wirelessSwitch || pageData.pppoeSwitch"
                @click="setData"
            >
                {{ Translate('IDCS_APPLY') }}
            </el-button>
            <el-button
                :disabled="pageData.wirelessSwitch || pageData.pppoeSwitch || !formData.switch"
                @click="getData"
            >
                {{ pageData.btnName }}
            </el-button>
        </div>
    </div>
</template>

<script lang="ts" src="./UPnP.v.ts"></script>
