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
        @opened="opened"
        @close="close"
    >
        <el-form
            :style="{
                '--form-input-width': '300px',
                '--form-label-width': '150px',
            }"
        >
            <el-form-item :label="Translate('IDCS_EXPIRE_TIME')">
                <BaseNumberInput
                    ref="inputRef"
                    v-model="pageData.expireTime"
                    :min="1"
                    :max="8760"
                    :value-on-clear="null"
                    @blur="blurExpireTime"
                />
                <span>{{ Translate('IDCS_HOUR_ALL') }}</span>
            </el-form-item>
            <el-form-item>
                {{ Translate('IDCS_EXPIRE_EXCLUDED_TIP') }}
            </el-form-item>
        </el-form>
        <div class="middleBox">
            <div class="base-btn-box flex-start collapse">{{ Translate('IDCS_KEEPVIDEO_WEEK') }}</div>
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
                    :label="Translate('IDCS_DATE')"
                    min-width="355"
                >
                    <template #default="{ row }: TableColumn<{ date: string }>">
                        {{ displayDate(row.date) }}
                    </template>
                </el-table-column>
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
                    <template #default="{ row }: TableColumn<{ date: string }>">
                        <BaseImgSpriteBtn
                            file="del"
                            @click="handleDelDate(row)"
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
                    <BaseDatePicker
                        v-model="pageData.selectDate"
                        :value-format="dateTime.dateFormat"
                        :format="dateTime.dateFormat"
                        type="date"
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
