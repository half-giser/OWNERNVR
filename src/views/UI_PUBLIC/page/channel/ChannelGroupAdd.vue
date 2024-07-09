<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-19 09:52:15
 * @Description:
-->
<template>
    <div id="ChannelGroupAdd">
        <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            class="ruleForm"
            label-width="200px"
            label-position="left"
        >
            <el-form-item
                prop="name"
                :label="Translate('IDCS_GROUP_NAME')"
            >
                <el-input
                    v-model="formData.name"
                    maxlength="63"
                    class="formItem"
                />
            </el-form-item>
            <el-form-item :label="Translate('IDCS_STAY_TIME')">
                <el-select
                    v-model="formData.dwellTime"
                    class="formItem"
                >
                    <el-option
                        v-for="item in timeList"
                        :key="item.value"
                        :value="item.value"
                        :label="item.text"
                    />
                </el-select>
            </el-form-item>
        </el-form>
        <el-table
            ref="tableRef"
            border
            stripe
            :data="tableData"
            table-layout="fixed"
            show-overflow-tooltip
            empty-text=" "
            highlight-current-row
            height="calc(100vh - 370px)"
            @row-click="handleRowClick"
            @selection-change="handleSelectionChange"
        >
            <el-table-column
                type="index"
                :label="Translate('IDCS_SERIAL_NUMBER')"
                width="80px"
            />
            <el-table-column
                type="selection"
                width="50px"
            />
            <el-table-column
                prop="name"
                :label="Translate('IDCS_CHANNEL_NAME')"
                min-width="300px"
            />
            <el-table-column
                prop="ip"
                :label="Translate('IDCS_ADDRESS')"
                min-width="300px"
            />
            <el-table-column
                :label="Translate('IDCS_PREVIEW')"
                min-width="140px"
            >
                <template #default="scope">
                    <BaseImgSprite
                        file="play (3)"
                        :chunk="4"
                        :index="0"
                        :hover-index="1"
                        :active-index="1"
                        @click="handlePreview(scope.row)"
                    />
                </template>
            </el-table-column>
        </el-table>
        <el-row class="elRowFooter">
            <el-col
                :span="12"
                class="el-col-flex-start"
            >
                <span>{{ Translate('IDCS_SELECT_CHANNEL_COUNT').formatForLang(selNum, total) }}</span>
            </el-col>
            <el-col
                :span="12"
                class="el-col-flex-end"
            >
                <el-button @click="save()">{{ Translate('IDCS_OK') }}</el-button>
                <el-button @click="handleCancel">{{ Translate('IDCS_CANCEL') }}</el-button>
            </el-col>
        </el-row>
        <BaseLivePop ref="baseLivePopRef"></BaseLivePop>
    </div>
</template>

<script lang="ts" src="./ChannelGroupAdd.v.ts"></script>

<style scoped lang="scss">
#ChannelGroupAdd {
    .ruleForm {
        padding-left: 10px;

        .formItem {
            width: 220px;
        }
    }
    .elRowFooter {
        margin-top: 10px;
    }
}
</style>
