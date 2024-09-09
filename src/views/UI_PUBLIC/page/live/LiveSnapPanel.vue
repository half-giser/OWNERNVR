<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-19 13:37:26
 * @Description: 现场预览-目标检测视图
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-04 17:57:37
-->
<template>
    <div class="snap">
        <div class="snap-list">
            <template v-for="(item, index) in currentSnapList">
                <!-- 人脸比对组件 -->
                <LiveSnapFaceMatchItem
                    v-if="item.type === 'face_verify'"
                    :key="`face_verify${item.detect_time}`"
                    :data="item"
                    :border="pageData.activeMenu"
                    @add="register(item)"
                    @detail="showDetail(index)"
                    @search="search(item, $event)"
                    @play-rec="playRec(item)"
                    @face-detail="showFaceDetail(index)"
                />
                <!-- 结构 -->
                <LiveSnapStructItem
                    v-else-if="item.type === 'boundary' && (item.info.person_info || item.info.bike_info || item.info.car_info)"
                    :key="`boundary${item.detect_time}`"
                    :data="item"
                    :border="pageData.activeMenu"
                    @add="register(item)"
                    @detail="showDetail(index)"
                    @search="search(item)"
                    @play-rec="playRec(item)"
                />
                <!-- 抓拍 -->
                <LiveSnapItem
                    v-else
                    :key="`snap${item.detect_time}`"
                    :data="item"
                    :border="pageData.activeMenu"
                    @add="register(item)"
                    @detail="showDetail(index)"
                    @search="search(item)"
                    @play-rec="playRec(item)"
                />
            </template>
        </div>
        <div class="snap-btns">
            <div
                v-for="(item, index) in pageData.menu"
                :key="index"
                :class="{
                    active: index === pageData.activeMenu,
                }"
                @click="changeMenu(index)"
            >
                {{ item.label }}
            </div>
        </div>
        <LiveSnapInfoPop
            v-model="pageData.isInfoPop"
            :list="pageData.infoList"
            :index="pageData.infoIndex"
            @play-rec="playRec"
            @add="register"
            @search="search"
            @close="pageData.isInfoPop = false"
        />
        <IntelFaceDBSnapRegisterPop
            v-model="pageData.isRegisterPop"
            :pic="pageData.registerPic"
            @close="pageData.isRegisterPop = false"
        />
        <IntelLicencePlateDBAddPlatePop
            v-model="pageData.isAddPlatePop"
            type="register"
            :data="{
                plateNumber: pageData.addPlateNum,
            }"
            @close="pageData.isAddPlatePop = false"
        />
        <LiveSnapFaceMatchPop
            v-model="pageData.isFacePop"
            :list="pageData.faceList"
            :index="pageData.faceIndex"
            @play-rec="playRec"
            @search="search"
            @close="pageData.isFacePop = false"
        />
    </div>
</template>

<script lang="ts" src="./LiveSnapPanel.v.ts"></script>

<style lang="scss" scoped>
.snap {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    &-list {
        height: 100%;
        overflow-y: scroll;
    }

    &-btns {
        flex-shrink: 0;
        width: 100%;
        height: 33px;
        border-top: 1px solid var(--border-color7);
        border-bottom: 1px solid var(--border-color7);
        line-height: 33px;
        text-align: center;
        display: flex;
        cursor: pointer;
        margin-bottom: 5px;
        margin-top: 5px;

        & > div {
            width: 50%;
            height: 100%;
            &.active {
                background-color: var(--primary--04);
                color: var(--text-active);
            }

            &:first-child {
                border-right: 1px solid var(--border-color7);
            }
        }
    }
}
</style>
