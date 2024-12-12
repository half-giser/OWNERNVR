<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-11-29 09:06:57
 * @Description: 分页器
-->
<template>
    <div class="Pagination">
        <div
            class="btn"
            @click="firstPage"
        >
            <BaseImgSprite
                file="pageBtn"
                :index="0"
                :hover-index="1"
                :disabled-index="3"
                :chunk="16"
                :disabled="currentPage <= 1"
            />
        </div>
        <div
            class="btn"
            @click="prevPage"
        >
            <BaseImgSprite
                file="pageBtn"
                :index="4"
                :hover-index="5"
                :disabled-index="7"
                :chunk="16"
                :disabled="currentPage <= 1"
            />
        </div>
        <BaseNumberInput
            v-model="inputNumber"
            :min="1"
            :max="totalPage"
            :disabled="totalPage <= 1"
            @keydown.enter="keydownPage(inputNumber)"
        />
        <div class="page-info">{{ currentPage }} / {{ totalPage }}</div>
        <div
            class="btn"
            @click="nextPage"
        >
            <BaseImgSprite
                file="pageBtn"
                :index="8"
                :hover-index="9"
                :disabled-index="11"
                :chunk="16"
                :disabled="currentPage >= totalPage"
            />
        </div>
        <div
            class="btn"
            @click="lastPage"
        >
            <BaseImgSprite
                file="pageBtn"
                :index="12"
                :hover-index="13"
                :disabled-index="15"
                :chunk="16"
                :disabled="currentPage >= totalPage"
            />
        </div>
        <el-select-v2
            v-show="layout.includes('sizes')"
            :model-value="pageSize"
            :options="arrayToOptions(pageSizes)"
            @update:model-value="changePageSize"
        />
        <div
            v-show="layout.includes('total')"
            class="item-info"
        >
            {{ startItem }} - {{ endItem }} / {{ total }}
        </div>
    </div>
</template>

<script lang="ts" setup>
import { arrayToOptions } from '@/utils/tools'

const prop = withDefaults(
    defineProps<{
        currentPage?: number
        pageSize?: number
        pageSizes?: number[]
        total: number
        layout?: string
    }>(),
    {
        currentPage: 1,
        pageSize: 10,
        pageSizes: () => [10, 20, 30],
        layout: 'prev, pager, next, sizes, total',
    },
)

const inputNumber = ref(1)

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

const changePageSize = (pageSize: number) => {
    emits('update:pageSize', pageSize)
    emits('sizeChange', pageSize)
}

const keydownPage = (currentPage: number) => {
    if (currentPage > totalPage.value) {
        inputNumber.value = totalPage.value
    }

    if (currentPage < 1) {
        inputNumber.value = 1
    }

    changeCurrentPage(inputNumber.value)
}

const changeCurrentPage = (currentPage: number) => {
    emits('update:currentPage', currentPage)
    emits('currentChange', currentPage)
}

const firstPage = () => {
    if (prop.currentPage <= 1) {
        return
    }

    changeCurrentPage(1)
}

const prevPage = () => {
    if (prop.currentPage <= 1) {
        return
    }

    changeCurrentPage(prop.currentPage - 1)
}

const nextPage = () => {
    if (prop.currentPage >= totalPage.value) {
        return
    }

    changeCurrentPage(prop.currentPage + 1)
}

const lastPage = () => {
    if (prop.currentPage >= totalPage.value) {
        return
    }

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
        width: 24px;
        height: 24px;
        overflow: hidden;
        border: 1px solid var(--pagination-border);
        margin: 0 2px;

        :deep(.Sprite) {
            transform: translate3d(-8px, -8px, 0);
        }

        &:hover {
            border-color: var(--pagination-border-hover);
        }

        &:has(.disabled) {
            border-color: var(--pagination-border-disabled);
        }
    }

    .el-select {
        width: 80px;
        margin-left: 10px;
    }

    .el-input-number {
        width: 80px;
        margin: 0 5px;
    }

    .page-info {
        margin: 0 5px;
    }

    .item-info {
        width: 130px;
        text-align: right;
    }
}
</style>
