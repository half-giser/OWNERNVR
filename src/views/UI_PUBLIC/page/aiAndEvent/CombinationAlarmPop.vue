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
            stripe
            border
            :data="tableData"
            highlight-current-row
            height="240"
            @current-change="rowChange"
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
                <template #default="scope">
                    <el-select
                        v-model="scope.row.alarmSourceType"
                        @change="typeChange(scope.row, scope.$index)"
                    >
                        <el-option
                            v-for="item in pageData.alarmSourceTypeList[scope.$index]"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                </template>
            </el-table-column>
            <!-- 报警源 -->
            <el-table-column
                width="150"
                :label="Translate('IDCS_ALARM_SOURCE')"
            >
                <template #default="scope">
                    <el-select
                        v-model="scope.row.alarmSourceEntity.value"
                        :empty-values="[undefined, null]"
                        @change="entityChange(scope.row)"
                    >
                        <el-option
                            v-for="item in pageData.alarmSourceEntityList[scope.$index]"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                </template>
            </el-table-column>
            <!-- 操作 -->
            <el-table-column
                width="98"
                :label="Translate('IDCS_OPERATION')"
            >
                <template #default="scope">
                    <BaseImgSprite
                        v-show="scope.row.alarmSourceType === 'FaceMatch'"
                        file="edit (2)"
                        :chunk="4"
                        :index="0"
                        :hover-index="1"
                        :active-index="1"
                        @click="handleEdit(scope.row.alarmSourceEntity.value)"
                    />
                </template>
            </el-table-column>
        </el-table>
        <div class="detect-box">
            <div
                v-if="pageData.isDetectShow"
                class="detect"
            >
                <span class="detectText">{{ `${pageData.detectEntity} ${pageData.detectType} ${Translate('IDCS_DISABLE')}` }}</span>
                <el-button @click="clickChangeDetect">{{ pageData.detectBtn.label }}</el-button>
            </div>
            <span>{{ Translate('IDCS_CONDITION_TIP') }}</span>
            <div class="description">
                <div
                    v-for="(item, index) in pageData.description"
                    :key="index"
                >
                    <span
                        class="descTip"
                        :title="item"
                        >{{ item }}</span
                    >
                    <div v-if="index !== pageData.description.length - 1">{{ Translate('IDCS_AND') }}</div>
                </div>
            </div>
        </div>
        <template #footer>
            <el-row>
                <el-col class="el-col-flex-end">
                    <el-button @click="save">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
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
