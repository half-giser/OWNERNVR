<!--
 * @Date: 2025-05-07 20:31:20
 * @Description: IP Speaker 工具栏
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <el-input
        v-model="msg"
        class="base-toolbar-input"
        :placeholder="Translate('IDCS_SEARCH')"
        @keydown.enter="search"
    />
    <BaseImgSprite
        file="toolbar_search"
        class="base-toolbar-btn"
        :title="Translate('IDCS_SEARCH')"
        @click="search"
    />

    <el-button @click="del">
        {{ Translate('IDCS_DELETE') }}
    </el-button>

    <el-button @click="add">
        {{ Translate('IDCS_ADD') }}
    </el-button>
</template>

<script lang="ts">
export default defineComponent({
    emits: {
        toolBarEvent(data: ConfigToolBarEvent<SearchToolBarEvent | undefined>) {
            return !!data
        },
    },

    setup(_props, ctx) {
        const msg = ref('')
        const layoutStore = useLayoutStore()

        const search = () => {
            ctx.emit('toolBarEvent', {
                type: 'search',
                data: {
                    searchText: msg.value,
                },
            })
        }

        const add = () => {
            ctx.emit('toolBarEvent', {
                type: 'add',
                data: undefined,
            })
        }

        const del = () => {
            ctx.emit('toolBarEvent', {
                type: 'del',
                data: undefined,
            })
        }

        watch(
            () => layoutStore.isIpSpeakerAddPop,
            (val) => {
                if (val) {
                    add()
                }
            },
        )

        onMounted(() => {
            if (layoutStore.isIpSpeakerAddPop) {
                add()
            }
        })

        onBeforeUnmount(() => {
            layoutStore.isIpSpeakerAddPop = false
        })

        return {
            msg,
            search,
            add,
            del,
        }
    },
})
</script>
