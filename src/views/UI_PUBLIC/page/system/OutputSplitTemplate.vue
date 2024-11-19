<!--
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-25 13:55:36
 * @Description: 分屏模版
-->
<template>
    <div
        class="Template"
        :class="[`seg${segment}`, type]"
    >
        <template v-if="type === 'screen'">
            <div
                v-for="index in segment"
                :key="index"
                :style="{
                    'grid-area': `s${index}`,
                }"
                :class="{
                    active: activeWin === index - 1,
                }"
                @click.prevent="handleClick(index - 1)"
                @dragover.prevent="handleDragOver(index - 1)"
                @contextmenu="handleMouseDown($event, index - 1)"
                @drop="handleDrop($event, index - 1)"
            >
                <div>{{ winData[index - 1].value }}</div>
            </div>
            <section
                v-show="isContextMenu"
                class="mouse_menu"
                :style="{
                    top: `${y}px`,
                    left: `${x}px`,
                }"
                @click="clear"
            >
                {{ Translate('IDCS_CLEAR_AWAY') }}
            </section>
        </template>
        <template v-else>
            <div
                v-for="index in segment"
                :key="index"
                :class="{ active: activeView }"
                :style="{ 'grid-area': `s${index}` }"
            ></div>
        </template>
    </div>
</template>

<script lang="ts" src="./OutputSplitTemplate.v.ts"></script>

<style lang="scss" scoped>
.Template {
    width: 100%;
    height: 100%;
    display: grid;
    background-color: var(--main-bg);

    & > div {
        justify-items: center;
        align-content: center;
        border: 1px solid var(--content-border);

        div {
            width: 100%;
            text-align: center;
        }
    }

    &.screen {
        background-color: var(--color-black);
        color: var(--color-white);

        & > div {
            &:hover,
            &.active {
                border-color: var(--primary);
            }
        }
    }

    &.thumbail > div {
        border-color: var(--content-border);

        &.active {
            border-color: var(--primary);
        }
    }

    &.seg1 {
        grid-template-rows: repeat(1, 100%);
        grid-template-columns: repeat(1, 100%);
        grid-template-areas: 's1';
    }

    &.seg4 {
        grid-template-rows: repeat(2, 50%);
        grid-template-columns: repeat(2, 50%);
        grid-template-areas:
            's1 s2'
            's3 s4';
    }

    &.seg6 {
        grid-template-rows: repeat(3, 33.3%);
        grid-template-columns: repeat(3, 33.3%);
        grid-template-areas:
            's1 s1 s2'
            's1 s1 s3'
            's4 s5 s6';
    }

    &.seg8 {
        grid-template-rows: repeat(4, 25%);
        grid-template-columns: repeat(4, 25%);
        grid-template-areas:
            's1 s1 s1 s2'
            's1 s1 s1 s3'
            's1 s1 s1 s4'
            's5 s6 s7 s8';
    }

    &.seg9 {
        grid-template-rows: repeat(3, 33.3%);
        grid-template-columns: repeat(3, 33.3%);
        grid-template-areas:
            's1 s2 s3'
            's4 s5 s6'
            's7 s8 s9';
    }

    &.seg13 {
        grid-template-rows: repeat(4, 25%);
        grid-template-columns: repeat(4, 25%);
        grid-template-areas:
            's1  s2  s3  s4'
            's5  s6  s6  s7'
            's8  s6  s6  s9'
            's10 s11 s12 s13';
    }

    &.seg16 {
        grid-template-rows: repeat(4, 25%);
        grid-template-columns: repeat(4, 25%);
        grid-template-areas:
            's1  s2  s3  s4'
            's5  s6  s7  s8'
            's9  s10 s11 s12'
            's13 s14 s15 s16';
    }

    &.seg25 {
        grid-template-rows: repeat(4, 20%);
        grid-template-columns: repeat(4, 20%);
        grid-template-areas:
            's1  s2  s3  s4  s5'
            's6  s7  s8  s9  s10'
            's11 s12 s13 s14 s15'
            's16 s17 s18 s19 s20'
            's21 s22 s23 s24 s25';
    }

    &.seg32 {
        grid-template-rows: repeat(7, 14.2857%);
        grid-template-columns: repeat(7, 14.2857%);
        grid-template-areas:
            's1  s1  s2  s2  s3  s4  s5'
            's1  s1  s2  s2  s6  s7  s8'
            's9  s9  s10 s10 s10 s11 s12'
            's9  s9  s10 s10 s10 s13 s14'
            's15 s16 s10 s10 s10 s17 s18'
            's19 s20 s21 s22 s23 s24 s25'
            's26 s27 s28 s29 s30 s31 s32';
    }

    &.seg36 {
        grid-template-rows: repeat(6, 16.66%);
        grid-template-columns: repeat(6, 16.66%);
        grid-template-areas:
            's1  s2  s3  s4  s5  s6'
            's7  s8  s9  s10 s11 s12'
            's13 s14 s15 s16 s17 s18'
            's19 s20 s21 s22 s23 s24'
            's25 s26 s27 s28 s29 s30'
            's31 s32 s33 s34 s35 s36';
    }

    &.seg64 {
        grid-template-rows: repeat(8, 12.5%);
        grid-template-columns: repeat(8, 12.5%);
        grid-template-areas:
            's1  s2  s3  s4  s5  s6  s7  s8'
            's9  s10 s11 s12 s13 s14 s15 s16'
            's17 s18 s19 s20 s21 s22 s23 s24'
            's25 s26 s27 s28 s29 s30 s31 s32'
            's33 s34 s35 s36 d37 s38 s39 s40'
            's41 s42 s43 s44 s45 s46 s47 s48'
            's49 s50 s51 s52 s53 s54 s55 s56'
            's57 s58 s59 s60 s61 s62 s63 s64';
    }

    .mouse_menu {
        position: fixed;
        left: 0;
        top: 0;
        width: 150px;
        height: 30px;
        text-align: center;
        line-height: 30px;
        cursor: pointer;
        z-index: 10;
        background-color: var(--main-bg);
        color: var(--main-text);

        &:hover {
            background-color: var(--primary);
            color: var(--main-text-active);
        }
    }
}
</style>
