/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-06-03 10:00:44
 * @Description: 业务应用-门禁管理-门禁配置
 */

import { QueryNodeListDto } from '@/types/apiType/channel'
import { ActConfigPageData, type AccessLockData, AccessLockDataItem } from '@/types/apiType/business'
import { type XMLQuery } from '@/utils/xmlParse'

export default defineComponent({
    setup() {
        // 多语言翻译方法
        const { Translate } = useLangStore()
        // 页面Loading
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        // 提示弹框
        const { openMessageTipBox } = useMessageBox()

        // 页面初始数据
        const pageData = reactive<ActConfigPageData>(new ActConfigPageData())
        // 备份原始数据
        let originalPageData = new ActConfigPageData()
        // 是否修改了门锁配置
        let changeDoorCfgFlg = false
        // 是否修改了韦根配置
        let changeWiegandFlg = false

        // 获取数据-更新通道列表（过滤掉不在线通道）
        function getPageChlList() {
            // 所有通道
            const getAccessControlChlList = () => {
                return new Promise((resolve) => {
                    const queryNodeListDto = new QueryNodeListDto()
                    queryNodeListDto.nodeType = 'chls'
                    queryNodeListDto.isSupportAccessControl = true
                    getChlList(queryNodeListDto).then((result) => {
                        resolve(result)
                    })
                })
            }
            // 在线通道
            const getOnlineChlList = () => {
                return new Promise((resolve) => {
                    queryOnlineChlList().then((result) => {
                        resolve(result)
                    })
                })
            }
            // 查询-发起请求
            pageData.chlList = []
            openLoading(LoadingTarget.FullScreen)
            Promise.all([getAccessControlChlList(), getOnlineChlList()]).then((resultArr) => {
                closeLoading(LoadingTarget.FullScreen)
                type XMLResult = Element | XMLDocument | null
                const result1Xml = queryXml(resultArr[0] as XMLResult)
                const result2Xml = queryXml(resultArr[1] as XMLResult)
                if (result1Xml('status').text() === 'success' && result2Xml('status').text() === 'success') {
                    result1Xml('//content/item').forEach((ele1) => {
                        result2Xml('//content/item').forEach((ele2) => {
                            if (ele1.attr('id') === ele2.attr('id')) {
                                const ele1Xml = queryXml(ele1.element)
                                pageData.chlList.push({
                                    value: ele1.attr('id'),
                                    label: ele1Xml('name').text(),
                                })
                            }
                        })
                    })
                    if (pageData.chlList.length > 0) {
                        getPageData(pageData.chlList[0].value)
                    }
                }
            })
        }

        // 获取数据-更新页面初始数据
        function getPageData(chlId: string) {
            // 门锁配置
            const getAccessControlCfg = () => {
                return new Promise((resolve) => {
                    const sendXml = `
                        <condition>
                            <chlId>${chlId}</chlId>
                        </condition>
                    `
                    const data = getXmlWrapData(sendXml)
                    queryAccessControlCfg(data).then((result) => {
                        resolve(result)
                    })
                })
            }
            // 韦根配置
            const getAccessDataComCfg = () => {
                return new Promise((resolve) => {
                    const sendXml = `
                        <condition>
                            <chlId>${chlId}</chlId>
                        </condition>
                    `
                    const data = getXmlWrapData(sendXml)
                    queryAccessDataComCfg(data).then((result) => {
                        resolve(result)
                    })
                })
            }
            // 查询-发起请求
            openLoading(LoadingTarget.FullScreen)
            Promise.all([getAccessControlCfg(), getAccessDataComCfg()]).then((resultArr) => {
                closeLoading(LoadingTarget.FullScreen)
                type XMLResult = Element | XMLDocument | null
                const result1Xml = queryXml(resultArr[0] as XMLResult)
                const result2Xml = queryXml(resultArr[1] as XMLResult)
                if (result1Xml('status').text() === 'success' && result2Xml('status').text() === 'success') {
                    pageData.chlId = chlId
                    // 门锁
                    getEnum(result1Xml, 'doorLockType')
                    getEnum(result1Xml, 'doorLockAction')
                    getEnum(result1Xml, 'accessListType')
                    // 开门验证名单-当前值/是否可操作
                    pageData.accessListType = result1Xml('//content/chl/accessListType').text()
                    pageData.accessListTypeEnable = result1Xml('//content/chl/accessListType').length > 0
                    // 开门条件-当前值/是否可操作
                    pageData.wearMaskOpen = result1Xml('//content/chl/wearMaskOpen').text() === 'true'
                    pageData.wearMaskOpenEnable = result1Xml('//content/chl/wearMaskOpen').length > 0
                    // 门锁数据
                    const accessLockData = {} as AccessLockData
                    // 门锁枚举
                    const accessLockIndexList = [] as SelectItem[]
                    result1Xml('//content/chl/doorLock/item').forEach((ele) => {
                        const eleXml = queryXml(ele.element)
                        const lockIndex = Number(eleXml('id').text())
                        // 开门延时时间
                        accessLockData[lockIndex] = new AccessLockDataItem()
                        accessLockData[lockIndex].delayTimeMin = Number(eleXml('OpenDelayTime').attr('min'))
                        accessLockData[lockIndex].delayTimeMax = Number(eleXml('OpenDelayTime').attr('max'))
                        accessLockData[lockIndex].delayTimeDefaultValue = Number(eleXml('OpenDelayTime').attr('default'))
                        accessLockData[lockIndex].delayTimeValue = Number(eleXml('OpenDelayTime').text())
                        accessLockData[lockIndex].delayTimeEnable = eleXml('OpenDelayTime').length > 0
                        // 开门持续时间
                        accessLockData[lockIndex].openHoldTimeMin = Number(eleXml('OpenHoldTime').attr('min'))
                        accessLockData[lockIndex].openHoldTimeMax = Number(eleXml('OpenHoldTime').attr('max'))
                        accessLockData[lockIndex].openHoldTimeDefaultValue = Number(eleXml('OpenHoldTime').attr('default'))
                        accessLockData[lockIndex].openHoldTimeValue = Number(eleXml('OpenHoldTime').text())
                        accessLockData[lockIndex].openHoldTimeEnable = eleXml('OpenHoldTime').length > 0
                        // 门锁配置
                        accessLockData[lockIndex].doorLockConfig = eleXml('doorLockConfig').text()
                        accessLockData[lockIndex].doorLockConfigEnable = eleXml('doorLockConfig').length > 0
                        // 报警联动
                        accessLockData[lockIndex].alarmAction = eleXml('alarmAction').text()
                        accessLockData[lockIndex].alarmActionEnable = eleXml('alarmAction').length > 0
                        // 门锁1、门锁2...
                        accessLockIndexList.push({ value: lockIndex, label: `${Translate('IDCS_DOOR_LOCK')}${lockIndex + 1}` })
                    })
                    pageData.accessLockData = accessLockData
                    pageData.accessLockDataEnable = accessLockIndexList.length > 0
                    pageData.accessLockIndexList = accessLockIndexList
                    pageData.accessLockCurrentIndex = accessLockIndexList.length > 0 ? accessLockIndexList[0].value : 0
                    // 韦根
                    getEnum(result2Xml, 'wiegandIOType')
                    getEnum(result2Xml, 'wiegandMode')
                    // 韦根配置-当前值/是否可操作
                    pageData.wiegandIOType = result2Xml('//content/chl/accessDataComDev/wiegand/IOType').text()
                    pageData.wiegandIOTypeEnable = result2Xml('//content/chl/accessDataComDev/wiegand/IOType').length > 0
                    // 韦根模式-当前值/是否可操作
                    pageData.wiegandMode = result2Xml('//content/chl/accessDataComDev/wiegand/mode').text()
                    pageData.wiegandModeEnable = result2Xml('//content/chl/accessDataComDev/wiegand/mode').length > 0
                    // 备份原始数据
                    originalPageData = JSON.parse(JSON.stringify(pageData))
                }
            })
        }
        // 获取枚举列表
        function getEnum(resultXml: XMLQuery, enumKey: string) {
            type enumType = 'doorLockTypeEnum' | 'doorLockActionEnum' | 'accessListTypeEnum' | 'wiegandIOTypeEnum' | 'wiegandModeEnum'
            const doorLockTypeMap = {
                Auto: Translate('IDCS_AUTO'), // 自动
                NO: Translate('IDCS_ALWAYS_OPEN'), // 常开
                NC: Translate('IDCS_ALWAYS_CLOSE'), // 常关
            }
            const doorLockAcitonMap = {
                openDoor: Translate('IDCS_ALARM_LINKAGE_TYPE_ENUM_OPEN_DOOR'), // 开门
                closeDoor: Translate('IDCS_ALARM_LINKAGE_TYPE_ENUM_CLOSE_DOOR'), // 关门
            }
            const accessListTypeMap = {
                whiteList: Translate('IDCS_UNLOCKING_GROUP_ENUM_WHITE_LIST'), // 白名单
                visitorAbove: Translate('IDCS_UNLOCKING_GROUP_ENUM_VISITOR'), // 访客
                strangerAbove: Translate('IDCS_UNLOCKING_GROUP_ENUM_STRANGER'), // 陌生人
            }
            const wiegandIOTypeMap = {
                INPUT: Translate('IDCS_WIEGAND_CONFIG_ENUM_INPUT'), // 韦根输入
                OUTPUT: Translate('IDCS_WIEGAND_CONFIG_ENUM_OUTPUT'), // 韦根输出
                OFF: Translate('IDCS_OFF'), // 关
            }
            const wiegandModeMap = {
                '26bit(8)': '26bit(8)',
                '26bit(10)': '26bit(10)',
                '34bit': '34bit',
                '37bit': '37bit',
                '42bit': '42bit',
                '46bit': '46bit',
                '58bit': '58bit',
                '66bit': '66bit',
            }
            const typeMap: { [key: string]: any } = {
                doorLockType: doorLockTypeMap,
                doorLockAction: doorLockAcitonMap,
                accessListType: accessListTypeMap,
                wiegandIOType: wiegandIOTypeMap,
                wiegandMode: wiegandModeMap,
            }
            resultXml(`//types/${enumKey}/enum`).forEach((ele) => {
                const selectItem = {} as SelectItem
                selectItem.value = ele.text() // 值
                selectItem.label = typeMap[enumKey][ele.text()] // 展示文本
                pageData[`${enumKey}Enum` as enumType].push(selectItem)
            })
        }

        // 查询-发起请求
        getPageChlList()
        // 切换通道-查询选中通道的数据
        function handleChlChange(chlId: string) {
            getPageData(chlId)
        }

        // 校验数据是否被修改
        function compareDataChange(pageData: ActConfigPageData, originalPageData: ActConfigPageData) {
            // 韦根-判断韦根配置是否被修改（'韦根配置'和'韦根模式'）
            changeWiegandFlg = false
            if (pageData.wiegandIOType !== originalPageData.wiegandIOType || pageData.wiegandMode !== originalPageData.wiegandMode) {
                changeWiegandFlg = true
            }
            // 门锁-判断门锁配置是否被修改（'开门验证名单'和'开门条件'）、（门锁配置中，未修改'开门验证名单'或'开门条件'，再进行（'开门延时时间'、'开门持续时间'、'门锁配置'、'报警联动类型'）是否修改的校验）
            changeDoorCfgFlg = false
            if (pageData.accessListType !== originalPageData.accessListType || pageData.wearMaskOpen !== originalPageData.wearMaskOpen) {
                changeDoorCfgFlg = true
                return
            }
            for (const [key, value] of Object.entries(pageData.accessLockData)) {
                const item = originalPageData.accessLockData[key]
                if (
                    value.delayTimeValue !== item.delayTimeValue ||
                    value.openHoldTimeValue !== item.openHoldTimeValue ||
                    value.doorLockConfig !== item.doorLockConfig ||
                    value.alarmAction !== item.alarmAction
                ) {
                    changeDoorCfgFlg = true
                    break
                }
            }
        }

        // 门锁
        function editAccessControl() {
            return new Promise((resolve) => {
                let sendXml = rawXml`<content><chl id="${pageData.chlId}">
                    ${pageData.wearMaskOpen ? '<wearmaskOpen>' + pageData.wearMaskOpen + '</wearmaskOpen>' : ''}
                    ${pageData.accessListType ? '<accessListType type="accessListType">' + pageData.accessListType + '</accessListType>' : ''}
                `
                const lockDataLength = Object.keys(pageData.accessLockData).length
                if (lockDataLength > 0) {
                    sendXml += `<doorLock type="list" count="${lockDataLength}">`
                    for (const [key, lockData] of Object.entries(pageData.accessLockData)) {
                        sendXml += rawXml`
                            <item>
                                <id type="uint32">${key}</id>
                                <OpenDelayTime type="uint8" min="${lockData.delayTimeMin.toString()}" max="${lockData.delayTimeMax.toString()}" default="${lockData.delayTimeDefaultValue.toString()}">${lockData.delayTimeValue.toString()}</OpenDelayTime>
                                <OpenHoldTime type="uint8" min="${lockData.openHoldTimeMin.toString()}" max="${lockData.openHoldTimeMax.toString()}" default="${lockData.openHoldTimeDefaultValue.toString()}">${lockData.openHoldTimeValue.toString()}</OpenHoldTime>
                                ${lockData.doorLockConfig ? '<doorLockConfig type="doorLockType">' + lockData.doorLockConfig + '</doorLockConfig>' : ''}
                                ${lockData.alarmAction ? '<alarmAction type="doorLockAction">' + lockData.alarmAction + '</alarmAction>' : ''}
                            </item>
                        `
                    }
                    sendXml += '</doorLock>'
                }
                sendXml += `</chl></content>`
                const data = getXmlWrapData(sendXml)
                editAccessControlCfg(data).then((result) => {
                    resolve(result)
                })
            })
        }
        // 韦根
        function editAccessDataCom() {
            return new Promise((resolve) => {
                const sendXml = rawXml`
                    <content>
                        <chl id="${pageData.chlId}">
                            <accessDataComDev>
                                <wiegand>
                                    <IOType>${pageData.wiegandIOType}</IOType>
                                    <mode>${pageData.wiegandMode}</mode>
                                </wiegand>
                            </accessDataComDev>
                        </chl>
                    </content>
                `
                const data = getXmlWrapData(sendXml)
                editAccessDataComCfg(data).then((result) => {
                    resolve(result)
                })
            })
        }
        // 编辑-下发编辑协议
        function apply() {
            compareDataChange(pageData, originalPageData)
            // 修改了哪个配置就下发哪个协议
            if (changeDoorCfgFlg && changeWiegandFlg) {
                openLoading(LoadingTarget.FullScreen)
                Promise.all([editAccessControl(), editAccessDataCom()]).then((resultArr) => {
                    closeLoading(LoadingTarget.FullScreen)
                    // 更新原始数据
                    originalPageData = JSON.parse(JSON.stringify(pageData))
                    type XMLResult = Element | XMLDocument | null
                    const result1Xml = queryXml(resultArr[0] as XMLResult)
                    const result2Xml = queryXml(resultArr[1] as XMLResult)
                    if (result1Xml('status').text() === 'success' && result2Xml('status').text() === 'success') {
                        handleSuccess()
                    } else {
                        const errorCode1 = result1Xml('errorCode').text()
                        const errorCode2 = result2Xml('errorCode').text()
                        if (errorCode1 === '536870953' || errorCode2 === '536870953') {
                            handleError(errorCode1)
                        }
                    }
                })
            } else if (changeDoorCfgFlg) {
                openLoading(LoadingTarget.FullScreen)
                Promise.all([editAccessControl()]).then((resultArr) => {
                    closeLoading(LoadingTarget.FullScreen)
                    // 更新原始数据
                    originalPageData = JSON.parse(JSON.stringify(pageData))
                    type XMLResult = Element | XMLDocument | null
                    const resultXml = queryXml(resultArr[0] as XMLResult)
                    if (resultXml('status').text() === 'success') {
                        handleSuccess()
                    } else {
                        const errorCode = resultXml('errorCode').text()
                        handleError(errorCode)
                    }
                })
            } else if (changeWiegandFlg) {
                openLoading(LoadingTarget.FullScreen)
                Promise.all([editAccessDataCom()]).then((resultArr) => {
                    closeLoading(LoadingTarget.FullScreen)
                    // 更新原始数据
                    originalPageData = JSON.parse(JSON.stringify(pageData))
                    type XMLResult = Element | XMLDocument | null
                    const resultXml = queryXml(resultArr[0] as XMLResult)
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
            handleChlChange,
            apply,
        }
    },
})
