<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-30 11:57:52
 * @Description: 智能分析 - 选择人脸 - 从抓拍库选择
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-14 09:29:56
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
                    @change="changeDateRange"
                />
            </div>
            <div>
                <BaseDateTab
                    :model-value="formData.dateRange"
                    @change="changeDateRange"
                />
            </div>
        </div>
        <div class="chl">
            <span class="chl-title">{{ Translate('IDCS_CHANNEL') }}</span>
            <el-checkbox
                v-model="pageData.isAllChl"
                :label="Translate('IDCS_ALL')"
                @change="changeAllChl"
            />
            <el-text class="chl-chls text-ellipsis">{{ formData.chls.map((item) => item.label).join(';') }}</el-text>
            <el-button @click="changeChl">{{ Translate('IDCS_MORE') }}</el-button>
            <el-button @click="searchData">{{ Translate('IDCS_SEARCH') }}</el-button>
        </div>
        <div class="choose">
            <div class="choose-list">
                <IntelBaseFaceItem
                    v-for="(item, index) in filterListData"
                    :key="item.frameTime"
                    :src="item.pic || ''"
                    :model-value="formData.faceIndex.includes(index + (formData.pageIndex - 1) * formData.pageSize)"
                    :disabled="!item.pic"
                    :icon="item.featureStatus && !multiple ? 'identity' : ''"
                    @update:model-value="selectFace(index + (formData.pageIndex - 1) * formData.pageSize)"
                >
                    {{ displayDateTime(item.timestamp) }}<br />{{ item.chlName }}
                </IntelBaseFaceItem>
            </div>
            <div
                class="base-btn-box padding"
                :span="2"
            >
                <div>
                    <span v-show="multiple">{{ Translate('IDCS_SELECTED_NUM_D').formatForLang(formData.faceIndex.length) }}</span>
                </div>
                <div>
                    <el-pagination
                        v-model:current-page="formData.pageIndex"
                        v-model:page-size="formData.pageSize"
                        :page-sizes="[formData.pageSize]"
                        :total="listData.length"
                        @current-change="changeFacePage"
                    />
                </div>
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
    border: 1px solid var(--content-border);
    margin-top: 10px;

    &-list {
        height: 320px;
        display: flex;
        flex-wrap: wrap;
        border-bottom: 1px solid var(--content-border);
        overflow-y: auto;
        box-sizing: border-box;
        padding: 10px 0;
    }
}
</style>
