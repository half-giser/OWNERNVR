<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-23 10:36:05
 * @Description: 云台-协议
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-23 11:55:21
-->
<template>
    <div class="protocol">
        <div class="left">
            <div class="player">
                <BaseVideoPlayer
                    ref="playerRef"
                    type="live"
                    @onready="handlePlayerReady"
                />
            </div>
            <el-form
                v-if="tableData.length"
                label-position="left"
                :style="{
                    '--form-label-width': '150px',
                }"
                class="stripe"
            >
                <el-form-item :label="Translate('IDCS_CHANNEL_SELECT')">
                    <el-select
                        v-model="pageData.tableIndex"
                        @change="changeChl"
                    >
                        <el-option
                            v-for="(item, index) in tableData"
                            :key="item.chlId"
                            :value="index"
                            :label="item.chlName"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_PTZ')">
                    <el-select
                        v-model="tableData[pageData.tableIndex].ptz"
                        :disabled="tableData[pageData.tableIndex].status !== 'success'"
                    >
                        <el-option
                            v-for="item in pageData.ptzOptions"
                            :key="item.label"
                            :value="item.value"
                            :label="item.label"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_PROTOCOL')">
                    <el-select
                        v-model="tableData[pageData.tableIndex].protocol"
                        :disabled="tableData[pageData.tableIndex].status !== 'success'"
                    >
                        <el-option
                            v-for="item in tableData[pageData.tableIndex].protocolOptions"
                            :key="item.label"
                            :value="item.value"
                            :label="item.label"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_BAUD_RATE')">
                    <el-select
                        v-model="tableData[pageData.tableIndex].baudRate"
                        :disabled="tableData[pageData.tableIndex].status !== 'success'"
                    >
                        <el-option
                            v-for="item in tableData[pageData.tableIndex].baudRateOptions"
                            :key="item.label"
                            :value="item.value"
                            :label="item.label"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item :label="Translate('IDCS_ADDRESS')">
                    <el-input-number
                        v-model="tableData[pageData.tableIndex].address"
                        :min="tableData[pageData.tableIndex].addressMin"
                        :max="tableData[pageData.tableIndex].addressMax"
                        :disabled="tableData[pageData.tableIndex].status !== 'success'"
                        :controls="false"
                        value-on-clear="min"
                    />
                </el-form-item>
            </el-form>
        </div>
        <div class="right">
            <div class="base-table-box">
                <el-table
                    :data="tableData"
                    border
                    stripe
                    highlight-current-row
                    flexible
                    @row-click="handleRowClick"
                >
                    <!-- 状态列 -->
                    <el-table-column
                        label=" "
                        width="50px"
                        class-name="custom_cell"
                    >
                        <template #default="scope">
                            <div
                                v-if="scope.row.status === 'loading'"
                                class="table_status_col_loading"
                            ></div>
                            <BaseImgSprite
                                v-else-if="scope.row.status === 'error'"
                                file="error"
                                :chunk="1"
                                :index="0"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_CHANNEL_NAME')"
                        prop="chlName"
                    />
                    <el-table-column :label="Translate('IDCS_PTZ')">
                        <template #header>
                            <el-dropdown trigger="click">
                                <span class="el-dropdown-link">
                                    {{ Translate('IDCS_PTZ') }}
                                    <BaseImgSprite
                                        class="ddn"
                                        file="ddn"
                                    />
                                </span>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item
                                            v-for="item in pageData.ptzOptions"
                                            :key="item.label"
                                            @click="changeAllPtz(item.value)"
                                        >
                                            {{ item.label }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </template>

                        <template #default="scope">
                            <el-select
                                v-model="scope.row.ptz"
                                :disabled="scope.row.status !== 'success'"
                            >
                                <el-option
                                    v-for="item in pageData.ptzOptions"
                                    :key="item.label"
                                    :value="item.value"
                                    :label="item.label"
                                />
                            </el-select>
                        </template>
                    </el-table-column>

                    <el-table-column :label="Translate('IDCS_PROTOCOL')">
                        <template #default="scope">
                            <el-select
                                v-model="scope.row.protocol"
                                :disabled="scope.row.status !== 'success'"
                            >
                                <el-option
                                    v-for="item in scope.row.protocolOptions"
                                    :key="item.label"
                                    :value="item.value"
                                    :label="item.label"
                                />
                            </el-select>
                        </template>
                    </el-table-column>

                    <el-table-column :label="Translate('IDCS_BAUD_RATE')">
                        <template #default="scope">
                            <el-select
                                v-model="scope.row.baudRate"
                                :disabled="scope.row.status !== 'success'"
                            >
                                <el-option
                                    v-for="item in scope.row.baudRateOptions"
                                    :key="item.label"
                                    :value="item.value"
                                    :label="item.label"
                                />
                            </el-select>
                        </template>
                    </el-table-column>

                    <el-table-column
                        :label="Translate('IDCS_ADDRESS')"
                        prop="address"
                    >
                        <template #default="scope">
                            <el-input-number
                                v-model="scope.row.address"
                                :min="scope.row.addressMin"
                                :max="scope.row.addressMax"
                                value-on-clear="min"
                                :disabled="scope.row.status !== 'success'"
                                :controls="false"
                            />
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="base-btn-box">
                <el-button @click="setData">{{ Translate('IDCS_APPLY') }}</el-button>
            </div>
        </div>
        <BaseNotification v-model:notifications="pageData.notification" />
    </div>
</template>

<script lang="ts">
import { cloneDeep } from 'lodash-es'
import { type TableInstance } from 'element-plus'
import { type ChannelPtzProtocolDto } from '@/types/apiType/channel'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const playerRef = ref<PlayerInstance>()
        const pluginStore = usePluginStore()

        const pageData = ref({
            notification: [] as string[],
            // 云台选项
            ptzOptions: [
                {
                    label: Translate('IDCS_ON'),
                    value: true,
                },
                {
                    label: Translate('IDCS_OFF'),
                    value: false,
                },
            ],
            // 云台索引
            tableIndex: 0,
        })

        const tableRef = ref<TableInstance>()
        const tableData = ref<ChannelPtzProtocolDto[]>([])

        let cacheTableData: ChannelPtzProtocolDto[] = []

        // 播放模式
        const mode = computed(() => {
            if (!playerRef.value) {
                return ''
            }
            return playerRef.value.mode
        })

        const ready = computed(() => {
            return playerRef.value?.ready || false
        })

        let player: PlayerInstance['player']
        let plugin: PlayerInstance['plugin']

        /**
         * @description 播放器就绪时回调
         */
        const handlePlayerReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'h5') {
                if (isHttpsLogin()) {
                    pageData.value.notification = [formatHttpsTips(`${Translate('IDCS_LIVE_PREVIEW')}/${Translate('IDCS_TARGET_DETECTION')}`)]
                }
            }
            if (mode.value === 'ocx') {
                if (!plugin.IsInstallPlugin()) {
                    plugin.SetPluginNotice('#layout2Content')
                    return
                }
                if (!plugin.IsPluginAvailable()) {
                    pluginStore.showPluginNoResponse = true
                    plugin.ShowPluginNoResponse()
                }
                const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                plugin.GetVideoPlugin().ExecuteCmd(sendXML)
            }
        }

        /**
         * @description 修改所有行云台选项
         * @param {boolean} bool
         */
        const changeAllPtz = (bool: boolean) => {
            tableData.value.forEach((item) => {
                item.ptz = bool
            })
        }

        /**
         * @description 播放视频
         */
        const play = () => {
            const { chlId, chlName } = tableData.value[pageData.value.tableIndex]
            if (mode.value === 'h5') {
                player.play({
                    chlID: chlId,
                    streamType: 2,
                })
            } else if (mode.value === 'ocx') {
                plugin.RetryStartChlView(chlId, chlName)
            }
        }

        /**
         * @description 获取行数据
         * @param {string} chlId
         * @param {number} index
         */
        const getConfig = async (chlId: string, index: number) => {
            const sendXml = rawXml`
                <condition>
                    <chlId>${chlId}</chlId>
                </condition>
            `
            const result = await queryPtzProtocol(sendXml)
            const $ = queryXml(result)
            if ($('/response/status').text() === 'success') {
                tableData.value[index].baudRate = $('/response/content/chl/baudRate').text()
                tableData.value[index].protocol = $('/response/content/chl/protocol').text()
                tableData.value[index].address = Number($('/response/content/chl/address').text())
                tableData.value[index].addressMin = Number($('/response/content/chl/address').attr('min')!)
                tableData.value[index].addressMax = Number($('/response/content/chl/address').attr('max')!)
                tableData.value[index].ptz = $('/response/content/chl/ptz').text().toBoolean()
                tableData.value[index].baudRateOptions = $('/response/types/baudRate/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: item.text(),
                    }
                })
                tableData.value[index].protocolOptions = $('/response/types/protocol/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: item.text(),
                    }
                })
                tableData.value[index].status = 'success'
            } else {
                tableData.value[index].status === 'fail'
            }
            cacheTableData.push({ ...tableData.value[index] })
        }

        /**
         * @description 保存编辑行数据
         */
        const setData = async () => {
            const edits: ChannelPtzProtocolDto[] = []
            tableData.value.forEach((item, index) => {
                if (item.status !== 'success') {
                    return
                }
                const params = ['address', 'baudRate', 'protocol', 'ptz']
                params.some((param) => {
                    if (!cacheTableData[index]) {
                        return false
                    }
                    if (item[param] !== cacheTableData[index][param]) {
                        edits.push(item)
                        return true
                    }
                    return false
                })
            })

            openLoading(LoadingTarget.FullScreen)

            for (let i = 0; i < edits.length; i++) {
                const item = edits[i]
                const sendXml = rawXml`
                    <types>
                        <baudRate>${wrapEnums(item.baudRateOptions)}</baudRate>
                        <protocol>${wrapEnums(item.protocolOptions)}</protocol>
                    </types>
                    <content>
                        <chl id="${item.chlId}">
                            <baudRate type="baudRate">${item.baudRate}</baudRate>
                            <protocol type="protocol">${item.protocol}</protocol>
                            <address min="${item.addressMin.toString()}" max="${item.addressMax.toString()}">${item.address.toString()}</address>
                            <ptz>${item.ptz.toString()}</ptz>
                        </chl>
                    </content>
                `
                await editPtzProtocol(sendXml)
            }

            cacheTableData = cloneDeep(tableData.value)
            closeLoading(LoadingTarget.FullScreen)
        }

        /**
         * @description 获取数据
         */
        const getData = async () => {
            openLoading(LoadingTarget.FullScreen)

            const result = await getChlList({
                pageIndex: 1,
                pageSize: 999,
                chlType: 'analog',
            })
            const $ = queryXml(result)

            closeLoading(LoadingTarget.FullScreen)

            if ($('/response/status').text() === 'success') {
                tableData.value = $('/response/content/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        chlId: item.attr('id')!,
                        chlName: $item('name').text(),
                        baudRate: '',
                        protocol: '',
                        address: 1,
                        addressMin: 1,
                        addressMax: 1,
                        ptz: false,
                        baudRateOptions: [],
                        protocolOptions: [],
                        status: 'loading',
                    }
                })
            }
        }

        /**
         * @description 修改通道选项
         */
        const changeChl = () => {
            tableRef.value?.setCurrentRow(tableData.value[pageData.value.tableIndex])
        }

        /**
         * @description 点击表格项回调
         * @param {ChannelPtzProtocolDto} row
         */
        const handleRowClick = (row: ChannelPtzProtocolDto) => {
            const index = tableData.value.findIndex((item) => item.chlId === row.chlId)
            if (index !== pageData.value.tableIndex) {
                pageData.value.tableIndex = index
            }
        }

        // 首次加载成功 播放视频
        const stopWatchFirstPlay = watchEffect(() => {
            if (ready.value && tableData.value.length) {
                nextTick(() => play())
                stopWatchFirstPlay()
            }
        })

        watch(
            () => pageData.value.tableIndex,
            () => {
                play()
            },
        )

        onMounted(async () => {
            await getData()
            for (let i = 0; i < tableData.value.length; i++) {
                await getConfig(tableData.value[i].chlId, i)
            }
        })

        return {
            playerRef,
            handlePlayerReady,
            pageData,
            tableData,
            changeChl,
            setData,
            handleRowClick,
            changeAllPtz,
        }
    },
})
</script>

<style lang="scss" scoped>
.protocol {
    width: 100%;
    height: var(--content-height);
    display: flex;
}

.left {
    width: 400px;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.player {
    width: 400px;
    height: 300px;
    flex-shrink: 0;
}

.time {
    width: 80px;
    text-align: center;
}

.right {
    width: 100%;
    height: 100%;
    margin-left: 10px;
    display: flex;
    flex-direction: column;
}
</style>
