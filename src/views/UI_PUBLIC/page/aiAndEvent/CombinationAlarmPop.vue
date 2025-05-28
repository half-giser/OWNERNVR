<!--
 * @Description: 普通事件——组合报警弹窗
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-23 15:02:52
-->
<template>
    <el-dialog
        :title="Translate('IDCS_COMBINED_ALARM_CONFIG')"
        width="520"
        hight="560"
        @open="open"
        @close="close"
    >
        <el-table
            v-title
            :data="tableData"
            highlight-current-row
            height="240"
            @current-change="changeRow"
        >
            <!-- 序号 -->
            <el-table-column
                type="index"
                :label="Translate('IDCS_SERIAL_NUMBER')"
                width="80"
            />
            <!-- 类型 -->
            <el-table-column
                width="150"
                :label="Translate('IDCS_TYPE')"
            >
                <template #default="{ row, $index }: TableColumn<AlarmCombinedItemDto>">
                    <el-select-v2
                        v-model="row.alarmSourceType"
                        :options="pageData.alarmSourceTypeList[$index]"
                        @change="changeType(row, $index)"
                    />
                </template>
            </el-table-column>
            <!-- 报警源 -->
            <el-table-column
                width="150"
                :label="Translate('IDCS_ALARM_SOURCE')"
            >
                <template #default="{ row, $index }: TableColumn<AlarmCombinedItemDto>">
                    <el-select-v2
                        v-model="row.alarmSourceEntity.value"
                        :options="pageData.alarmSourceEntityList[$index]"
                        @change="changeEntity(row)"
                    />
                </template>
            </el-table-column>
            <!-- 操作 -->
            <el-table-column
                width="98"
                :label="Translate('IDCS_OPERATION')"
            >
                <template #default="{ row }: TableColumn<AlarmCombinedItemDto>">
                    <BaseImgSpriteBtn
                        v-show="row.alarmSourceType === 'FaceMatch'"
                        file="edit2"
                        @click="editFaceMatch(row.alarmSourceEntity.value)"
                    />
                </template>
            </el-table-column>
        </el-table>
        <div class="detect-box">
            <div class="detect">
                <template v-if="pageData.isDetectShow">
                    <span class="detectText">{{ `${pageData.detectEntity} ${pageData.detectType} ${Translate('IDCS_DISABLE')}` }}</span>
                    <el-button @click="changeDetect">{{ pageData.detectBtn.label }}</el-button>
                </template>
            </div>
            <span>{{ Translate('IDCS_CONDITION_TIP') }}</span>
            <div class="description">
                <div
                    v-for="(item, index) in pageData.description"
                    :key="index"
                >
                    <span
                        v-title
                        class="descTip"
                        >{{ item }}</span
                    >
                    <div v-if="index !== pageData.description.length - 1">{{ Translate('IDCS_AND') }}</div>
                </div>
            </div>
        </div>
        <div class="base-btn-box">
            <el-button @click="save">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
        <CombinationAlarmFaceMatchPop
            v-model="pageData.isFaceMatchPopShow"
            :linked-entity="pageData.linkedEntity"
            :linked-obj="pageData.linkedObj"
            @confirm="handleFaceMatchLinkedObj"
            @close="pageData.isFaceMatchPopShow = false"
        />
    </el-dialog>
</template>

<script lang="ts" src="./CombinationAlarmPop.v.ts"></script>

<style lang="scss" scoped>
.detect-box {
    margin-top: 10px;
}

.detect {
    margin: 5px 0;
    display: flex;
    height: 26px;
    align-items: center;
    width: 100%;
}

.detectText {
    margin-right: 15px;
    color: var(--color-error);
}

.descTip {
    display: inline-block;
    width: 440px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.description {
    margin-top: 10px;
    height: 115px;
    border: 1px solid var(--content-border);
    box-sizing: border-box;
    padding: 5px;
}
</style>
