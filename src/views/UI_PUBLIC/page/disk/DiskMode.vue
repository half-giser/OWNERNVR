<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-04 16:09:35
 * @Description: 磁盘模式
-->
<template>
    <div>
        <el-form>
            <el-form-item>
                <el-checkbox
                    v-model="formData.enable"
                    :label="Translate('IDCS_RAID_USE')"
                    @change="changeDiskMode"
                />
            </el-form-item>
        </el-form>
        <BaseCheckAuthPop
            v-model="pageData.isAuthDialog"
            @close="close"
            @confirm="setData"
        />
    </div>
</template>

<script lang="ts" src="./DiskMode.v.ts"></script>
