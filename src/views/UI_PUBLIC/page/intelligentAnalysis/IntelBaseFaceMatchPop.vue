<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-12 09:21:59
 * @Description: 智能分析 - 人脸比对结果弹窗
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-12 20:38:57
-->
<template>
    <el-dialog
        :title="Translate('IDCS_FACE_DETAIL')"
        width="900"
    >
        <div>
            <div class="info">
                <div class="title">{{ Translate('IDCS_BASIC_INFO') }}</div>
                <div class="row">
                    <label>{{ Translate('IDCS_SNAP_TIME') }}</label>
                    <span>{{ displayDateTime(current.timestamp) }}</span>
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
                        :src="current.pic"
                        class="snap-img"
                    />
                </div>
                <p>
                    <span class="similarity">{{ current.similarity }}%</span>
                    <span>{{ Translate('IDCS_SIMILARITY') }}</span>
                </p>
                <div>
                    <div class="title">{{ Translate('IDCS_FACE_LIBRARY_PREVIEW') }}</div>
                    <img
                        :src="current.match"
                        class="face-img"
                    />
                </div>
            </div>
            <div class="info">
                <div class="title">{{ Translate('IDCS_PERSON_INFO') }}</div>
                <div class="row">
                    <label>{{ Translate('IDCS_NAME_PERSON') }}</label>
                    <span>{{ current.name }}</span>
                    <label>{{ Translate('IDCS_SEX') }}</label>
                    <span>{{ displayGender }}</span>
                </div>
                <div class="row">
                    <label>{{ Translate('IDCS_BIRTHDAY') }}</label>
                    <span>{{ current.birthday }}</span>
                    <label>{{ Translate('IDCS_ID_TYPE') }}</label>
                    <span>{{ Translate('IDCS_ID_CARD') }}</span>
                </div>
                <div class="row">
                    <label>{{ Translate('IDCS_ID_NUMBER') }}</label>
                    <span>{{ current.certificateNum }}</span>
                    <label>{{ Translate('IDCS_PHONE_NUMBER') }}</label>
                    <span>{{ current.mobile }}</span>
                </div>
                <div class="row">
                    <label>{{ Translate('IDCS_NUMBER') }}</label>
                    <span>{{ current.number }}</span>
                    <label>{{ Translate('IDCS_REMARK') }}</label>
                    <span>{{ current.note }}</span>
                </div>
                <div class="row">
                    <label>{{ Translate('IDCS_ADD_FACE_GROUP') }}</label>
                    <span>{{ current.groupName }}</span>
                </div>
            </div>
            <IntelBasePanoramaPop
                v-model="pageData.isSnapPop"
                :data="current"
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

<script lang="ts" src="./IntelBaseFaceMatchPop.v.ts"></script>

<style lang="scss" scoped>
.info {
    margin: 20px 0;
    padding-bottom: 10px;

    &:first-child {
        border-bottom: 1px solid var(--input-border);
    }
}

.title {
    border-left: 3px solid var(--content-border);
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
        width: 185px;
        flex-shrink: 0;
    }

    & > div:last-child {
        width: 400px;
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

    .similarity {
        font-size: 24px;
        margin-bottom: 10px;
    }
}
</style>
