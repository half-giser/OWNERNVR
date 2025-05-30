<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-19 13:37:26
 * @Description: 现场预览-目标检测视图
-->
<template>
    <div class="snap">
        <el-scrollbar class="snap-list">
            <template v-for="(item, index) in currentSnapList">
                <!-- 人脸比对组件 -->
                <LiveSnapFaceMatchItem
                    v-if="item.type === 'face_verify'"
                    :key="`face_verify${item.detect_time}`"
                    :data="item"
                    :border="pageData.activeMenu"
                    @add="register(item)"
                    @detail="showDetail(index, 'normal')"
                    @search="search(item, $event)"
                    @play-rec="playRec(item)"
                    @face-detail="showDetail(index, 'faceCompare')"
                />
                <!-- 结构 -->
                <LiveSnapStructItem
                    v-else-if="item.type === 'boundary' && (item.info?.person_info || item.info?.bike_info || item.info?.car_info)"
                    :key="`boundary${item.detect_time}`"
                    :data="item"
                    :border="pageData.activeMenu"
                    @add="register(item)"
                    @detail="showDetail(index, 'normal')"
                    @search="search(item)"
                    @play-rec="playRec(item)"
                />
                <!-- 车牌 -->
                <LiveSnapVehiclePlateItem
                    v-else-if="item.type === 'vehicle_plate'"
                    :key="`vehicle_plate${item.detect_time}`"
                    :data="item"
                    :border="pageData.activeMenu"
                    @add="register(item)"
                    @detail="showDetail(index, 'normal')"
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
                    @detail="showDetail(index, 'normal')"
                    @search="search(item)"
                    @play-rec="playRec(item)"
                />
            </template>
        </el-scrollbar>
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
        <LiveSnapPop
            v-model="pageData.isSnapPop"
            :list="pageData.snapList"
            :index="pageData.snapIndex"
            :open-type="pageData.openType"
            @close="pageData.isSnapPop = false"
            @add="handleSnapRegister"
            @search="handleSnapSearch"
            @export-pic="handleSnapExport"
            @play-rec="handleSnapRec"
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
        <IntelSearchBackupPop
            ref="backupPopRef"
            :auth="auth"
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
    }

    &-btns {
        flex-shrink: 0;
        width: 100%;
        height: 33px;
        border-top: 1px solid var(--input-border);
        border-bottom: 1px solid var(--input-border);
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
                background-color: var(--primary);
                color: var(--main-text-active);
            }

            &:first-child {
                border-right: 1px solid var(--input-border);
            }
        }
    }
}
</style>
