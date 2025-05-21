<!--
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2025-05-21 10:30:00
 * @Description: 智能分析-人、车
-->
<template>
    <div class="snap">
        <!-- 封面图区域 -->
        <div class="pic_show_container">
            <div
                class="normal_pic"
                :class="{
                    selected: targetData.selected,
                }"
            >
                <!-- 顶部操作区域（checkbox选择框） -->
                <div class="top_operate">
                    <el-checkbox v-model="targetData.selected" />
                </div>
                <!-- 封面图 -->
                <img
                    :src="targetData.objPicData.data"
                    class="center_operate"
                    @load="loadImg"
                />
                <!-- 底部操作区域（注册、导出...） -->
                <div class="bottom_operate">
                    <BaseImgSprite
                        file="snap_search"
                        :chunk="4"
                        :hover-index="1"
                        class="operate_icon"
                    />
                    <BaseImgSprite
                        file="export"
                        :chunk="4"
                        :hover-index="1"
                        class="operate_icon"
                    />
                    <BaseImgSprite
                        file="register"
                        :chunk="4"
                        :hover-index="1"
                        class="operate_icon"
                    />
                </div>
            </div>
            <div
                v-if="false"
                class="noData_pic"
            >
                <div class="onDataSnapText">無資料</div>
            </div>
            <div
                v-if="false"
                class="deleted_pic"
            >
                <div class="delSnapText">已刪除</div>
            </div>
        </div>
        <!-- 描述信息区域 -->
        <div class="info_show_container">
            <div class="info_show_snap">
                <span class="frametime">{{ displayDateTime(targetData.timeStamp * 1000) }}</span>
                <span class="picChlName text-ellipsis">{{ targetData.channelName }}</span>
                <span class="plateNumber"></span>
                <span class="similarityValue"></span>
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./IntelBaseSnapItem.v.ts"></script>

<style lang="scss" scoped>
.snap {
    width: calc((100% - 35px) / 6);
    margin: 5px 0px 30px 5px;
    user-select: none;

    .pic_show_container {
        width: 100%;
        position: relative;
        border: 1px solid var(--content-border);
        padding-top: calc(100% * 4 / 3);

        .normal_pic,
        .noData_pic,
        .deleted_pic {
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            margin: auto;
        }

        .normal_pic {
            .center_operate {
                width: 100%;
                height: 100%;
            }
            .top_operate,
            .bottom_operate {
                position: absolute;
                left: 0;
                right: 0;
                margin: auto;
                display: flex;
                justify-content: flex-start;
                align-items: center;
                visibility: hidden;
            }
            .top_operate {
                top: 0;
                padding: 2px 5px;
            }
            .bottom_operate {
                bottom: 0;
                padding: 2px;

                .operate_icon {
                    transform: scale(0.8);
                }
            }
            &.selected {
                .top_operate {
                    visibility: visible;
                }
            }
            &:hover {
                .top_operate,
                .bottom_operate {
                    visibility: visible;
                }
            }
        }
    }

    .info_show_container {
        width: 100%;
        min-height: 50px;
        .info_show_snap {
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: flex-start;
            > span {
                margin-top: 4px;
            }
        }
    }
}
</style>
