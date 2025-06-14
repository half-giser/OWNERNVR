<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-05 10:10:29
 * @Description: 存储模式配置
-->
<template>
    <div>
        <el-form v-title>
            <el-form-item :label="Translate('IDCS_STORAGE_MODE')">
                <BaseSelect
                    disabled
                    :model-value="Translate('IDCS_REEL_GROUP')"
                    :options="[]"
                />
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
                    @click="changeDiskGroup(item, key)"
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
                <el-scrollbar class="disk-list">
                    <div class="wrapper">
                        <p
                            v-for="item in currentItem.diskList"
                            :key="item.id"
                        >
                            <span>{{ item.text }}</span>
                            <BaseImgSprite
                                v-show="pageData.activeIndex !== 0"
                                class="del"
                                :hover-index="0"
                                file="delItem"
                                @click="deleteDisk(item.id)"
                            />
                        </p>
                        <BaseImgSprite
                            class="add"
                            file="addItem"
                            :hover-index="0"
                            :chunk="2"
                            @click="addDisk"
                        />
                    </div>
                </el-scrollbar>
                <el-scrollbar
                    class="chl-list"
                    :style="{ '--h': pageData.diskGroupList.length - 1 }"
                >
                    <div class="wrapper">
                        <p
                            v-for="item in currentItem.chlList"
                            :key="item.id"
                        >
                            <span>{{ item.text }}</span>
                            <BaseImgSprite
                                v-show="pageData.activeIndex !== 0"
                                class="del"
                                :hover-index="0"
                                file="delItem"
                                @click="deleteChl(item.id)"
                            />
                        </p>
                        <BaseImgSprite
                            class="add"
                            file="addItem"
                            :hover-index="0"
                            :disabled-index="1"
                            :disabled="!currentItem.diskList.length"
                            :chunk="2"
                            @click="addChl"
                        />
                    </div>
                </el-scrollbar>
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
:deep(.el-form-item) {
    background-color: var(--subheading-bg);
}

.group {
    display: flex;
    border: 1px solid var(--content-border);
}

.left {
    width: 20%;
    border-right: 1px solid var(--content-border);

    .title {
        border-bottom: 1px solid var(--content-border);
        height: 30px;
        line-height: 30px;
        font-size: 18px;
        text-align: center;
    }
}

.group-item {
    width: 100%;
    height: 107px;
    color: var(--main-text);
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
        border-bottom: 1px solid var(--content-border);
    }

    &.disabled {
        color: var(--main-text-light);
        cursor: unset;
    }

    &.active {
        background-color: var(--disk-group-bg-active);
        color: var(--disk-group-text-active);
    }
}

.center {
    width: 15%;
    border-right: 1px solid var(--content-border);
}

.right {
    width: 65%;
}

.disk-list,
.disk-title {
    height: 138px;
    border-bottom: 1px solid var(--content-border);
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

.wrapper {
    box-sizing: border-box;
    padding: 10px;
    display: flex;
    flex-wrap: wrap;
    width: 100%;

    p {
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
}

.add {
    margin-top: 5px;
}
</style>
