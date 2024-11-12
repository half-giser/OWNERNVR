/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-06-03 10:00:44
 * @Description: 业务应用-门禁管理-门禁配置
 */

import { cloneDeep } from 'lodash-es'
import { AccessConfigForm, AccessLockDataItem } from '@/types/apiType/business'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading } = useLoading()
        const { openMessageBox } = useMessageBox()

        const pageData = ref({
            // chlId-当前选中的通道Id
            chlId: '',
            // 通道列表-所有门禁通道列表
            chlList: [] as SelectOption<string, string>[],
            // 当前门锁-索引（1、2...）
            accessLockCurrentIndex: 0,
            // 当前门锁-是否可操作
            accessLockEnabled: false,
            // 门锁配置-枚举（自动、常开、常闭）
            doorLockTypeEnum: [] as SelectOption<string, string>[],
            // 报警联动类型-枚举（开门、关门）
            doorLockActionEnum: [] as SelectOption<string, string>[],
            // 开门验证名单-枚举
            accessListTypeEnum: [] as SelectOption<string, string>[],
            // 开门条件-是否可操作
            wearMaskOpenEnable: false,
            // 韦根配置-枚举
            wiegandIOTypeEnum: [] as SelectOption<string, string>[],
            // 韦根模式-枚举
            wiegandModeEnum: [] as SelectOption<string, string>[],
        })

        const formData = ref(new AccessConfigForm())
        let originalFormData = new AccessConfigForm()

        // 门锁配置与文本映射
        const DOOR_LOCK_TYPE_MAPPING: Record<string, string> = {
            Auto: Translate('IDCS_AUTO'), // 自动
            NO: Translate('IDCS_ALWAYS_OPEN'), // 常开
            NC: Translate('IDCS_ALWAYS_CLOSE'), // 常关
        }

        // 报警联动类型与文本映射
        const DOOR_LOCK_ACTION_MAPPING: Record<string, string> = {
            openDoor: Translate('IDCS_ALARM_LINKAGE_TYPE_ENUM_OPEN_DOOR'), // 开门
            closeDoor: Translate('IDCS_ALARM_LINKAGE_TYPE_ENUM_CLOSE_DOOR'), // 关门
        }

        // 开门验证名单与文本映射
        const ACCESS_LIST_TYPE_MAPPING: Record<string, string> = {
            whiteList: Translate('IDCS_UNLOCKING_GROUP_ENUM_WHITE_LIST'), // 白名单
            visitorAbove: Translate('IDCS_UNLOCKING_GROUP_ENUM_VISITOR'), // 访客
            strangerAbove: Translate('IDCS_UNLOCKING_GROUP_ENUM_STRANGER'), // 陌生人
        }

        // 韦根配置传输方向与文本映射
        const WIEGAND_IO_TYPE_MAPPING: Record<string, string> = {
            INPUT: Translate('IDCS_WIEGAND_CONFIG_ENUM_INPUT'), // 韦根输入
            OUTPUT: Translate('IDCS_WIEGAND_CONFIG_ENUM_OUTPUT'), // 韦根输出
            OFF: Translate('IDCS_OFF'), // 关
        }

        // 韦根模式与文本映射
        const WIEGAND_MODE_MAPPING: Record<string, string> = {
            '26bit(8)': '26bit(8)',
            '26bit(10)': '26bit(10)',
            '34bit': '34bit',
            '37bit': '37bit',
            '42bit': '42bit',
            '46bit': '46bit',
            '58bit': '58bit',
            '66bit': '66bit',
        }

        /**
         * @description 获取数据-更新通道列表（过滤掉不在线通道）
         */
        const getPageChlList = async () => {
            openLoading()

            const chl = await getChlList({
                nodeType: 'chls',
                isSupportAccessControl: true,
            })
            const $chl = queryXml(chl)

            const onlineChl = await queryOnlineChlList()
            const $ = queryXml(onlineChl)

            closeLoading()

            if ($chl('//status').text() === 'success' && $('//status').text() === 'success') {
                const chls = $('//content/item').map((item) => item.attr('id')!)
                pageData.value.chlList = $chl('//content/item')
                    .map((item) => {
                        const $item = queryXml(item.element)
                        return {
                            value: item.attr('id')!,
                            label: $item('name').text(),
                        }
                    })
                    .filter((item) => chls.includes(item.value))
            }
        }

        /**
         * @description 门锁配置
         * @param {string} chlId
         */
        const getAccessControlCfg = async (chlId: string) => {
            const sendXml = rawXml`
                <condition>
                    <chlId>${chlId}</chlId>
                </condition>
            `
            const result = await queryAccessControlCfg(sendXml)
            const $ = queryXml(result)
            if ($('//status').text() === 'success') {
                pageData.value.doorLockTypeEnum = $('//types/doorLockType/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: DOOR_LOCK_TYPE_MAPPING[item.text()],
                    }
                })
                pageData.value.doorLockActionEnum = $('//types/doorLockAction/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: DOOR_LOCK_ACTION_MAPPING[item.text()],
                    }
                })
                pageData.value.accessListTypeEnum = $('//types/accessListType/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: ACCESS_LIST_TYPE_MAPPING[item.text()],
                    }
                })
                pageData.value.wearMaskOpenEnable = $('//content/chl/wearMaskOpen').length > 0

                formData.value.accessListType = $('//content/chl/accessListType').text()
                formData.value.wearMaskOpen = $('//content/chl/wearMaskOpen').text().toBoolean()

                formData.value.accessLockData = $('//content/chl/doorLock/item').map((item) => {
                    const $item = queryXml(item.element)
                    const id = Number($item('id').text())
                    return {
                        id,
                        name: `${Translate('IDCS_DOOR_LOCK')}${id + 1}`,
                        openDelayTimeMin: Number($item('OpenDelayTime').attr('min')),
                        openDelayTimeMax: Number($item('OpenDelayTime').attr('max')),
                        openDelayTimeDefault: Number($item('OpenDelayTime').attr('default')),
                        openDelayTimeEnabled: $item('OpenDelayTime').length > 0,
                        openDelayTime: Number($item('OpenDelayTime').text()),
                        openHoldTimeMin: Number($item('OpenHoldTime').attr('min')),
                        openHoldTimeMax: Number($item('OpenHoldTime').attr('max')),
                        openHoldTimeDefault: Number($item('OpenHoldTime').attr('default')),
                        openHoldTimeEnabled: $item('OpenHoldTime').length > 0,
                        openHoldTime: Number($item('OpenHoldTime').text()),
                        doorLockConfig: $item('doorLockConfig').text(),
                        alarmAction: $item('alarmAction').text(),
                    }
                })

                pageData.value.accessLockEnabled = formData.value.accessLockData.length > 0
            } else {
                pageData.value.doorLockTypeEnum = []
                pageData.value.doorLockActionEnum = []
                pageData.value.accessListTypeEnum = []
                pageData.value.wearMaskOpenEnable = false
                pageData.value.accessLockEnabled = false

                formData.value.accessListType = ''
                formData.value.wearMaskOpen = false
                formData.value.accessLockData = [new AccessLockDataItem()]
            }

            pageData.value.accessLockCurrentIndex = formData.value.accessLockData[0].id
        }

        /**
         * @description 韦根配置
         * @param {string} chlId
         */
        const getAccessDataComCfg = async (chlId: string) => {
            const sendXml = rawXml`
                <condition>
                    <chlId>${chlId}</chlId>
                </condition>
            `
            const result = await queryAccessControlCfg(sendXml)
            const $ = queryXml(result)
            if ($('//status').text() === 'success') {
                pageData.value.doorLockTypeEnum = $('//types/wiegandIOType/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: WIEGAND_IO_TYPE_MAPPING[item.text()],
                    }
                })
                pageData.value.doorLockActionEnum = $('//types/wiegandMode/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: WIEGAND_MODE_MAPPING[item.text()],
                    }
                })

                formData.value.wiegandIOType = $('//content/chl/accessDataComDev/wiegand/IOType').text()
                formData.value.wiegandMode = $('//content/chl/accessDataComDev/wiegand/mode').text()
            } else {
                pageData.value.doorLockTypeEnum = []
                pageData.value.doorLockActionEnum = []

                formData.value.wiegandIOType = ''
                formData.value.wiegandMode = ''
            }
        }

        /**
         * @description 获取数据-更新页面初始数据
         * @param {string} chlId
         */
        const getPageData = async (chlId: string) => {
            openLoading()

            await getAccessControlCfg(chlId)
            await getAccessDataComCfg(chlId)

            closeLoading()

            originalFormData = cloneDeep(formData.value)
        }

        /**
         * @description 切换通道-查询选中通道的数据
         */
        const handleChlChange = () => {
            getPageData(pageData.value.chlId)
        }

        /**
         * @description 校验数据是否被修改
         * @returns {boolean[]}
         */
        const compareDataChange = () => {
            let changeDoorCfgFlg = false
            let changeWiegandFlg = false

            // 韦根-判断韦根配置是否被修改（'韦根配置'和'韦根模式'）
            if (formData.value.wiegandIOType !== originalFormData.wiegandIOType || formData.value.wiegandMode !== originalFormData.wiegandMode) {
                changeWiegandFlg = true
            }

            // 门锁-判断门锁配置是否被修改（'开门验证名单'和'开门条件'）、（门锁配置中，未修改'开门验证名单'或'开门条件'，再进行（'开门延时时间'、'开门持续时间'、'门锁配置'、'报警联动类型'）是否修改的校验）
            if (formData.value.accessListType !== originalFormData.accessListType || formData.value.wearMaskOpen !== originalFormData.wearMaskOpen) {
                changeDoorCfgFlg = true
            }

            if (!changeDoorCfgFlg) {
                changeDoorCfgFlg = formData.value.accessLockData.some((item, index) => {
                    const o = originalFormData.accessLockData[index]
                    return item.openDelayTime !== o.openDelayTime || item.openHoldTime !== o.openHoldTime || item.doorLockConfig !== o.doorLockConfig || item.alarmAction !== o.alarmAction
                })
            }

            return [changeDoorCfgFlg, changeWiegandFlg]
        }

        /**
         * @description 更新门锁配置
         * @returns {Promise<XMLQuery>}
         */
        const setAccessControl = async () => {
            const lockDataLength = formData.value.accessLockData.length
            const accessLockData = formData.value.accessLockData
                .map((item) => {
                    return rawXml`
                        <item>
                            <id type="uint32">${item.id}</id>
                            <OpenDelayTime type="uint8" min="${item.openDelayTimeMin}" max="${item.openDelayTimeMax}" default="${item.openDelayTimeDefault}">${item.openDelayTime}</OpenDelayTime>
                            <OpenHoldTime type="uint8" min="${item.openHoldTimeMin}" max="${item.openHoldTimeMax}" default="${item.openHoldTimeDefault}">${item.openHoldTime}</OpenHoldTime>
                            ${ternary(!!item.doorLockConfig, `<doorLockConfig type="doorLockType">${item.doorLockConfig}</doorLockConfig>`)}
                            ${ternary(!!item.alarmAction, `<alarmAction type="doorLockAction">${item.alarmAction}</alarmAction>`)}
                        </item>
                    `
                })
                .join('')
            const sendXml = rawXml`
                <content>
                    <chl id="${pageData.value.chlId}">
                        ${ternary(formData.value.wearMaskOpen, `<wearmaskOpen>true</wearmaskOpen>`)}
                        ${ternary(!!formData.value.accessListType, `<accessListType type="accessListType">${formData.value.accessListType}</accessListType>`)}
                        ${ternary(!!lockDataLength, `<doorLock type="list" count="${lockDataLength}">${accessLockData}</doorLock>`)}
                    </chl>
                </content>
            `
            const result = await editAccessControlCfg(sendXml)
            return queryXml(result)
        }

        /**
         * @description 更新韦根配置
         * @returns {Promise<XMLQuery>}
         */
        const setAccessDataCom = async () => {
            const sendXml = rawXml`
                <content>
                    <chl id="${pageData.value.chlId}">
                        <accessDataComDev>
                            <wiegand>
                                <IOType>${formData.value.wiegandIOType}</IOType>
                                <mode>${formData.value.wiegandMode}</mode>
                            </wiegand>
                        </accessDataComDev>
                    </chl>
                </content>
            `
            const result = await editAccessDataComCfg(sendXml)
            return queryXml(result)
        }

        /**
         * @description 编辑-下发编辑协议
         */
        const apply = async () => {
            const [changeDoorCfgFlg, changeWiegandFlg] = compareDataChange()
            if (!changeDoorCfgFlg && !changeWiegandFlg) {
                return
            }

            openLoading()

            let success = true
            let errorCode = 0
            if (changeDoorCfgFlg) {
                const $ = await setAccessControl()
                success = $('status').text() === 'success'
                if (!success) {
                    errorCode = Number($('errorCode').text())
                }
            }

            if (success && changeWiegandFlg) {
                const $ = await setAccessDataCom()
                success = $('status').text() === 'success'
                if (!success) {
                    errorCode = Number($('errorCode').text())
                }
            }

            closeLoading()

            if (success) {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                })
            } else {
                let errorMsg = Translate('IDCS_SAVE_DATA_FAIL')
                if (errorCode === ErrorCode.USER_ERROR_NO_AUTH) {
                    errorMsg = Translate('IDCS_NO_PERMISSION')
                }
                openMessageBox({
                    type: 'info',
                    message: errorMsg,
                })
            }
        }

        onMounted(async () => {
            await getPageChlList()
            if (pageData.value.chlList.length) {
                pageData.value.chlId = pageData.value.chlList[0].value
                getPageData(pageData.value.chlId)
            }
        })

        return {
            pageData,
            formData,
            handleChlChange,
            apply,
        }
    },
})
