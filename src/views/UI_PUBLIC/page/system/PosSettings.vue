<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-02 09:08:21
 * @Description: POS配置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-11 17:53:59
-->
<template>
    <div class="base-flex-box">
        <div class="base-table-box">
            <el-table
                stripe
                border
                :data="tableData"
            >
                <el-table-column
                    :label="Translate('IDCS_POS')"
                    prop="name"
                >
                </el-table-column>
                <!-- 启用 -->
                <el-table-column width="100px">
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
                                    <el-dropdown-item
                                        v-for="opt in pageData.switchOption"
                                        :key="opt.value"
                                        @click="changeAllSwitch(opt.value)"
                                    >
                                        {{ Translate(opt.label) }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select v-model="scope.row.switch">
                            <el-option
                                v-for="opt in pageData.switchOption"
                                :key="opt.value"
                                :label="Translate(opt.label)"
                                :value="opt.value"
                            />
                        </el-select>
                    </template>
                </el-table-column>
                <!-- 连接方式 -->
                <el-table-column width="240px">
                    <template #header>
                        <el-dropdown trigger="click">
                            <span class="el-dropdown-link">
                                {{ Translate('IDCS_CONNECTION') }}
                                <BaseImgSprite
                                    class="ddn"
                                    file="ddn"
                                />
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="opt in pageData.connectionTypeList"
                                        :key="opt.value"
                                        @click="changeAllConnectionType(opt.value)"
                                    >
                                        {{ Translate(opt.name) }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select v-model="scope.row.connectionType">
                            <el-option
                                v-for="opt in pageData.connectionTypeList"
                                :key="opt.value"
                                :label="Translate(opt.name)"
                                :value="opt.value"
                            />
                        </el-select>
                    </template>
                </el-table-column>
                <!-- 连接设置 -->
                <el-table-column
                    :label="Translate('IDCS_CONNECTION_SETTINGS')"
                    width="150px"
                >
                    <template #default="scope">
                        <el-button @click="setConnection(scope.$index)">{{ Translate('IDCS_CONFIG') }}</el-button>
                    </template>
                </el-table-column>
                <!-- 协议 -->
                <el-table-column width="160px">
                    <template #header>
                        <el-dropdown trigger="click">
                            <span class="el-dropdown-link">
                                {{ Translate('IDCS_PROTOCOL') }}
                                <BaseImgSprite
                                    class="ddn"
                                    file="ddn"
                                />
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="opt in pageData.manufacturersList"
                                        :key="opt.value"
                                        @click="changeAllManufacturers(opt.value)"
                                    >
                                        {{ Translate(opt.name) }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select v-model="scope.row.manufacturers">
                            <el-option
                                v-for="opt in pageData.manufacturersList"
                                :key="opt.value"
                                :label="Translate(opt.name)"
                                :value="opt.value"
                            />
                        </el-select>
                    </template>
                </el-table-column>
                <!-- 联动通道 -->
                <el-table-column
                    :label="Translate('IDCS_CHANNEL_TRGGER')"
                    width="150px"
                >
                    <template #default="scope">
                        <div class="channel-trigger">
                            <el-checkbox
                                v-model="scope.row.triggerChl.switch"
                                @change="changeTriggerChannel(scope.$index)"
                            >
                            </el-checkbox>
                            <el-button
                                :disabled="!scope.row.triggerChl.switch"
                                @click="setTriggerChannel(scope.$index)"
                                >{{ Translate('IDCS_CONFIG') }}</el-button
                            >
                        </div>
                    </template>
                </el-table-column>
                <!-- 显示设置 -->
                <el-table-column width="150px">
                    <template #header>
                        <span @click="setAllDisplay">
                            {{ Translate('IDCS_DISPLAY_SETTINGS') }}
                            <BaseImgSprite
                                class="ddn"
                                file="ddn"
                            />
                        </span>
                    </template>
                    <template #default="scope">
                        <el-button @click="setDisplay(scope.$index)">{{ Translate('IDCS_CONFIG') }}</el-button>
                    </template>
                </el-table-column>
                <!-- 编码格式 -->
                <el-table-column width="200px">
                    <template #header>
                        <el-dropdown trigger="click">
                            <span class="el-dropdown-link">
                                {{ Translate('IDCS_ENCODE_FORMAT') }}
                                <BaseImgSprite
                                    class="ddn"
                                    file="ddn"
                                />
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="opt in pageData.encodeList"
                                        :key="opt.value"
                                        @click="changeAllEncodeFormat(opt.value)"
                                    >
                                        {{ opt.name }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select v-model="scope.row.encodeFormat">
                            <el-option
                                v-for="opt in pageData.encodeList"
                                :key="opt.value"
                                :value="opt.value"
                                :label="opt.name"
                            />
                        </el-select>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="base-btn-box">
            <el-button
                :disabled="pageData.submitDisabled"
                @click="setData"
                >{{ Translate('IDCS_APPLY') }}</el-button
            >
        </div>
        <PosConnectionSettingsPop
            v-model="pageData.isConnectionDialog"
            :data="tableData[pageData.connectionDialogIndex]"
            @confirm="confirmSetConnection"
            @close="pageData.isConnectionDialog = false"
        />
        <PosTriggerChannelPop
            v-model="pageData.isTriggerChannelDialog"
            :chls="tableData[pageData.triggerChannelDialogIndex]?.triggerChl.chls || []"
            @confirm="confirmSetTriggerChannel"
            @close="closeTriggerChannel"
        />
        <PosHayleyTriggerChannelPop
            v-model="pageData.isHayleyTriggerChannleDialog"
            :max="pageData.tillNumberMax"
            :link-chls="linkChls"
            :chls="tableData[pageData.triggerChannelDialogIndex]?.triggerChl.chls || []"
            @confirm="confirmSetTriggerChannel"
            @close="closeTriggerChannel"
        />
        <PosDisplaySettingPop
            v-model="pageData.isDisplayDialog"
            :data="tableData[pageData.displayDialogIndex]?.displaySetting"
            :limit="pageData.displaysetList"
            :color-data="pageData.colorData"
            @confirm="confirmSetDisplay"
            @close="pageData.isDisplayDialog = false"
        />
    </div>
</template>

<script lang="ts" src="./PosSettings.v.ts"></script>

<style lang="scss" scoped>
.channel-trigger {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    :deep(.el-checkbox) {
        margin-right: 5px;
    }
}
</style>
