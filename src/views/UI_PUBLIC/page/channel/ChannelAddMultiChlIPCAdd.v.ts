import { ChannelInfoDto, type DefaultPwdDto, MultiChlCheckedInfoDto, type MultiChlIPCAddDto } from '@/types/apiType/channel'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const userSessionStore = useUserSessionStore()
        const router = useRouter()
        const multiChlIPCCfgDialogVisiable = ref(false)
        const tableData = ref([] as MultiChlIPCAddDto[])

        const defaultParam =
            '	<rec per="5" post="10"/>' +
            '	<snapSwitch>true</snapSwitch>' +
            '	<buzzerSwitch>false</buzzerSwitch>' +
            '	<popVideoSwitch>false</popVideoSwitch>' +
            '	<frontEndOffline_popMsgSwitch>false</frontEndOffline_popMsgSwitch>'

        let chlMapping: Record<string, DefaultPwdDto> = {}
        let manufacturerMap: Record<string, string> = {}
        let protocolList: Array<Record<string, string>> = []
        let callback: Function
        let numName = 1
        let RTSPData: MultiChlIPCAddDto[] = [] // RTSP通道类型数据
        let nonRTSPData: MultiChlIPCAddDto[] = [] //非RTSP通道类型数据（包含：热成像通道，鱼眼通道，...）
        let normalChlData: MultiChlIPCAddDto[] = [] // 普通通道数据（可见光通道也属于普通单目通道）
        let thermalChlData: MultiChlIPCAddDto[] = [] // 热成像通道数据（热成像IPC为双通道，包括：可见光通道，热成像通道）
        let multichannelIpcData: MultiChlIPCAddDto[] = [] // 多通道IPC数据（热成像，鱼眼等多通道IPC）

        const opened = () => {
            closeLoading(LoadingTarget.FullScreen)
        }

        const init = (
            rowDatas: Record<string, any>[],
            _mapping: Record<string, DefaultPwdDto>,
            _manufacturerMap: Record<string, string>,
            _protocolList: Array<Record<string, string>>,
            _callback: Function,
        ) => {
            chlMapping = _mapping
            manufacturerMap = _manufacturerMap
            protocolList = _protocolList
            callback = _callback
            numName = Number(localStorage.getItem(LocalCacheKey.defaultChlMaxValue))
            RTSPData = []
            nonRTSPData = []
            normalChlData = []
            thermalChlData = []
            multichannelIpcData = []

            rowDatas.forEach((item: Record<string, object>) => {
                const isArray = Boolean(item.isArray)
                const element = item.element as MultiChlIPCAddDto
                if (isArray && ((element.addrType == 'ip' && element.ip != '0.0.0.0') || (element.addrType != 'ip' && element.domain))) {
                    RTSPData.push(element)
                }
                if (!isArray && ((element.addrType == 'ip' && element.ip != '0.0.0.0') || (element.addrType != 'ip' && element.domain)) && Number(element.port) != 0 && element.userName) {
                    nonRTSPData.push(element)
                }
            })
            if (nonRTSPData.length == 0) {
                saveData() // 仅添加RTSP通道
                return
            }

            const chlTypeMap: Record<string, string> = {}
            let curRequestNum = 0
            openLoading(LoadingTarget.FullScreen)
            nonRTSPData.forEach((item: MultiChlIPCAddDto) => {
                createLanDeviceRequest(item).then((res) => {
                    const $ = queryXml(res)
                    curRequestNum++
                    if ($('status').text() == 'success') {
                        const supportChlType = $('//content/industryProductType').text() // 值为"THERMAL_DOUBLE"，代表“热成像双目IPC”
                        if (supportChlType) chlTypeMap[item.ip] = supportChlType
                    } else {
                        chlTypeMap[item.ip] = 'NORMAL' // 返回“fail”，代表“普通单目IPC”
                    }
                    if (curRequestNum == nonRTSPData.length) {
                        curRequestNum = 0
                        getExistChl((allExistChlData: ChannelInfoDto[]) => {
                            normalChlData = []
                            thermalChlData = []
                            multichannelIpcData = []
                            nonRTSPData.forEach((item: MultiChlIPCAddDto, index: number) => {
                                const resArr: ChannelInfoDto[] = []
                                allExistChlData.forEach((ele: ChannelInfoDto) => {
                                    if (ele.ip == item.ip) resArr.push(ele)
                                })
                                if (chlTypeMap[item.ip] == 'THERMAL_DOUBLE' || (!isNaN(Number(chlTypeMap[item.ip])) && Number(chlTypeMap[item.ip]) > 1)) {
                                    item.multichannelCheckedInfoList = []
                                    if (chlTypeMap[item.ip] == 'THERMAL_DOUBLE') {
                                        // 热成像通道
                                        const visibleLight = new MultiChlCheckedInfoDto()
                                        visibleLight.operateIndex = 0
                                        visibleLight.chlType = 'visibleLight'
                                        visibleLight.chlLabel = Translate('IDCS_VISIBLE_LIGHT')
                                        const thermal = new MultiChlCheckedInfoDto()
                                        thermal.operateIndex = 1
                                        thermal.chlType = 'thermal'
                                        thermal.chlLabel = Translate('IDCS_THERMAL_LIGHT')
                                        switch (resArr.length) {
                                            case 1:
                                                visibleLight.disabled = resArr[0].accessType == 'NORMAL'
                                                thermal.disabled = resArr[0].accessType == 'THERMAL'
                                                break
                                            case 2:
                                                visibleLight.disabled = true
                                                thermal.disabled = true
                                                break
                                        }
                                        item.multichannelCheckedInfoList.push(visibleLight)
                                        item.multichannelCheckedInfoList.push(thermal)

                                        item.index = index
                                        item.name = item.ip
                                        item.type = 'THERMAL_DOUBLE' // 标识该通道为“热成像双目IPC”
                                        thermalChlData.push(item)
                                    }
                                    multichannelIpcData = thermalChlData
                                } else if (chlTypeMap[item.ip] == 'THERMAL_SINGLE') {
                                    if (resArr.length > 0) return
                                    normalChlData.push(item)
                                } else {
                                    normalChlData.push(item)
                                }
                            })
                            if (multichannelIpcData.length > 0) {
                                tableData.value = multichannelIpcData
                                multiChlIPCCfgDialogVisiable.value = true
                            } else {
                                saveData()
                            }
                        })
                    }
                })
            })
        }

        /**
         * 查询当前的通道是否支持热成像
         * @param element
         * @returns
         */
        const createLanDeviceRequest = (element: MultiChlIPCAddDto) => {
            let ipXmlStr = ''
            let domainXmlStr = ''
            if (element.addrType == 'ip') {
                ipXmlStr = `<ip>${element.ip}</ip>`
            } else if (element.addrType == 'ipv6') {
                ipXmlStr = `<ip>${element.domain}</ip>`
            } else {
                if (checkIpV4(element.domain)) {
                    ipXmlStr = `<ip>${element.domain}</ip>`
                } else {
                    domainXmlStr = `<domain><![CDATA[${element.domain}]]></domain>`
                }
            }
            const data = rawXml`
                <content>
                    <manufacturer>${element.manufacturer}</manufacturer>
                    ${ipXmlStr}
                    ${domainXmlStr}
                    <port>${element.port}</port>
                    <userName><![CDATA[${cutStringByByte(element.userName, nameByteMaxLen)}]]></userName>
                    ${element.password == '******' ? '' : '<password' + getSecurityVer() + '><![CDATA[' + AES_encrypt(element.password, userSessionStore.sesionKey) + ']]></password>'}
                </content>`
            return queryLanDevice(getXmlWrapData(data), undefined, false)
        }

        /**
         * 获取已添加的通道数据
         * @param cb
         */
        const getExistChl = (cb: Function) => {
            const data = rawXml`
                <requireField>
                    <name/>
                    <ip/>
                    <port/>
                    <userName/>
                    <password/>
                    <protocolType/>
                    <productModel/>
                    <chlIndex/>
                    <index/>
                    <chlType/>
                    <chlNum/>
                </requireField>`
            queryDevList(getXmlWrapData(data)).then((res) => {
                const $ = queryXml(res)
                const rowData: ChannelInfoDto[] = []
                if ($('status').text() == 'success') {
                    $('//content/item').forEach((ele) => {
                        const eleXml = queryXml(ele.element)
                        const channelInfo = new ChannelInfoDto()
                        channelInfo.id = ele.attr('id')!
                        channelInfo.chlNum = eleXml('chlNum').text()
                        channelInfo.name = eleXml('name').text()
                        channelInfo.devID = eleXml('devID').text()
                        channelInfo.ip = eleXml('ip').text()
                        channelInfo.port = eleXml('port').text()
                        channelInfo.poePort = eleXml('poePort').text()
                        channelInfo.userName = eleXml('userName').text()
                        channelInfo.password = eleXml('password').text()
                        channelInfo.protocolType = eleXml('protocolType').text()
                        channelInfo.addType = eleXml('addType').text()
                        channelInfo.accessType = eleXml('AccessType').text() == '0' ? 'NORMAL' : 'THERMAL'
                        channelInfo.chlIndex = eleXml('chlIndex').text() // 多通道IPC产品的子通道号
                        rowData.push(channelInfo)
                    })
                }
                cb(rowData)
            })
        }

        const saveData = () => {
            let data = rawXml`
                <types>
                    <manufacturer>`
            for (const key in manufacturerMap) {
                data += `<enum displayName='${manufacturerMap[key]}'>${key}</enum>`
            }
            data += rawXml`
                    </manufacturer>
                    <protocolType>
                        <enum>TVT_IPCAMERA</enum>
                        <enum>ONVIF</enum>
                    </protocolType>
                </types>
                <content type='list'>
                    <itemType>
                        <manufacturer type='manufacturer'/>
                        <protocolType type='protocolType'/>
                    </itemType>`
            let tmpSendXml = ''
            RTSPData.forEach((ele: MultiChlIPCAddDto) => {
                tmpSendXml += getSaveData(ele, 'RTSP', '')
            })
            normalChlData.forEach((ele: MultiChlIPCAddDto) => {
                tmpSendXml += getSaveData(ele, 'NON-RTSP', 'NORMAL')
            })
            tableData.value.forEach((ele: MultiChlIPCAddDto) => {
                if (ele.type == 'THERMAL_DOUBLE') {
                    const visibleLight = ele.multichannelCheckedInfoList[0]
                    const thermal = ele.multichannelCheckedInfoList[1]
                    if (visibleLight.checked && !visibleLight.disabled) {
                        tmpSendXml += getSaveData(ele, 'NON-RTSP', 'NORMAL')
                    }
                    if (thermal.checked && !thermal.disabled) {
                        tmpSendXml += getSaveData(ele, 'NON-RTSP', 'THERMAL')
                    }
                }
            })
            if (!tmpSendXml) {
                router.push('list')
            } else {
                data += tmpSendXml + '</content>'
                callback(getXmlWrapData(data))
            }
        }

        const getSaveData = (element: MultiChlIPCAddDto, chlType: string, accessType: string) => {
            const name = calChlName()
            let itemXMLStr = ''
            let ipXmlStr = ''
            let domainXmlStr = ''
            if (element.addrType == 'ip') {
                ipXmlStr = `<ip>${element.ip}</ip>`
            } else if (element.addrType == 'ipv6') {
                ipXmlStr = `<ip>${element.domain}</ip>`
            } else {
                if (checkIpV4(element.domain)) {
                    ipXmlStr = `<ip>${element.domain}</ip>`
                } else {
                    domainXmlStr = `<domain><![CDATA[${element.domain}]]></domain>`
                }
            }
            if (chlType == 'RTSP') {
                let manufacturerID = '1'
                protocolList.forEach((ele: Record<string, string>) => {
                    //解决中间有空格不相等的问题
                    if (Trim(ele.displayName, 'g') == Trim(element.manufacturer, 'g')) manufacturerID = ele.index
                })
                itemXMLStr += rawXml`
                    <item>
                        <name><![CDATA[${name}]]></name>
                        ${ipXmlStr}
                        ${domainXmlStr}
                        <port>0</port>
                        <userName><![CDATA[${cutStringByByte(element.userName, nameByteMaxLen)}]]></userName>
                        <password${getSecurityVer()}><![CDATA[${AES_encrypt(element.password, userSessionStore.sesionKey)}]]></password>
                        <index>0</index>
                        <manufacturer>RTSP_${manufacturerID}</manufacturer>
                        <protocolType>RTSP</protocolType>
                        <productModel></productModel>
                        ${defaultParam}
                    </item>`
            } else {
                itemXMLStr += rawXml`
                    <item>
                        <name><![CDATA[${name}]]></name>
                        ${ipXmlStr}
                        ${domainXmlStr}
                        <port>${element.port}</port>
                        <userName><![CDATA[${cutStringByByte(element.userName, nameByteMaxLen)}]]></userName>
                        ${element.password == '******' ? '' : '<password' + getSecurityVer() + '><![CDATA[' + AES_encrypt(element.password, userSessionStore.sesionKey) + ']]></password>'}
                        <index>0</index>
                        <manufacturer>${element.manufacturer}</manufacturer>
                        <protocolType>${chlMapping[element.manufacturer]['protocolType']}</protocolType>
                        <productModel></productModel>
                        <accessType>${accessType}</accessType>
                        ${defaultParam}
                    </item>`
            }
            return itemXMLStr
        }

        const calChlName = () => {
            numName++
            const defalutName = Translate('IDCS_IP_CHANNEL')
            const chlIndex = numName.toString().length < 2 ? '0' + numName : numName
            const chlName = defalutName + ' ' + chlIndex
            return chlName
        }

        const Trim = (str: string, is_global: string): string => {
            let result
            result = str.replace(/(^\s+)|(\s+$)/g, '')
            if (is_global.toLowerCase() == 'g') {
                result = result.replace(/\s/g, '')
            }
            return result
        }

        return {
            multiChlIPCCfgDialogVisiable,
            tableData,
            opened,
            init,
            saveData,
        }
    },
})
