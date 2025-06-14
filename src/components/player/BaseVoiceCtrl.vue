<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-05 10:57:42
 * @Description: 音量控件
-->
<template>
    <div class="VoiceCtrl">
        <BaseImgSpriteBtn
            class="icon"
            :file="iconFile"
            :disabled="disabled"
            :title="mute ? Translate('IDCS_AUDIO_ON') : Translate('IDCS_AUDIO_OFF')"
            @click="handleSwitchMute"
        />
        <div class="bar">
            <el-slider
                v-model="sliderValue"
                :min="0"
                :max="100"
                :disabled="prop.mute || disabled"
                @change="handleChangevolume"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
const prop = withDefaults(
    defineProps<{
        /**
         * @property 音量值 范围: [0, 100]
         */
        volume: number
        /**
         * @property 是否静音
         */
        mute: boolean
        /**
         * @property 是否禁用
         */
        disabled?: boolean
    }>(),
    {
        volume: 65,
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

// ICON图标
const iconFile = computed(() => {
    return prop.mute ? 'sound_close' : 'sound'
})

/**
 * @description 更改音量回调
 */
const handleChangevolume = () => {
    emits('update:volume', sliderValue.value)
}

/**
 * @description 开关静音回调
 */
const handleSwitchMute = () => {
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
