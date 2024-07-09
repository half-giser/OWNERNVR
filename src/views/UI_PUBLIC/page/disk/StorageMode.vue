<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-05 10:10:29
 * @Description: 存储模式配置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-08 19:26:04
-->
<template>
    <div class="StorageMode">
        <el-form>
            <el-form-item :label="Translate('IDCS_STORAGE_MODE')">
                <el-select
                    disabled
                    model-value="1"
                >
                    <el-option
                        value="1"
                        :label="Translate('IDCS_REEL_GROUP')"
                    />
                </el-select>
            </el-form-item>
        </el-form>
        <div class="group">
            <div class="left">
                <div class="title">{{ Translate('IDCS_GROUP_NORMAL') }}</div>
                <div
                    v-for="(item, key) in pageData.diskGroupList"
                    :key="item.id"
                    class="group-item"
                    :class="{
                        disabled: !item.diskList.length && !item.chlList.length && key >= pageData.diskTotalNum,
                        active: key === pageData.activeIndex,
                    }"
                >
                    <p>{{ key + 1 }}</p>
                    <div>
                        <p class="group-disk">{{ Translate('IDCS_DISK_D').formatForLang(item.diskList.length) }}</p>
                        <p class="group-chl">{{ Translate('IDCS_CHANNEL_D').formatForLang(item.chlList.length) }}</p>
                    </div>
                </div>
            </div>
            <div class="center">
                <div class="disk-title">
                    <div>{{ Translate('IDCS_DISK') }}</div>
                    <div>({{ Translate('IDCS_DISK_CAPACITY') }}{{ currentItem.totalSize || '' }})</div>
                </div>
                <div
                    class="chl-title"
                    :style="{ '--h': pageData.diskGroupList.length - 1 }"
                >
                    <div>{{ Translate('IDCS_CHANNEL') }}</div>
                </div>
            </div>
            <div class="right">
                <div class="disk-list">
                    <p
                        v-for="item in currentItem.diskList"
                        :key="item.id"
                    >
                        <span>{{ item.text }}</span>
                        <BaseImgSprite
                            v-show="pageData.activeIndex !== 0"
                            class="del"
                            file="delItem"
                            @click="deleteDisk(item.id)"
                        />
                    </p>
                    <BaseImgSprite
                        class="add"
                        file="addItem"
                        :index="0"
                        :hover-index="0"
                        :chunk="2"
                        @click="addDisk"
                    />
                </div>
                <div
                    class="chl-list"
                    :style="{ '--h': pageData.diskGroupList.length - 1 }"
                >
                    <p
                        v-for="item in currentItem.chlList"
                        :key="item.id"
                    >
                        <span>{{ item.text }}</span>
                        <BaseImgSprite
                            v-show="pageData.activeIndex !== 0"
                            class="del"
                            file="delItem"
                            @click="deleteChl(item.id)"
                        />
                    </p>
                    <BaseImgSprite
                        class="add"
                        file="addItem"
                        :index="0"
                        :hover-index="0"
                        :disabled-index="currentItem.diskList.length ? 1 : -1"
                        :chunk="2"
                        @click="addChl"
                    />
                </div>
            </div>
        </div>
        <StorageModeAddDiskPop
            v-model="pageData.isAddDisk"
            :backup-disk-id="pageData.backupDiskId"
            :current="currentItem"
            @close="pageData.isAddDisk = false"
            @confirm="confirmAddDisk"
        />
        <StorageModeAddChlPop
            v-model="pageData.isAddChl"
            :list="pageData.diskGroupList"
            :current="currentItem"
            @close="pageData.isAddChl = false"
            @confirm="confirmAddChl"
        />
    </div>
</template>

<script lang="ts" src="./StorageMode.v.ts"></script>

<style lang="scss" scoped>
.StorageMode {
    :deep(.el-form-item) {
        margin-bottom: 0;
        padding: 10px 0 10px 15px;
        background-color: var(--bg-color4);
    }

    .el-select {
        width: 340px;
    }

    .group {
        display: flex;
        border: 1px solid var(--border-color2);
    }

    .left {
        width: 20%;
        border-right: 1px solid var(--border-color2);

        .title {
            border-bottom: 1px solid var(--border-color2);
            height: 30px;
            line-height: 30px;
            font-size: 18px;
            text-align: center;
        }

        .group-item {
            width: 100%;
            height: 107px;
            color: var(--text-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;

            & > p {
                font-size: 30px;
            }

            & > div {
                margin-left: 20px;
                font-size: 18px;

                p {
                    margin: 0;
                }
            }

            &:not(:last-child) {
                border-bottom: 1px solid var(--border-color2);
            }

            &.disabled {
                color: var(--text-disabled);
                cursor: unset;
            }

            &.active {
                background-color: var(--primary--01);
            }
        }
    }

    .center {
        width: 15%;
        border-right: 1px solid var(--border-color2);
    }

    .right {
        width: 65%;
    }

    .disk-list,
    .disk-title {
        height: 138px;
        border-bottom: 1px solid var(--border-color2);
    }

    .disk-title {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        font-size: 18px;

        div:last-child {
            font-size: 14px;
            margin-top: 5px;
        }
    }

    .chl-list,
    .chl-title {
        --h: 1;
        height: calc(var(--h) * 107px);
        min-height: 107px;
    }

    .chl-title {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        font-size: 18px;
    }

    .disk-list,
    .chl-list {
        box-sizing: border-box;
        padding: 10px;
        display: flex;
        flex-wrap: wrap;
        overflow-y: auto;

        & > p {
            width: 150px;
            font-size: 15px;
            margin: 5px 10px;
            height: 20px;
            line-height: 20px;
            overflow: hidden;
            text-overflow: ellipsis;
            text-wrap: nowrap;
        }
    }

    .del {
        margin-left: 5px;
        cursor: pointer;
    }

    .add {
        margin-top: 5px;
    }
}
</style>
