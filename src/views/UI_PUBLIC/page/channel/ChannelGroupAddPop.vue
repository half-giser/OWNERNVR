<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-23 16:12:12
 * @Description: 新增通道组弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-23 16:15:29
-->
<template>
    <el-dialog
        :title="Translate('IDCS_ADD_GROUP')"
        width="800"
        align-center
        draggable
    >
        <ChannelGroupAdd
            dialog
            @close="$emit('close')"
            @call-back="$emit('callBack')"
        />
    </el-dialog>
</template>

<script lang="ts" src="./ChannelGroupAddPop.v.ts"></script>
