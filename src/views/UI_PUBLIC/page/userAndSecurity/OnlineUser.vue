<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-18 18:42:24
 * @Description: 在线用户
-->
<template>
    <div class="base-flex-box">
        <el-table
            :data="tableData"
            show-overflow-tooltip
            height="100%"
        >
            <el-table-column
                prop="userName"
                :label="Translate('IDCS_USER_NAME')"
            />
            <el-table-column
                prop="loginType"
                :label="Translate('IDCS_LOGIN_TYPE')"
            />
            <el-table-column
                prop="ip"
                :label="Translate('IDCS_IP')"
                width="180"
            />
            <el-table-column
                prop="time"
                :label="Translate('IDCS_LOGIN_TIME')"
                width="250"
            />
            <el-table-column :label="Translate('IDCS_DETAIL_INFO')">
                <template #default="{ $index }: TableColumn<UserOnlineList>">
                    <BaseImgSpriteBtn
                        file="detail"
                        @click="showDetailInfo($index)"
                    />
                </template>
            </el-table-column>
        </el-table>
        <el-dialog
            v-model="pageData.isDetail"
            :title="Translate('IDCS_DETAIL_INFO')"
        >
            <div>
                <p>
                    <span>{{ Translate('IDCS_PREVIEW_CHANNELS') }}</span>
                    <span>{{ currentUser ? currentUser.previewChlCount : '' }}</span>
                </p>
                <p>
                    <span>{{ Translate('IDCS_PLAYBACK_CHANNELS') }}</span>
                    <span>{{ currentUser ? currentUser.playbackChlCount : '' }}</span>
                </p>
            </div>
            <p></p>
        </el-dialog>
    </div>
</template>

<script lang="ts" src="./OnlineUser.v.ts"></script>
