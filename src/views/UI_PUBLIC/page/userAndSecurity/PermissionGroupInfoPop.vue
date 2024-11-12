<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-18 16:37:53
 * @Description: 权限组说明弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_DESCRIPTION')"
        width="600"
    >
        <p>{{ Translate('IDCS_PREVIEW') }} : {{ Translate('IDCS_PREVIEW_RIGHT_TIP') }}</p>
        <p>{{ Translate('IDCS_SEARCH_AND_BACKUP') }} : {{ Translate('IDCS_SEARCH_BACKUP_RIGHT_TIP') }}</p>
        <p>{{ Translate('IDCS_SEARCH_AND_PLAYBACK') }} : {{ Translate('IDCS_SEARCH_PLAYBACK_RIGHT_TIP') }}</p>
    </el-dialog>
</template>

<script setup></script>
