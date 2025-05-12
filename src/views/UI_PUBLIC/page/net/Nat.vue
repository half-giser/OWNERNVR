<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-12 09:40:12
 * @Description: NAT配置
-->
<template>
    <div>
        <el-form
            v-title
            class="stripe"
        >
            <el-form-item>
                <el-checkbox
                    v-model="formData.natSwitch"
                    :disabled="!pageData.editable"
                    :label="Translate('IDCS_ENABLE')"
                />
            </el-form-item>
            <el-form-item v-if="pageData.showSecurityAccessCfg">
                <el-checkbox
                    v-model="formData.securityAccessSwitch"
                    :label="Translate('IDCS_SECURITY_ACCESS')"
                    :disabled="pageData.securityAccessSwitch"
                    @change="changeSecurityAccessSwitch"
                />
                <BaseImgSprite
                    file="question"
                    :index="0"
                    :hover-index="1"
                    :chunk="2"
                    :title="Translate('IDCS_SECURITY_ACCESS_TIP')"
                />
            </el-form-item>
            <!-- 1.5.0去除NAT选项, 默认NAT2.0 -->
            <el-form-item
                v-if="systemCaps.needP2pVersion1 && systemCaps.showNatServerAddress"
                :label="Translate('IDCS_ACCESS_TYPE')"
            >
                <el-select-v2
                    v-model="formData.index"
                    :options="pageData.natServerTypeOptions"
                    :disabled="!pageData.editable"
                />
            </el-form-item>
            <el-form-item
                v-if="systemCaps.showNatVisitAddress"
                :label="Translate('IDCS_VISIT_ADDRESS')"
            >
                <span>{{ pageData.visitAddress }}</span>
            </el-form-item>
            <el-form-item :label="Translate('IDCS_NAT_STATUS')">
                <el-input
                    :model-value="pageData.natServerState"
                    readonly
                />
            </el-form-item>
            <div class="base-btn-box">
                <el-button @click="apply">{{ Translate('IDCS_APPLY') }}</el-button>
            </div>
        </el-form>
        <p class="tip">{{ Translate('IDCS_DEVICE_SCAN_QRCODE_TIP') }}</p>
        <!-- 二维码部分 -->
        <div class="code">
            <div>
                <div class="code-pic">
                    <img :src="pageData.snCode" />
                    <!-- nat开关没有打开时二维码置灰BA-1856 -->
                    <div
                        v-show="!pageData.natSwitch"
                        class="code-cover"
                    ></div>
                    <el-button
                        v-show="!pageData.natSwitch"
                        class="code-label"
                        @click="openNat"
                    >
                        {{ Translate('IDCS_ENABLE_NAT') }}
                    </el-button>
                </div>
                <p class="code-text">{{ pageData.snText }}</p>
            </div>
            <div v-show="pageData.currentIndex === 1">
                <div class="code-h1">{{ Translate('IDCS_SECURITY_CODE') }}</div>
                <div class="code-tips">{{ Translate('IDCS_SECURITY_CODE_TIP') }}</div>
                <div class="code-num">
                    <ul>
                        <li
                            v-for="(item, index) in pageData.securityCode.split('')"
                            :key="index"
                        >
                            {{ pageData.isShowSecurityCode ? item : '*' }}
                        </li>
                    </ul>
                    <BaseImgSprite
                        file="icon_mask"
                        :index="pageData.isShowSecurityCode ? 0 : 2"
                        :hover-index="pageData.isShowSecurityCode ? 1 : 3"
                        :chunk="4"
                        @click="toggleSecurityCode"
                    />
                </div>
            </div>
        </div>
        <BaseCheckAuthPop
            v-model="pageData.isCheckAuthPop"
            @confirm="getSecurityCode"
            @close="pageData.isCheckAuthPop = false"
        />
    </div>
</template>

<script lang="ts" src="./Nat.v.ts"></script>

<style lang="scss" scoped>
.tip {
    padding-left: 15px;
    margin: 30px 0 20px;
}

.code {
    display: flex;
    align-items: flex-end;
    // flex-wrap: wrap;

    & > div:first-child {
        width: 230px;
        height: 230px;
        flex-shrink: 0;
        margin-left: 15px;
    }

    & > div:last-child {
        margin-left: 10px;
        padding-bottom: 10px;
    }

    &-pic {
        position: relative;
        width: 100%;
        height: 100%;
        padding: 10px;
        background-color: var(--qrcode-bg);
        box-sizing: border-box;

        img {
            width: 100%;
            height: 100%;
        }
    }

    &-cover {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: var(--qrcode-bg);
        opacity: 0.95;
    }

    &-label {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: fit-content;
        padding: 0 10px;
    }

    &-text {
        margin-top: 10px;
        font-family: Consolas, Menlo, monospace;
    }

    &-h1 {
        font-size: 15px;
        margin-bottom: 5px;
    }

    &-tips {
        color: var(--main-text-light);
        font-size: 12px;
        margin-bottom: 5px;
    }

    &-num {
        display: flex;
        align-items: center;

        ul {
            margin: 0;
            padding: 0;
            display: flex;
            align-items: center;
        }

        li {
            width: 30px;
            height: 30px;
            border-radius: 5px;
            margin-right: 10px;
            border: 1px solid var(--input-border);
            text-align: center;
            line-height: 30px;
        }
    }
}
</style>
