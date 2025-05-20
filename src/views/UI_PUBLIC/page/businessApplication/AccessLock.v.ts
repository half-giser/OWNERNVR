/*
 * @Author: zhangdongming zhangdongming@tvt.net.cn
 * @Date: 2024-06-03 10:00:44
 * @Description: 业务应用-门禁管理-门禁配置
 */
export default defineComponent({
    setup() {
        const { Translate } = useLangStore()

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

        const accessLockformData = ref(new BusinessAccessLockForm())
        const editAccessLock = useWatchEditData(accessLockformData)

        const wiegandFormData = ref(new BusinessWiegandForm())
        const editWiegand = useWatchEditData(wiegandFormData)

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

            if ($chl('status').text() === 'success' && $('status').text() === 'success') {
                const chls = $('content/item').map((item) => item.attr('id'))
                pageData.value.chlList = $chl('content/item')
                    .map((item) => {
                        const $item = queryXml(item.element)
                        return {
                            value: item.attr('id'),
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
            editAccessLock.reset()
            const sendXml = rawXml`
                <condition>
                    <chlId>${chlId}</chlId>
                </condition>
            `
            const result = await queryAccessControlCfg(sendXml)
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                pageData.value.doorLockTypeEnum = $('types/doorLockType/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: DOOR_LOCK_TYPE_MAPPING[item.text()],
                    }
                })
                pageData.value.doorLockActionEnum = $('types/doorLockAction/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: DOOR_LOCK_ACTION_MAPPING[item.text()],
                    }
                })
                pageData.value.accessListTypeEnum = $('types/accessListType/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: ACCESS_LIST_TYPE_MAPPING[item.text()],
                    }
                })
                pageData.value.wearMaskOpenEnable = $('content/chl/wearMaskOpen').length > 0

                accessLockformData.value.accessListType = $('content/chl/accessListType').text()
                accessLockformData.value.wearMaskOpen = $('content/chl/wearMaskOpen').text().bool()

                accessLockformData.value.doorLock = $('content/chl/doorLock/item').map((item, index) => {
                    const $item = queryXml(item.element)
                    const id = $item('id').text().num()
                    return {
                        index,
                        id,
                        name: `${Translate('IDCS_DOOR_LOCK')}${id + 1}`,
                        openDelayTimeMin: $item('OpenDelayTime').attr('min').num(),
                        openDelayTimeMax: $item('OpenDelayTime').attr('max').num(),
                        openDelayTimeDefault: $item('OpenDelayTime').attr('default').num(),
                        openDelayTimeEnabled: $item('OpenDelayTime').length > 0,
                        openDelayTime: $item('OpenDelayTime').text().num(),
                        openHoldTimeMin: $item('OpenHoldTime').attr('min').num(),
                        openHoldTimeMax: $item('OpenHoldTime').attr('max').num(),
                        openHoldTimeDefault: $item('OpenHoldTime').attr('default').num(),
                        openHoldTimeEnabled: $item('OpenHoldTime').length > 0,
                        openHoldTime: $item('OpenHoldTime').text().num(),
                        doorLockConfig: $item('doorLockConfig').text(),
                        alarmAction: $item('alarmAction').text(),
                    }
                })

                pageData.value.accessLockEnabled = accessLockformData.value.doorLock.length > 0
            } else {
                pageData.value.doorLockTypeEnum = []
                pageData.value.doorLockActionEnum = []
                pageData.value.accessListTypeEnum = []
                pageData.value.wearMaskOpenEnable = false
                pageData.value.accessLockEnabled = false

                accessLockformData.value.accessListType = ''
                accessLockformData.value.wearMaskOpen = false
                accessLockformData.value.doorLock = [new BusinessAccessLockDataItem()]
            }

            pageData.value.accessLockCurrentIndex = accessLockformData.value.doorLock[0].index
            editAccessLock.listen()
        }

        /**
         * @description 韦根配置
         * @param {string} chlId
         */
        const getAccessDataComCfg = async (chlId: string) => {
            editWiegand.reset()
            const sendXml = rawXml`
                <condition>
                    <chlId>${chlId}</chlId>
                </condition>
            `
            const result = await queryAccessDataComCfg(sendXml)
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                pageData.value.wiegandIOTypeEnum = $('types/wiegandIOType/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: WIEGAND_IO_TYPE_MAPPING[item.text()],
                    }
                })
                pageData.value.wiegandModeEnum = $('types/wiegandMode/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: item.text(),
                    }
                })

                wiegandFormData.value.IOType = $('content/chl/accessDataComDev/wiegand/IOType').text()
                wiegandFormData.value.mode = $('content/chl/accessDataComDev/wiegand/mode').text()
            } else {
                pageData.value.wiegandIOTypeEnum = []
                pageData.value.wiegandModeEnum = []

                wiegandFormData.value.IOType = ''
                wiegandFormData.value.mode = ''
            }

            editWiegand.listen()
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
        }

        /**
         * @description 切换通道-查询选中通道的数据
         */
        const handleChlChange = () => {
            getPageData(pageData.value.chlId)
        }

        /**
         * @description 更新门锁配置
         * @returns {Promise<XMLQuery>}
         */
        const setAccessControl = async () => {
            const doorLockDataLength = accessLockformData.value.doorLock.length
            const doorLock = accessLockformData.value.doorLock
                .map((item) => {
                    return rawXml`
                        <item>
                            <id type="uint32">${item.id}</id>
                            <OpenDelayTime type="uint8" min="${item.openDelayTimeMin}" max="${item.openDelayTimeMax}" default="${item.openDelayTimeDefault}">${item.openDelayTime}</OpenDelayTime>
                            <OpenHoldTime type="uint8" min="${item.openHoldTimeMin}" max="${item.openHoldTimeMax}" default="${item.openHoldTimeDefault}">${item.openHoldTime}</OpenHoldTime>
                            ${item.doorLockConfig ? `<doorLockConfig type="doorLockType">${item.doorLockConfig}</doorLockConfig>` : ''}
                            ${item.alarmAction ? `<alarmAction type="doorLockAction">${item.alarmAction}</alarmAction>` : ''}
                        </item>
                    `
                })
                .join('')
            const sendXml = rawXml`
                <content>
                    <chl id="${pageData.value.chlId}">
                        ${accessLockformData.value.wearMaskOpen ? '<wearmaskOpen>true</wearmaskOpen>' : ''}
                        ${accessLockformData.value.accessListType ? `<accessListType type="accessListType">${accessLockformData.value.accessListType}</accessListType>` : ''}
                        ${doorLockDataLength ? `<doorLock type="list" count="${doorLockDataLength}">${doorLock}</doorLock>` : ''}
                    </chl>
                </content>
            `
            const result = await editAccessControlCfg(sendXml)
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                editAccessLock.update()
                return 0
            } else {
                return $('errorCode').text().num()
            }
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
                                <IOType>${wiegandFormData.value.IOType}</IOType>
                                <mode>${wiegandFormData.value.mode}</mode>
                            </wiegand>
                        </accessDataComDev>
                    </chl>
                </content>
            `
            const result = await editAccessDataComCfg(sendXml)
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                editWiegand.update()
                return 0
            } else {
                return $('errorCode').text().num()
            }
        }

        /**
         * @description 编辑-下发编辑协议
         */
        const apply = async () => {
            openLoading()

            const errorCode1 = await setAccessControl()
            const errorCode2 = await setAccessDataCom()

            closeLoading()

            if (errorCode1 === 0 && errorCode2 === 0) {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                })
            } else {
                let errorMsg = Translate('IDCS_SAVE_DATA_FAIL')
                if (errorCode1 === ErrorCode.USER_ERROR_NO_AUTH || errorCode2 === ErrorCode.USER_ERROR_NO_AUTH) {
                    errorMsg = Translate('IDCS_NO_PERMISSION')
                }
                openMessageBox(errorMsg)
            }
        }

        onActivated(async () => {
            await getPageChlList()
            if (pageData.value.chlList.length) {
                pageData.value.chlId = pageData.value.chlList[0].value
                getPageData(pageData.value.chlId)
            }
        })

        return {
            pageData,
            accessLockformData,
            wiegandFormData,
            handleChlChange,
            apply,
            editAccessLock,
            editWiegand,
        }
    },
})
