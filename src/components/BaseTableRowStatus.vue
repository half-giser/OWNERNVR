<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-14 15:36:11
 * @Description: 表格行的状态图标
-->
<template>
    <div>
        <el-tooltip
            :content
            :disabled="!content"
            placement="right"
        >
            <div
                v-if="icon === 'loading'"
                class="loading"
            ></div>
            <BaseImgSprite
                v-else-if="icon"
                :file="icon"
            />
            <span v-else></span>
        </el-tooltip>
    </div>
</template>

<script lang="ts" setup>
const prop = withDefaults(
    defineProps<{
        /**
         * @property {'loading' | 'success' | 'error' | ''} 图标
         */
        icon?: string
        /**
         * @property 失败时候的提示 如果不填，则为默认错误值
         */
        errorText?: string
    }>(),
    {
        icon: '',
    },
)

const { Translate } = useLangStore()

const content = computed(() => {
    if (prop.icon === 'loading') return Translate('IDCS_DEVC_REQUESTING_DATA')
    if (prop.icon === 'success') return Translate('IDCS_SAVE_DATA_SUCCESS')
    if (prop.icon === 'error') return prop.errorText || Translate('IDCS_SAVE_DATA_FAIL')
    return ''
})
</script>

<style lang="scss" scoped>
.loading {
    width: 20px;
    height: 20px;
    background-image: var(--img-loading);
    background-repeat: no-repeat;
    background-size: cover;
}
</style>
