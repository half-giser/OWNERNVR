<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-19 13:37:56
 * @Description: 现场预览-云台视图
-->
<template>
    <div class="ptz">
        <div class="pane">
            <BaseImgSpriteBtn
                v-for="item in pageData.steer"
                :key="item.file"
                :file="item.file"
                @mousedown="addCmd(item)"
                @mouseup="stopCmd()"
            />
        </div>
        <div class="speed">
            <BaseImgSpriteBtn
                file="SpeedSlow"
                @click="decreaseSpeed()"
            />
            <el-slider
                v-model="pageData.speed"
                :min="pageData.minSpeed"
                :max="pageData.maxSpeed"
                :step="1"
            />
            <BaseImgSpriteBtn
                file="SpeedQuick"
                @click="increaseSpeed()"
            />
        </div>
        <div
            v-for="item in pageData.controls"
            :key="item.name"
            class="row"
        >
            <BaseImgSpriteBtn
                :file="item.control[0].file"
                @mousedown="addCmd(item.control[0])"
                @mouseup="stopCmd()"
            />
            <span>{{ item.name }}</span>
            <BaseImgSpriteBtn
                :file="item.control[1].file"
                @mousedown="addCmd(item.control[1])"
                @mouseup="stopCmd()"
            />
        </div>
        <div class="list">
            <div class="list-menu">
                <BaseImgSpriteBtn
                    file="left"
                    :index="[1, 0, 0, 1]"
                    :chunk="2"
                    @click="changeMenu(pageData.activeMenu - 1)"
                />
                <div
                    v-for="(item, index) in pageData.menu"
                    v-show="pageData.activeMenu === index"
                    :key="item.value"
                >
                    {{ item.label }}
                </div>
                <BaseImgSpriteBtn
                    file="right"
                    :index="[1, 0, 0, 1]"
                    :chunk="2"
                    @click="changeMenu(pageData.activeMenu + 1)"
                />
            </div>
            <LivePtzPresetPanel
                v-show="pageData.activeMenu === 0"
                :enabled="hasAuth"
                :chl-id="chlId"
                :chl-name="winData.chlName"
                :speed="pageData.speed"
            />
            <LivePtzCruisePanel
                v-show="pageData.activeMenu === 1"
                :enabled="hasAuth"
                :chl-id="chlId"
                :chl-name="winData.chlName"
                :speed="pageData.speed"
            />
            <LivePtzGroupPanel
                v-show="pageData.activeMenu === 2"
                :enabled="hasAuth"
                :chl-id="chlId"
            />
            <LivePtzTracePanel
                v-show="pageData.activeMenu === 3"
                :enabled="hasAuth"
                :chl-id="chlId"
                :chl-name="winData.chlName"
                :speed="pageData.speed"
                :active="pageData.activeMenu === 3"
            />
        </div>
    </div>
</template>

<script lang="ts" src="./LivePtzPanel.v.ts"></script>

<style lang="scss" scoped>
.ptz {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.pane {
    width: 190px;
    margin: 0 auto;
    padding: 20px 0 10px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    flex-shrink: 0;

    span {
        margin: 2px;
    }
}

.speed {
    width: 190px;
    margin: 0 auto 3px;
    display: flex;
    align-items: center;
    flex-shrink: 0;

    span:first-child {
        margin-right: 10px;
        flex-shrink: 0;
    }

    span:last-child {
        margin-left: 10px;
        flex-shrink: 0;
    }
}

.row {
    width: 190px;
    margin: 3px auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
}

.list {
    height: 100%;
    width: 220px;
    margin: 10px auto 20px;
    border: 1px solid var(--btn-border);
    display: flex;
    flex-direction: column;

    &-menu {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
        margin: 10px 0;
        font-size: 16px;
    }

    &-main {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        margin-bottom: 10px;
    }

    &-content {
        height: 100%;
    }

    &-btns {
        display: flex;
        justify-content: flex-end;
        flex-shrink: 0;
        width: 90%;
        margin: 0 5%;
        padding-top: 5px;
        border-top: 1px solid var(--btn-border);

        span {
            margin-left: 5px;
        }
    }
}
</style>
