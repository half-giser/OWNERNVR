<!--
 * @Date: 2025-05-19 20:57:10
 * @Description: 目标搜索框
 * @Author: yejiahao yejiahao@tvt.net.cn
-->
<template>
    <div
        v-show="visible"
        class="target hide-ocx"
    >
        <div
            v-for="item in targetData"
            :key="item.detectIndex"
            class="target-wrap"
        >
            <img :src="displayImg(item.detectImgInfo.imgData)" />
            <div
                v-for="targetItem in item.targetList"
                :key="targetItem.targetId"
                class="target-box"
                :style="getStyle(targetItem)"
            >
                <BaseImgSprite
                    file="target_retrieval"
                    :index="2"
                    :hover-index="2"
                    :chunk="4"
                    class="target-btn"
                    @click="search(item.detectImgInfo, targetItem)"
                />
            </div>
        </div>
        <p
            v-show="pageData.isFailTip"
            class="target-error"
        >
            {{ Translate('IDCS_REID_PROC_FAIL') }}
        </p>
    </div>
</template>

<script lang="ts" setup>
import fetch from '@/api/api'

const prop = withDefaults(
    defineProps<{
        visible: boolean
        type: 'live' | 'record' | 'image'
        pic?: string
        snapPic?: () => Promise<string>
        mode: string
        winIndex: number
        chlId?: string
        startTime?: number
        endTime?: number
    }>(),
    {
        pic: '',
        snapPic: () => Promise.resolve(''),
        chlId: '',
        startTime: 0,
        endTime: 0,
    },
)

const emits = defineEmits<{
    (e: 'search', data: ExtraceTargetDto[]): void
    (e: 'update:visible', visible: boolean): void
}>()

const { Translate } = useLangStore()

type ExtraceTargetDto = {
    targetType: string
    targetFeatureIndex: number
    targetFeatureData: string
    imgBase64: string
}

type TargetDto = {
    detectIndex: number
    detectImgInfo: TargetImgInfo
    targetList: TargetListDto[]
}

type TargetImgInfo = {
    detectIndex: number
    imgWidth: number
    imgHeight: number
    imgFormat: string
    imgData: string
}

type TargetListDto = {
    targetId: number
    targetType: string
    rect: {
        leftTop: {
            x: number
            y: number
        }
        rightBottom: {
            x: number
            y: number
        }
        scaleWidth: number
        scaleHeight: number
    }
    featurePointInfos: {
        faceFeatureIndex: string
        x: number
        y: number
    }[]
}

const pageData = ref({
    isFailTip: false,
    activeTargetIndex: -1,
})

const ocxBase64 = ref('')

const targetData = ref<TargetDto[]>([])

const plugin = usePlugin({
    onMessage($, stateType) {
        if (stateType === 'TakePhotoBase64') {
            const bmpDataBase64 = $('statenotify').text()
            if (bmpDataBase64) {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')!
                const img = new Image()
                img.onload = () => {
                    canvas.height = img.height
                    canvas.width = img.width
                    ctx.drawImage(img, 0, 0)
                    const imgDataUrl = canvas.toDataURL('image/jpg', 1)
                    const imgBase64 = imgDataUrl.split(',').pop()!
                    ocxBase64.value = imgBase64
                }
                img.src = 'data:image/bmp;base64,' + bmpDataBase64
            } else {
                handleDetectResultFail('snapFail')
            }
        }
    },
})

let imgRender: ReturnType<typeof WasmImageRender>

const getSwitch = async () => {
    openLoading()

    try {
        const result = await queryREIDCfg()
        const $ = queryXml(result)

        closeLoading()

        const switchType = $('content/switch').text().bool()
        if (!switchType) {
            handleNoSwitch()
        } else {
            setDetectImg()
        }
    } catch (e) {
        handleNoSwitch()
    }
}

const setDetectImg = async () => {
    try {
        openLoading()
        const base64Img = await getSnapPic()
        const size = await getImgSize(base64Img)
        const detectImg = {
            detectIndex: 1, // 图片序号：这个index与detectTarget协议返回的"detectResultInfos下的Item的index"一一对应，也与与extractTraget协议返回的"extractImgInfos下的item的index"一一对应
            imgWidth: size.width, // 图片宽
            imgHeight: size.height, // 图片高
            imgFormat: 'jpg', // 当前仅支持JPG
            imgData: base64Img, // 图片base64
        }
        await getDetectResultInfos([detectImg])
        closeLoading()
    } catch {
        handleDetectResultFail('snapFail')
    }
}

const handleNoSwitch = () => {
    openMessageBox({
        type: 'question',
        message: Translate('IDCS_REID_ENABLE_TIP'),
    }).then(async () => {
        const sendXml = rawXml`
            <content>
                <switch>true</switch>
            </content>
        `
        await editREIDCfg(sendXml)
        setDetectImg()
    })
}

const getSnapPic = async () => {
    return new Promise(async (resolve: (base64: string) => void, reject) => {
        if (prop.type === 'live') {
            if (prop.mode === 'h5') {
                const base64 = await prop.snapPic()
                if (base64) {
                    resolve(base64)
                } else {
                    reject()
                }
                return
            }

            if (prop.mode === 'ocx') {
                const sendXML = OCX_XML_TakePhotoBase64ByWinIndex(prop.winIndex)
                plugin.ExecuteCmd(sendXML)
                const stopWatch = watch(ocxBase64, (data) => {
                    resolve(data)
                    stopWatch()
                })
            }
        }

        if (prop.type === 'record') {
            imgRender?.destroy()
            imgRender = WasmImageRender({
                type: 'targetSearch',
                ready: async () => {
                    const sendXML = rawXml`
                        <condition>
                            <chlId>${prop.chlId}</chlId>
                            <startTimeEx>${localToUtc(prop.startTime)}</startTimeEx>
                            <endTimeEx>${localToUtc(prop.endTime)}</endTimeEx>
                            <diskType>write</diskType>
                            <streamType>main</streamType>
                        </condition>
                    `
                    const result = await queryChlSnapPicture(sendXML)
                    const $ = queryXml(result)
                    if ($('status').text() === 'success') {
                        const encodingType = $('content/encodingType').text()

                        const codecTypeMap: Record<string, number> = {
                            H264: 1, // H264帧
                            H265: 2, // H265帧
                        }
                        const codecType = codecTypeMap[encodingType]
                        const dataBase64 = $('content/data').text()
                        const dataBlob = dataURLToBlob(dataBase64)
                        const reader = new FileReader()
                        reader.onload = () => {
                            const dataArrayBuffer = reader.result as ArrayBuffer
                            if (!dataArrayBuffer) {
                                return
                            }

                            imgRender.render(
                                dataArrayBuffer,
                                (imgUrl) => {
                                    resolve(imgUrl.split(',').pop()!)
                                },
                                codecType,
                            )
                        }
                        reader.readAsArrayBuffer(dataBlob)
                    } else {
                        reject()
                    }
                },
            })
        }

        if (prop.type === 'image') {
            resolve(prop.pic)
        }
    })
}

const getDetectResultInfos = async (detectImgInfos: TargetImgInfo[]) => {
    const sendXml = rawXml`
        <content>
            <detectImgInfos>
                ${detectImgInfos
                    .map((item) => {
                        return rawXml`
                            <item index="${item.detectIndex}">
                                <imgWidth>${item.imgWidth}</imgWidth>
                                <imgHeight>${item.imgHeight}</imgHeight>
                                <imgFormat>${item.imgFormat}</imgFormat>
                                <imgData>${item.imgData}</imgData>
                            </item>
                        `
                    })
                    .join('')}
            </detectImgInfos>
        </content>
    `
    const result = await fetch('detectTarget', sendXml)
    const $ = queryXml(result)
    if ($('status').text() === 'success') {
        // 目标检索框数据结果列表
        targetData.value = $('content/detectResultInfos/Item').map((item) => {
            const $item = queryXml(item.element)
            const detectIndex = item.attr('index').num()
            return {
                detectIndex: detectIndex,
                detectImgInfo: detectImgInfos[0],
                targetList: $item('targetList/item').map((el) => {
                    const $el = queryXml(el.element)
                    return {
                        targetId: el.attr('id').num(),
                        targetType: $el('targetType').text(),
                        rect: {
                            leftTop: {
                                x: $el('rect/leftTop/x').text().num(),
                                y: $el('rect/leftTop/y').text().num(),
                            },
                            rightBottom: {
                                x: $el('rect/rightBottom/x').text().num(),
                                y: $el('rect/rightBottom/y').text().num(),
                            },
                            scaleWidth: $el('rect/scaleWidth').text().num(),
                            scaleHeight: $el('rect/scaleHeight').text().num(),
                        },
                        featurePointInfos: $el('featurePointInfos/item').map((point) => {
                            const $point = queryXml(point.element)
                            return {
                                faceFeatureIndex: point.attr('index'),
                                x: $point('x').text().num(),
                                y: $point('y').text().num(),
                            }
                        }),
                    }
                }),
            }
        })

        if (!targetData.value.length || !targetData.value[0].targetList.length) {
            targetData.value = [
                {
                    detectIndex: detectImgInfos[0].detectIndex,
                    detectImgInfo: detectImgInfos[0],
                    targetList: [],
                },
            ]
            handleDetectResultFail('noTarget')
        }
    } else {
        targetData.value = [
            {
                detectIndex: detectImgInfos[0].detectIndex,
                detectImgInfo: detectImgInfos[0],
                targetList: [],
            },
        ]
        handleDetectResultFail('noTarget')
    }
}

// 获取"通道抓拍图"-失败 或者 根据"通道抓拍图"获取"目标检索框"-失败
const handleDetectResultFail = (failType: string) => {
    closeLoading()

    if (failType === 'snapFail') {
        pageData.value.isFailTip = true
    } else {
        openMessageBox(Translate('IDCS_NOT_DETECT_TARGET') + Translate('IDCS_SELECT_OTHER_TIMEPOINT_RETRY'))
    }
}

const getStyle = (target: TargetListDto) => {
    const left = (target.rect.leftTop.x / target.rect.scaleWidth) * 100
    const top = (target.rect.leftTop.y / target.rect.scaleHeight) * 100
    const width = (Math.abs(target.rect.rightBottom.x - target.rect.leftTop.x) / target.rect.scaleWidth) * 100
    const height = (Math.abs(target.rect.rightBottom.y - target.rect.leftTop.y) / target.rect.scaleHeight) * 100
    return {
        left: left + '%',
        top: top + '%',
        width: width + '%',
        height: height + '%',
        zIndex: target.targetId,
    }
}

const displayImg = (src: string) => {
    return 'data:image/jpg;base64,' + src
}

// 获取图片宽高
const getImgSize = (imgBase64: string) => {
    return new Promise((resolve: (size: { width: number; height: number }) => void) => {
        const img = new Image()
        img.onload = () => {
            const width = img.width
            const height = img.height
            resolve({ width, height })
        }
        img.src = 'data:image/jpg;base64,' + imgBase64
    })
}

const search = async (detectImgInfo: TargetImgInfo, targetItem: TargetListDto) => {
    openLoading()

    const sendXml = rawXml`
        <content>
            <extractImgInfos>
                    <item index="${detectImgInfo.detectIndex}">
                        <imgWidth>${detectImgInfo.imgWidth}</imgWidth>
                        <imgHeight>${detectImgInfo.imgHeight}</imgHeight>
                        <imgFormat>${detectImgInfo.imgFormat}</imgFormat>
                        <imgData>${detectImgInfo.imgData}</imgData>
                        <rect>
                            <leftTop>
                                <x>${targetItem.rect.leftTop.x}</x>
                                <y>${targetItem.rect.leftTop.y}</y>
                            </leftTop>
                            <rightBottom>
                                <x>${targetItem.rect.rightBottom.x}</x>
                                <y>${targetItem.rect.rightBottom.y}</y>
                            </rightBottom>
                            <scaleWidth>${targetItem.rect.scaleWidth}</scaleWidth>
                            <scaleHeight>${targetItem.rect.scaleHeight}</scaleHeight>
                        </rect>
                        <targetType>${targetItem.targetType}</targetType>
                        <featurePointInfos>
                            ${targetItem.featurePointInfos
                                .map((point) => {
                                    return rawXml`
                                        <item index="${point.faceFeatureIndex}">
                                            <x>${point.x}</x>
                                            <y>${point.y}</y>
                                        </item>
                                    `
                                })
                                .join('')}
                        </featurePointInfos>
                    </item>
            </extractImgInfos>
        </content>
    `
    const result = await fetch('extractTraget', sendXml)
    const $ = queryXml(result)
    const img = await cropImage(detectImgInfo, targetItem)

    closeLoading()

    const extractResultInfos = [
        {
            targetType: targetItem.targetType,
            targetFeatureIndex: targetItem.targetId,
            targetFeatureData: $('extractResultInfos/item/featureData').text(),
            imgBase64: img,
        },
    ]

    emits('search', extractResultInfos)
}

const cropImage = async (detectImgInfo: TargetImgInfo, targetItem: TargetListDto) => {
    return new Promise((resolve: (data: string) => void) => {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')!
        const image = new Image()
        image.onload = () => {
            const cropX = (targetItem.rect.leftTop.x / targetItem.rect.scaleWidth) * detectImgInfo.imgWidth
            const cropY = (targetItem.rect.leftTop.y / targetItem.rect.scaleHeight) * detectImgInfo.imgHeight
            const cropWidth = (Math.abs(targetItem.rect.leftTop.x - targetItem.rect.rightBottom.x) / targetItem.rect.scaleWidth) * detectImgInfo.imgWidth
            const cropHeight = (Math.abs(targetItem.rect.leftTop.y - targetItem.rect.rightBottom.y) / targetItem.rect.scaleHeight) * detectImgInfo.imgHeight
            canvas.width = cropWidth
            canvas.height = cropHeight
            context.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight)
            resolve(canvas.toDataURL('image/png').split(',').pop()!)
        }
        image.src = displayImg(detectImgInfo.imgData)
    })
}

watch(
    () => prop.visible,
    async (bool) => {
        if (bool) {
            await getSwitch()
        } else {
            targetData.value = []
            ocxBase64.value = ''
        }
    },
    {
        immediate: true,
    },
)
</script>

<style lang="scss" scoped>
.target {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 5;
    background-color: var(--player-bg);

    &-wrap {
        position: relative;
        width: 100%;
        height: 100%;

        img {
            width: 100%;
            height: 100%;
        }
    }

    &-box {
        position: absolute;
        background:
            linear-gradient(to left, yellow, yellow) left top no-repeat,
            linear-gradient(to bottom, yellow, yellow) left top no-repeat,
            linear-gradient(to left, yellow, yellow) right top no-repeat,
            linear-gradient(to bottom, yellow, yellow) right top no-repeat,
            linear-gradient(to left, yellow, yellow) left bottom no-repeat,
            linear-gradient(to bottom, yellow, yellow) left bottom no-repeat,
            linear-gradient(to left, yellow, yellow) right bottom no-repeat,
            linear-gradient(to left, yellow, yellow) right bottom no-repeat;
        background-size:
            1px 20%,
            20% 1px,
            1px 20%,
            20% 1px;

        &:hover {
            border: 1px solid yellow;
            box-shadow: 0 0 1px 1px yellow;
            background: none;

            .target-btn {
                visibility: visible;
                pointer-events: auto;
            }
        }
    }

    &-btn {
        position: absolute;
        right: 0;
        top: 0;
        visibility: hidden;
        pointer-events: none;
    }

    &-error {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
}
</style>
