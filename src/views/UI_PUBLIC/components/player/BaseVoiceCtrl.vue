<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-05 10:57:42
 * @Description: 音量控件
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-06-12 13:41:22
-->
<template>
    <div class="VoiceCtrl">
        <BaseImgSprite
            class="icon"
            :file="iconFile"
            :index="0"
            :hover-index="1"
            :chunk="4"
            @click="handleSwitchMute"
        />
        <div class="bar">
            <el-slider
                v-model="sliderValue"
                :min="0"
                :max="100"
                :disabled="prop.mute"
                @change="handleChangeVolumn($event as number)"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import BaseImgSprite from '@/views/UI_PUBLIC/components/sprite/BaseImgSprite.vue'

const prop = withDefaults(
    defineProps<{
        volumn: number
        mute: boolean
    }>(),
    {
        volumn: 50,
        mute: false,
    },
)

const sliderValue = ref(prop.volumn)

const emits = defineEmits<{
    /**
     * @param {number} volumn 音量值
     */
    (e: 'update:volumn', volumn: number): void
    /**
     * @param {boolean} mute true: 静音; false: 取消静音
     */
    (e: 'update:mute', mute: boolean): void
}>()

const iconFile = computed(() => {
    return prop.mute ? 'sound_close' : 'sound'
})

const handleChangeVolumn = (event: number) => {
    emits('update:volumn', event)
}

const handleSwitchMute = () => {
    emits('update:mute', !prop.mute)
}

watch(
    () => prop.volumn,
    (value) => {
        console.log('watch!', value)
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
