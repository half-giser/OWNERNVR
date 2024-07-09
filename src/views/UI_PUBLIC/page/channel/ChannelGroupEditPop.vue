<!--
 * @Author: linguifan linguifan@tvt.net.cn
 * @Date: 2024-06-18 14:20:44
 * @Description: 
-->
<template>
    <el-dialog
        :title="Translate('IDCS_EDIT_GROUP')"
        width="460"
        align-center
        draggable
        @opened="opened"
    >
        <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
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
                />
            </el-form-item>
            <el-form-item
                prop="dwellTime"
                :label="Translate('IDCS_STAY_TIME')"
            >
                <el-select v-model="formData.dwellTime">
                    <el-option
                        v-for="item in timeList"
                        :key="item.value"
                        :value="item.value"
                        :label="item.text"
                    />
                </el-select>
            </el-form-item>
        </el-form>
        <template #footer>
            <div class="dialog-footer">
                <el-button @click="save()">{{ Translate('IDCS_OK') }}</el-button>
                <el-button @click="close()">{{ Translate('IDCS_CANCEL') }}</el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./ChannelGroupEditPop.v.ts"></script>

<style scoped lang="scss"></style>
