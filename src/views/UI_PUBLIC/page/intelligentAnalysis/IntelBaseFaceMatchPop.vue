<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-12 09:21:59
 * @Description: 智能分析 - 人脸比对结果弹窗
-->
<template>
    <el-dialog
        :title="Translate('IDCS_FACE_DETAIL')"
        width="900"
        @open="open"
    >
        <div>
            <div class="info">
                <div class="title">{{ Translate('IDCS_BASIC_INFO') }}</div>
                <el-form>
                    <el-form-item>
                        <el-form-item :label="Translate('IDCS_SNAP_TIME')">{{ displayDateTime(current.timestamp) }}</el-form-item>
                        <el-form-item :label="Translate('IDCS_SNAP_ADDRESS')">{{ current.chlName }}</el-form-item>
                    </el-form-item>
                    <el-form-item>
                        <el-form-item :label="Translate('IDCS_EVENT_TYPE')">{{ displayEventType }}</el-form-item>
                        <el-form-item :label="Translate('IDCS_TARGET_TYPE')">{{ displayTargetType }}</el-form-item>
                    </el-form-item>
                </el-form>
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
                <el-form>
                    <el-form-item>
                        <el-form-item :label="Translate('IDCS_NAME_PERSON')">{{ current.name }}</el-form-item>
                        <el-form-item :label="Translate('IDCS_SEX')">{{ displayGender }}</el-form-item>
                    </el-form-item>
                    <el-form-item>
                        <el-form-item :label="Translate('IDCS_BIRTHDAY')">{{ current.birthday }}</el-form-item>
                        <el-form-item :label="Translate('IDCS_ID_TYPE')">{{ Translate('IDCS_ID_CARD') }}</el-form-item>
                    </el-form-item>
                    <el-form-item>
                        <el-form-item :label="Translate('IDCS_ID_NUMBER')">{{ current.certificateNum }}</el-form-item>
                        <el-form-item :label="Translate('IDCS_PHONE_NUMBER')">{{ current.mobile }}</el-form-item>
                    </el-form-item>
                    <el-form-item>
                        <el-form-item :label="Translate('IDCS_NUMBER')">{{ current.number }}</el-form-item>
                        <el-form-item :label="Translate('IDCS_REMARK')">{{ current.note }}</el-form-item>
                    </el-form-item>
                    <el-form-item>
                        <el-form-item :label="Translate('IDCS_ADD_FACE_GROUP')">{{ current.groupName }}</el-form-item>
                        <el-form-item />
                    </el-form-item>
                </el-form>
            </div>
            <IntelBasePanoramaPop
                v-model="pageData.isSnapPop"
                :data="current"
            />
        </div>
        <div
            class="base-btn-box"
            span="2"
        >
            <div>
                <el-button @click="showSnapShot">{{ Translate('IDCS_VIEW_SNAPSHOT') }}</el-button>
                <el-button @click="search">{{ Translate('IDCS_SEARCH') }}</el-button>
                <el-button @click="playRec">{{ Translate('IDCS_PLAYBACK_BY_SNAPIMAGE') }}</el-button>
            </div>
            <div>
                <el-button
                    :disabled="pageData.currentIndex === 0"
                    @click="previous"
                >
                    {{ Translate('IDCS_PREVIOUS') }}
                </el-button>
                <el-button
                    :disabled="pageData.currentIndex >= list.length - 1"
                    @click="next"
                >
                    {{ Translate('IDCS_NEXT') }}
                </el-button>
                <el-button @click="close">{{ Translate('IDCS_EXIT') }}</el-button>
            </div>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./IntelBaseFaceMatchPop.v.ts"></script>

<style lang="scss" scoped>
.info {
    margin-bottom: 20px;

    &:first-child {
        border-bottom: 1px solid var(--input-border);
    }
}

.title {
    border-left: 3px solid var(--content-border);
    height: 30px;
    line-height: 30px;
    padding-left: 15px;
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
