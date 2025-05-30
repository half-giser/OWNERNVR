<!--
 * @Date: 2025-05-29 17:05:50
 * @Description: AI与事件 错误遮罩
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <div class="base-ai-not-support-box">
        <BaseImgSprite file="chl_error" />
        <span>{{ type === 'fail' ? Translate('IDCS_QUERY_DATA_FAIL') : Translate('IDCS_NOT_SUPPORTFUNC') }}</span>
    </div>
</template>

<script lang="ts" src="./AlarmBaseErrorPanel.v.ts"></script>
