<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-02 18:02:44
 * @Description: POS显示设置
-->
<template>
    <el-dialog
        width="1000"
        :title="Translate('IDCS_DISPLAY_SETTINGS')"
        @close="close"
        @open="open"
    >
        <div class="PosDisplaySetting">
            <ul class="tab">
                <li
                    v-for="(item, key) in pageData.tabOption"
                    :key
                    :class="{ active: key === pageData.tabIndex }"
                    @click="changeTab(key)"
                >
                    {{ item }}
                </li>
            </ul>
            <div class="content">
                <!-- 通用配置 -->
                <div v-show="pageData.tabIndex === 0">
                    <div class="char">
                        <!-- 开始结束字符 -->
                        <div>
                            <el-table
                                v-title
                                :data="startEndCharTableList"
                                height="300"
                            >
                                <el-table-column :label="Translate('IDCS_START_CHAR')">
                                    <template #default="{ row, $index }: TableColumn<SystemPosListStartEndChar>">
                                        <el-input
                                            v-model="row.startChar"
                                            maxlength="63"
                                            :formatter="formatChar"
                                            :parser="formatChar"
                                            @blur="addStartEndCharRow(row, $index)"
                                        />
                                    </template>
                                </el-table-column>
                                <el-table-column :label="Translate('IDCS_END_CHAR')">
                                    <template #default="{ row, $index }: TableColumn<SystemPosListStartEndChar>">
                                        <el-input
                                            v-model="row.endChar"
                                            maxlength="63"
                                            :formatter="formatChar"
                                            :parser="formatChar"
                                            @blur="addStartEndCharRow(row, $index)"
                                        />
                                    </template>
                                </el-table-column>
                                <el-table-column :label="Translate('IDCS_DELETE')">
                                    <template #default="{ $index }: TableColumn<SystemPosListStartEndChar>">
                                        <BaseImgSpriteBtn
                                            file="del"
                                            :disabled="$index === startEndCharTableList.length - 1"
                                            @click="deleteStartEndChar($index)"
                                        />
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                        <!-- 换行符 -->
                        <div>
                            <el-table
                                v-title
                                :data="lineBreakTableList"
                                height="300"
                            >
                                <el-table-column :label="Translate('IDCS_WRAP_CHAR')">
                                    <template #default="{ row, $index }: TableColumn<{ value: string }>">
                                        <el-input
                                            v-model="row.value"
                                            maxlength="63"
                                            :formatter="formatChar"
                                            :parser="formatChar"
                                            @blur="addLineBreakRow(row, $index)"
                                        />
                                    </template>
                                </el-table-column>
                                <el-table-column :label="Translate('IDCS_DELETE')">
                                    <template #default="{ $index }: TableColumn<{ value: string }>">
                                        <BaseImgSpriteBtn
                                            file="del"
                                            :disabled="$index === lineBreakTableList.length - 1"
                                            @click="deleteLineBreak($index)"
                                        />
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                        <!-- 忽略字符 -->
                        <div>
                            <el-table
                                v-title
                                :data="ignoreChareTableList"
                                height="300"
                            >
                                <el-table-column :label="Translate('IDCS_IGNORE_CHAR')">
                                    <template #default="{ row, $index }: TableColumn<{ value: string }>">
                                        <el-input
                                            v-model="row.value"
                                            maxlength="63"
                                            :formatter="formatChar"
                                            :parser="formatChar"
                                            @blur="addIgnoreCharRow(row, $index)"
                                        />
                                    </template>
                                </el-table-column>
                                <el-table-column :label="Translate('IDCS_DELETE')">
                                    <template #default="{ $index }: TableColumn<{ value: string }>">
                                        <BaseImgSpriteBtn
                                            file="del"
                                            :disabled="$index === ignoreChareTableList.length - 1"
                                            @click="deleteIgnoreChar($index)"
                                        />
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                    </div>
                    <el-form
                        v-title
                        :style="{
                            '--form-input-width': '250px',
                        }"
                        class="no-padding"
                    >
                        <el-form-item :label="Translate('IDCS_IGNORE_UPPER')">
                            <el-checkbox v-model="formData.upperCase" />
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_OVERTIME')">
                            <BaseNumberInput
                                v-model="formData.timeOut"
                                :min="5"
                                :max="3600"
                            />
                            <span>s</span>
                        </el-form-item>
                    </el-form>
                </div>
                <!-- 显示位置 -->
                <div v-show="pageData.tabIndex === 1">
                    <div
                        ref="div"
                        class="canvas"
                        @mousedown="handleCanvasMouseDown"
                    >
                        <div
                            class="canvas-rect"
                            :style="{
                                top: `${drawingPosition.Y}px`,
                                left: `${drawingPosition.X}px`,
                                width: `${drawingPosition.width}px`,
                                height: `${drawingPosition.height}px`,
                            }"
                        ></div>
                    </div>
                    <div class="canvas-position">
                        <span>X: {{ drawingPosition.X }}px</span>
                        <span>Y: {{ drawingPosition.Y }}px</span>
                        <span>W: {{ drawingPosition.width }}px</span>
                        <span>H: {{ drawingPosition.height }}px</span>
                    </div>
                </div>
                <!-- 显示模式 -->
                <div v-show="pageData.tabIndex === 2">
                    <div v-if="colorTableList.length">
                        <el-form
                            class="no-padding"
                            :style="{
                                '--form-input-width': '250px',
                            }"
                        >
                            <BaseSelect
                                v-model="pageData.colorTableIndex"
                                :options="colorTableList"
                                :props="{
                                    value: 'index',
                                    label: 'name',
                                }"
                                empty-text=""
                                :persistent="true"
                                @change="play"
                            />
                        </el-form>
                        <div class="player">
                            <BaseVideoPlayer
                                v-if="pageData.tabIndex === 2"
                                ref="playerRef"
                                @ready="handlePlayerReady"
                            />
                        </div>
                        <el-form
                            v-title
                            :style="{
                                '--form-input-width': '250px',
                            }"
                            class="no-padding"
                        >
                            <el-form-item :label="Translate('IDCS_FONT_COLOR')">
                                <BaseImgSpriteBtn
                                    v-for="item in pageData.colorOption"
                                    :key="item.file"
                                    class="color"
                                    :file="item.file"
                                    :active="colorTableList[pageData.colorTableIndex].colorList.includes(item.value)"
                                    @click="changeColor(item.value)"
                                />
                            </el-form-item>
                            <el-form-item>
                                {{ Translate('IDCS_SELECT_CHANNEL_TIP') }}
                            </el-form-item>
                            <el-form-item :label="Translate('IDCS_PRINT_METHOD')">
                                <BaseSelect
                                    v-model="colorTableList[pageData.colorTableIndex].printMode"
                                    :options="pageData.printOption"
                                />
                            </el-form-item>
                            <el-form-item>
                                <el-checkbox
                                    v-model="colorTableList[pageData.colorTableIndex].previewDisplay"
                                    :label="Translate('IDCS_PREVIEW_DISPLAY')"
                                />
                            </el-form-item>
                        </el-form>
                    </div>
                </div>
            </div>
        </div>
        <div class="base-btn-box">
            <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
            <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
        </div>
    </el-dialog>
</template>

<script lang="ts" src="./PosDisplaySettingPop.v.ts"></script>

<style lang="scss" scoped>
.PosDisplaySetting {
    height: 550px;

    .tab {
        padding: 0;
        margin: 0;
        margin-bottom: 10px;
        width: 100%;
        display: flex;

        li {
            list-style: none;
            padding: 5px 15px;
            line-height: 20px;
            font-size: 14px;
            margin-right: 10px;
            cursor: pointer;
            user-select: none;

            &.active {
                color: var(--main-text-active);
                background-color: var(--primary);
            }
        }
    }

    .char {
        width: 100%;
        display: flex;
        margin-bottom: 10px;

        & > div {
            flex-grow: 1;
        }
    }

    .canvas {
        background-color: #eee;
        position: relative;
        width: 704px;
        height: 480px;

        &-rect {
            border: 1px solid #008000;
            background-color: #b9d7fc;
            position: absolute;
            left: 0;
            top: 0;
        }

        &-position {
            margin-top: 5px;
            user-select: none;

            span {
                margin-right: 10px;
            }
        }
    }

    .player {
        margin-top: 10px;
        width: 400px;
        height: 300px;
    }

    .color {
        margin: 0 5px;
    }
}
</style>
