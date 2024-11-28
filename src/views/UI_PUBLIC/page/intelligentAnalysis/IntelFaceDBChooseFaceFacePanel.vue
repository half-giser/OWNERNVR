<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-30 11:57:52
 * @Description: 智能分析 - 选择人脸 - 从人脸库选择
-->
<template>
    <div class="feature">
        <div
            class="base-btn-box"
            span="2"
        >
            <div>
                <span class="group-title">{{ Translate('IDCS_ADD_FACE_GROUP') }}</span>
                <el-checkbox
                    v-model="pageData.isAllFaceGroup"
                    :label="Translate('IDCS_ALL')"
                    @change="changeAllFaceGroup"
                />
                <el-text class="group-list text-ellipsis">{{ formData.faceGroup.map((item) => item.name).join(';') }}</el-text>
            </div>
            <div>
                <el-button @click="changeGroup">{{ Translate('IDCS_CONFIGURATION') }}</el-button>
            </div>
        </div>
        <el-form
            :style="{
                '--form-input-width': '200px',
            }"
        >
            <el-form-item>
                <el-input
                    v-model="formData.name"
                    :placeholder="Translate('IDCS_SEARCH_TARGET_PERSON')"
                />
                <el-button @click="searchFace">{{ Translate('IDCS_SEARCH') }}</el-button>
            </el-form-item>
        </el-form>
        <div class="choose">
            <el-scrollbar class="choose-list">
                <div class="choose-wrapper">
                    <IntelBaseFaceItem
                        v-for="(item, index) in filterListData"
                        :key="item.id"
                        :src="item.pic[0] || ''"
                        :model-value="formData.faceIndex.includes(index + (formData.pageIndex - 1) * formData.pageSize)"
                        :disabled="!item.pic[0]"
                        @update:model-value="selectFace(index + (formData.pageIndex - 1) * formData.pageSize)"
                    >
                        {{ item.name }}
                    </IntelBaseFaceItem>
                </div>
            </el-scrollbar>
            <div
                class="base-btn-box padding"
                span="2"
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
                        @current-change="changePage"
                    />
                </div>
            </div>
        </div>
        <BaseTableSelectPop
            v-model="pageData.isSelectGroupPop"
            :title="Translate('IDCS_CONFIGURATION')"
            :data="pageData.faceGroupList"
            :current="formData.faceGroup"
            :label-title="Translate('IDCS_ADD_FACE_GROUP')"
            value="id"
            label="name"
            @confirm="confirmChangeGroup"
        />
    </div>
</template>

<script lang="ts" src="./IntelFaceDBChooseFaceFacePanel.v.ts"></script>

<style lang="scss" scoped>
.el-form-item {
    padding-inline: 0 !important;
}

.feature {
    width: 922px;
}

.group {
    display: flex;
    margin-top: 10px;
    align-items: center;

    &-title {
        flex-shrink: 0;
        margin-right: 5px;
    }

    &-list {
        margin: 0 20px 0 10px;
        width: 500px;
    }
}

.choose {
    width: 100%;
    height: 375px;
    border: 1px solid var(--content-border);
    margin-top: 13px;

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
