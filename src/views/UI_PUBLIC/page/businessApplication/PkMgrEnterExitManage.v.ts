/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-05-29 21:21:34
 * @Description: 业务应用-停车场管理-出入口
 */

import { ArrowDown } from '@element-plus/icons-vue'
import { type directionType, type screenType } from '@/types/apiType/business'
import { PkMgrEnterExitManagePageData, PkMgrEnterExitManageItem } from '@/types/apiType/business'

export default defineComponent({
    components: {
        ArrowDown,
    },
    setup() {
        // 多语言翻译方法
        const { Translate } = useLangStore()
        // 页面Loading
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        // 提示弹框
        const { openMessageTipBox } = useMessageBox()
        // 系统能力集
        const cababilityStore = useCababilityStore()

        // 页面初始数据
        const pageData = reactive<PkMgrEnterExitManagePageData>(new PkMgrEnterExitManagePageData())
        let originalPageData = new PkMgrEnterExitManagePageData()
        let changeDataFlg = false

        // 获取数据-更新页面初始数据
        async function getPageData() {
            const result = await queryParkingLotConfig()
            return result
        }

        // 获取数据-更新在线通道数据
        async function getOnlineChlList() {
            const result = await queryOnlineChlList()
            StartRefreshChlStatus()
            return result
        }
        // 通道树状态刷新定时器
        let ChlStatusRefreshTimer: NodeJS.Timeout | null = null
        // 通道树状态刷新定时器-开启
        function StartRefreshChlStatus() {
            if (ChlStatusRefreshTimer) {
                StopRefreshChlStatus()
            }
            ChlStatusRefreshTimer = setTimeout(() => {
                getOnlineChlList().then((result) => {
                    const resultXml = queryXml(result)
                    if (resultXml('status').text() === 'success') {
                        resultXml('//content/item').forEach((ele1) => {
                            pageData.tableDatas.forEach((ele2: PkMgrEnterExitManageItem) => {
                                if (ele2.id === ele1.attr('id')) {
                                    ele2.ipcStatus = 'online'
                                }
                            })
                        })
                    }
                })
            }, 5000)
        }
        // 通道树状态刷新定时器-销毁
        function StopRefreshChlStatus() {
            clearTimeout(ChlStatusRefreshTimer as NodeJS.Timeout)
            ChlStatusRefreshTimer = null
        }

        // 查询-发起请求
        openLoading(LoadingTarget.FullScreen)
        Promise.all([getPageData(), getOnlineChlList()]).then((resultArr) => {
            closeLoading(LoadingTarget.FullScreen)
            type XMLResult = Element | XMLDocument | null
            const result1Xml = queryXml(resultArr[0] as XMLResult)
            const result2Xml = queryXml(resultArr[1] as XMLResult)
            if (result1Xml('status').text() === 'success' && result2Xml('status').text() === 'success') {
                // 页面数据
                pageData.tableDatas = []
                result1Xml('//content/entryLeaveConfig/item').forEach((ele, idx) => {
                    const eleXml = queryXml(ele.element)
                    const pkMgrEnterExitManageItem = new PkMgrEnterExitManageItem()
                    pkMgrEnterExitManageItem.id = ele.attr('id')!
                    pkMgrEnterExitManageItem.serialNum = idx + 1
                    pkMgrEnterExitManageItem.channelName = eleXml('channelName').text()
                    pkMgrEnterExitManageItem.direction = eleXml('direction').text()
                    pkMgrEnterExitManageItem.ip = eleXml('ip').text()
                    pkMgrEnterExitManageItem.ipc = `${eleXml('channelName').text()} ( ${eleXml('ip').text()} ) `
                    pkMgrEnterExitManageItem.ipcStatus = 'offline'
                    pkMgrEnterExitManageItem.enableLEDScreen = eleXml('enableLEDScreen').text() === 'true'
                    pkMgrEnterExitManageItem.enableLEDScreenValid = eleXml('enableLEDScreen').length > 0 && cababilityStore.supportParkingLotLEDVisible
                    pkMgrEnterExitManageItem.LEDScreenType = eleXml('LEDScreenType').text() || ''
                    pkMgrEnterExitManageItem.LEDScreenTypeValid = eleXml('LEDScreenType').length > 0 && cababilityStore.supportParkingLotLEDVisible
                    pageData.tableDatas.push(pkMgrEnterExitManageItem)
                })
                pageData.screenList = []
                result1Xml('//types/LEDScreenType/enum').forEach((ele) => {
                    const enterExitScreen = {} as SelectItem
                    enterExitScreen.value = ele.text() // LED屏-值
                    enterExitScreen.label = pageData.screenMap[ele.text() as screenType] // LED屏-展示文本
                    pageData.screenList.push(enterExitScreen)
                })
                pageData.directionList = []
                result1Xml('//types/directionType/enum').forEach((ele) => {
                    const enterExitDirection = {} as SelectItem
                    enterExitDirection.value = ele.text()
                    enterExitDirection.label = pageData.directionMap[ele.text() as directionType]
                    pageData.directionList.push(enterExitDirection)
                })
                // 备份原始数据
                originalPageData = JSON.parse(JSON.stringify(pageData))
                // 在线通道数据
                result2Xml('//content/item').forEach((ele1) => {
                    pageData.tableDatas.forEach((ele2: PkMgrEnterExitManageItem) => {
                        if (ele2.id === ele1.attr('id')) {
                            ele2.ipcStatus = 'online'
                        }
                    })
                })
            }
        })

        // 校验数据是否被修改
        function compareDataChange(pageData: PkMgrEnterExitManagePageData, originalPageData: PkMgrEnterExitManagePageData) {
            changeDataFlg = false
            for (let i = 0; i < pageData.tableDatas.length; i++) {
                const ele1 = pageData.tableDatas[i]
                const ele2 = originalPageData.tableDatas[i]
                if (ele1.direction !== ele2.direction || ele1.enableLEDScreen !== ele2.enableLEDScreen || ele1.LEDScreenType !== ele2.LEDScreenType) {
                    changeDataFlg = true
                    break
                }
            }
        }

        // 编辑-下发编辑协议
        function apply() {
            compareDataChange(pageData, originalPageData)
            if (changeDataFlg) {
                let sendXml = '<content><entryLeaveConfig>'
                pageData.tableDatas.forEach((ele: PkMgrEnterExitManageItem) => {
                    sendXml += `<item id="${ele.id}">
                        <channelName>${ele.channelName}</channelName>
                        <direction>${ele.direction}</direction>
                        <ip>${ele.ip}</ip>
                        ${ele.enableLEDScreenValid ? '<enableLEDScreen>' + ele.enableLEDScreen + '</enableLEDScreen>' : ''}
                        ${ele.LEDScreenTypeValid ? '<LEDScreenType>' + ele.LEDScreenType + '</LEDScreenType>' : ''}
                    </item>`
                })
                sendXml += '</entryLeaveConfig></content>'
                const data = getXmlWrapData(sendXml)
                openLoading(LoadingTarget.FullScreen)
                editParkingLotConfig(data).then((result) => {
                    closeLoading(LoadingTarget.FullScreen)
                    // 更新原始数据
                    originalPageData = JSON.parse(JSON.stringify(pageData))
                    const resultXml = queryXml(result)
                    if (resultXml('status').text() === 'success') {
                        handleSuccess()
                    } else {
                        const errorCode = resultXml('errorCode').text()
                        handleError(errorCode)
                    }
                })
            }
        }

        // 处理成功提示
        function handleSuccess() {
            openMessageTipBox({
                type: 'success',
                message: Translate('IDCS_SAVE_DATA_SUCCESS'),
            })
        }
        // 处理错误码提示
        function handleError(errorCode: string) {
            let errorMsg = Translate('IDCS_SAVE_DATA_FAIL')
            if (errorCode === '536870953') {
                errorMsg = Translate('IDCS_NO_PERMISSION')
            }
            openMessageTipBox({
                type: 'info',
                message: errorMsg,
            })
        }

        return {
            pageData,
            apply,
        }
    },
})
