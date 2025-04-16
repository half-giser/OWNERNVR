<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-30 09:26:56
 * @Description: 人脸库 - 选择人脸
-->
<template>
    <el-dialog
        :title="Translate('IDCS_ADD')"
        :width="type === 'both' ? 1150 : 1000"
        append-to-body
        @open="open"
    >
        <div class="choose">
            <div
                v-show="type === 'both'"
                class="choose-left"
            >
                <div
                    v-for="item in pageData.typeOptions"
                    :key="item.value"
                    :class="{
                        active: item.value === pageData.type,
                    }"
                    @click="changeType(item.value)"
                >
                    {{ item.label }}
                </div>
            </div>
            <div class="choose-right">
                <IntelFaceDBChooseFaceSnapPanel
                    v-if="type !== 'import'"
                    v-show="pageData.type === 'snap'"
                    @change="chooseSnap"
                />
                <IntelFaceDBChooseFaceImportPanel
                    v-if="type !== 'snap'"
                    v-show="pageData.type === 'import'"
                    type="import"
                    @change="importImg"
                />
            </div>
            <el-dialog
                v-model="pageData.isDescPop"
                :title="Translate('IDCS_INFORMATION_DESCRIPTION')"
                append-to-body
                width="900"
            >
                <div class="desc">
                    <div>
                        <span>{{ Translate('IDCS_FILE_TYPE') }}</span>
                        <span>*.csv;*.txt</span>
                    </div>
                    <div>
                        {{ Translate('IDCS_FOR_EXAMPLE') }}
                    </div>
                    <div>
                        <div>CSV</div>
                        <div>{{ pageData.descTitle.join(',') }}</div>
                        <div>{{ pageData.descBody.join(',') }}</div>
                        <div>TXT</div>
                        <div>{{ pageData.descTitle.join(' ') }}</div>
                        <div>{{ pageData.descBody.join(' ') }}</div>
                    </div>
                    <div>
                        {{ Translate('IDCS_REMARK') }}
                    </div>
                    <div>
                        <div>1. {{ Translate('IDCS_PERSONAL_EXPLAIN_NUM1') }}</div>
                        <div>2. {{ Translate('IDCS_PERSONAL_EXPLAIN_NUM2') }}</div>
                        <div>3. {{ Translate('IDCS_PERSONAL_EXPLAIN_NUM3') }}</div>
                        <div>4. {{ Translate('IDCS_PERSONAL_EXPLAIN_NUM4') }}</div>
                    </div>
                </div>
            </el-dialog>
        </div>
        <div class="base-btn-box">
            <el-button
                v-show="pageData.type === 'snap'"
                @click="confirmSnap"
            >
                {{ Translate('IDCS_OK') }}
            </el-button>
            <el-button
                v-show="pageData.type === 'import'"
                @click="pageData.isDescPop = true"
            >
                {{ Translate('IDCS_INFORMATION_DESCRIPTION') }}
            </el-button>
            <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./IntelFaceDBChooseFacePop.v.ts"></script>

<style lang="scss" scoped>
.choose {
    display: flex;

    &-left {
        width: 150px;
        height: 460px;
        border: 1px solid var(--content-border);
        flex-shrink: 0;
        margin-right: 10px;

        div {
            height: 50px;
            width: 100%;
            line-height: 50px;
            text-align: center;
            cursor: pointer;

            &.active {
                color: var(--main-text-active);
                background-color: var(--primary);
            }
        }
    }

    &-right {
        height: 460px;
    }
}

.desc {
    line-height: 2.5;

    & > div {
        & > div {
            margin-left: 60px;
        }

        & > span:last-child {
            margin-left: 60px;
        }
    }
}
</style>
