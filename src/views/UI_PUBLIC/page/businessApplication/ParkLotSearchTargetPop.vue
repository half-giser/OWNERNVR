<!--
 * @Date: 2025-05-24 11:06:41
 * @Description: 停车场-车辆进出记录弹窗
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <div class="target-search">
        <div class="target-search-wrap">
            <div class="target-search-title">
                <div>
                    <BaseImgSprite file="enter_exit_record" />
                    <span class="target-search-title-text">{{ Translate('IDCS_VEHICLE_ENTRY_EXIT_RECORD') }}</span>
                </div>
                <div>
                    <BaseImgSprite
                        file="close"
                        :index="0"
                        :hover-index="1"
                        :chunk="2"
                        @click="$emit('close')"
                    />
                </div>
            </div>
            <div class="base-intel-box">
                <div
                    v-show="!pageData.isDetailOpen"
                    class="base-intel-left"
                >
                    <div class="base-intel-left-column">
                        <div class="base-intel-left-form">
                            <!-- 时间选择 -->
                            <IntelBaseDateTimeSelector v-model="pageData.dateRange" />
                            <!-- 通道选择 -->
                            <IntelBaseChannelSelector
                                v-model="pageData.chlIdList"
                                mode="park"
                                @ready="getChlIdNameMap"
                            />
                            <IntelBaseVehicleDirectionSelector v-model="pageData.direction" />
                            <el-form class="no-padding">
                                <el-form-item :label="Translate('IDCS_LICENSE_PLATE')">
                                    <el-input />
                                </el-form-item>
                            </el-form>
                        </div>
                    </div>
                    <!-- 搜索按钮 -->
                    <div class="base-intel-row">
                        <el-button>{{ Translate('IDCS_SEARCH') }}</el-button>
                    </div>
                </div>
                <div
                    class="base-intel-center"
                    :class="{
                        detail_open: pageData.isDetailOpen,
                    }"
                >
                    <!-- 抓拍图、轨迹 tab -->
                    <div>
                        <el-radio-group
                            v-model="pageData.listType"
                            :style="{
                                '--form-radio-button-width': '160px',
                            }"
                        >
                            <el-radio-button
                                v-for="item in pageData.listTypeOptions"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            />
                        </el-radio-group>
                    </div>

                    <!-- 打开/关闭详情按钮 -->
                    <div class="resize_icon_left">
                        <BaseImgSprite
                            :file="pageData.isDetailOpen ? 'right_close' : 'left_open'"
                            :chunk="4"
                            class="icon_left"
                            @click="switchDetail"
                        />
                    </div>
                    <div class="resize_icon_right">
                        <BaseImgSprite
                            :file="pageData.isDetailOpen ? 'right_close' : 'left_open'"
                            :chunk="4"
                            class="icon_right"
                            @click="switchDetail"
                        />
                    </div>
                </div>
                <!-- 详情容器 -->
                <div
                    v-show="pageData.isDetailOpen"
                    class="base-intel-right"
                >
                    详情容器
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
export default defineComponent({
    emits: {
        close() {
            return true
        },
    },
    setup() {
        const pageData = ref({
            dateRange: [0, 0] as [number, number],
            // 选择的通道ID列表
            chlIdList: [] as string[],
            direction: '',
            isDetailOpen: false,
        })

        const switchDetail = () => {
            pageData.value.isDetailOpen = !pageData.value.isDetailOpen
        }

        return {
            pageData,
            switchDetail,
        }
    },
})
</script>

<style lang="scss" scoped>
.target-search {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: calc(100vh - 22px);
    z-index: 10;
    background-color: var(--main-bg);

    &-wrap {
        margin: 20px;
        height: calc(100% - 40px);
        box-sizing: border-box;
        border: 1px solid var(--content-border);
        flex-direction: column;
        display: flex;
    }

    &-title {
        width: 100%;
        height: 60px;
        flex-shrink: 0;
        border-bottom: 1px solid var(--content-border);
        align-items: center;
        padding: 0 20px;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;

        &-text {
            margin-left: 10px;
        }
    }

    .base-intel-box {
        height: 100vh;
    }
}

.base-intel-center {
    position: relative;

    .base-intel-row {
        .el-radio-button {
            :deep(.el-radio-button__inner) {
                width: auto !important;
            }
        }

        .el-dropdown {
            margin-right: 30px;
        }
    }

    .resize_icon_left,
    .resize_icon_right {
        cursor: pointer;
        position: absolute;
        top: 0;
        bottom: 0;
        margin: auto;
        width: 10px;
        height: 60px;

        &:hover {
            opacity: 0.8;
        }
    }

    .resize_icon_left {
        left: -10px;
    }

    .resize_icon_right {
        right: 0;
    }

    &.detail_open {
        border-right: 1px solid var(--content-border);

        .resize_icon_left {
            left: 0;
        }

        .resize_icon_right {
            right: -10px;
        }
    }
}
</style>
