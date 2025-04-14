<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-11-29 09:06:57
 * @Description: 分页器
-->
<template>
    <div
        class="Pagination"
        :class="{ 'is-jumper': layout === 'jumper' }"
    >
        <template v-if="layout === 'pager'">
            <div class="btn">
                <BaseImgSpriteBtn
                    file="pageBtn-first"
                    :disabled="currentPage <= 1"
                    @click="firstPage"
                />
            </div>
            <div class="btn">
                <BaseImgSpriteBtn
                    file="pageBtn-prev"
                    :disabled="currentPage <= 1"
                    @click="prevPage"
                />
            </div>
            <BaseNumberInput
                v-model="inputNumber"
                :min="1"
                :max="totalPage"
                :disabled="totalPage <= 1"
                @keyup.enter="keydownPage(inputNumber)"
            />
            <div class="page-info">{{ currentPage }} / {{ totalPage }}</div>
            <div class="btn">
                <BaseImgSpriteBtn
                    file="pageBtn-next"
                    :disabled="currentPage >= totalPage"
                    @click="nextPage"
                />
            </div>
            <div class="btn">
                <BaseImgSpriteBtn
                    file="pageBtn-last"
                    :disabled="currentPage >= totalPage"
                    @click="lastPage"
                />
            </div>
            <el-select-v2
                :model-value="pageSize"
                :options="arrayToOptions(pageSizes)"
                @update:model-value="changePageSize"
            />
            <div class="sizes-info">{{ startItem }} - {{ endItem }} / {{ total }}</div>
        </template>
        <template v-if="layout === 'jumper'">
            <div
                class="btn-prev"
                :class="{
                    disabled: currentPage <= 1,
                }"
                @click="prevPage"
            ></div>
            <el-input
                class="jumper-input"
                :model-value="currentPage"
                disabled
            />
            <div
                class="btn-next"
                :class="{
                    disabled: currentPage >= totalPage,
                }"
                @click="nextPage"
            ></div>
            <div class="jumper-info">
                {{ Translate('IDCS_JUMP_TERM_AND_ALL').formatForLang(total) }}
            </div>
            <BaseNumberInput
                v-model="jumpNumber"
                :min="1"
                :max="totalPage"
                :disabled="totalPage <= 1"
                @keyup.enter="keydownPage(jumpNumber)"
            />
            <div
                class="btn-next jumper-btn"
                @click="keydownPage(jumpNumber)"
            ></div>
        </template>
    </div>
</template>

<script lang="ts" setup>
import { arrayToOptions } from '@/utils/tools'

const prop = withDefaults(
    defineProps<{
        /**
         * @property 当前页页码
         */
        currentPage?: number
        /**
         * @property 每页行数
         */
        pageSize?: number
        /**
         * @property 每页行数可选项
         */
        pageSizes?: number[]
        /**
         * @property 总行数
         */
        total: number
        /**
         * @property Layout
         */
        layout?: 'pager' | 'jumper'
    }>(),
    {
        currentPage: 1,
        pageSize: 10,
        pageSizes: () => [10, 20, 30],
        layout: 'pager',
    },
)

const inputNumber = ref(1)
const jumpNumber = ref<number | undefined>()

const totalPage = computed(() => {
    return Math.max(1, Math.ceil(prop.total / prop.pageSize))
})

const startItem = computed(() => {
    if (prop.total === 0) {
        return 0
    }
    return (prop.currentPage - 1) * prop.pageSize + 1
})

const endItem = computed(() => {
    return Math.min(prop.total, prop.currentPage * prop.pageSize)
})

const emits = defineEmits<{
    (e: 'update:pageSize', pageSize: number): void
    (e: 'update:currentPage', currentPage: number): void
    (e: 'currentChange', currentPage: number): void
    (e: 'sizeChange', pageSize: number): void
}>()

/**
 * @description 改变每页行数
 * @param {number} pageSize
 */
const changePageSize = (pageSize: number) => {
    emits('update:pageSize', pageSize)
    emits('sizeChange', pageSize)
}

/**
 * @description 输入页码
 * @param {number} currentPage
 */
const keydownPage = (currentPage?: number) => {
    if (currentPage === undefined) {
        return
    }

    if (currentPage > totalPage.value) {
        inputNumber.value = totalPage.value
    }

    if (currentPage < 1) {
        inputNumber.value = 1
    }

    inputNumber.value = currentPage

    changeCurrentPage(inputNumber.value)
}

/**
 * @description 切换页码
 * @param {number} currentPage
 */
const changeCurrentPage = (currentPage: number) => {
    emits('update:currentPage', currentPage)
    emits('currentChange', currentPage)
}

/**
 * @description 跳转首页
 */
const firstPage = () => {
    changeCurrentPage(1)
}

/**
 * @description 上一页
 */
const prevPage = () => {
    if (prop.currentPage <= 1) {
        return
    }

    changeCurrentPage(prop.currentPage - 1)
}

/**
 * @description 下一页
 */
const nextPage = () => {
    if (prop.currentPage >= totalPage.value) {
        return
    }

    changeCurrentPage(prop.currentPage + 1)
}

/**
 * @description 跳转尾页
 */
const lastPage = () => {
    changeCurrentPage(totalPage.value)
}

watch(
    () => prop.currentPage,
    () => {
        inputNumber.value = prop.currentPage
    },
)
</script>

<style lang="scss" scoped>
.Pagination {
    display: flex;
    height: 26px;
    align-items: center;

    .btn {
        width: 19px;
        height: 19px;
        overflow: hidden;
        border: 1px solid var(--pagination-border);
        margin: 0 2px;

        :deep(.Sprite) {
            transform: translate3d(-11px, -11px, 0);
        }

        &:hover {
            border-color: var(--pagination-border-hover);
        }

        &:has(.disabled) {
            border-color: var(--pagination-border-disabled);
        }
    }

    .btn-prev {
        border: 8px solid transparent;
        font-size: 0;
        width: 0;
        height: 0;
        line-height: 0;
        cursor: pointer;
        position: relative;
        border-right: 8px solid var(--pagination-border);
        margin-right: 10px;

        &::after {
            content: '';
            border: 4px solid transparent;
            position: absolute;
            width: 0;
            height: 0;
            top: -4px;
            left: 0;
            border-right: 4px solid var(--table-expand-bg);
        }

        &:hover {
            border-right-color: var(--pagination-border-hover);
        }

        &.disabled {
            border-right-color: var(--pagination-border-disabled);
        }
    }

    .btn-next {
        border: 8px solid transparent;
        font-size: 0;
        width: 0;
        height: 0;
        line-height: 0;
        cursor: pointer;
        position: relative;
        border-left: 8px solid var(--pagination-border);
        margin-left: 10px;

        &::after {
            content: '';
            border: 4px solid transparent;
            position: absolute;
            width: 0;
            height: 0;
            top: -4px;
            right: 0;
            border-left: 4px solid var(--table-expand-bg);
        }

        &:hover {
            border-left-color: var(--pagination-border-hover);
        }

        &.disabled {
            border-left-color: var(--pagination-border-disabled);
        }
    }

    .jumper-btn {
        &::before {
            content: '';
            position: absolute;
            top: -10px;
            left: -16px;
            width: 19px;
            height: 19px;
            border: 1px solid var(--pagination-border);
        }
    }

    .el-select {
        width: 60px;
        margin-left: 10px;
    }

    #n9web & .BaseNumberInput {
        width: 50px;
        margin: 0 5px;
    }

    #n9web & .el-input {
        width: 50px;
        margin: 0 5px;

        :deep(.el-input__inner) {
            text-align: center;
        }
    }

    .page-info {
        margin: 0 5px;
        flex-shrink: 0;
    }

    .sizes-info {
        width: 130px;
        text-align: right;
    }

    .jumper-info {
        margin-left: 5px;
    }
}
</style>
