<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-22 16:34:34
 * @Description: 人脸比对弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-29 17:59:36
-->
<template>
    <el-dialog
        :title="Translate('IDCS_FACE_DETAIL')"
        width="900"
        align-center
        draggable
    >
        <div>
            <div class="info">
                <div class="title">{{ Translate('IDCS_BASIC_INFO') }}</div>
                <div class="row">
                    <label>{{ Translate('IDCS_SNAP_TIME') }}</label>
                    <span>{{ displayDateTime(current.detect_time) }}</span>
                    <label>{{ Translate('IDCS_SNAP_ADDRESS') }}</label>
                    <span>{{ current.chlName }}</span>
                </div>
                <div class="row">
                    <label>{{ Translate('IDCS_EVENT_TYPE') }}</label>
                    <span>{{ displayEventType }}</span>
                    <label>{{ Translate('IDCS_TARGET_TYPE') }}</label>
                    <span>{{ displayTargetType }}</span>
                </div>
            </div>
            <div class="img">
                <div>
                    <div class="title">{{ Translate('IDCS_FACE_SNAP_IMAGE') }}</div>
                    <img
                        :src="displayBase64Img(current.snap_pic)"
                        class="snap-img"
                    />
                </div>
                <p>
                    <span>{{ current.info.similarity }}%</span>
                    <span>{{ Translate('IDCS_SIMILARITY') }}</span>
                </p>
                <div>
                    <div class="title">{{ Translate('IDCS_FACE_LIBRARY_PREVIEW') }}</div>
                    <img
                        :src="displayBase64Img(current.repo_pic)"
                        class="face-img"
                    />
                </div>
            </div>
            <div class="info">
                <div class="title">{{ Translate('IDCS_PERSON_INFO') }}</div>
                <div class="row">
                    <label>{{ Translate('IDCS_NAME_PERSON') }}</label>
                    <span>{{ current.info.name }}</span>
                    <label>{{ Translate('IDCS_SEX') }}</label>
                    <span>{{ displayGender }}</span>
                </div>
                <div class="row">
                    <label>{{ Translate('IDCS_BIRTHDAY') }}</label>
                    <span>{{ displayDate(current.info.birth_date) }}</span>
                    <label>{{ Translate('IDCS_ID_TYPE') }}</label>
                    <span>{{ Translate('IDCS_ID_CARD') }}</span>
                </div>
                <div class="row">
                    <label>{{ Translate('IDCS_ID_NUMBER') }}</label>
                    <span>{{ current.info.certificate_number }}</span>
                    <label>{{ Translate('IDCS_PHONE_NUMBER') }}</label>
                    <span>{{ current.info.mobile_phone_number }}</span>
                </div>
                <div class="row">
                    <label>{{ Translate('IDCS_NUMBER') }}</label>
                    <span>{{ current.info.serial_number }}</span>
                    <label>{{ Translate('IDCS_REMARK') }}</label>
                    <span>{{ current.info.remarks }}</span>
                </div>
                <div class="row">
                    <label>{{ Translate('IDCS_ADD_FACE_GROUP') }}</label>
                    <span>{{ current.info.group_name }}</span>
                </div>
            </div>
            <LiveSnapShotPop
                v-model="pageData.isSnapPop"
                :pic="current.scene_pic || ''"
                :width="current.info.ptWidth"
                :height="current.info.ptHeight"
                :left-top="current.info.point_left_top"
                :right-bottom="current.info.point_right_bottom"
            />
        </div>
        <template #footer>
            <el-row>
                <el-col
                    :span="12"
                    class="el-col-flex-start"
                >
                    <el-button @click="showSnapShot">{{ Translate('IDCS_VIEW_SNAPSHOT') }}</el-button>
                    <el-button @click="search">{{ Translate('IDCS_SEARCH') }}</el-button>
                    <el-button @click="playRec">{{ Translate('IDCS_PLAYBACK_BY_SNAPIMAGE') }}</el-button>
                </el-col>
                <el-col
                    :span="12"
                    class="el-col-flex-end"
                >
                    <el-button
                        :disabled="pageData.currentIndex <= 0"
                        @click="previous"
                        >{{ Translate('IDCS_PREVIOUS') }}</el-button
                    >
                    <el-button
                        :disabled="pageData.currentIndex >= list.length - 1"
                        @click="next"
                        >{{ Translate('IDCS_NEXT') }}</el-button
                    >
                    <el-button @click="close">{{ Translate('IDCS_EXIT') }}</el-button>
                </el-col>
            </el-row>
        </template>
    </el-dialog>
</template>

<script lang="ts" src="./LiveSnapFaceMatchPop.v.ts"></script>

<style lang="scss" scoped>
.info {
    margin: 20px 0;
    padding-bottom: 10px;

    &:first-child {
        border-bottom: 1px solid var(--border-color7);
    }
}

.title {
    border-left: 3px solid var(--border-color2);
    height: 30px;
    line-height: 30px;
    padding-left: 15px;
    // margin-left: 15px;
}

.row {
    display: flex;
    padding: 10px 0;

    label {
        width: 15%;

        &:after {
            content: ' : ';
        }
    }

    span {
        width: 35%;
    }
}

.img {
    display: flex;
    margin: 20px 0;
    height: 255px;
    align-items: center;

    & > div:first-child {
        width: 200px;
        flex-shrink: 0;
    }

    & > div:last-child {
        width: 50%;
        flex-shrink: 0;
    }

    img {
        width: 185px;
        height: 215px;
        margin: 10px 0 0 10px;
        background-color: var(--bg-button-disabled);
    }

    p {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        text-align: center;
    }
}
</style>
