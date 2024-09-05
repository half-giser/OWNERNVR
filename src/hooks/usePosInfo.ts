/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-12 14:52:28
 * @Description: POS信息
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-09-05 16:19:54
 */
import { type TVTPlayerPosInfoItem } from '@/utils/wasmPlayer/tvtPlayer'

/**
 * @description POS信息
 * @param mode 'h5' | 'ocx' | ''
 * @returns
 */
export const usePosInfo = (mode: Ref<string>) => {
    const posInfo: Record<string, TVTPlayerPosInfoItem> = {}

    /**
     * @description 获取POS数据列表
     */
    const getData = async () => {
        const result = await queryPosList()
        const $ = queryXml(result)
        if ($('//status').text() !== 'success') return
        const $systemX = $('//content/itemType/coordinateSystem/X')
        const $systemY = $('//content/itemType/coordinateSystem/Y')
        const width = Number($systemX.attr('max')) - Number($systemX.attr('min'))
        const height = Number($systemY.attr('max')) - Number($systemY.attr('min'))

        $('//channel/chl').forEach((ele) => {
            const chlId = ele.attr('id') as string
            const $ele = queryXml(ele.element)
            const previewDisplay = $ele('previewDisplay').text() === 'true'
            const printMode = $ele('printMode').text()
            posInfo[chlId] = {
                previewDisplay: previewDisplay, // 现场预览是否显示pos
                printMode: printMode as 'page' | 'scroll', // pos显示模式：page翻页/scroll滚屏
                displayPosition: {
                    // pos显示区域
                    x: 0,
                    y: 0,
                    width: width,
                    height: height,
                },
                timeout: 10, // pos超时隐藏时间，默认10秒
            }
        })
        $('//content/item').forEach((ele) => {
            const $ele = queryXml(ele.element)
            const $position = `param/displaySetting/displayPosition/`
            const $triggerChls = $ele('trigger/triggerChl/chls/item')
            const timeout = $ele('param/displaySetting/common/timeOut').text()
            if ($triggerChls.length === 0) return
            const displayPosition = {
                x: Number($ele(`${$position}X`).text()),
                y: Number($ele(`${$position}Y`).text()),
                width: Number($ele(`${$position}width`).text()),
                height: Number($ele(`${$position}height`).text()),
            }
            $triggerChls.forEach((item) => {
                const chlId = item.attr('id')!
                if (posInfo[chlId]) {
                    posInfo[chlId].displayPosition = displayPosition
                    posInfo[chlId].timeout = Number(timeout)
                }
            })
        })
    }

    /**
     * @description 查询通道的POS信息
     * @param {string} chlId
     */
    const getPosInfo = (chlId: string) => {
        if (posInfo[chlId]) {
            return posInfo[chlId]
        }
        return {
            previewDisplay: false,
            printMode: 'page',
            timeout: 10,
            displayPosition: {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
            },
        }
    }

    /**
     * @description 生成OCX命令
     * @param {Boolean} bool
     * @param {Array} chlList
     * @param {String} chlId
     * @param {Number} winIndex
     */
    const getCmd = (bool: boolean, chlId: string, winIndex: number) => {
        const pos = getPosInfo(chlId)
        if (bool) {
            const area = pos.displayPosition
            return OCX_XML_SetPOSDisplayArea(bool, winIndex, area.x, area.y, area.width, area.height, pos.printMode)
        } else {
            return OCX_XML_SetPOSDisplayArea(false, winIndex, 0, 0, 0, 0)
        }
    }

    const stopWatch = watch(
        mode,
        (newVal) => {
            if (newVal === 'ocx') {
                getData()
                stopWatch()
            } else if (newVal === 'h5') {
                stopWatch()
            }
        },
        {
            immediate: true,
        },
    )

    return getCmd
}
