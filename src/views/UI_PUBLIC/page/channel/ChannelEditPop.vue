<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-05-09 17:17:55
 * @Description:
-->
<template>
    <el-dialog
        :title="Translate('IDCS_CHANGE_IP_CAMERA')"
        width="450"
        align-center
        draggable
        @opened="opened"
    >
        <el-form
            ref="formRef"
            :model="editItem"
            :rules="rules"
            label-width="auto"
            label-position="left"
        >
            <el-row>
                <el-col :span="8">{{ Translate('IDCS_CHANNEL_NAME') }}</el-col>
                <el-col :span="16">
                    <el-form-item prop="name">
                        <el-input
                            v-model="editItem.name"
                            maxlength="63"
                        />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="8">{{ ipTitle }}</el-col>
                <el-col :span="16">
                    <el-form-item prop="ip">
                        <BaseIpInput
                            v-show="showIpInput"
                            v-model:value="editItem.ip"
                            :disable="ipDisabled"
                        />
                        <el-input
                            v-show="!showIpInput"
                            v-model="editItem.ip"
                            :placeholder="ipPlaceholder"
                            :disabled="ipDisabled"
                        />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="8">{{ Translate('IDCS_PORT') }}</el-col>
                <el-col :span="16">
                    <el-form-item prop="port">
                        <el-input
                            v-model="editItem.port"
                            v-numericalRange:[editItem].port="[10, 65535]"
                            :disabled="portDisabled"
                        />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="8">{{ Translate('IDCS_PROTOCOL') }}</el-col>
                <el-col :span="16">
                    <el-form-item prop="manufacturer">
                        <el-input
                            v-model="editItem.manufacturer"
                            disabled
                        />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="8">{{ Translate('IDCS_PRODUCT_MODEL') }}</el-col>
                <el-col :span="16">
                    <el-form-item prop="productModel">
                        <el-input
                            v-model="editItem.productModel.innerText"
                            disabled
                        />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="8">{{ Translate('IDCS_USERNAME') }}</el-col>
                <el-col :span="16">
                    <el-form-item prop="userName">
                        <el-input
                            v-model="editItem.userName"
                            :disabled="inputDisabled"
                        />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="8">
                    {{ Translate('IDCS_CHANGE_PWD') }}
                    <el-checkbox
                        v-model="editPwdSwitch"
                        :disabled="inputDisabled"
                    />
                </el-col>
                <el-col :span="16">
                    <el-form-item prop="password">
                        <el-input
                            v-model="editItem.password"
                            type="password"
                            :disabled="!editPwdSwitch"
                            @paste.capture.prevent=""
                            @copy.capture.prevent=""
                        />
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>

        <template #footer>
            <div class="dialog-footer">
                <el-button @click="save(false)">{{ Translate('IDCS_OK') }}</el-button>
                <el-button @click="close(false)">{{ Translate('IDCS_CANCEL') }}</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelEditPop.v.ts"></script>

<style lang="scss" scoped></style>
