<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-24 14:21:16
 * @Description: 添加通道 - 设置通道默认密码弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_SET_DEV_DEFAULT_PWD')"
        width="600"
        align-center
        @opened="opened"
    >
        <el-form
            ref="formRef"
            :model="formData"
        >
            <el-table
                border
                stripe
                :data="formData.params"
                table-layout="fixed"
                show-overflow-tooltip
                empty-text=" "
                height="300px"
                class="ruleTable"
            >
                <el-table-column
                    prop="displayName"
                    :label="Translate('IDCS_PROTOCOL')"
                    width="130px"
                />
                <el-table-column
                    :label="Translate('IDCS_USERNAME')"
                    min-width="240px"
                >
                    <template #default="scope">
                        <el-form-item
                            :prop="`params.${scope.$index}.userName`"
                            :rules="rules.userName"
                        >
                            <el-input
                                v-model="scope.row.userName"
                                :validate-event="false"
                                maxlength="63"
                                @keydown.enter="handleKeydownEnter($event)"
                            />
                        </el-form-item>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="password"
                    :label="Translate('IDCS_USERNAME')"
                    width="170px"
                >
                    <template #default="scope">
                        <span
                            v-show="!scope.row.showInput"
                            @click="handlePwdViewChange(scope.$index, scope.row)"
                            >{{ scope.row.password ? scope.row.password : '******' }}</span
                        >
                        <el-input
                            v-show="scope.row.showInput"
                            :ref="(ref) => (passwordInputRef[scope.$index] = ref)"
                            v-model="scope.row.password"
                            @blur="handlePwdViewChange(scope.$index, scope.row)"
                        />
                    </template>
                </el-table-column>
            </el-table>
        </el-form>
        <BaseCheckAuthPop
            v-model="baseCheckAuthPopVisiable"
            @confirm="setData"
        />
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="save">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="$emit('close')">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelAddSetDefaultPwdPop.v.ts"></script>
