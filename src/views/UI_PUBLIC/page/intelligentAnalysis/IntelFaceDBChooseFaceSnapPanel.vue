<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-30 11:57:52
 * @Description: 智能分析 - 选择人脸 - 从抓拍库选择
-->
<template>
    <div class="snap">
        <div class="base-btn-box space-between">
            <BaseDateRange
                :model-value="formData.dateRange"
                :type="pageData.dateRangeType"
                @change="changeDateRange"
            />
            <BaseDateTab
                :model-value="formData.dateRange"
                @change="changeDateRange"
            />
        </div>
        <div class="chl">
            <span class="chl-title">{{ Translate('IDCS_CHANNEL') }}</span>
            <el-checkbox
                v-model="pageData.isAllChl"
                :label="Translate('IDCS_ALL')"
                @change="changeAllChl"
            />
            <div
                v-title
                class="chl-chls text-ellipsis"
            >
                {{ formData.chls.map((item) => item.label).join(';') }}
            </div>
            <el-button @click="changeChl">{{ Translate('IDCS_MORE') }}</el-button>
            <el-button @click="searchData">{{ Translate('IDCS_SEARCH') }}</el-button>
        </div>
        <div class="choose">
            <el-scrollbar class="choose-list">
                <div class="choose-wrapper">
                    <IntelBaseFaceItem
                        v-for="(item, index) in filterListData"
                        :key="item.frameTime"
                        :src="item.pic || ''"
                        :model-value="formData.faceIndex.includes(index + (formData.pageIndex - 1) * formData.pageSize)"
                        :disabled="!item.pic"
                        :icon="item.featureStatus && !multiple ? 'identity' : ''"
                        @update:model-value="selectFace(index + (formData.pageIndex - 1) * formData.pageSize)"
                    >
                        <div
                            v-title
                            class="text-ellipsis"
                        >
                            {{ displayDateTime(item.timestamp) }}
                        </div>
                        <div
                            v-title
                            class="text-ellipsis"
                        >
                            {{ item.chlName }}
                        </div>
                    </IntelBaseFaceItem>
                </div>
            </el-scrollbar>
            <div class="base-btn-box space-between padding">
                <div>
                    <span v-show="multiple">{{ Translate('IDCS_SELECTED_NUM_D').formatForLang(formData.faceIndex.length) }}</span>
                </div>
                <BasePagination
                    v-model:current-page="formData.pageIndex"
                    v-model:page-size="formData.pageSize"
                    :page-sizes="[formData.pageSize]"
                    :total="listData.length"
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
        width: 100%;
    }
}

.choose {
    width: 100%;
    height: 375px;
    border: 1px solid var(--content-border);
    margin-top: 10px;

    &-list {
        height: 330px;
        border-bottom: 1px solid var(--content-border);
        box-sizing: border-box;
    }

    &-wrapper {
        padding: 10px 0;
        display: flex;
        flex-wrap: wrap;
    }
}
</style>
