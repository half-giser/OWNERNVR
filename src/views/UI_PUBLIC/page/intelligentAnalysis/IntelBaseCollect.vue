<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-09-06 14:22:29
 * @Description: 智能分析 - 添加收藏
-->
<template>
    <div class="collect">
        <BaseDropdown>
            <BaseImgSprite
                file="collect"
                :hover-index="0"
            />
            <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item @click="addCollect">{{ Translate('IDCS_ADD_TO_FAVORITE') }}</el-dropdown-item>
                    <el-dropdown-item
                        v-for="(item, index) in listData"
                        :key="item.name"
                        @click="change(index)"
                    >
                        <div class="dropdown-item">
                            <div class="text-ellipsis">{{ item.name }}</div>
                            <BaseImgSprite
                                file="delete"
                                @click="deleteCollect(index)"
                            />
                        </div>
                    </el-dropdown-item>
                </el-dropdown-menu>
            </template>
        </BaseDropdown>
        <el-dialog
            v-model="pageData.isPop"
            :title="Translate('IDCS_ADD_TO_FAVORITE')"
            width="450"
            append-to-body
            @closed="formRef?.resetFields()"
        >
            <el-form
                ref="formRef"
                v-title
                :model="formData"
                :rules="formRule"
            >
                <el-form-item
                    prop="name"
                    :label="Translate('IDCS_NAME')"
                >
                    <el-input
                        v-model="formData.name"
                        :formatter="formatInput"
                        :parser="formatInput"
                    />
                </el-form-item>
            </el-form>
            <div class="base-btn-box">
                <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
                <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script lang="ts" src="./IntelBaseCollect.v.ts"></script>

<style lang="scss" scoped>
.collect {
    margin-left: 20px;
}

.dropdown-item {
    width: 150px;
    display: flex;
    justify-content: space-between;

    span {
        flex-shrink: 0;
    }
}
</style>
