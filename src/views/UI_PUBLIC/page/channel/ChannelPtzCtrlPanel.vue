<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-20 14:01:55
 * @Description: 云台-控制台
-->
<template>
    <div
        class="ctrl"
        :class="[
            {
                disabled: !chlId || disabled,
            },
            layout,
        ]"
    >
        <div class="steer">
            <BaseImgSpriteBtn
                v-for="item in pageData.steer"
                :key="item.file"
                :file="item.file"
                :disabled="!chlId || disabled || !enableCtrl"
                @mousedown="addCmd(item)"
                @mouseup="stopCmd()"
            />
        </div>
        <div class="value">
            <div class="speed">
                <BaseImgSpriteBtn
                    file="SpeedSlow"
                    :disabled="!chlId || disabled || !enableSpeed"
                    @click="decreaseSpeed()"
                />
                <el-slider
                    v-model="pageData.speed"
                    :min="minSpeed"
                    :max="maxSpeed"
                    :step="1"
                    :disabled="!chlId || disabled || !enableSpeed"
                    :show-tooltip="!chlId || disabled || !enableSpeed ? false : true"
                    placement="bottom"
                />
                <BaseImgSpriteBtn
                    file="SpeedQuick"
                    :disabled="!chlId || disabled || !enableSpeed"
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
                    :disabled="!item.validate()"
                    @mousedown="addCmd(item.control[0])"
                    @mouseup="stopCmd()"
                />
                <span>{{ item.name }}</span>
                <BaseImgSpriteBtn
                    :file="item.control[1].file"
                    :disabled="!item.validate()"
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

    &.disabled {
        .row {
            color: var(--main-text-light);
        }
    }

    &.vertical {
        flex-direction: column;
        width: 100%;

        .steer {
            padding: 20px 0 10px;
        }
    }
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
