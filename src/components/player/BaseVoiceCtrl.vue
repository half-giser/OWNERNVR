<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-05 10:57:42
 * @Description: 音量控件
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-08-23 13:57:17
-->
<template>
    <div class="VoiceCtrl">
        <el-tooltip
            :content="mute ? Translate('IDCS_AUDIO_ON') : Translate('IDCS_AUDIO_OFF')"
            :show-after="500"
        >
            <BaseImgSprite
                class="icon"
                :file="iconFile"
                :index="mute ? 0 : 2"
                :hover-index="1"
                :disabled-index="3"
                :disabled="disabled"
                :chunk="4"
                @click="handleSwitchMute"
            />
        </el-tooltip>
        <div class="bar">
            <el-slider
                v-model="sliderValue"
                :min="0"
                :max="100"
                :disabled="prop.mute || disabled"
                @change="handleChangevolume($event as number)"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
const prop = withDefaults(
    defineProps<{
        volume: number
        mute: boolean
        disabled?: boolean
    }>(),
    {
        volume: 50,
        mute: true,
        disabled: false,
    },
)

const sliderValue = ref(prop.volume)

const emits = defineEmits<{
    /**
     * @param {number} volume 音量值
     */
    (e: 'update:volume', volume: number): void
    /**
     * @param {boolean} mute true: 静音; false: 取消静音
     */
    (e: 'update:mute', mute: boolean): void
}>()

const iconFile = computed(() => {
    return prop.mute ? 'sound_close' : 'sound'
})

const handleChangevolume = (event: number) => {
    emits('update:volume', event)
}

const handleSwitchMute = () => {
    if (prop.disabled) {
        return
    }
    emits('update:mute', !prop.mute)
}

watch(
    () => prop.volume,
    (value) => {
        sliderValue.value = value
    },
)
</script>

<style lang="scss" scoped>
.VoiceCtrl {
    display: flex;
    align-items: center;
    .icon {
        cursor: pointer;
        flex-shrink: 0;
    }
    .bar {
        margin-left: 20px;
        width: 100%;
    }
}
</style>
