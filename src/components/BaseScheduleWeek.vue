<!--
 * @Author: tengxiang tengxiang@tvt.net.cn
 * @Date: 2024-07-22 15:26:37
 * @Description: 周排程
-->
<template>
    <div>
        <div
            v-for="(item, index) in weekdayLang"
            :key="index"
            class="row"
            :style="{ width: `${width}px` }"
        >
            <div
                class="day-name"
                :title="Translate(item)"
                v-text="Translate(item)"
            ></div>
            <div class="day-schedule">
                <BaseScheduleLine
                    v-bind="$attrs"
                    :id="`line-${index}`"
                    ref="scheduleLines"
                    :width="width - 90"
                >
                    <template #customerControlPanel>
                        <a
                            @click="copyToOpen(index, $event)"
                            v-text="Translate('IDCS_COPY_TO')"
                        ></a>
                        <div
                            v-show="curCopyToPlIndex === index"
                            class="copyToPL"
                            @click.stop
                        >
                            <div class="copyToDayList">
                                <el-checkbox-group v-model="copyToCheckedDay">
                                    <template v-for="(cpItem, cpIndex) in weekdayLang">
                                        <el-checkbox
                                            v-if="cpIndex !== index"
                                            :key="cpIndex"
                                            class="copyToDayItem"
                                            :label="Translate(cpItem)"
                                            :value="cpIndex"
                                        />
                                    </template>
                                </el-checkbox-group>
                            </div>
                            <div class="copyToFooter">
                                <el-button @click="copyToOk(index)">{{ Translate('IDCS_OK') }}</el-button>
                                <el-button @click="copyToClose">{{ Translate('IDCS_CANCEL') }}</el-button>
                            </div>
                        </div>
                    </template>
                </BaseScheduleLine>
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./BaseScheduleWeek.v.ts"></script>

<style lang="scss" scoped>
.row {
    display: flex;
}

.day-name {
    flex: 0 0 auto;
    padding: 3px 0px 0px 0px;
    width: 90px;
    font-size: 14px;
    max-height: 60px;
    overflow: hidden;
    text-wrap: nowrap;
    text-overflow: ellipsis;
}

.day-schedule {
    flex: 0 0 auto;
}

.copyToPL {
    position: absolute;
    z-index: 100;
    width: 205px;
    top: 20px;
    left: 0px;
    border: solid 1px var(--border-color1);
    background-color: var(--bg-color5);
    padding: 5px;
    border-radius: 5px;

    .copyToDayList {
        display: flex;
        flex-wrap: wrap;

        .copyToDayItem {
            flex: 0 0 60px;
            font-size: 13px;
            margin: 2px;
            height: 20px;
        }
    }

    .copyToFooter {
        display: flex;
        margin-top: 10px;

        button {
            flex: 1 1 auto;
        }
    }
}
</style>
