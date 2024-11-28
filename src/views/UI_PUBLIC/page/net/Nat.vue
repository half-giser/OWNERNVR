<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-12 09:40:12
 * @Description: NAT配置
-->
<template>
    <div>
        <el-form
            class="stripe"
            :style="{
                '--form-label-width': '200px',
                '--form-input-width': '200px',
            }"
        >
            <el-form-item>
                <el-checkbox
                    v-model="formData.natSwitch"
                    :disabled="pageData.isBindUser"
                    :label="Translate('IDCS_ENABLE')"
                />
            </el-form-item>
            <!-- 1.5.0去除NAT选项, 默认NAT2.0 -->
            <!-- <el-form-item :label="Translate('IDCS_ACCESS_TYPE')">
            </el-form-item> -->
            <el-form-item
                v-if="systemCaps.showNatServerAddress"
                :label="Translate('IDCS_VISIT_ADDRESS')"
            >
                {{ pageData.visitAddress }}
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
                        v-show="!formData.natSwitch"
                        class="code-cover"
                    ></div>
                    <div
                        v-show="!formData.natSwitch"
                        class="code-label"
                        @click="openNat"
                    >
                        {{ Translate('IDCS_NAT_DISABLE') }}
                    </div>
                </div>
                <p class="code-text">{{ pageData.snText }}</p>
            </div>
        </div>
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
    flex-wrap: wrap;

    & > div {
        width: 230px;
        height: 230px;
        flex-shrink: 0;
        margin-left: 15px;
    }

    &-pic {
        position: relative;
        width: 100%;
        height: 100%;
        padding: 10px;
        background-color: var(--qrcode-bg);

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
        height: 30px;
        line-height: 30px;
        padding: 0 10px;
        background-color: var(--qrcode-label-bg);
    }

    &-text {
        margin-top: 10px;
        text-align: center;
        font-family: Consolas, Menlo, monospace;
    }
}
</style>
