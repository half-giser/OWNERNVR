<!--
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-07-31 10:29:37
 * @Description: 录像码流通用表格组件
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-10-11 16:51:43
-->
<template>
    <div class="base-flex-box">
        <div class="base-table-box">
            <el-table
                :data="tableData"
                class="RecordStreamList"
                stripe
                border
                table-layout="fixed"
                show-overflow-tooltip
                empty-text=" "
                highlight-current-row
            >
                <!-- 通道名 -->
                <el-table-column
                    prop="name"
                    :label="Translate('IDCS_CHANNEL_NAME')"
                    width="240px"
                >
                    <template #default="scope">
                        <span>{{ scope.row.name }}</span>
                    </template>
                </el-table-column>
                <!-- 码流类型 -->
                <el-table-column
                    prop="streamType"
                    :label="Translate('IDCS_CODE_STREAM_TYPE')"
                    width="100px"
                >
                    <template #default="scope">
                        <span>{{ formatDisplayStreamType(scope.row) }}</span>
                    </template>
                </el-table-column>
                <!-- videoEncodeType -->
                <el-table-column
                    prop="videoEncodeType"
                    :label="Translate('IDCS_VIDEO_ENCT')"
                    width="130px"
                >
                    <template #header>
                        <el-dropdown trigger="click">
                            <span class="el-dropdown-link">
                                {{ Translate('IDCS_VIDEO_ENCT') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="(item, index) in pageData.videoEncodeTypeUnionList"
                                        :key="index"
                                        :value="item"
                                        @click="handleVideoEncodeTypeChangeAll(item)"
                                    >
                                        {{ Translate(streamTypeMapping[item]) }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.videoEncodeType"
                            prop="videoEncodeType"
                            placeholder=""
                            :disabled="scope.row.videoEncodeTypeDisable"
                            :options="scope.row.mainCaps['@supEnct']"
                            @change="handleVideoEncodeTypeChange(scope.row)"
                        >
                            <el-option
                                v-for="item in scope.row.mainCaps['@supEnct']"
                                :key="item"
                                :label="Translate(streamTypeMapping[item])"
                                :value="item"
                            >
                            </el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <!-- resolution -->
                <el-table-column
                    prop="resolution"
                    :label="Translate('IDCS_RESOLUTION_RATE')"
                    width="170px"
                >
                    <template #header>
                        <el-popover
                            v-model:visible="pageData.resolutionHeaderVisble"
                            trigger="click"
                            width="430px"
                            popper-class="no-padding"
                        >
                            <template #reference>
                                <span class="base-popover-icon">
                                    {{ Translate('IDCS_RESOLUTION_RATE') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                                </span>
                            </template>
                            <div class="resolutionContainer">
                                <el-table
                                    ref="resolutionTableRef"
                                    max-height="400px"
                                    :data="pageData.resolutionGroups"
                                    :show-header="pageData.headerVisble"
                                    :row-key="getRowKey"
                                    :expand-row-keys="pageData.expands"
                                    stripe
                                    @expand-change="handleExpandChange($event, pageData.expands)"
                                >
                                    <el-table-column
                                        prop="res"
                                        width="220px"
                                    >
                                        <template #default="scope">
                                            <el-select
                                                v-model="scope.row.res"
                                                :options="scope.row.resGroup"
                                                :teleported="false"
                                            >
                                                <el-option
                                                    v-for="item in scope.row.resGroup"
                                                    :key="item.value"
                                                    :label="item.label"
                                                    :value="item.value"
                                                    @click="keepDropDownOpen(scope.row)"
                                                >
                                                </el-option>
                                            </el-select>
                                        </template>
                                    </el-table-column>
                                    <el-table-column
                                        prop="chls"
                                        width="190px"
                                        type="expand"
                                    >
                                        <template #default="scope">
                                            <div class="chl_area">
                                                <el-row>
                                                    <el-col
                                                        v-for="(item, index) in scope.row.chls.data"
                                                        :key="index"
                                                        :span="12"
                                                        class="fit-content-height"
                                                    >
                                                        <div class="device-item">
                                                            <BaseImgSprite
                                                                file="chl_icon"
                                                                :index="0"
                                                                :chunk="4"
                                                            />
                                                            <span class="device-name">{{ item.text }}</span>
                                                        </div>
                                                    </el-col>
                                                </el-row>
                                            </div>
                                        </template>
                                    </el-table-column>
                                </el-table>
                                <el-row class="base-btn-box">
                                    <el-button @click="handleSetResolutionAll">{{ Translate('IDCS_OK') }}</el-button>
                                    <el-button @click="handleSetResolutionCancel">{{ Translate('IDCS_CANCEL') }}</el-button>
                                </el-row>
                            </div>
                        </el-popover>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.resolution"
                            prop="resolution"
                            placeholder=""
                            max-height="400px"
                            :disabled="scope.row.resolutionDisable"
                            :options="scope.row.resolutions"
                            @change="handleResolutionChange(scope.row)"
                        >
                            <el-option
                                v-for="item in scope.row.resolutions"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            >
                            </el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <!-- frameRate -->
                <el-table-column
                    prop="frameRate"
                    :label="Translate('IDCS_FRAME_RATE')"
                    width="100px"
                >
                    <template #header>
                        <el-dropdown
                            trigger="click"
                            max-height="400px"
                        >
                            <span class="el-dropdown-link">
                                {{ Translate('IDCS_FRAME_RATE') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.frameRateList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                        @click="handleFrameRateChangeAll(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.frameRate"
                            prop="frameRate"
                            placeholder=""
                            max-height="400px"
                            :disabled="scope.row.frameRateDisable"
                            :options="scope.row.frameRates"
                            @change="handleFrameRateChange(scope.row)"
                        >
                            <el-option
                                v-for="item in scope.row.frameRates"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            >
                            </el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <!-- bitType -->
                <el-table-column
                    prop="bitType"
                    :label="Translate('IDCS_BITRATE_TYPE')"
                    width="130px"
                >
                    <template #header>
                        <el-dropdown
                            trigger="click"
                            :disabled="pageData.bitTypeDropDisable"
                        >
                            <span class="el-dropdown-link">
                                {{ Translate('IDCS_BITRATE_TYPE') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.bitTypeUnionList"
                                        :key="item"
                                        :value="item"
                                        @click="handleBitTypeChangeAll(item)"
                                    >
                                        {{ item }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-if="scope.row.bitTypeVisible"
                            v-model="scope.row.bitType"
                            prop="bitType"
                            placeholder=""
                            :disabled="scope.row.bitTypeDisable"
                            :options="scope.row.mainCaps['@bitType']"
                            @change="handleBitTypeChange(scope.row)"
                        >
                            <el-option
                                v-for="item in scope.row.mainCaps['@bitType']"
                                :key="item"
                                :label="item"
                                :value="item"
                            >
                            </el-option>
                        </el-select>
                        <span v-else>- -</span>
                    </template>
                </el-table-column>
                <!-- imageLevel -->
                <el-table-column
                    prop="level"
                    :label="Translate('IDCS_IMAGE_QUALITY')"
                    width="130px"
                >
                    <template #header>
                        <el-dropdown
                            trigger="click"
                            :disabled="pageData.levelDropDisable"
                        >
                            <span class="el-dropdown-link">
                                {{ Translate('IDCS_IMAGE_QUALITY') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.levelList"
                                        :key="item.value"
                                        :value="item.text"
                                        @click="handleLevelChangeAll(item.value)"
                                    >
                                        {{ item.text }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.level"
                            prop="level"
                            :placeholder="Translate('IDCS_LOWEST')"
                            value-key="value"
                            :disabled="scope.row.imageLevelDisable"
                            :options="scope.row.levelNote"
                            @change="handleLevelChange(scope.row)"
                        >
                            <el-option
                                v-for="item in scope.row.levelNote"
                                :key="item"
                                :label="formatDisplayImageLevel(item)"
                                :value="item"
                            >
                            </el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <!-- videoQuality -->
                <el-table-column
                    prop="videoQuality"
                    :label="Translate('IDCS_VIDEO_QUALITY')"
                    width="164px"
                >
                    <template #header>
                        <el-dropdown trigger="click">
                            <span class="el-dropdown-link">
                                {{ Translate('IDCS_VIDEO_QUALITY') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.videoQualityList"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                        @click="handleVideoQualityChangeAll(item)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.videoQuality"
                            prop="videoQuality"
                            value-key="value"
                            placeholder=""
                            :options="scope.row.qualitys"
                            :disabled="scope.row.videoQualityDisable"
                            @change="handleVideoQualityChange(scope.row)"
                        >
                            <el-option
                                v-for="item in scope.row.qualitys"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            >
                            </el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <!-- bitRange -->
                <el-table-column
                    prop="bitRange"
                    :label="Translate('IDCS_RATE_RECOMMEND_RANGE')"
                    width="200px"
                >
                    <template #default="scope">
                        <span :disabled="scope.row.bitRangeDisable">{{ formatDisplayBitRange(scope.row) }}</span>
                    </template>
                </el-table-column>
                <!-- audio -->
                <el-table-column
                    prop="audio"
                    :label="Translate('IDCS_AUDIO_FREQUENCY')"
                    width="110px"
                >
                    <template #header>
                        <el-dropdown trigger="click">
                            <span class="el-dropdown-link">
                                {{ Translate('IDCS_AUDIO_FREQUENCY') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in pageData.audioOptions"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                        @click="handleAudioOptionsChangeAll(item)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.audio"
                            prop="audio"
                            value-key="value"
                            placeholder="开"
                            :options="pageData.audioOptions"
                            :disabled="scope.row.audioDisable"
                            @change="handleAudioOptionsChange(scope.row)"
                        >
                            <el-option
                                v-for="item in pageData.audioOptions"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            >
                            </el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <!-- TODO 原代码中写死了不显示 recordStream -->
                <el-table-column
                    v-if="pageData.recordStreamVisible"
                    prop="recordStream"
                    :label="Translate('IDCS_RECORD_CODE_STREAM')"
                    width="140px"
                >
                    <template #header>
                        <el-dropdown trigger="click">
                            <span class="el-dropdown-link">
                                {{ Translate('IDCS_RECORD_CODE_STREAM') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item
                                        v-for="item in recordStreams"
                                        :key="item.value"
                                        :value="item.value"
                                        :label="item.label"
                                        @click="handleRecordStreamChangeAll(item.value)"
                                    >
                                        {{ item.label }}
                                    </el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <el-select
                            v-model="scope.row.recordStream"
                            prop="recordStream"
                            value-key="value"
                            placeholder="主码流"
                            :options="recordStreams"
                            :disabled="scope.row.recordStreamDisable"
                            @change="handleRecordStreamChange(scope.row)"
                        >
                            <el-option
                                v-for="item in recordStreams"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            >
                            </el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <!-- GOP -->
                <el-table-column
                    prop="GOP"
                    :label="Translate('IDCS_GOP')"
                    width="90px"
                >
                    <template #header>
                        <el-popover
                            v-model:visible="pageData.gopHeaderVisble"
                            trigger="click"
                            popper-class="no-padding"
                            width="300"
                            placement="bottom-start"
                        >
                            <template #reference>
                                <span class="base-popover-icon">
                                    {{ Translate('IDCS_GOP') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                                </span>
                            </template>
                            <div class="GOP_dropDown">
                                <div class="GOP_input">
                                    <span>GOP</span>
                                    <el-input
                                        v-model="pageData.gopSetAll"
                                        placeholder=""
                                        @input="GOPhandleFocus(pageData.gopSetAll)"
                                    />
                                </div>

                                <el-row class="base-btn-box">
                                    <el-button @click="handleSetGopAll(pageData.gopSetAll)">{{ Translate('IDCS_OK') }}</el-button>
                                    <el-button @click="handleGopCancel">{{ Translate('IDCS_CANCEL') }}</el-button>
                                </el-row>
                            </div>
                        </el-popover>
                        <!-- <el-dropdown
                            ref="gopDropdownRef"
                            trigger="click"
                            :hide-on-click="false"
                            placement="bottom-end"
                        >
                            <span class="el-dropdown-link">
                                {{ Translate('IDCS_GOP') }}<el-icon class="el-icon--right"><arrow-down /></el-icon>
                            </span>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <div class="GOP_dropDown">
                                        <div class="GOP_input">
                                            <span>GOP</span>
                                            <el-input
                                                v-model="pageData.gopSetAll"
                                                placeholder=""
                                                @input="GOPhandleFocus(pageData.gopSetAll)"
                                            />
                                        </div>

                                        <el-row class="base-btn-box">
                                            <el-button @click="handleSetGopAll(pageData.gopSetAll)">{{ Translate('IDCS_OK') }}</el-button>
                                            <el-button @click="handleGopCancel">{{ Translate('IDCS_CANCEL') }}</el-button>
                                        </el-row>
                                    </div>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown> -->
                    </template>
                    <template #default="scope">
                        <el-input
                            v-model="scope.row.GOP"
                            placeholder=""
                            :disabled="scope.row.GOPDisable"
                            @input="GOPhandleFocus(scope.row)"
                            @keydown.enter="GOPhandleKeydown(scope.row)"
                        ></el-input>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <el-row class="bottom_row">
            <div>
                <span
                    id="txtBandwidth"
                    class="row_bandwidth"
                    >{{ pageData.txtBandwidth }}</span
                >
                <!-- TODO 这个按钮老代码中写死不显示，新代码其他页面也没实现 -->
                <span
                    id="bandwidthDetail"
                    class="detailBtn"
                ></span>
                <span
                    v-if="pageData.PredictVisible"
                    id="txRecTime"
                    >{{ pageData.recTime }}</span
                >
                <el-button
                    v-show="pageData.CalculateVisible"
                    id="btnActivate"
                    @click="handleCalculate"
                    >{{ Translate('IDCS_CALCULATE') }}</el-button
                >
            </div>
            <el-button
                id="btnSetDefaultPwd"
                :disabled="pageData.applyBtnDisable"
                @click="setData"
                >{{ Translate('IDCS_APPLY') }}</el-button
            >
        </el-row>
    </div>
</template>

<script lang="ts" setup>
import { ArrowDown } from '@element-plus/icons-vue'
import { RecordStreamInfoDto } from '@/types/apiType/record'
import { ElMessageBox } from 'element-plus'
import type { TableInstance } from 'element-plus'

// 用于控制下拉菜单的打开关闭
const resolutionTableRef = ref<TableInstance>()
const theme = getUiAndTheme().name
const prop = withDefaults(
    defineProps<{
        mode: string
    }>(),
    {
        mode: 'event',
    },
)
type ChlItem = {
    '@id': string
    addType: string
    chlType: string
    chlIndex: string
    name: string
    poeIndex: string
    productModel: {
        value: string
        '@factoryName': string
    }
}
const { Translate } = useLangStore()
const { openLoading, closeLoading } = useLoading()
const tableData = ref([] as RecordStreamInfoDto[])
// const tableRef = ref<FormInstance>()

const streamTypeMapping: Record<string, string> = {
    // 码流类型映射
    main: 'IDCS_MAIN_STREAM',
    sub: 'IDCS_SUB_STREAM',
    h264: 'IDCS_VIDEO_ENCT_TYPE_H264',
    h264s: 'IDCS_VIDEO_ENCT_TYPE_H264_SMART',
    h264p: 'IDCS_VIDEO_ENCT_TYPE_H264_PLUS',
    h265: 'IDCS_VIDEO_ENCT_TYPE_H265',
    h265s: 'IDCS_VIDEO_ENCT_TYPE_H265_SMART',
    h265p: 'IDCS_VIDEO_ENCT_TYPE_H265_PLUS',
}
const videoEncodeTypeArr = ['h264s', 'h265s', 'h264p', 'h265p'] // 可修改bitType、videoQuality、GOP的码流类型
const imageLevelMapping: Record<string, string> = {
    // 图像质量映射
    highest: 'IDCS_HIGHEST',
    higher: 'IDCS_HIGHER',
    medium: 'IDCS_MEDIUM',
    low: 'IDCS_LOW',
    lower: 'IDCS_LOWER',
    lowest: 'IDCS_LOWEST',
}
const recordStreams = [
    // 录像码流
    { value: 'main', label: Translate('IDCS_MAIN_STREAM') },
    { value: 'sub', label: Translate('IDCS_SUB_STREAM') },
]
const DevRecParamCfgModule = {
    // 设备录制参数
    doubleStreamRecSwitch: true,
}
// 事件录像码流参数
const RecStreamModule = ref({
    recType: '' as string,
    recType1: '' as string,
    loopRecSwitch: false,
})
const pageData = ref({
    videoEncodeTypeUnionList: [] as string[],
    resolutionGroups: [] as { res: string; resGroup: { value: string; label: string }[]; chls: { expand: boolean; data: { value: string; text: string }[] } }[],
    bitTypeUnionList: [] as string[],
    levelList: [] as { value: string; text: string }[],
    videoQualityList: [] as { value: string; label: string }[],
    frameRateList: [] as { value: string; label: string }[],
    maxFpsMap: {} as Record<string, number>,
    videoQualityListFlag: 0,
    chls: [] as ChlItem[],
    audioOptions: [
        { value: 'ON', label: Translate('IDCS_ON') },
        { value: 'OFF', label: Translate('IDCS_OFF') },
    ],
    smartEncodeFlag: false,
    gopSetAll: '',
    count: 0,
    chlName: '',
    maxQoI: 0, // 最大QoI
    poeModeNode: '', // poe模式
    txtBandwidth: ref(''), // 宽带信息
    audioInNum: -1, //支持的音频数量
    mainStreamLimitFps: 1, // 主码流帧率限制

    PredictVisible: false, // 预计录像时间是否显示
    CalculateVisible: false, // 计算按钮是否显示
    recordStreamVisible: false, // 录像码流是否显示

    isAllCBR: true, // 是否全为CBR
    headerVisble: false, // 分辨率下拉框表头是否显示
    levelDropDisable: false, // 图像质量下拉框是否禁用
    bitTypeDropDisable: false, // 码率类型下拉框是否禁用
    applyBtnDisable: true, // 应用按钮是否禁用
    recTime: '', // 预计录像时间
    editeRows: [] as RecordStreamInfoDto[], // 编辑的行
    expands: [] as string[], // 展开的行
    firstInit: true, // 是否第一次初始化

    resolutionHeaderVisble: false, // 分辨率下拉框表头是否显示
    gopHeaderVisble: false, // GOP下拉框表头是否显示
})

// TODO 获取UI，设置visible属性
// 获取设备录制参数配置
const getDevRecParamCfgModule = function (callback: Function) {
    queryRecordDistributeInfo().then((resb) => {
        const res = queryXml(resb)
        if (res('status').text() == 'success') {
            DevRecParamCfgModule.doubleStreamRecSwitch = res('//content/recMode/doubleStreamRecSwitch').text() == 'true'
            // 需要改
            if (prop.mode == 'event') {
                RecStreamModule.value.recType = res('//content/recMode/mode').text() == 'auto' ? 'ae' : 'me'
                RecStreamModule.value.recType1 = res('//content/recMode/mode').text() == 'auto' ? 'an' : 'mn'
                RecStreamModule.value.loopRecSwitch = res('//content/loopRecSwitch').text().toLowerCase() === 'true'
            } else if (prop.mode == 'timing') {
                RecStreamModule.value.recType = res('//content/recMode/mode').text() == 'auto' ? 'an' : 'mn'
                RecStreamModule.value.recType1 = res('//content/recMode/mode').text() == 'auto' ? 'ae' : 'me'
                RecStreamModule.value.loopRecSwitch = res('//content/loopRecSwitch').text().toLowerCase() === 'true'
            }
        }
        if (callback) callback()
    })
}
// 获取系统宽带容量
const getSystemCaps = function (callback?: Function) {
    querySystemCaps().then((resb) => {
        const res = queryXml(resb)
        if (res('status').text() === 'success') {
            const totalBandwidth = Number(res('//content/totalBandwidth').text()) * 1
            let usedBandwidth = 0
            // 需要改
            if (prop.mode == 'event') {
                usedBandwidth = Number(res('//content/' + (RecStreamModule.value.recType == 'me' ? 'usedManualBandwidth' : 'usedAutoBandwidth')).text()) * 1
            } else if (prop.mode == 'timing') {
                usedBandwidth = Number(res('//content/' + (RecStreamModule.value.recType == 'mn' ? 'usedManualBandwidth' : 'usedAutoBandwidth')).text()) * 1
            }
            // 可能要用于bandwidthDetail
            // const singleChannelBandwidth = res('//content/singleChannelBandwidth').text()
            // const unit = res('//content/singleChannelBandwidth').attr('unit')
            // const bandwidthCalc = singleChannelBandwidth + unit
            let remainBandwidth = (totalBandwidth * 1024 - usedBandwidth) / 1024
            if (remainBandwidth < 0) {
                remainBandwidth = 0
            }
            pageData.value.txtBandwidth = Translate('IDCS_CURRENT_BANDWIDTH_ALL_D_D').formatForLang(remainBandwidth.toFixed(0), totalBandwidth.toFixed(0))
            // TODO: 可能要写bandwidthDetail
            pageData.value.audioInNum = Number(res('//content/audioInNum').text()) * 1
            pageData.value.mainStreamLimitFps = Number(res('//content/mainStreamLimitFps').text()) * 1 || pageData.value.mainStreamLimitFps
        }
        if (callback) callback()
    })
}
// 获取通道列表
const getChlListData = function () {
    getChlList({}).then((resb) => {
        commLoadResponseHandler(resb, ($) => {
            const rowData = [] as ChlItem[]
            $('//content/item').forEach((ele: any) => {
                const eleXml = queryXml(ele.element)
                rowData.push({
                    '@id': ele.attr('id'),
                    addType: eleXml('addType').text(),
                    chlType: eleXml('chlType').text(),
                    chlIndex: eleXml('chlIndex').text(),
                    name: eleXml('name').text(),
                    poeIndex: eleXml('poeIndex').text(),
                    productModel: {
                        value: eleXml('productModel').text(),
                        '@factoryName': eleXml('productModel').attr('factoryName'),
                    },
                })
            })
            pageData.value.chls = rowData
        }).then(() => {
            getData()
        })
    })
}
// 获取网络配置信息
const getNetCfgModule = function (callback: Function) {
    queryNetCfgV2().then((resb) => {
        const res = queryXml(resb)
        if (res('status').text() === 'success') {
            pageData.value.poeModeNode = res('//content/poeMode').text()
        }
        if (callback) callback()
    })
}
// 获取表格数据
const getData = function () {
    openLoading()
    getNetCfgModule(function () {
        const sendXml = rawXml`
                                <requireField>
                                    <name/>
                                    <chlType/>
                                    <mainCaps/>
                                    <main/>
                                    <${RecStreamModule.value.recType}/>
                                    <${RecStreamModule.value.recType1}/>
                                    <mainStreamQualityCaps/>
                                    <levelNote/>
                                </requireField>  `
        queryNodeEncodeInfo(sendXml).then((resb) => {
            commLoadResponseHandler(resb, ($) => {
                bindCtrlData($)
            })
            closeLoading()
        })
    })
}
// 绑定数据
const bindCtrlData = function (res: any) {
    getNetCfgModule(function () {
        // res = queryXml(res)
        if (res('status').text() === 'success') {
            tableData.value = []
            // 遍历('//cotent/item')，获取表格数据
            res('//content/item').forEach((ele: any) => {
                const eleXml = queryXml(ele.element)
                const item = new RecordStreamInfoDto()
                item['@id'] = ele.attr('id').trim()
                item.name = eleXml('name').text()
                item.chlType = eleXml('chlType').text()
                const resList: { '@fps': string; value: string }[] = []
                eleXml('mainCaps/res').forEach((element: any) => {
                    resList.push({ '@fps': element.attr('fps'), value: element.text() })
                })
                item.mainCaps = {
                    '@supEnct': eleXml('mainCaps') && eleXml('mainCaps').attr('supEnct') ? (eleXml('mainCaps').attr('supEnct').split(',') ? eleXml('mainCaps').attr('supEnct').split(',') : []) : [],
                    '@bitType': eleXml('mainCaps') && eleXml('mainCaps').attr('bitType') ? (eleXml('mainCaps').attr('bitType').split(',') ? eleXml('mainCaps').attr('bitType').split(',') : []) : [],
                    res: [...resList],
                }
                item.main = {
                    '@enct': eleXml('main').attr('enct'),
                    '@aGOP': eleXml('main').attr('aGOP') ? eleXml('main').attr('aGOP') : '',
                    '@mGOP': eleXml('main').attr('mGOP') ? eleXml('main').attr('mGOP') : '',
                }
                item.videoEncodeType = eleXml('main').attr('enct')
                item.an = {
                    '@res': eleXml('an').attr('res'),
                    '@fps': eleXml('an').attr('fps'),
                    '@QoI': eleXml('an').attr('QoI'),
                    '@audio': eleXml('an').attr('audio'),
                    '@type': eleXml('an').attr('type'),
                    '@bitType': eleXml('an').attr('bitType'),
                    '@level': eleXml('an').attr('level'),
                }
                item.ae = {
                    '@res': eleXml('ae').attr('res'),
                    '@fps': eleXml('ae').attr('fps'),
                    '@QoI': eleXml('ae').attr('QoI'),
                    '@audio': eleXml('ae').attr('audio'),
                    '@type': eleXml('ae').attr('type'),
                    '@bitType': eleXml('ae').attr('bitType'),
                    '@level': eleXml('ae').attr('level'),
                }
                item.mn = {
                    '@res': eleXml('mn').attr('res'),
                    '@fps': eleXml('mn').attr('fps'),
                    '@QoI': eleXml('mn').attr('QoI'),
                    '@audio': eleXml('mn').attr('audio'),
                    '@type': eleXml('mn').attr('type'),
                    '@bitType': eleXml('mn').attr('bitType'),
                    '@level': eleXml('mn').attr('level'),
                }
                item.me = {
                    '@res': eleXml('me').attr('res'),
                    '@fps': eleXml('me').attr('fps'),
                    '@QoI': eleXml('me').attr('QoI'),
                    '@audio': eleXml('me').attr('audio'),
                    '@type': eleXml('me').attr('type'),
                    '@bitType': eleXml('me').attr('bitType'),
                    '@level': eleXml('me').attr('level'),
                }
                item.streamType = 'main'
                // 获取码率类型
                eleXml('mainStreamQualityCaps/item').forEach((element: any) => {
                    item.mainStreamQualityCaps.push({
                        '@enct': element.attr('enct'),
                        '@res': element.attr('res'),
                        '@digitalDefault': element.attr('digitalDefault'),
                        '@analogDefault': element.attr('analogDefault'),
                        value: element.text().split(',') ? element.text().split(',') : [],
                    })
                    if (element.attr('enct') == 'h264' && element.attr('res') == '0x0' && pageData.value.videoQualityListFlag === 0) {
                        element
                            .text()
                            .split(',')
                            .forEach((ele: string) => {
                                pageData.value.maxQoI = Math.max(parseInt(ele) * 1, pageData.value.maxQoI)
                                if (pageData.value.poeModeNode && pageData.value.poeModeNode == '10' && parseInt(ele) <= 6144) {
                                    //为长线模式时，过滤掉6M以上的码率
                                    pageData.value.videoQualityList.push({ value: ele, label: ele + 'Kbps' })
                                } else if (!pageData.value.poeModeNode || pageData.value.poeModeNode == '100') {
                                    pageData.value.videoQualityList.push({ value: ele, label: ele + 'Kbps' })
                                }
                            })
                        pageData.value.videoQualityListFlag++
                    }
                })
                item.levelNote = eleXml('levelNote').text() ? eleXml('levelNote').text().split(',') : []
                if (item.levelNote.length > 0) {
                    pageData.value.levelList = []
                    item.levelNote.reverse().forEach((element: any) => {
                        pageData.value.levelList.push({ value: element, text: Translate(imageLevelMapping[element]) })
                    })
                }
                //遍历item['mainCaps']['@supEnct']，获取编码类型并集
                item['mainCaps']['@supEnct'].forEach((element: string) => {
                    if (!pageData.value.videoEncodeTypeUnionList.includes(element)) {
                        pageData.value.videoEncodeTypeUnionList.push(element)
                    }
                })
                item['mainCaps']['@bitType'].forEach((element: string) => {
                    if (!pageData.value.bitTypeUnionList.includes(element)) {
                        pageData.value.bitTypeUnionList.push(element)
                    }
                })
                if (prop.mode == 'event') {
                    if (RecStreamModule.value.recType === 'ae') {
                        item['GOP'] = item['main']['@aGOP'] ? item['main']['@aGOP'] : ''
                        item['resolution'] = item['ae']['@res']
                        item['frameRate'] = item['ae']['@fps']
                        item['bitType'] = item['ae']['@bitType']
                        item['level'] = item['ae']['@level']
                        item['videoQuality'] = item['ae']['@QoI']
                        item['audio'] = item['ae']['@audio']
                        item['recordStream'] = item['ae']['@type']
                    } else if (RecStreamModule.value.recType === 'me') {
                        item['GOP'] = item['main']['@mGOP'] ? item['main']['@mGOP'] : ''
                        item['resolution'] = item['me']['@res']
                        item['frameRate'] = item['me']['@fps']
                        item['frameRate'] = item['me']['@fps']
                        item['bitType'] = item['me']['@bitType']
                        item['level'] = item['me']['@level'] ? item['me']['@level'] : '最低'
                        item['videoQuality'] = item['me']['@QoI']
                        item['audio'] = item['me']['@audio']
                        item['recordStream'] = item['me']['@type']
                    }
                } else if (prop.mode == 'timing') {
                    if (RecStreamModule.value.recType === 'an') {
                        item['GOP'] = item['main']['@aGOP'] ? item['main']['@aGOP'] : ''
                        item['resolution'] = item['an']['@res']
                        item['frameRate'] = item['an']['@fps']
                        item['bitType'] = item['an']['@bitType']
                        item['level'] = item['an']['@level']
                        item['videoQuality'] = item['an']['@QoI']
                        item['audio'] = item['an']['@audio']
                        item['recordStream'] = item['an']['@type']
                    } else if (RecStreamModule.value.recType === 'mn') {
                        item['GOP'] = item['main']['@mGOP'] ? item['main']['@mGOP'] : ''
                        item['resolution'] = item['mn']['@res']
                        item['frameRate'] = item['mn']['@fps']
                        item['frameRate'] = item['mn']['@fps']
                        item['bitType'] = item['mn']['@bitType']
                        item['level'] = item['mn']['@level'] ? item['mn']['@level'] : '最低'
                        item['videoQuality'] = item['mn']['@QoI']
                        item['audio'] = item['mn']['@audio']
                        item['recordStream'] = item['mn']['@type']
                    }
                }
                if (!item['frameRate'] && item['mainCaps']['res'].length > 0) {
                    item['frameRate'] = item['mainCaps']['res'][0]['@fps']
                }
                if (item['mainCaps']['res'].length > 1) {
                    item['mainCaps']['res'].sort((a, b) => resolutionSort(a, b))
                }
                item['bitRange'] =
                    item['bitType'] == 'CBR' || !item['bitType']
                        ? null
                        : getBitrateRange({
                              resolution: item['resolution'],
                              level: item['level'],
                              fps: item['frameRate'],
                              maxQoI: pageData.value.maxQoI,
                              videoEncodeType: item['videoEncodeType'],
                          })

                item['supportAudio'] = true
                if (pageData.value.audioInNum > 0) {
                    ele.each(pageData.value.chls, function (chl: ChlItem) {
                        if (chl['@id'] == item['@id'] && chl['chlIndex'] && parseInt(chl['chlIndex']) * 1 >= pageData.value.audioInNum) {
                            item['supportAudio'] = false
                            return false
                        }
                    })
                }
                item['resolutions'] = getResolutionSingleList(item)
                item['frameRates'] = getFrameRateSingleList(item)
                // handleLineDisabled(item)
                tableData.value.push(item)
            })
            pageData.value.frameRateList = getFrameRateList(tableData.value)
            // 排序 NT-9768
            pageData.value.videoEncodeTypeUnionList.sort()
            pageData.value.videoEncodeTypeUnionList.map((n) => {
                return { value: n, text: Translate(streamTypeMapping[n]) }
            })

            pageData.value.bitTypeUnionList.map((element) => {
                return { value: element, text: element }
            })
            doCfg(tableData.value)
            pageData.value.resolutionGroups = getResolutionGroups(tableData.value)
            queryRemainRecTimeF()
            pageData.value.levelDropDisable = pageData.value.isAllCBR
            pageData.value.firstInit = false
        }
    })
}

// 查询和显示当前录制状态下剩余的录制时间
const queryRemainRecTimeF = function () {
    // 需要改
    let recType: string = ''
    if (prop.mode == 'event') {
        recType = RecStreamModule.value.recType == 'ae' ? 'auto' : 'manually'
    } else if (prop.mode == 'timing') {
        recType = RecStreamModule.value.recType == 'an' ? 'auto' : 'manually'
    }
    let sendXml = rawXml`<content>  
                        <recMode   type='recModeType'>${recType}</recMode> 
                        <streamType  type='streamType'>Main</streamType>
                        <chls type='list'>`
    tableData.value.forEach((rowData: RecordStreamInfoDto) => {
        if (!rowData['rowDisable']) {
            sendXml += rawXml`<item  id='${rowData['@id']}'>
                            <QoI>${rowData['videoQuality']}</QoI>
                        </item>`
        }
    })
    sendXml += `</chls>
            </content>`
    openLoading()
    queryRemainRecTime(sendXml).then((resb) => {
        closeLoading()
        const res = queryXml(resb)
        if (res('status').text() === 'success') {
            pageData.value.recTime = ''
            const item = res('//content/item')
            if (item.length >= 2) {
                const recTimeArray: string[] = []
                item.forEach((ele: any) => {
                    const elexml = queryXml(ele.element)
                    const remainRecTime = parseInt(elexml('remainRecTime').text()) * 1
                    const recTime =
                        remainRecTime == 0 && RecStreamModule.value.loopRecSwitch
                            ? Translate('IDCS_CYCLE_RECORD')
                            : remainRecTime <= 1
                              ? remainRecTime < 0
                                  ? 0 + ' ' + Translate('IDCS_DAY_TIME')
                                  : remainRecTime + ' ' + Translate('IDCS_DAY_TIME')
                              : remainRecTime + ' ' + Translate('IDCS_DAY_TIMES')
                    const diskGroupIndex = '(' + Translate('IDCS_REEL_GROUP') + elexml('diskGroupIndex').text() + ')'
                    recTimeArray.push('' + recTime + diskGroupIndex + '')
                })
                pageData.value.recTime = recTimeArray.join(';')
                // 根据UI切换是否显示
                if (theme === 'UI1-E') {
                    pageData.value.PredictVisible = true
                    pageData.value.CalculateVisible = true
                }
            } else if (item.length == 0) {
                pageData.value.PredictVisible = false
                pageData.value.CalculateVisible = false
            } else {
                const remainRecTime = Number(res('//content/item/remainRecTime').text()) * 1
                const recTime =
                    remainRecTime == 0 && RecStreamModule.value.loopRecSwitch
                        ? Translate('IDCS_CYCLE_RECORD')
                        : remainRecTime <= 1
                          ? remainRecTime < 0
                              ? 0 + ' ' + Translate('IDCS_DAY_TIME')
                              : remainRecTime + ' ' + Translate('IDCS_DAY_TIME')
                          : remainRecTime + ' ' + Translate('IDCS_DAY_TIMES')
                pageData.value.recTime = Translate('IDCS_PREDICT_RECORD_TIME') + '' + recTime + ''
                if (theme === 'UI1-E') {
                    pageData.value.PredictVisible = true
                    pageData.value.CalculateVisible = true
                }
            }
        }
    })
}
// 获取所有数据
const fetchData = function () {
    getDevRecParamCfgModule(function () {
        getSystemCaps(function () {
            getChlListData()
        })
    })
}

// 检查该列数据是否存在于编辑行
const checkIsEdite = function (rowData: RecordStreamInfoDto) {
    let isEdite = false
    pageData.value.editeRows.forEach((ele) => {
        if (ele['@id'] == rowData['@id']) {
            isEdite = true
        }
    })
    return isEdite
}
// 添加到编辑行或者更新编辑行
const addEditeRows = function (rowData: RecordStreamInfoDto) {
    if (!checkIsEdite(rowData)) {
        pageData.value.editeRows.push(rowData)
    } else {
        // 如果已经存在于编辑行，更新数据
        pageData.value.editeRows.forEach((ele) => {
            if (ele['@id'] == rowData['@id']) {
                ele = rowData
                return
            }
        })
    }
    pageData.value.applyBtnDisable = false
}
// 设置videoQuality
const setQuality = function (rowData: RecordStreamInfoDto) {
    rowData['mainStreamQualityCaps'].forEach((element) => {
        if (rowData['resolution'] == element['@res'] && rowData['videoEncodeType'] == element['@enct']) {
            if (rowData['chlType'] == 'digital') {
                if (pageData.value.poeModeNode && pageData.value.poeModeNode == '10' && parseInt(element['@digitalDefault']) * 1 > 6144) {
                    rowData['videoQuality'] = '6144'
                } else {
                    rowData['videoQuality'] = element['@digitalDefault']
                }
            } else {
                if (pageData.value.poeModeNode && pageData.value.poeModeNode == '10' && parseInt(element['@analogDefault']) * 1 > 6144) {
                    rowData['videoQuality'] = '6144'
                } else {
                    rowData['videoQuality'] = element['@analogDefault']
                }
            }
        }
    })
}
// 根据参数变化生成码率范围
const setBitRange = function (rowData: RecordStreamInfoDto) {
    if (rowData['bitType'] !== 'CBR' && rowData['bitType']) {
        rowData['bitRange'] = getBitrateRange({
            resolution: rowData['resolution'],
            level: rowData['level'],
            fps: rowData['frameRate'],
            maxQoI: pageData.value.maxQoI,
            videoEncodeType: rowData['videoEncodeType'],
        })
    } else {
        rowData['bitRange'] = null
    }
}
// 对单个视频编码进行处理
const handleVideoEncodeTypeChange = function (rowData: RecordStreamInfoDto) {
    const isDisabled = videoEncodeTypeArr.includes(rowData.videoEncodeType)
    rowData.bitTypeDisable = isDisabled
    rowData.videoQualityDisable = isDisabled
    rowData.GOPDisable = isDisabled
    if (!isDisabled) {
        genQualityList(rowData)
        if (rowData['bitType'] == 'CBR') {
            setQuality(rowData)
        }
    }
    setBitRange(rowData)
    addEditeRows(rowData)
}
// 设置整列的视频编码
const handleVideoEncodeTypeChangeAll = function (videoEncodeType: string): void {
    tableData.value.forEach((rowData: RecordStreamInfoDto) => {
        if (rowData['chlType'] !== 'recorder' && rowData['mainCaps']['@supEnct'].includes(videoEncodeType) && !rowData['rowDisable'] && !rowData['videoEncodeTypeDisable']) {
            rowData.videoEncodeType = videoEncodeType
            handleVideoEncodeTypeChange(rowData)
            setBitRange(rowData)
            addEditeRows(rowData)
        }
    })
}

// 对单个分辨率进行处理
const handleResolutionChange = function (rowData: RecordStreamInfoDto) {
    rowData['mainCaps']['res'].forEach((element) => {
        if (element['value'] == rowData['resolution']) {
            let frameRate = parseInt(rowData['frameRate']) * 1
            if (frameRate > parseInt(element['@fps']) * 1) {
                frameRate = parseInt(element['@fps']) * 1
            }
            if (pageData.value.maxFpsMap[rowData['@id']] != parseInt(element['@fps'])) {
                //更新ui
                updateFrameRates(rowData, parseInt(element['@fps']), rowData['@id'], rowData['frameRate'])
                updateHeaderFrameRates()
            }
        }
    })
    genQualityList(rowData)
    if (rowData['bitType'] == 'CBR') {
        rowData['mainStreamQualityCaps'].forEach((element) => {
            if (rowData['chlType'] == 'digital') {
                if (rowData['resolution'] == element['@res'] && rowData['videoEncodeType'] == element['@enct']) {
                    rowData['videoQuality'] = element['@digitalDefault']
                }
            } else {
                if (rowData['resolution'] == element['@res'] && rowData['videoEncodeType'] == element['@enct']) {
                    rowData['videoQuality'] = element['@analogDefault']
                }
            }
        })
    }
    setBitRange(rowData)
    addEditeRows(rowData)
}
// 设置整列的分辨率
const handleSetResolutionAll = function (): void {
    pageData.value.resolutionGroups.forEach((rowData: { res: string; resGroup: { value: string; label: string }[]; chls: { expand: boolean; data: { value: string; text: string }[] } }) => {
        const resolution = rowData['res']
        const ids = rowData['chls']['data'].map((element) => {
            return element['value']
        })
        const changeRows = [] as RecordStreamInfoDto[]
        // 获取tableData中的被修改的数据,设置编辑状态，更新数据
        tableData.value.forEach((element: RecordStreamInfoDto) => {
            if (element['chlType'] !== 'recorder' && !element['rowDisable'] && !element['resolutionDisable']) {
                if (ids.includes(element['@id'])) {
                    addEditeRows(element)
                    changeRows.push(element)
                    element['resolution'] = resolution
                    setBitRange(element)
                }
            }
        })
        // 修正帧率上限
        changeRows[0]['mainCaps']['res'].forEach((element) => {
            if (element['value'] == resolution) {
                const frameRate = parseInt(element['@fps']) * 1
                changeRows.forEach((element) => {
                    let currentFrameRate = parseInt(element['frameRate']) * 1
                    if (currentFrameRate > frameRate) {
                        currentFrameRate = frameRate
                    }

                    if (pageData.value.maxFpsMap[element['@id']] != frameRate) {
                        //更新ui
                        updateFrameRates(element, frameRate, element['@id'], currentFrameRate.toString())
                        updateHeaderFrameRates()
                    }
                })
                return false
            }
        })
        // 生成码率范围
        changeRows.forEach((element: RecordStreamInfoDto) => {
            genQualityList(element)
            if (element['bitType'] == 'CBR') {
                element['mainStreamQualityCaps'].forEach((ele) => {
                    if (element['resolution'] == ele['@res'] && element['videoEncodeType'] == ele['@enct']) {
                        if (element['chlType'] == 'digital') {
                            element['videoQuality'] = ele['@digitalDefault']
                        } else {
                            element['videoQuality'] = ele['@analogDefault']
                        }
                    }
                })
            }
        })
    })
    pageData.value.resolutionHeaderVisble = false
}
// 取消分辨率下拉框表头
const handleSetResolutionCancel = function () {
    pageData.value.resolutionHeaderVisble = false
}
// 展开或者收起分辨率下拉框的方法
const handleExpandChange = function (row: { res: string; resGroup: { value: string; label: string }[]; chls: { expand: boolean; data: { value: string; text: string }[] } }, expandedRows: string[]) {
    if (expandedRows.includes(row.chls.data[0].value) && resolutionTableRef.value) {
        resolutionTableRef.value.toggleRowExpansion(row, false)
        row.chls.expand = false
        pageData.value.expands.splice(pageData.value.expands.indexOf(row.chls.data[0].value), 1)
    } else if (resolutionTableRef.value) {
        resolutionTableRef.value.toggleRowExpansion(row, true)
        row.chls.expand = true
        pageData.value.expands.push(row.chls.data[0].value)
    }
}
// 获取分辨率下拉框的key
const getRowKey = (row: { res: string; resGroup: { value: string; label: string }[]; chls: { expand: boolean; data: { value: string; text: string }[] } }) => {
    return row.chls.data[0].value
}
// 保持dropdown打开,以及保持展开行不收起
const keepDropDownOpen = function (row: { res: string; resGroup: { value: string; label: string }[]; chls: { expand: boolean; data: { value: string; text: string }[] } }) {
    pageData.value.resolutionHeaderVisble = true
    if (row.chls.expand && resolutionTableRef.value) {
        row.chls.expand = true
        resolutionTableRef.value.toggleRowExpansion(row, true)
    } else if (row.chls.expand == false && resolutionTableRef.value) {
        row.chls.expand = false
        resolutionTableRef.value.toggleRowExpansion(row, false)
    }
}

// 设置单个设备的帧率
const handleFrameRateChange = function (rowData: RecordStreamInfoDto) {
    setBitRange(rowData)
    addEditeRows(rowData)
}
// 设置整列的帧率
const handleFrameRateChangeAll = function (frameRate: string): void {
    tableData.value.forEach((rowData: RecordStreamInfoDto) => {
        let currentFrameRate = frameRate
        if (rowData['rowDisable'] == false) {
            if (parseInt(frameRate) > pageData.value.maxFpsMap[rowData['@id']]) {
                currentFrameRate = pageData.value.maxFpsMap[rowData['@id']].toString()
            }
            rowData.frameRate = currentFrameRate
            setBitRange(rowData)
            addEditeRows(rowData)
        }
    })
}

// 对单个码率类型进行处理
const handleBitTypeChange = function (rowData: RecordStreamInfoDto) {
    const isCBR = rowData['bitType'] == 'CBR'
    rowData.imageLevelDisable = isCBR
    if (isCBR) {
        setQuality(rowData)
    }
    let isAllCBR = true
    tableData.value.forEach((item: RecordStreamInfoDto) => {
        isAllCBR = isAllCBR && (item['rowDisable'] || item['bitType'] == 'CBR')
    })
    pageData.value.levelDropDisable = isAllCBR
    setBitRange(rowData)
    addEditeRows(rowData)
}
// 设置整列的bitType
const handleBitTypeChangeAll = function (bitType: string): void {
    const isCBR = bitType == 'CBR'
    tableData.value.forEach((rowData: RecordStreamInfoDto) => {
        if (rowData['chlType'] !== 'recorder' && !rowData['rowDisable'] && rowData['mainCaps']['@bitType'].includes(bitType) && rowData['bitType'].length !== 0 && !rowData['bitTypeDisable']) {
            rowData.bitType = bitType
            rowData.imageLevelDisable = isCBR
            if (isCBR) {
                setQuality(rowData)
            }
            setBitRange(rowData)
            addEditeRows(rowData)
        }
    })
    pageData.value.levelDropDisable = isCBR
}

// 设置单个设备的图像质量
const handleLevelChange = function (rowData: RecordStreamInfoDto) {
    setBitRange(rowData)
    addEditeRows(rowData)
}
// 设置整列的level
const handleLevelChangeAll = function (level: string): void {
    tableData.value.forEach((rowData: RecordStreamInfoDto) => {
        if (rowData['chlType'] !== 'recorder' && !rowData['rowDisable'] && rowData['bitType'] != 'CBR' && rowData['bitType'] && !rowData['imageLevelDisable']) {
            rowData.level = level
            setBitRange(rowData)
            addEditeRows(rowData)
        }
    })
}

// 设置单个设备的videoQuality
const handleVideoQualityChange = function (rowData: RecordStreamInfoDto): void {
    addEditeRows(rowData)
}
// 设置整列的videoQuality
const handleVideoQualityChangeAll = function (videoQuality: { value: string; label: string }): void {
    tableData.value.forEach((rowData: RecordStreamInfoDto) => {
        if (rowData['chlType'] !== 'recorder' && !rowData['rowDisable'] && !rowData['videoQualityDisable']) {
            rowData['qualitys'].forEach((element) => {
                if (element.value == videoQuality.value) {
                    rowData.videoQuality = videoQuality.value
                }
            })
            addEditeRows(rowData)
        }
    })
}

// 设置单个设备的audio
const handleAudioOptionsChange = function (rowData: RecordStreamInfoDto): void {
    addEditeRows(rowData)
}
// 设置整列的audio
const handleAudioOptionsChangeAll = function (audio: { value: string; label: string }): void {
    tableData.value.forEach((rowData: RecordStreamInfoDto) => {
        if (rowData['chlType'] !== 'recorder' && rowData['supportAudio'] && !rowData['rowDisable'] && !rowData['audioDisable']) {
            rowData.audio = audio.value
            addEditeRows(rowData)
        }
    })
}

// 限制GOP
const GOPhandleFocus = (value: string | RecordStreamInfoDto) => {
    const maxValue = 480
    if (typeof value == 'object') {
        // 使用正则表达式去掉非数字字符
        value.GOP = value.GOP.replace(/[^\d]/g, '')
        if (parseInt(value.GOP) > maxValue) {
            value.GOP = maxValue.toString()
        } else if (parseInt(value.GOP) < 1) {
            value.GOP = '1'
        }
    } else {
        // 使用正则表达式去掉非数字字符
        pageData.value.gopSetAll = value.replace(/[^\d]/g, '')
        if (isNaN(parseInt(value))) {
            pageData.value.gopSetAll = '1'
        }
        if (parseInt(value) > maxValue) {
            pageData.value.gopSetAll = maxValue.toString()
        } else if (parseInt(value) < 1) {
            pageData.value.gopSetAll = '1'
        }
    }
}
// 回车设置GOP
const GOPhandleKeydown = (rowData: RecordStreamInfoDto) => {
    addEditeRows(rowData)
}
// 设置整列的GOP
const handleSetGopAll = function (gop: string): void {
    tableData.value.forEach((rowData: RecordStreamInfoDto) => {
        if (!rowData['rowDisable'] && rowData['GOP'] != '' && !rowData['GOPDisable']) {
            rowData.GOP = gop
            addEditeRows(rowData)
        }
    })
    pageData.value.gopHeaderVisble = false
}
// 取消设置整列的GOP
const handleGopCancel = function (): void {
    pageData.value.gopSetAll = ''
    pageData.value.gopHeaderVisble = false
}

// 设置单个设备的recordStream
const handleRecordStreamChange = function (rowData: RecordStreamInfoDto): void {
    addEditeRows(rowData)
}
// 设置整列的recordStream
const handleRecordStreamChangeAll = function (recordStream: string): void {
    tableData.value.forEach((rowData: RecordStreamInfoDto) => {
        if (rowData['chlType'] !== 'recorder' && !rowData['rowDisable'] && !rowData['recordStreamDisable']) {
            rowData.recordStream = recordStream
            addEditeRows(rowData)
        }
    })
}
// 进行整体禁用设置及一些操作
const doCfg = function (tableData: RecordStreamInfoDto[]): void {
    tableData.forEach((rowData: RecordStreamInfoDto) => {
        if (videoEncodeTypeArr.includes(rowData.videoEncodeType)) {
            rowData.bitTypeDisable = true
            rowData.videoQualityDisable = true
            rowData.GOPDisable = true
        }
        if (rowData['chlType'] == 'recorder' || rowData['mainCaps']['res'].length == 0) {
            rowData.rowDisable = true
            rowData.videoEncodeTypeDisable = true
            rowData.resolutionDisable = true
            rowData.frameRateDisable = true
            rowData.bitTypeDisable = true
            rowData.imageLevelDisable = true
            rowData.videoQualityDisable = true
            rowData.bitRangeDisable = true
            rowData.audioDisable = true
            rowData.GOPDisable = true
        }
        if (!rowData['audio']) {
            rowData.audioDisable = true
        } else {
            rowData.audioDisable = false
        }
        if (!rowData['bitType']) {
            rowData.bitTypeVisible = false
        }
        if (rowData.bitType == 'CBR' || rowData.bitType == '') {
            rowData.imageLevelDisable = true
        }
        if (rowData.GOP == '') {
            rowData.GOPDisable = true
        }
        pageData.value.isAllCBR = pageData.value.isAllCBR && rowData['bitType'] == 'CBR'
        rowData['mainStreamQualityCaps'].sort(function (item1, item2) {
            const resolutionParts1 = item1['@res'].split('x')
            const resolutionParts2 = item2['@res'].split('x')
            return item1['@enct'] != item2['@enct']
                ? item1['@enct'] > item2['@enct']
                    ? -1
                    : 1
                : resolutionParts1[0] != resolutionParts2[0]
                  ? parseInt(resolutionParts1[0]) * 1 > parseInt(resolutionParts2[0]) * 1
                      ? -1
                      : 1
                  : resolutionParts1[1] != resolutionParts2[1]
                    ? parseInt(resolutionParts1[1]) * 1 > parseInt(resolutionParts2[1]) * 1
                        ? -1
                        : 1
                    : 0
        })
        genQualityList(rowData)
    })
}

// 对码流类型显示进行处理
const formatDisplayStreamType = function (rowData: RecordStreamInfoDto): string {
    const value: string = rowData.streamType
    return Translate(streamTypeMapping[value])
}
// 对图像质量显示进行处理
const formatDisplayImageLevel = function (value: string): string {
    if (value != '') {
        return Translate(imageLevelMapping[value])
    } else {
        return Translate(imageLevelMapping['lowest'])
    }
}
// 对码率上限推荐范围显示进行处理
const formatDisplayBitRange = function (rowData: RecordStreamInfoDto): string {
    if (rowData.bitRange) {
        return rowData.bitRange.min + ' ~ ' + rowData.bitRange.max + 'Kbps'
    } else {
        return '- -'
    }
}

// 获取全局可选取的帧率范围
const getFrameRateList = function (tableData: RecordStreamInfoDto[]): { value: string; label: string }[] {
    let maxFrameRate: number = 0
    tableData.forEach((element: any) => {
        element['mainCaps']['res'].forEach((obj: { '@fps': string; value: string }) => {
            if (element['resolution'] == obj['value'] && maxFrameRate < parseInt(obj['@fps']) * 1) {
                maxFrameRate = parseInt(obj['@fps']) * 1
            }
        })
    })
    if (maxFrameRate == 0) return []
    const minFrameRate = pageData.value.mainStreamLimitFps > maxFrameRate ? maxFrameRate : pageData.value.mainStreamLimitFps
    for (let i = minFrameRate; i <= maxFrameRate; i++) {
        pageData.value.frameRateList.push({ value: i + '', label: i + '' })
    }
    return pageData.value.frameRateList.reverse()
}
// 获取单个设备的帧率范围
const getFrameRateSingleList = function (rowData: RecordStreamInfoDto): { value: string; label: string }[] {
    const frameRates = [] as { value: string; label: string }[]
    rowData['mainCaps']['res'].forEach((obj: { '@fps': string; value: string }) => {
        if (obj['value'] === rowData['resolution']) {
            const maxFrameRate = parseInt(obj['@fps']) * 1
            pageData.value.maxFpsMap[rowData['@id']] = maxFrameRate
            const minFrameRate = pageData.value.mainStreamLimitFps > maxFrameRate ? maxFrameRate : pageData.value.mainStreamLimitFps
            for (let i = minFrameRate; i <= maxFrameRate; i++) {
                frameRates.push({ value: i + '', label: i + '' })
            }
        }
    })
    return frameRates.reverse()
}
// 获取单个设备的分辨率范围
const getResolutionSingleList = function (rowData: RecordStreamInfoDto): { value: string; label: string }[] {
    const resolutions = [] as { value: string; label: string }[]
    rowData['mainCaps']['res'].forEach((obj: { '@fps': string; value: string }) => {
        resolutions.push({ value: obj['value'], label: obj['value'] })
    })
    return resolutions
}
// 获取整体的分辨率下拉框数据
const getResolutionGroups = function (
    tableData: RecordStreamInfoDto[],
): { res: string; resGroup: { value: string; label: string }[]; chls: { expand: boolean; data: { value: string; text: string }[] } }[] {
    // 生成数据
    const rowDatas = [] as RecordStreamInfoDto[]
    tableData.forEach((rowData) => {
        if (rowData['chlType'] !== 'recorder' && rowData['rowDisable'] !== true) {
            rowDatas.push(rowData)
        }
    })
    const resolutionMapping = {} as { [key: string]: { value: string; text: string }[] }
    const resolutionGroups = [] as { res: string; resGroup: { value: string; label: string }[]; chls: { expand: boolean; data: { value: string; text: string }[] } }[]
    rowDatas.forEach((rowData) => {
        const resolutionList: string[] = []
        rowData['mainCaps']['res'].forEach((element) => {
            resolutionList.push(element['value'])
        })
        const mappingKey = resolutionList.join(',')
        if (!resolutionMapping[mappingKey]) {
            resolutionMapping[mappingKey] = []
            resolutionGroups.push({
                res: resolutionList[0],
                resGroup: resolutionList.map((res) => {
                    return { value: res, label: res }
                }),
                chls: {
                    expand: false,
                    data: resolutionMapping[mappingKey],
                },
            })
        }
        resolutionMapping[mappingKey].push({
            value: rowData['@id'],
            text: rowData['name'],
        })
    })
    return resolutionGroups
}
// 根据其他参数变化生成码率范围
const genQualityList = function (rowData: RecordStreamInfoDto) {
    // rtsp通道只有声音节点，没有其他
    if (rowData['mainStreamQualityCaps'].length > 0) {
        let isQualityCapsMatch = false
        let isQualityCapsEmpty = true
        rowData['qualitys'] = []
        rowData['mainStreamQualityCaps'].forEach((element) => {
            if (element['@enct'] == rowData['videoEncodeType'] && element['@res'] == rowData['resolution']) {
                if (element['value'][0]) {
                    isQualityCapsEmpty = false
                    const tmp = element['value']
                    tmp.forEach((element: any) => {
                        if (pageData.value.poeModeNode && pageData.value.poeModeNode == '10' && parseInt(element) <= 6144) {
                            rowData['qualitys'].push({ value: element, label: element + 'Kbps' })
                        } else if (!pageData.value.poeModeNode || pageData.value.poeModeNode == '100') {
                            rowData['qualitys'].push({ value: element, label: element + 'Kbps' })
                        }
                    })
                }
                isQualityCapsMatch = true
            }
        })

        // 没有完全匹配的项就找低于该值的最近的一项
        if (!isQualityCapsMatch) {
            const resolutionParts = rowData['resolution'].split('x')
            rowData['mainStreamQualityCaps'].forEach((element) => {
                const currentResolutionParts = element['@res'].split('x')
                if (
                    element['@enct'] == rowData['videoEncodeType'] &&
                    (parseInt(currentResolutionParts[0]) * 1 < parseInt(resolutionParts[0]) * 1 ||
                        (currentResolutionParts[0] == resolutionParts[0] && parseInt(currentResolutionParts[1]) * 1 < parseInt(resolutionParts[1]) * 1))
                ) {
                    if (element['value'][0]) {
                        isQualityCapsEmpty = false
                        const tmp = element['value']
                        tmp.forEach((element: any) => {
                            if (pageData.value.poeModeNode && pageData.value.poeModeNode == '10' && parseInt(element) <= 6144) {
                                rowData['qualitys'].push({ value: element, label: element + 'Kbps' })
                            } else if (!pageData.value.poeModeNode || pageData.value.poeModeNode == '100') {
                                rowData['qualitys'].push({ value: element, label: element + 'Kbps' })
                            }
                        })
                    }
                }
            })
        }

        // 对应项如果码率列表为空，则取所有支持的码率列表
        if (isQualityCapsEmpty) {
            rowData['mainStreamQualityCaps'].forEach((element) => {
                if (element['@enct'] == rowData['videoEncodeType'] && element['@res'] == '0x0') {
                    const tmp = element['value']
                    tmp.forEach((element: any) => {
                        if (pageData.value.poeModeNode && pageData.value.poeModeNode == '10' && parseInt(element) <= 6144) {
                            rowData['qualitys'].push({ value: element, label: element + 'Kbps' })
                        } else if (!pageData.value.poeModeNode || pageData.value.poeModeNode == '100') {
                            rowData['qualitys'].push({ value: element, label: element + 'Kbps' })
                        }
                    })
                }
            })
        }
    }
}

const getBitrateRange = function (options: { resolution: string; level: string; fps: string; maxQoI: number; videoEncodeType: string }) {
    // 计算分辨率对应参数
    let resolution: string | number = options['resolution']
    const videoEncodeType = options['videoEncodeType']
    if (typeof resolution == 'string') {
        const resParts: any[] = resolution.split('x').map((res) => Number(res))
        const resolutionObj = { width: resParts[0] * 1, height: resParts[1] * 1 }
        resolution = resolutionObj['width'] * resolutionObj['height']
    }
    if (!resolution) {
        return null
    }
    let resParam = Math.floor(resolution / (resolution >= 1920 * 1080 ? 200000 : 150000))
    if (!resParam) {
        resParam = 0.5
    }

    // 计算图像质量对应参数
    const levelParamMapping = {
        highest: 100,
        higher: 67,
        medium: 50,
        lower: 34,
        lowest: 25,
    }
    const levelParam = levelParamMapping[options['level'] as keyof typeof levelParamMapping]
    if (!levelParam) {
        return null
    }
    // 根据帧率使用不同公式计算下限和上限
    const fps = parseInt(options['fps'])
    const minBase = (768 * resParam * levelParam * (fps >= 10 ? fps : 10)) / 3000
    let min = minBase - (fps >= 10 ? 0 : ((10 - fps) * minBase * 2) / 27)
    const maxBase = (1280 * resParam * levelParam * (fps >= 10 ? fps : 10)) / 3000
    let max = maxBase - (fps >= 10 ? 0 : ((10 - fps) * maxBase * 2) / 27)
    min = options['maxQoI'] ? (options['maxQoI'] < min ? options['maxQoI'] : min) : min
    max = videoEncodeType == 'h265' ? Math.floor(max * 0.55) : Math.floor(max)
    if (videoEncodeType == 'h265' || videoEncodeType == 'h265p' || videoEncodeType == 'h265s') {
        min = Math.floor(min * 0.55)
    } else {
        min = Math.floor(min)
    }
    if (!min || !max) {
        return null
    }

    return { min: min, max: max }
}

//分辨率选项根据大小排序
const resolutionSort = (a: { '@fps': string; value: string }, b: { '@fps': string; value: string }) => {
    const a1: number = parseInt(a['value'].split('x')[0])
    const b1: number = parseInt(b['value'].split('x')[0])
    return b1 - a1
}

// 更新单个设备的可选帧率
const updateFrameRates = function (rowData: RecordStreamInfoDto, maxFrameRate: number, chlId: string, frameRate: string) {
    const minFrameRate = pageData.value.mainStreamLimitFps > maxFrameRate ? maxFrameRate : pageData.value.mainStreamLimitFps
    const tmp = [] as { value: string; label: string }[]
    for (let i = maxFrameRate; i >= minFrameRate; i--) {
        tmp.push({ value: i + '', label: i + '' })
    }
    rowData['frameRates'] = tmp
    rowData['frameRate'] = frameRate
    pageData.value.maxFpsMap[chlId] = maxFrameRate
}
// 更新表头可选帧率
const updateHeaderFrameRates = function () {
    const frameRateList = []
    let maxFrameRate = 0
    for (const attr in pageData.value.maxFpsMap) {
        if (pageData.value.maxFpsMap[attr] > maxFrameRate) {
            maxFrameRate = pageData.value.maxFpsMap[attr]
        }
    }
    const minFrameRate = pageData.value.mainStreamLimitFps > maxFrameRate ? maxFrameRate : pageData.value.mainStreamLimitFps
    for (let i = minFrameRate; i <= maxFrameRate; i++) {
        frameRateList.push({ value: i + '', label: i + '' })
    }
    pageData.value.frameRateList = frameRateList.reverse()
}

// 计算
const handleCalculate = () => {
    queryRemainRecTimeF()
}
// 编辑请求数据
const getSaveData = function () {
    // 编辑时rtsp通道由设备端区分，web还是传所有节点设备对无效节点过滤
    const editRowDatas = pageData.value.editeRows
    let sendXml = rawXml`<content type='list' total='${editRowDatas.length.toString()}'>`
    editRowDatas.forEach((element: RecordStreamInfoDto) => {
        // 需要改
        let gop = ''
        if (prop.mode === 'event') {
            gop = RecStreamModule.value.recType === 'ae' ? 'aGOP' : 'mGOP'
        } else if (prop.mode === 'timing') {
            gop = RecStreamModule.value.recType === 'an' ? 'aGOP' : 'mGOP'
        }
        const bitType = element['bitType'] || 'CBR'
        sendXml += rawXml`
                <item id="${element['@id']}">
                <${RecStreamModule.value.recType} 
                    res="${element['resolution']}"
                    fps="${element['frameRate']}"
                    QoI="${element['videoQuality']}"
                    audio="${element['audio']}"
                    type="${element['recordStream']}"
                    bitType="${bitType}"
                    level="${element['level']}"
                ></${RecStreamModule.value.recType}>
                `
        if (element['GOP'] == '') {
            // 需要改
            if (prop.mode === 'event') {
                if (RecStreamModule.value.recType1 == 'an') {
                    const min = parseInt(element['frameRate']) * 4 > parseInt(element['an']['@fps']) * 4 ? parseInt(element['frameRate']) * 4 : parseInt(element['an']['@fps']) * 4
                    sendXml += rawXml`<main enct="${element['videoEncodeType']}" ${gop}="${min.toString()}"></main>`
                } else if (RecStreamModule.value.recType1 == 'mn') {
                    const min = parseInt(element['frameRate']) * 4 > parseInt(element['mn']['@fps']) * 4 ? parseInt(element['frameRate']) * 4 : parseInt(element['mn']['@fps']) * 4
                    sendXml += rawXml`<main enct="${element['videoEncodeType']}" ${gop}="${min.toString()}"></main>`
                }
            } else if (prop.mode === 'timing') {
                if (RecStreamModule.value.recType1 == 'ae') {
                    const min = parseInt(element['frameRate']) * 4 > parseInt(element['ae']['@fps']) * 4 ? parseInt(element['frameRate']) * 4 : parseInt(element['ae']['@fps']) * 4
                    sendXml += rawXml`<main enct="${element['videoEncodeType']}" ${gop}="${min.toString()}"></main>`
                } else if (RecStreamModule.value.recType1 == 'me') {
                    const min = parseInt(element['frameRate']) * 4 > parseInt(element['me']['@fps']) * 4 ? parseInt(element['frameRate']) * 4 : parseInt(element['me']['@fps']) * 4
                    sendXml += rawXml`<main enct="${element['videoEncodeType']}" ${gop}="${min.toString()}"></main>`
                }
            }
        } else {
            sendXml += rawXml`<main enct="${element['videoEncodeType']}" ${gop}="${element['GOP']}" ></main>`
        }
        sendXml += rawXml`</item>`
    })
    sendXml += rawXml`</content>`
    return sendXml
}
const setData = function () {
    openLoading()
    editNodeEncodeInfo(getSaveData())
        .then((resb) => {
            closeLoading()
            const res = queryXml(resb)
            getSystemCaps()
            if (res('status').text() == 'success') {
                ElMessageBox.confirm(Translate('IDCS_SAVE_DATA_SUCCESS'), Translate('IDCS_SUCCESS_TIP'), {
                    confirmButtonText: Translate('IDCS_OK'),
                    showCancelButton: false,
                    type: 'success',
                    draggable: true,
                }).then(() => {
                    pageData.value.editeRows = []
                    pageData.value.applyBtnDisable = true
                })
                pageData.value.editeRows = []
            } else {
                const errorCode = Number(res('response/errorCode').text()) * 1
                if (errorCode == parseInt('2000005C', 16)) {
                    ElMessageBox.confirm(Translate('IDCS_SAVE_DATA_FAIL') + Translate('IDCS_OVER_MAX_NUMBER_LIMIT'), Translate('IDCS_INFO_TIP'), {
                        confirmButtonText: Translate('IDCS_OK'),
                        showCancelButton: false,
                        type: 'info',
                        draggable: true,
                    })
                } else {
                    ElMessageBox.confirm(Translate('IDCS_SAVE_DATA_FAIL'), Translate('IDCS_INFO_TIP'), {
                        confirmButtonText: Translate('IDCS_OK'),
                        showCancelButton: false,
                        type: 'info',
                        draggable: true,
                    })
                }
            }
        })
        .catch(() => {
            closeLoading()
        })
}

onMounted(() => {
    fetchData()
})
watch(
    () => prop.mode,
    () => {
        if (!pageData.value.firstInit) {
            fetchData()
        }
    },
)
</script>

<style lang="scss" scope>
.RecordStreamList {
    width: 100%;
    height: calc(100vh - 280px);

    .el-dropdown-link {
        color: var(--el-table-header-text-color);
    }

    .status {
        &.online {
            color: var(--color-online);
        }
        &.offline {
            color: var(--color-offline);
        }
    }
}
.bottom_row {
    margin-top: 10px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
}
#txRecTime {
    margin-left: 20px;
    margin-top: 10px;
}
#btnActivate {
    margin-left: 20px;
}
.row_bandwidth {
    margin-top: 10px;
}
.gop_btn {
    margin: 10px 20px;
}

.resolutionContainer {
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}
.device-item {
    margin-left: 15px;
    display: flex;
    align-items: center;
    gap: 3px;
}
.chl_area {
    min-height: 260px;
}
.fit-content-height {
    height: 35px;
    display: flex;
    align-items: center;
}
.base-popover-icon {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--el-table-header-text-color);
    .el-icon {
        cursor: pointer;
        &:hover {
            color: var(--input-text);
        }
    }
}
.GOP_dropDown {
    width: 280px;
    height: 80px;
    padding: 20px 10px 0px 10px;
}
.GOP_input {
    display: flex;
    gap: 20px;
    align-items: center;
    font-size: 13px;
    color: var(--main-text);
}
</style>
