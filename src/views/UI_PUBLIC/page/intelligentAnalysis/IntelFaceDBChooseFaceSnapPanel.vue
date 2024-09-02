<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-30 11:57:52
 * @Description: 人脸库 - 选择人脸 - 从抓拍库选择
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-02 18:06:01
-->
<template>
    <div class="snap">
        <div
            class="base-btn-box"
            :span="2"
        >
            <div>
                <BaseDateRange
                    :model-value="formData.dateRange"
                    :type="pageData.dateRangeType"
                    :date-format="dateTime.dateFormat.value"
                    :date-time-format="dateTime.dateTimeFormat.value"
                    :ym-format="dateTime.yearMonthFormat.value"
                    @change="changeDateRange"
                />
            </div>
            <div>
                <BaseDateTab
                    :model-value="formData.dateRange"
                    :date-format="dateTime.dateFormat.value"
                    :date-time-format="dateTime.dateTimeFormat.value"
                    :highlight="dateTime.highlightWeekend"
                    @change="changeDateRange"
                />
            </div>
        </div>
        <div class="chl">
            <span class="chl-title">{{ Translate('IDCS_CHANNEL') }}</span>
            <el-checkbox
                v-model="pageData.isAllChl"
                @change="changeAllChl"
                >{{ Translate('IDCS_ALL') }}</el-checkbox
            >
            <el-text class="chl-chls text-ellipsis">{{ formData.chls.map((item) => item.label).join(';') }}</el-text>
            <el-button @click="changeChl">{{ Translate('IDCS_MORE') }}</el-button>
            <el-button @click="searchData">{{ Translate('IDCS_SEARCH') }}</el-button>
        </div>
        <div class="choose">
            <div class="choose-list">
                <IntelFaceItem
                    v-for="(item, index) in filterListData"
                    :key="`${item.timestamp}:${item.timeNS}`"
                    :src="item.pic || ''"
                    :model-value="formData.faceIndex === index"
                    :disabled="!item.pic"
                    :icon="item.featureStatus ? 'identity' : ''"
                    @update:model-value="selectFace(index)"
                >
                    {{ displayDateTime(item.timestamp) }}<br />{{ item.chlName }}
                </IntelFaceItem>
            </div>
            <div class="base-btn-box padding">
                <el-pagination
                    v-model:current-page="formData.pageIndex"
                    :page-size="18"
                    layout="prev, pager, next, total"
                    :total="listData.length"
                    size="small"
                    @current-change="changeFacePage"
                />
            </div>
        </div>
        <BaseTableSelectPop
            v-model="pageData.isSelectChlPop"
            :title="Translate('IDCS_CHANNEL_SELECT')"
            :data="pageData.chlList"
            :current="formData.chls"
            :label-title="Translate('IDCS_CHANNEL_NAME')"
            @confirm="confirmChangeChl"
        />
    </div>
</template>

<script lang="ts" src="./IntelFaceDBChooseFaceSnapPanel.v.ts"></script>

<style lang="scss" scoped>
.snap {
    width: 922px;
}

.chl {
    display: flex;
    margin-top: 10px;
    align-items: center;

    &-title {
        flex-shrink: 0;
        margin-right: 5px;
    }

    &-chls {
        margin: 0 20px 0 10px;
        width: 500px;
    }
}

.choose {
    width: 100%;
    height: 365px;
    border: 1px solid var(--border-color8);
    margin-top: 10px;

    &-list {
        height: 320px;
        display: flex;
        flex-wrap: wrap;
        border-bottom: 1px solid var(--border-color8);
        overflow-y: auto;
        box-sizing: border-box;
        padding: 10px 0;
    }
}
</style>
