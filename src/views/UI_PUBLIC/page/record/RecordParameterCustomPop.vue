<!--
 * @Description: 录像——参数配置——通道录像参数——过期时间自定义
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-05 16:26:27
-->
<template>
    <el-dialog
        :title="Translate('IDCS_EXPIRE_TIME_SET')"
        width="600"
        @open="open"
        @close="close"
    >
        <el-form
            :style="{
                '--form-input-width': '300px',
                '--form-label-width': '100px',
            }"
        >
            <el-form-item :label="Translate('IDCS_EXPIRE_TIME')">
                <BaseNumberInput
                    v-model="pageData.expireTime"
                    :min="1"
                    :max="8760"
                />
                <span>{{ Translate('IDCS_HOUR_ALL') }}</span>
            </el-form-item>
            <el-form-item>
                {{ Translate('IDCS_EXPIRE_EXCLUDED_TIP') }}
            </el-form-item>
        </el-form>
        <div class="middleBox">
            <span>{{ Translate('IDCS_KEEPVIDEO_WEEK') }}</span>
            <el-checkbox-group v-model="pageData.weekArr">
                <el-checkbox
                    v-for="item in week"
                    :key="item.value"
                    :value="item.value"
                    :label="item.label"
                />
            </el-checkbox-group>
            <div class="base-btn-box space-between">
                <span>{{ Translate('IDCS_KEEPVIDEO_HOLIDAY') }}</span>
                <el-button @click="openAddDate">{{ Translate('IDCS_ADD') }}</el-button>
            </div>
            <el-table
                :data="pageData.toAddDateList"
                height="230"
                highlight-current-row
            >
                <el-table-column
                    prop="date"
                    :label="Translate('IDCS_DATE')"
                    min-width="355"
                />
                <el-table-column
                    :label="Translate('IDCS_EDIT')"
                    width="80"
                >
                    <template #header>
                        <el-dropdown>
                            <BaseTableDropdownLink>
                                {{ Translate('IDCS_EDIT') }}
                            </BaseTableDropdownLink>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click="handleDelDateAll">{{ Translate('IDCS_DELETE_ALL') }}</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </template>
                    <template #default="scope">
                        <BaseImgSprite
                            file="del"
                            :chunk="4"
                            :index="0"
                            :hover-index="1"
                            :active-index="1"
                            @click="handleDelDate(scope.row)"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <el-dialog
            v-model="pageData.isShowAddDate"
            :title="Translate('IDCS_TIME_CUSTOMIZE')"
            width="500"
        >
            <el-form>
                <el-form-item>
                    <el-date-picker
                        v-model="pageData.selectDate"
                        :value-format="pageData.dateFormat"
                        :format="pageData.dateFormat"
                        :default-value="new Date()"
                    />
                </el-form-item>
            </el-form>
            <div class="base-btn-box">
                <el-button @click="addDateToList">{{ Translate('IDCS_OK') }}</el-button>
                <el-button @click="closeAddDate">{{ Translate('IDCS_CANCEL') }}</el-button>
            </div>
        </el-dialog>
        <div class="base-btn-box">
            <el-button @click="apply">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./RecordParameterCustomPop.v.ts"></script>

<style lang="scss" scoped>
.middleBox {
    border: 1px solid var(--content-border);
    padding: 10px;

    .base-btn-box {
        margin-bottom: 10px;
    }
}
</style>
