<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-04 16:47:04
 * @Description: 健康状态检测
-->
<template>
    <div>
        <div
            v-show="!pageData.isDetail"
            class="main"
        >
            <div class="top">{{ Translate('IDCS_DISK_HEALTH_TIPS').formatForLang(pageData.diskList.length) }}</div>
            <div class="list">
                <div
                    v-for="(item, key) in pageData.diskList"
                    :key="item.id"
                    class="diskcard"
                    :class="{ warning: item.healthStatusValue === 'warning' }"
                    @click="changeDiskCard(key)"
                >
                    <div>
                        <span class="diskcard-name">{{ displayDiskName(key) }}</span>
                        <div class="diskcard-logo">
                            <BaseImgSprite
                                file="disk_logo"
                                class="diskcard-img"
                            />
                            <span>Western Digital DEVICE ANALYTICS</span>
                        </div>
                    </div>
                    <p class="diskcard-status">{{ item.healthStatus }}</p>
                </div>
            </div>
        </div>
        <div
            v-show="pageData.isDetail"
            class="detail base-flex-box"
        >
            <div class="detail-top">
                <span
                    class="detail-back"
                    @click="goBack"
                >
                    <i></i>
                    {{ Translate('IDCS_BACK') }}
                </span>
                <div class="detail-logo">
                    <BaseImgSprite
                        file="disk_logo"
                        class="diskcard-img"
                    />
                    <span>Western Digital DEVICE ANALYTICS</span>
                </div>
            </div>
            <div class="detail-info">
                <span class="detail-num">{{ diskNum }}</span>
                <span class="detail-sn">{{ diskName }}</span>
                <span class="detail-status">{{ healthStatus }}</span>
            </div>
            <div class="detail-table">
                <div class="base-table-box">
                    <el-table
                        :data="tableData"
                        stripe
                        border
                        show-overflow-tooltip
                    >
                        <el-table-column
                            :label="Translate('IDCS_SERIAL_NUMBER')"
                            type="index"
                            width="70"
                        />
                        <el-table-column
                            :label="Translate('IDCS_ALARM_NAME')"
                            prop="name"
                        />
                        <el-table-column
                            :label="Translate('IDCS_STATE')"
                            prop="status"
                        />
                        <el-table-column
                            :label="Translate('IDCS_DISK_SMART_VALUE')"
                            prop="value"
                        />
                        <el-table-column
                            :label="Translate('IDCS_SUGGESTION')"
                            prop="suggest"
                        />
                    </el-table>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./HealthStatusCheck.v.ts"></script>

<style lang="scss" scoped>
.top {
    padding: 20px 44px;
    font-size: 20px;
    font-weight: bold;
}

.list {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;
    padding: 0 44px;
    width: 100%;
    box-sizing: border-box;
}

.diskcard {
    width: 450px;
    border: 1px solid var(--content-border);
    border-radius: 6px;
    box-sizing: border-box;
    padding: 15px;
    font-size: 14px;
    color: var(--main-text);
    height: 200px;
    cursor: pointer;
    margin-right: 40px;
    margin-bottom: 40px;

    & > div {
        display: flex;
        height: 75px;
    }

    &-logo {
        display: flex;
    }

    &-name {
        width: 50%;
        margin-right: 20px;
    }

    &-img {
        flex-shrink: 0;
        margin-right: 10px;
    }

    &-status {
        font-size: 20px;
        text-align: center;
        font-weight: bold;
        color: var(--breadcrumb-text);
        margin: 0;
        line-height: 1;
    }

    &:hover {
        background-color: var(--primary);
        color: white;

        .diskcard-status {
            color: white;
        }
    }

    &.warning &-status {
        color: var(--color-error);
    }
}

.detail {
    &-top {
        width: 100%;
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
        flex-shrink: 0;
    }

    &-back {
        font-size: 16px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;

        &:hover {
            color: var(--primary);

            i {
                border-top-color: var(--primary);
                border-left-color: var(--primary);
            }
        }

        i {
            border-right: 2px solid transparent;
            border-top: 2px solid var(--main-text);
            border-bottom: 2px solid transparent;
            border-left: 2px solid var(--main-text);
            width: 8px;
            height: 8px;
            transform: rotate(-45deg);
        }
    }

    &-logo {
        display: flex;
        width: 200px;
        font-size: 14px;
        color: var(--main-text);
    }

    &-info {
        display: flex;
        height: 36px;
        line-height: 36px;
        margin-bottom: 10px;
        flex-shrink: 0;
    }

    &-num {
        width: 36px;
        height: 36px;
        line-height: 36px;
        flex-shrink: 0;
        background-color: var(--primary);
        text-align: center;
        color: var(--main-text-active);
        font-size: 16px;
        margin-right: 20px;
        border-radius: 100%;
        margin-left: 20px;
    }

    &-status {
        font-size: 20px;
        font-weight: bold;
        margin-left: 20px;
    }

    &-table {
        width: 100%;
        box-sizing: border-box;
        padding-left: 76px;
        height: 100%;
    }
}
</style>
