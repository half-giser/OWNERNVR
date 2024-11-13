<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-20 14:01:55
 * @Description: 云台-控制台
-->
<template>
    <div class="ctrl">
        <div class="steer">
            <BaseImgSprite
                v-for="item in pageData.steer"
                :key="item.file"
                :file="item.file"
                :index="0"
                :hover-index="1"
                :chunk="4"
                @mousedown="addCmd(item)"
                @mouseup="stopCmd()"
            />
        </div>
        <div class="value">
            <div class="speed">
                <BaseImgSprite
                    file="SpeedSlow"
                    :index="0"
                    :hover-index="1"
                    :chunk="4"
                    @click="decreaseSpeed()"
                />
                <el-slider
                    v-model="pageData.speed"
                    :min="pageData.minSpeed"
                    :max="pageData.maxSpeed"
                    :step="1"
                    placement="bottom"
                />
                <BaseImgSprite
                    file="SpeedQuick"
                    :index="0"
                    :hover-index="1"
                    :chunk="4"
                    @click="increaseSpeed()"
                />
            </div>
            <div
                v-for="item in pageData.controls"
                :key="item.name"
                class="row"
            >
                <BaseImgSprite
                    :file="item.control[0].file"
                    :index="0"
                    :hover-index="1"
                    :chunk="4"
                    @mousedown="addCmd(item.control[0])"
                    @mouseup="stopCmd()"
                />
                <span>{{ item.name }}</span>
                <BaseImgSprite
                    :file="item.control[1].file"
                    :index="0"
                    :hover-index="1"
                    :chunk="4"
                    @mousedown="addCmd(item.control[1])"
                    @mouseup="stopCmd()"
                />
            </div>
        </div>
    </div>
</template>

<script lang="ts" src="./ChannelPtzCtrlPanel.v.ts"></script>

<style lang="scss" scoped>
.ctrl {
    width: 400px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-sizing: border-box;
    padding: 10px;
}

.steer {
    width: 180px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    flex-shrink: 0;
    padding-top: 10px;

    span {
        margin: 2px;
    }
}

.speed {
    width: 190px;
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
    margin: 2px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
}
</style>
