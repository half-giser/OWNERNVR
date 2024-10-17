<!--
 * @Description: 录像——参数配置——通道录像参数——过期时间自定义
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-05 16:26:27
 * @LastEditors: luoyiming luoyiming@tvt.net.cn
 * @LastEditTime: 2024-10-17 10:19:18
-->
<template>
    <el-dialog
        :title="Translate('IDCS_EXPIRE_TIME_SET')"
        width="600"
        height="773"
        align-center
        draggable
        @open="open"
        @close="close"
    >
        <div class="base-flex-box">
            <el-form
                label-width="100px"
                label-position="left"
            >
                <el-form-item :label="Translate('IDCS_EXPIRE_TIME')">
                    <el-input
                        v-model="pageData.expireTime"
                        type="number"
                        :min="1"
                        :max="8760"
                        :style="{ width: '300px' }"
                        @input="inputLimit"
                    />
                    <span>{{ Translate('IDCS_HOUR_ALL') }}</span>
                </el-form-item>
            </el-form>
            <span>{{ Translate('IDCS_EXPIRE_EXCLUDED_TIP') }}</span>
            <div class="middleBox">
                <span>{{ Translate('IDCS_KEEPVIDEO_WEEK') }}</span>
                <el-checkbox-group v-model="pageData.weekArr">
                    <el-checkbox
                        :label="Translate('IDCS_MONDAY')"
                        :value="1"
                    />
                    <el-checkbox
                        :label="Translate('IDCS_TUESDAY')"
                        :value="2"
                    />
                    <el-checkbox
                        :label="Translate('IDCS_WEDNESDAY')"
                        :value="3"
                    />
                    <el-checkbox
                        :label="Translate('IDCS_THURSDAY')"
                        :value="4"
                    />
                    <el-checkbox
                        :label="Translate('IDCS_FRIDAY')"
                        :value="5"
                    />
                    <el-checkbox
                        :label="Translate('IDCS_SATURDAY')"
                        :value="6"
                    />
                    <el-checkbox
                        :label="Translate('IDCS_SUNDAY')"
                        :value="7"
                    />
                </el-checkbox-group>
                <div
                    class="base-btn-box"
                    :style="{ margin: '30px 0 10px' }"
                >
                    <span class="tips">{{ Translate('IDCS_KEEPVIDEO_HOLIDAY') }}</span>
                    <el-button @click="openAddDate">{{ Translate('IDCS_ADD') }}</el-button>
                </div>
                <el-table
                    border
                    stripe
                    table-layout="fixed"
                    show-overflow-tooltip
                    :data="pageData.toAddDateList"
                    empty-text=" "
                    highlight-current-row
                    :style="{ height: '230px' }"
                >
                    <el-table-column
                        prop="date"
                        :label="Translate('IDCS_DATE')"
                        min-width="355px"
                    >
                        <template #default="scope">
                            <span>{{ scope.row.date }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="Translate('IDCS_EDIT')"
                        width="80px"
                    >
                        <template #header>
                            <el-dropdown trigger="click">
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
            <el-row :style="{ margin: '30px 0' }">
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="apply">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </div>
        <el-dialog
            v-model="pageData.isShowAddDate"
            :title="Translate('IDCS_TIME_CUSTOMIZE')"
            width="500"
            height="200"
            align-center
            draggable
        >
            <el-date-picker
                v-model="pageData.selectDate"
                :clearable="false"
                :value-format="pageData.dateFormat"
                :format="pageData.dateFormat"
                :default-value="new Date()"
                :style="{ marginLeft: '150px' }"
            ></el-date-picker>
            <el-row :style="{ margin: '30px 0' }">
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="addDateToList">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="closeAddDate">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </el-dialog>
    </el-dialog>
</template>

<script lang="ts" src="./RecParamCustomizationPop.v.ts"></script>

<style lang="scss" scoped>
.middleBox {
    border: solid #5f5f5f 1px;
    padding: 10px 5px 10px 6px;
    margin-top: 30px;
}
.checkboxItem {
    width: 133px;
}
.tips {
    flex: 1;
}
</style>
