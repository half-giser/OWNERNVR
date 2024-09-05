<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-02 18:02:44
 * @Description: POS显示设置
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-05 15:10:43
-->
<template>
    <el-dialog
        draggable
        center
        width="1000px"
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
                                stripe
                                border
                                :data="startEndCharTableList"
                                height="300px"
                            >
                                <el-table-column :label="Translate('IDCS_START_CHAR')">
                                    <template #default="scope">
                                        <el-input
                                            v-model="scope.row.startChar"
                                            :formatter="formatChar"
                                            :parser="formatChar"
                                            @blur="addStartEndCharRow(scope.row, scope.$index)"
                                        />
                                    </template>
                                </el-table-column>
                                <el-table-column :label="Translate('IDCS_END_CHAR')">
                                    <template #default="scope">
                                        <el-input
                                            v-model="scope.row.endChar"
                                            :formatter="formatChar"
                                            :parser="formatChar"
                                            @blur="addStartEndCharRow(scope.row, scope.$index)"
                                        />
                                    </template>
                                </el-table-column>
                                <el-table-column :label="Translate('IDCS_DELETE')">
                                    <template #default="scope">
                                        <BaseImgSprite
                                            file="del"
                                            :index="2"
                                            :hover-index="0"
                                            :disabled-index="3"
                                            :disabled="scope.$index === startEndCharTableList.length - 1"
                                            :chunk="4"
                                            @click="deleteStartEndChar(scope.$index)"
                                        />
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                        <!-- 换行符 -->
                        <div>
                            <el-table
                                stripe
                                border
                                :data="lineBreakTableList"
                                height="300px"
                            >
                                <el-table-column :label="Translate('IDCS_WRAP_CHAR')">
                                    <template #default="scope">
                                        <el-input
                                            v-model="scope.row.value"
                                            :formatter="formatChar"
                                            :parser="formatChar"
                                            @blur="addLineBreakRow(scope.row, scope.$index)"
                                        />
                                    </template>
                                </el-table-column>
                                <el-table-column :label="Translate('IDCS_DELETE')">
                                    <template #default="scope">
                                        <BaseImgSprite
                                            file="del"
                                            :index="2"
                                            :hover-index="0"
                                            :disabled-index="3"
                                            :disabled="scope.$index === lineBreakTableList.length - 1"
                                            :chunk="4"
                                            @click="deleteLineBreak(scope.$index)"
                                        />
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                        <!-- 忽略字符 -->
                        <div>
                            <el-table
                                stripe
                                border
                                :data="ignoreChareTableList"
                                height="300px"
                            >
                                <el-table-column :label="Translate('IDCS_IGNORE_CHAR')">
                                    <template #default="scope">
                                        <el-input
                                            v-model="scope.row.value"
                                            @blur="addIgnoreCharRow(scope.row, scope.$index)"
                                        />
                                    </template>
                                </el-table-column>
                                <el-table-column :label="Translate('IDCS_DELETE')">
                                    <template #default="scope">
                                        <BaseImgSprite
                                            file="del"
                                            :index="2"
                                            :hover-index="0"
                                            :disabled-index="3"
                                            :disabled="scope.$index === ignoreChareTableList.length - 1"
                                            :chunk="4"
                                            @click="deleteIgnoreChar(scope.row)"
                                        />
                                    </template>
                                </el-table-column>
                            </el-table>
                        </div>
                    </div>
                    <el-form
                        class="narrow"
                        label-width="150px"
                        label-position="left"
                        :style="{
                            '--form-input-width': '340px',
                        }"
                    >
                        <el-form-item :label="Translate('IDCS_IGNORE_UPPER')">
                            <el-checkbox v-model="formData.upperCase"></el-checkbox>
                        </el-form-item>
                        <el-form-item :label="Translate('IDCS_OVERTIME')">
                            <el-input-number
                                v-model="formData.timeOut"
                                :min="5"
                                :max="3600"
                                :controls="false"
                            />
                            <span class="overtime">s</span>
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
                        <el-select
                            v-model="pageData.colorTableIndex"
                            @change="play"
                            @visible-change="toggleOCX"
                        >
                            <el-option
                                v-for="(item, key) in colorTableList"
                                :key
                                :value="key"
                                :label="item.name"
                            />
                        </el-select>
                        <div class="player">
                            <BaseVideoPlayer
                                v-if="pageData.tabIndex === 2"
                                ref="playerRef"
                                :split="1"
                                @onready="handlePlayerReady"
                            />
                        </div>
                        <el-form
                            class="narrow"
                            label-position="left"
                            :style="{
                                '--form-input-width': '340px',
                            }"
                        >
                            <el-form-item :label="Translate('IDCS_FONT_COLOR')">
                                <BaseImgSprite
                                    v-for="item in pageData.colorOption"
                                    :key="item.file"
                                    class="color"
                                    :file="item.file"
                                    :index="colorTableList[pageData.colorTableIndex].colorList.includes(item.value) ? 2 : 0"
                                    :chunk="4"
                                    @click="changeColor(item.value)"
                                />
                            </el-form-item>
                            <el-form-item>
                                {{ Translate('IDCS_SELECT_CHANNEL_TIP') }}
                            </el-form-item>
                            <el-form-item :label="Translate('IDCS_PRINT_METHOD')">
                                <el-select v-model="colorTableList[pageData.colorTableIndex].printMode">
                                    <el-option
                                        v-for="item in pageData.printOption"
                                        :key="item.value"
                                        :label="item.label"
                                        :value="item.value"
                                    />
                                </el-select>
                            </el-form-item>
                            <el-form-item>
                                <el-checkbox v-model="colorTableList[pageData.colorTableIndex].previewDisplay">{{ Translate('IDCS_PREVIEW_DISPLAY') }}</el-checkbox>
                            </el-form-item>
                        </el-form>
                    </div>
                </div>
            </div>
        </div>
        <template #footer>
            <el-row>
                <el-col
                    :span="24"
                    class="el-col-flex-end"
                >
                    <el-button @click="verify">{{ Translate('IDCS_OK') }}</el-button>
                    <el-button @click="close">{{ Translate('IDCS_CANCEL') }}</el-button>
                </el-col>
            </el-row>
        </template>
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
            padding: 5px 15px 5px 15px;
            line-height: 20px;
            font-size: 14px;
            margin-right: 10px;
            cursor: pointer;
            user-select: none;

            &.active {
                color: #fff;
                background-color: #00bbdb;
            }
        }
    }

    .overtime {
        margin-left: 5px;
    }

    .char {
        width: 100%;
        display: flex;
        margin-bottom: 10px;

        & > div {
            flex-grow: 1;
            // width: 33.33%;
        }
    }

    .canvas {
        background-color: #eeeeee;
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

    :deep(.el-select) {
        width: 200px;
    }
}
</style>
