/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-06-03 11:56:43
 * @Description: 插件命令集合
 */
const wrapXml = (xml: string) => (import.meta.env.DEV ? compressXml(`${xmlHeader}${xml}`) : `${xmlHeader}${xml}`)

export const OCX_XML_OpenFileBrowser_getpath = (xmlStr: string) => {
    const $xmlDoc = queryXml(XMLStr2XMLDoc(xmlStr))
    return $xmlDoc("response[@type='OpenFileBrowser']").text()
}

export const DEFAULT_OCX_CONFIG = {
    // 插件配置
    viewType: 'Live',
    setModel: 'Interactive',
    NotifyFunName: 'VideoPluginNotify',
    systemType: 'NVMS-9000',
    screenNum: '1',
    uiName: import.meta.env.VITE_UI_TYPE,
}

/**
 * @description 初始化OCX
 * @param {string} model Interactive(交互模式)/ReadOnly(只读模式)/Fixed
 * @param {string} notifyFunName 回调函数
 * @param {string} viewType 视图类型
 * @param {number} screenNum 分屏数
 * @return {string}
 */
// export const OCX_XML_Initial = (model: string, notifyFunName: string, viewType: string, screenNum?: number) => {
//     return wrapXml(rawXml`
//         <cmd type="Initial">
//             ${viewType ? `<viewType>${viewType}</viewType>` : ''}
//             ${model ? `<setModel>${model}</setModel>` : ''}
//             <setLang></setLang>
//             ${notifyFunName ? `<NotifyFunName>${notifyFunName}</NotifyFunName>` : ''}
//             <systemType>NVMS-9000</systemType>
//             <screenNum>${screenNum ? screenNum : 1}</screenNum>
//             <uiName>${import.meta.env.VITE_UI_TYPE}</uiName>
//         </cmd>`)
// }

/**
 * @description 初始化OCX
 * @param {string} model Interactive(交互模式)/ReadOnly(只读模式)/Fixed
 * @param {string} notifyFunName 回调函数
 * @param {string} viewType 视图类型
 * @param {number} screenNum 分屏数
 * @return {string}
 */
// export const OCX_XML_Initial_P2P = (model?: string, notifyFunName?: string, viewType?: string, screenNum?: number) => {
//     const p2pVersion = useUserSessionStore().p2pVersion
//     return wrapXml(rawXml`
//         <cmd type="Initial">
//             ${viewType ? `<viewType>${viewType}</viewType>` : ''}
//             ${model ? `<setModel>${model}</setModel>` : ''}
//             <natSvc>
//                 ${p2pVersion === '1.0' ? `<item ver="${p2pVersion}" ip="${natIp}" port="${natPort}" />` : `<item ver="${p2pVersion}" ip="${natIp_2_0}" port="${natPort_2_0}" />`}
//             </natSvc>
//             ${notifyFunName ? `<NotifyFunName>${notifyFunName}</NotifyFunName>` : ''}
//             <systemType>NVMS-9000</systemType>
//             <screenNum>${screenNum ? screenNum : 1}</screenNum>
//             <uiName>${import.meta.env.VITE_UI_TYPE}</uiName>
//         </cmd>
//     `)
// }

/**
 * @description
 * @param model
 * @param viewType
 * @returns {string}
 */
export const OCX_XML_SetPluginModel = (model?: string, viewType?: string) => {
    return wrapXml(rawXml`
        <cmd type="SetPluginModel">
            ${viewType ? `<viewType>${viewType}</viewType>` : ''}
            ${model ? `<setModel>${model}</setModel>` : ''}
        </cmd>
    `)
}

/**
 * @description 设置插件视频位置
 * @param {string} winLeft 左上角坐标X
 * @param {string} winTop  左上角坐标Y
 * @param {string} winWidth 视频宽
 * @param {string} winHeight 视频高
 * @param {string} winPosType 定位方式, relativeToDom/relativeToBrowser/relativeToScreen
 * @param {string} domWidth 文档流宽
 * @param {string} domHeight 文档流高
 * @return {string}
 */
export const OCX_XML_SetPluginSize = (
    winLeft: number,
    winTop: number,
    winWidth: number,
    winHeight: number,
    winPosType?: 'relativeToDom' | 'relativeToBrowser' | 'relativeToScreen' | 'absolute',
    domWidth?: number,
    domHeight?: number,
) => {
    return wrapXml(rawXml`
        <cmd type="SetPluginSize">
            <winLeft>${winLeft}</winLeft>
            <winTop>${winTop}</winTop>
            <winWidth>${winWidth}</winWidth>
            <winHeight>${winHeight}</winHeight>
            <winPosType>${winPosType || 'absolute'}</winPosType>
            ${domWidth && domWidth > 0 ? `<domWidth>${domWidth}</domWidth>` : ''}
            ${domHeight && domHeight > 0 ? `<domHeight>${domHeight}</domHeight>` : ''}
        </cmd>
    `)
}

/**
 * @description
 * @param isShow
 * @returns {string}
 */
export const OCX_XML_DisplayPlugin = (isShow: boolean) => {
    return wrapXml(rawXml`
        <cmd type="DisplayPlugin">
            <displayPlugin>${Boolean(isShow)}</displayPlugin>
        </cmd>
    `)
}

export const OCX_XML_PluginParentWinChange = () => {
    return wrapXml(rawXml`
        <cmd type="PluginParentWinChange" />
    `)
}

/**
 * @description 设置OCX属性
 * @param {Record<string, string | Boolean>} properties
 * @param {string} viewType
 * @returns {string}
 */
export const OCX_XML_SetProperty = (properties: Record<string, string | Boolean>, viewType?: string) => {
    return wrapXml(rawXml`
        <cmd type="SetProperty">
            ${viewType ? `<viewType>${viewType}</viewType>` : ''}
            ${Object.entries(properties)
                .map(([key, item]) => `<${key}>${item}</${key}>`)
                .join('')}
        </cmd>
    `)
}

/**
 * @description 设置OSD属性
 * @param {boolean} nameSwitch
 * @param {boolean} iconSwitch
 * @param {boolean} addressSwitch
 * @returns {string}
 */
export const OCX_XML_SetPropertyOSD = (nameSwitch: boolean, iconSwitch: boolean, addressSwitch: boolean) => {
    return wrapXml(rawXml`
        <cmd type="SetProperty">
            <devOsdDisplay>
                <nameSwitch>${nameSwitch}</nameSwitch>
                <iconSwitch>${iconSwitch}</iconSwitch>
                <addressSwitch>${addressSwitch}</addressSwitch>
            </devOsdDisplay>
        </cmd>
    `)
}

/**
 * @description
 * @param properties
 * @param viewType
 * @returns {string}
 */
export const OCX_XML_SetModeTwo = (properties: Record<string, string | Boolean>, viewType: string) => {
    return wrapXml(rawXml`
        <cmd type="SetNewProperty">
            ${viewType ? `<viewType>${viewType}</viewType>` : ''}
            ${Object.entries(properties)
                .map(([key, item]) => `<${key}>${item}</${key}>`)
                .join('')}
        </cmd>
    `)
}

// 获取“设置登录信息”的XML命令字符串
export const OCX_XML_SetLoginInfo = (ip: string, port: number, id?: string, config?: typeof DEFAULT_OCX_CONFIG) => {
    const userSession = useUserSessionStore()
    config = config || DEFAULT_OCX_CONFIG

    return wrapXml(rawXml`
        <cmd type="SetLoginInfo">
            <username>${userSession.sessionId}</username>
            <password>${userSession.token}</password>
            <ip>${ip}</ip>
            <port>${port}</port>
            <id>${id || ''}</id>
            <config>
                <viewType>${config.viewType}</viewType>
                <setModel>${config.setModel}</setModel>
                <NotifyFunName>${config.NotifyFunName}</NotifyFunName>
                <systemType>${config.systemType}</systemType>
                <screenNum>${config.screenNum}</screenNum>
                <uiName>${config.uiName}</uiName>
            </config>
        </cmd>
    `)
}

// 获取“P2P用户名/密码登录”的XML命令字符串
export const OCX_XML_SetPasswordLogin_P2P = (username: string, pwd: string, sn: string, config?: typeof DEFAULT_OCX_CONFIG) => {
    config = config || DEFAULT_OCX_CONFIG
    return wrapXml(rawXml`
        <cmd type="SetLoginInfo" loginType="password">
            <username>${wrapCDATA(username)}</username>
            <password>${wrapCDATA(pwd)}</password>
            <sn>${wrapCDATA(sn)}</sn>
            ${ISOLATION && CUSTOMER_ID ? `<isolation>${wrapCDATA(ISOLATION)}</isolation>` : ''}
            ${ISOLATION && CUSTOMER_ID ? `<customerID>${wrapCDATA(CUSTOMER_ID)}</customerID>` : ''}
            <config>
                <viewType>${config.viewType}</viewType>
                <setModel>${config.setModel}</setModel>
                <NotifyFunName>${config.NotifyFunName}</NotifyFunName>
                <systemType>${config.systemType}</systemType>
                <screenNum>${config.screenNum}</screenNum>
                <uiName>${config.uiName}</uiName>
            </config>
            <natSvc>
                <item ver="2.0" ip="${natIp_2_0}" port="${natPort_2_0}"></item>
            </natSvc>
        </cmd>
    `)
}

// p2p插件鉴权认证登录（依赖token和sessionId, 用于刷新页面时）
export const OCX_XML_P2PAuthentication = (config?: typeof DEFAULT_OCX_CONFIG) => {
    const userSession = useUserSessionStore()
    config = config || DEFAULT_OCX_CONFIG
    return wrapXml(rawXml`
        <cmd type="Authentication">
            <sn>${wrapCDATA(userSession.sn)}</sn>
            <p2pVer>2.0</p2pVer>
            <ip>${natIp_2_0}</ip>
            <port>${natPort_2_0}</port>
            <token>${userSession.token}</token>
            <sessionId>${userSession.sessionId}</sessionId>
            <config>
                <viewType>${config.viewType}</viewType>
                <setModel>${config.setModel}</setModel>
                <NotifyFunName>${config.NotifyFunName}</NotifyFunName>
                <systemType>${config.systemType}</systemType>
                <screenNum>${config.screenNum}</screenNum>
                <uiName>${config.uiName}</uiName>
            </config>
        </cmd>
    `)
}

// 获取“P2P授权码登录”的XML命令字符串
export const OCX_XML_SetAuthCodeLogin_P2P = (authCode: string, authIndex: string, sn: string, config?: typeof DEFAULT_OCX_CONFIG) => {
    config = config || DEFAULT_OCX_CONFIG

    return wrapXml(rawXml`
        <cmd type="SetLoginInfo" loginType="authCode">
            <authCode>${wrapCDATA(authCode)}</authCode>
            <authIndex>${wrapCDATA(authIndex)}</authIndex>
            <sn>${wrapCDATA(sn)}</sn>
            <natSvc>
                <item ver="2.0" ip="${natIp_2_0}" port="${natPort_2_0}"></item>
            </natSvc>
            <config>
                <viewType>${config.viewType}</viewType>
                <setModel>${config.setModel}</setModel>
                <NotifyFunName>${config.NotifyFunName}</NotifyFunName>
                <systemType>${config.systemType}</systemType>
                <screenNum>${config.screenNum}</screenNum>
                <uiName>${config.uiName}</uiName>
            </config>
        </cmd>
    `)
}

// 获取“P2P双重认证”的XML命令字符串（执行双重认证之前都会调一次普通登录, 这里不重复加config节点）
export const OCX_XML_SetDualAuthLogin_P2P = (username: string, password: string, sn: string, dualAuthUserName: string, dualAuthPassword: string) => {
    return wrapXml(rawXml`
        <cmd type="SetLoginInfo" loginType="dualAuth">
            <username>${wrapCDATA(username)}</username>
            <password>${wrapCDATA(password)}</password>
            <sn>${wrapCDATA(sn)}</sn>
            <dualAuthUserName>${wrapCDATA(dualAuthUserName)}</dualAuthUserName>
            <dualAuthPassword>${wrapCDATA(dualAuthPassword)}</dualAuthPassword>
            <natSvc>
                <item ver="2.0" ip="${natIp_2_0}" port="${natPort_2_0}"></item>
            </natSvc>
        </cmd>
    `)
}

// 获取“P2P sessionId登录”的XML命令字符串
export const OCX_XML_SetSessionIdLogin_P2P = (sessionId: string, sn: string, config?: typeof DEFAULT_OCX_CONFIG) => {
    config = config || DEFAULT_OCX_CONFIG
    return wrapXml(rawXml`
        <cmd type="SetLoginInfo" loginType="sessionId">
            <sessionId>${wrapCDATA(sessionId)}</sessionId>
            <sn>${wrapCDATA(sn)}</sn>
            <natSvc>
                <item ver="2.0" ip="${natIp_2_0}" port="${natPort_2_0}"></item>
            </natSvc>
            <config>
                <viewType>${config.viewType}</viewType>
                <setModel>${config.setModel}</setModel>
                <NotifyFunName>${config.NotifyFunName}</NotifyFunName>
                <systemType>${config.systemType}</systemType>
                <screenNum>${config.screenNum}</screenNum>
                <uiName>${config.uiName}</uiName>
            </config>
        </cmd>
    `)
}

// 获取“P2P DAToken登录”的XML命令字符串
export const OCX_XML_SetDATokenLogin_P2P = (sn: string, daToken: string, sign: string, config?: typeof DEFAULT_OCX_CONFIG) => {
    config = config || DEFAULT_OCX_CONFIG
    return wrapXml(rawXml`
        <cmd type="SetLoginInfo" loginType="sessionId">
            <sn>${wrapCDATA(sn)}</sn>
            <sign>${wrapCDATA(sign)}</sign>
            <daToken>${wrapCDATA(daToken)}</daToken>
            <natSvc>
                <item ver="2.0" ip="${natIp_2_0}" port="${natPort_2_0}"></item>
            </natSvc>
            <config>
                <viewType>${config.viewType}</viewType>
                <setModel>${config.setModel}</setModel>
                <NotifyFunName>${config.NotifyFunName}</NotifyFunName>
                <systemType>${config.systemType}</systemType>
                <screenNum>${config.screenNum}</screenNum>
                <uiName>${config.uiName}</uiName>
            </config>
        </cmd>
    `)
}

/**
 * @description 获取“设置分割屏”的XML命令字符串
 * @param screenNum
 * @param layoutType
 * @param viewType
 * @returns {string}
 */
export const OCX_XML_SetScreenMode = (screenNum: number, layoutType?: number) => {
    return wrapXml(rawXml`
        <cmd type="SetScreenMode" layoutType="${layoutType || 1}">${screenNum}</cmd>
    `)
}

/**
 * @description 获取“选择分割屏”的XML命令字符串
 * @param screenIndex
 * @returns {string}
 */
export const OCX_XML_SelectScreen = (screenIndex: number) => {
    return wrapXml(rawXml`<cmd type="SelectScreen">${screenIndex}</cmd>`)
}

/**
 * @description 获取“设置当前选中通道ID”的XML命令字符串
 * @param chlId
 * @param chlName
 * @param chlPoe
 * @returns {string}
 */
export const OCX_XML_SetViewChannelID = (chlId: string, chlName: string, chlPoe?: { chlIp?: string; poeSwitch?: boolean }) => {
    return wrapXml(rawXml`
        <cmd type="SetViewChannelId">
            <item id="${chlId}" chlIp="${chlPoe?.chlIp || ' '}" poe="${chlPoe?.poeSwitch || false}">${chlName}</item>
        </cmd>
    `)
}

/**
 * @description 获取“设置当前选中通道ID列表”的XML命令字符串
 * @param chlIds
 * @param chlNames
 * @param chlPoe
 * @returns {string}
 */
export const OCX_XML_SetAllViewChannelId = (chlIds: string[], chlNames: string[], chlPoe?: { chlIp?: string; poeSwitch?: boolean }[]) => {
    return wrapXml(rawXml`
        <cmd type="SetAllViewChannelId">
            ${chlIds
                .map((item, key) => {
                    return `<item id="${item}" chlIp="${chlPoe ? chlPoe[key]?.chlIp || ' ' : ''}" poe="${chlPoe ? chlPoe[key]?.poeSwitch || false : false}">${chlNames[key]}</item>`
                })
                .join('')}
        </cmd>
    `)
}

/**
 * @description 获取“设置通道组”的XML命令字符串
 * @param {Array} chlIds
 * @param {String} chlGroupId
 * @param {Number} dwellTime
 */
export const OCX_XML_CallChlGroup = (chlIds: { id: string; value: string }[], chlGroupId: string, dwellTime: number) => {
    return wrapXml(rawXml`
        <cmd type="CallChlGroup">
            <groupId>${chlGroupId}</groupId>
            <switchTime>${dwellTime}</switchTime>
            <chls>
                ${chlIds.map((item) => `<item id="${item.id}">${item.value}</item>`).join('')}
            </chls>
        </cmd>
    `)
}

/**
 * @description 获取“设置当前选中设备ID”的XML命令字符串
 * @param {number} equId 设备ID
 * @returns {string}
 */
export const OCX_XML_SetViewEquipmentID = (equId: number) => {
    return wrapXml(rawXml`
        <cmd type="SetViewEquipmentId">
            <item>${equId}</item>
        </cmd>
    `)
}

/**
 * @description 获取“停止预览”的XML命令字符串
 * @param {string | number} screenIndex 窗口编号 ALL/CURRENT/int
 * @returns {string}
 */
export const OCX_XML_StopPreview = (screenIndex: number | 'ALL' | 'CURRENT') => {
    return wrapXml(rawXml`
        <cmd type="StopPreview">${screenIndex}</cmd>
    `)
}

/**
 * @description 获取“停止预览”的XML命令字符串
 * @returns {string}
 */
export const OCX_XML_StopRec = () => {
    return wrapXml(rawXml`<cmd type="StopRec" />`)
}

/**
 * @description 退出OCX
 * @returns {string}
 */
export const OCX_XML_Leave = () => {
    return wrapXml(rawXml`<cmd type="Leave"/>`)
}

/**
 * @description 查询回放录像
 * @param cmdType 'RecPlay' | 'RecSearch' | 'RecSearchNotBindWin'
 * @param startTime
 * @param endTime
 * @param winIndexList
 * @param chlIdList
 * @param chlNameList
 * @param eventList
 * @param startTimeEx
 * @param endTimeEx
 * @param taskId
 * @returns {string}
 */
export const OCX_XML_SearchRec = (
    cmdType: 'RecPlay' | 'RecSearch' | 'RecSearchNotBindWin',
    startTime: string, // YYYY-MM-DD HH:mm:ss 本地时间
    endTime: string, // YYYY-MM-DD HH:mm:ss 本地时间
    winIndexList: number[],
    chlIdList: string[],
    chlNameList: string[],
    eventList: string[],
    startTimeEx?: string, // YYYY-MM-DD HH:mm:ss UTC时间
    endTimeEx?: string, // YYYY-MM-DD HH:mm:ss UTC时间
) => {
    // 老协议（queryChlRecLog）和新协议（queryRecLog）的事件字段一一对应的映射关系（老协议返回的事件类型是大写，新协议返回的事件类型是小写）
    const OldNewEventTypeMap: Record<string, string> = {
        // 常规回放（新-新）
        human: 'human', // 人...
        vehicle: 'vehicle', // 车...
        nonMotorizedVehicle: 'nonMotorizedVehicle', // 非机动车...
        // 事件回放（新-旧）
        motion: 'MOTION', // 移动侦测
        smdPerson: 'SMDHUMAN', // SMD-人
        smdCar: 'SMDVEHICLE', // SMD-车
        manual: 'MANUAL', // 手动
        pos: 'POS', // POS
        sensor: 'SENSOR', // 传感器
        intrusion: 'INVADE', // 区域入侵
        smartEntry: 'AOIENTRY', // 区域进入
        smartLeave: 'AOILEAVE', // 区域离开
        tripwire: 'TRIPWIRE', // 越界
        vfd: 'FACEDETECTION', // 人脸侦测
        faceMatch: 'FACEMATCH', // 人脸识别
        plateMatch: 'VEHICLE', // 车牌识别
        loitering: 'LOITERING', // 徘徊检测
        pvd: 'PVD', // 停车检测
        threshold: 'THRESHOLD', // 统计阈值
        cdd: 'CROWDDENSITY', // 人群密度检测
        osc: 'ITEMCARE', // 物品遗留与看护
        asd: 'AUDIOEXCEPTION', // 声音异常
        avd: 'VIDEOEXCEPTION', // 视频异常
        smartCroedGather: 'CROWDGATHER', // 人员聚集
        cpc: 'cpc', // 人流量统计...
        firePoint: 'FIREPOINT', // 火点检测
        temperatureAlarm: 'TEMPERATURE', // 温度检测
        schedule: 'SCHEDULE', // 排程
    }
    return wrapXml(rawXml`
        <cmd type="${cmdType}" compatibilityMode='true'>
            ${startTime ? `<startTime>${startTime}</startTime>` : ''}
            ${endTime ? `<endTime>${endTime}</endTime>` : ''}
            ${startTimeEx ? `<startTimeEx timeZone='UTC'>${startTimeEx}</startTimeEx>` : ''}
            ${endTimeEx ? `<endTimeEx timeZone='UTC'>${endTimeEx}</endTimeEx>` : ''}
            <chl>
                ${chlIdList.map((item, index) => `<item id="${item}" ${winIndexList ? ` winIndex="${winIndexList[index]}"` : ''}>${wrapCDATA(chlNameList[index])}</item>`).join('')}
            </chl>
            <recType>
                ${eventList.map((item) => `<item>${OldNewEventTypeMap[item] || item}</item>`).join('')}
            </recType>
        </cmd>
    `)
}

/**
 * 设置需要插件透明的区域
 * @param {*} points 透明的区域：参数为X、Y坐标位置
 * @param {*} posType 坐标系类型：relativeToDom、relativeToBrowser、relativeToScreen
 * @param {*} highBrushMode 拉伸、放缩时使用，仅下发SetTransparentArea并打开此开关，一次性下发所有要透明的区域
 * @returns
 */
export const OCX_XML_setTransparentArea = (points: CanvasBasePoint[], posType?: string, highBrushMode?: string) => {
    return wrapXml(rawXml`
        <cmd type="SetTransparentArea">
            <points>
                ${points.map((item) => `<item X="${item.X} Y="${item.Y}" />`).join('')}
            </points>
            ${posType ? `<posType>${posType}</posType>` : ''}
            ${highBrushMode ? `<highBrushMode>${highBrushMode}</highBrushMode>` : ''}
        </cmd>
    `)
}

/**
 * 恢复插件透明的区域
 * @param {*} points 透明的区域：参数为X、Y坐标位置
 * @param {*} posType 坐标系类型：relativeToDom、relativeToBrowser、relativeToScreen
 * @param {*} clearRegion 清除上次的显示设置；单区域隐藏时，可以每次打开该开关；多区域透明情况下，要恢复区域，只有当所有区域都恢复时才打开此开关
 * @returns
 */
export const OCX_XML_RestoreTransparentArea = (points: CanvasBasePoint[], posType?: string, clearRegion?: string) => {
    return wrapXml(rawXml`
        <cmd type="RestoreTransparentArea">
            <points>
                ${points.map((item) => `<item X="${item.X} Y="${item.Y}" />`).join('')}
            </points>
            ${posType ? `<posType>${posType}</posType>` : ''}
            ${clearRegion ? `<clearRegion>${clearRegion}</clearRegion>` : ''}
        </cmd>
    `)
}

/**
 * @description 播放选中的录像
 * @param chlId
 * @param chlName
 * @param event
 * @param startTime
 * @param endTime
 * @returns {string}
 */
export const OCX_XML_PlayRecItem = (chlId: string, chlName: string, event: string, startTime: number, endTime: number) => {
    return wrapXml(rawXml`
        <cmd type="PlayRecItem">
            <recItem chlId="${chlId}" chlName="${chlName}" event="${event}" startTime="${startTime}" endTime="${endTime}" />
        </cmd>
    `)
}

/**
 * @description 拍照
 * @param chlIdList
 * @returns {string}
 */
export const OCX_XML_TakePhoto = (chlIdList: number[]) => {
    return wrapXml(rawXml`
        <cmd type="TakePhoto">
            <chlId>
                ${chlIdList.map((item) => `<item>${item}</item>`).join('')}
            </chlId>
        </cmd>
    `)
}

/**
 * @description 拍照
 * @param winIndex
 * @returns {string}
 */
export const OCX_XML_TakePhotoByWinIndex = (winIndex: number) => {
    return wrapXml(rawXml`
        <cmd type="TakePhotoByWinIndex">${winIndex}</cmd>
    `)
}

// 拍照--获取base64
export const OCX_XML_TakePhotoBase64ByWinIndex = (winIndex: number) => {
    return wrapXml(rawXml`
        <cmd type="TakePhotoBase64ByWinIndex" snapCount="1">${winIndex}</cmd>
    `)
}

/**
 * @description 对讲
 * @param status
 * @param chlId
 * @returns {string}
 */
export const OCX_XML_TalkSwitch = (status: 'ON' | 'OFF', chlId?: string) => {
    return wrapXml(rawXml`
        <cmd type="TalkSwitch" ${chlId ? ` chlId="${chlId}"` : ''}>${status}</cmd>
    `)
}

/**
 * @description 原始比例
 * @param win
 * @param status
 * @returns {string}
 */
export const OCX_XML_OriginalDisplaySwitch = (win: number, status: boolean) => {
    return wrapXml(rawXml`
        <cmd type="OriginalDisplaySwitch">
            <win>${win}</win>
            <switch>${status}</switch>
        </cmd>
    `)
}

/**
 * @description OSD
 * @param status
 * @returns {string}
 */
export const OCX_XML_OSDSwitch = (status: 'ON' | 'OFF') => {
    return wrapXml(rawXml`
        <cmd type="OSDSwitch">${status}</cmd>
    `)
}

/**
 * @description 设置码流类型
 * @param winIndex
 * @param streamIndex
 * @param mainResolution
 * @returns {string}
 */
export const OCX_XML_SetStreamType = (winIndex: number | 'ALL' | 'CURRENT', streamIndex: number, mainResolution?: string) => {
    return wrapXml(rawXml`
        <cmd type="SetStreamType">
            <win>${winIndex}</win>
            <streamType>${streamIndex}</streamType>
            ${mainResolution ? `<resolution>${mainResolution}</resolution>` : ''}
        </cmd>
    `)
}

/**
 * @description 录像
 * @param status
 * @returns {string}
 */
export const OCX_XML_RecSwitch = (status: 'ON' | 'OFF') => {
    return wrapXml(rawXml`
        <cmd type="RecSwitch">${status}</cmd>
    `)
}

/**
 * @description 全部录像
 * @param status
 * @returns {string}
 */
export const OCX_XML_AllRecSwitch = (status: 'ON' | 'OFF') => {
    return wrapXml(rawXml`
        <cmd type="AllRecSwitch">${status}</cmd>
    `)
}

/**
 * @description 声音
 * @param value
 * @returns {string}
 */
export const OCX_XML_SetVolume = (value: number) => {
    return wrapXml(rawXml`
        <cmd type="SetVolume">${value}</cmd>
    `)
}

/**
 * @description 轨迹
 * @param status
 * @returns {string}
 */
export const OCX_XML_TraceSwitch = (status: 'ON' | 'OFF') => {
    return wrapXml(rawXml`
        <cmd type="TraceSwitch">${status}</cmd>
    `)
}

/**
 * @description 自动扫描
 * @param status
 * @returns {string}
 */
export const OCX_XML_ScanSwitch = (status: 'ON' | 'OFF') => {
    return wrapXml(rawXml`
        <cmd type="ScanSwitch">${status}</cmd>
    `)
}

/**
 * @description 雨刷
 * @param status
 * @returns {string}
 */
export const OCX_XML_WiperSwitch = (status: 'ON' | 'OFF') => {
    return wrapXml(rawXml`
        <cmd type="WiperSwitch">${status}</cmd>
    `)
}

/**
 * @description 灯光
 * @param status
 * @returns {string}
 */
export const OCX_XML_LightSwitch = (status: 'ON' | 'OFF') => {
    return wrapXml(rawXml`
        <cmd type="LightSwitch">${status}</cmd>
    `)
}

/**
 * @description 设置语言
 * @param viewType
 * @returns {string}
 */
export const OCX_XML_SetLang = () => {
    const { langItems } = useLangStore()
    const keys = [
        'IDCS_FULLSCREEN',
        'IDCS_CLOSE_IMAGE',
        'IDCS_AUDIO_ON',
        'IDCS_AUDIO_OFF',
        'IDCS_VIDEO_PENDING',
        'IDCS_UNKNOWN_ERROR_CODE',
        'IDCS_FAILED',
        'IDCS_NODE_NOT_ONLINE',
        'IDCS_NO_NET_VIDEO',
        'IDCS_NO_CAMERA_ADD',
        'IDCS_INVALID_PARAMETER',
        'IDCS_DEVICE_BUSY',
        'IDCS_NO_PERMISSION',
        'IDCS_NOT_SUPPORTFUNC',
        'IDCS_DEVICE_TYPE_ERR',
        'IDCS_CONNECT_LIMIT',
        'IDCS_SYNC_WAITTING',
        'IDCS_LOCAL',
        'IDCS_PLAYBACK_END',
        'IDCS_NO_RECORD_DATA',
        'IDCS_MANUAL',
        'IDCS_SCHEDULE',
        'IDCS_INTELIGENCE_DETECTION',
        'IDCS_AI',
        'IDCS_MOTION_DETECTION',
        'IDCS_SENSOR',
        'IDCS_DEVICE_USER_NOTEXIST',
        'IDCS_DEVICE_BUSY',
        'IDCS_POS',
        'IDCS_POE',
        'IDCS_CHANNEL_NOTEXIST',
        'IDCS_CONNECT_FAILED',
        'IDCS_LOGIN_FAILED',
        'IDCS_CHOOSE_FOLDER',
        'IDCS_SET_CHANNEL_PALY_TIME_D',
        'IDCS_SET_PALY_SYN_TIME_D',
        'IDCS_NO_VIDEO_SIGNAL',
        'IDCS_CALENDAR_JANUARY',
        'IDCS_CALENDAR_FEBRUARY',
        'IDCS_CALENDAR_MARCH',
        'IDCS_CALENDAR_APRIL',
        'IDCS_CALENDAR_MAY',
        'IDCS_CALENDAR_JUNE',
        'IDCS_CALENDAR_JULY',
        'IDCS_CALENDAR_AUGUST',
        'IDCS_CALENDAR_SEPTEMBER',
        'IDCS_CALENDAR_OCTOBER',
        'IDCS_CALENDAR_NOVEMBER',
        'IDCS_CALENDAR_DECEMBER',
        'IDCS_CALENDAR_SUNDAY',
        'IDCS_CALENDAR_MONDAY',
        'IDCS_CALENDAR_TUESDAY',
        'IDCS_CALENDAR_WEDNESDAY',
        'IDCS_CALENDAR_THURSDAY',
        'IDCS_CALENDAR_FRIDAY',
        'IDCS_CALENDAR_SATURDAY',
        'IDCS_DISK_FULL',
        'IDCS_EVENT_NORMAL_ALL',
        'IDCS_FACE',
        'IDCS_LICENSE_PLATE',
        'IDCS_BEYOND_DETECTION',
        'IDCS_INVADE_DETECTION',
        'IDCS_MAINTENSIGN_ITEM_OTHERSYS',
        'IDCS_REMOTE_USER_LOCKED',
    ]
    return wrapXml(rawXml`
        <cmd type="SetLang">
            ${Object.entries(langItems)
                .filter((item) => keys.includes(item[0]))
                .map((item) => {
                    return `<item id="${item[0]}">${item[1]}</item>`
                })
                .join('')}
        </cmd>
    `)
}

/**
 * @description 设置播放状态
 * @param status
 * @param winInfo
 * @returns {string}
 */
export const OCX_XML_SetPlayStatus = (status: 'ON' | 'OFF' | 'STOP' | 'FORWARDS_PAUSE' | 'FORWARDS' | 'BACKWARDS_PAUSE' | 'BACKWARDS', winInfo: string | number = '') => {
    return wrapXml(rawXml`
        <cmd type="RecPlayStatus">
            ${winInfo !== '' ? `<winInfo>${winInfo}</winInfo>` : ''}
            <status>${status}</status>
        </cmd>
    `)
}

/**
 * @description 设置播放倍速
 * @param speed
 * @returns {string}
 */
export const OCX_XML_SetPlaySpeed = (speed: number) => {
    return wrapXml(rawXml`
        <cmd type="RecPlaySpeed">${speed}</cmd>
    `)
}

/**
 * @description 设置备份开始时间
 * @returns {string}
 */
export const OCX_XML_BackUpRecStartTime = () => {
    return wrapXml(rawXml`<cmd type="BackUpRecStartTime" target="dateCtrl" />`)
}

/**
 * @description 设置备份结束时间
 * @returns {string}
 */
export const OCX_XML_BackUpRecEndTime = () => {
    return wrapXml(rawXml`<cmd type="BackUpRecEndTime" target="dateCtrl" />`)
}

/**
 * @description 查询录像备份条件
 * @returns {string}
 */
export const OCX_XML_BackUpRecCondition = () => {
    return wrapXml(rawXml`<request type="BackUpRecCondition" target="dateCtrl"/>`)
}

/**
 * @description 备份录像数据
 * @param startTime
 * @param endTime
 * @returns {string}
 */
export const OCX_XML_BackUpRec = (startTime: number, endTime: number) => {
    return wrapXml(rawXml`
        <cmd type="BackUpRec">
            <startTime>${startTime}</startTime>
            <endTime>${endTime}</endTime>
        </cmd>
    `)
}

/**
 * @description 备份录像数据
 * @param type
 * @param format
 * @param path
 * @param recList
 * @returns {string}
 */
export const OCX_XML_BackUpRecord = (
    type: string,
    format: string,
    path: string,
    recList: { chlId: number; chlIndex: number; chlName: string; event: string; startTime: number; endTime: number }[],
) => {
    return wrapXml(rawXml`
        <cmd type="BackUpRec">
            <type>${type}</type>
            <format>${format}</format>
            <path>${wrapCDATA(path)}</path>
            <recList>
                ${recList.map((item) => `<item chlId="${item.chlId}" chlIndex="${item.chlIndex}" chlName="${item.chlName}" event="${item.event}" startTime="${item.startTime}" endTime="${item.endTime}">${wrapCDATA(item.chlName)}</item>`).join('')}
            </recList>
        </cmd>
    `)
}

/**
 * @description 在回放中备份录像数据
 * @param format
 * @param path
 * @param startTime
 * @param endTime
 * @param eventList
 * @returns {string}
 */
export const OCX_XML_BackUpRecInRecPlay = (format: string, path: string, startTime: number, endTime: number, eventList: string[]) => {
    return wrapXml(rawXml`
        <cmd type="BackUpRecInRecPlay">
            <format>${format}</format>
            <path><![CDATA[${path}]</path>
            <startTime>${startTime}</startTime>
            <endTime>${endTime}</endTime>
            <recType>
                ${eventList.map((item) => `<item>${item}</item>`).join('')}
            </recType>
        </cmd>
    `)
}

/**
 * @description 备份录像数据操作
 * @param operate
 * @param taskIds
 * @returns {string}
 */
export const OCX_XML_BackUpRecOperate = (operate: string, taskIds: string[]) => {
    return wrapXml(rawXml`
        <cmd type="${operate}">
            <tasksIds>
                ${taskIds.map((item) => `<item>${item}</item>`).join('')}
            </tasksIds>
        </cmd>
    `)
}

/**
 * @description 前进/后退N秒
 * @param time 秒
 * @returns {string}
 */
export const OCX_XML_Skip = (time: number) => {
    return wrapXml(rawXml`<cmd type="Skip">${time}</cmd>`)
}

/**
 * @description 设置当前播放时间点
 * @param winList
 * @param startTime
 * @returns {string}
 */
export const OCX_XML_RecCurPlayTime = (winList: { time: string; timeStamp: number; index: number }[], taskId?: number) => {
    return wrapXml(
        rawXml`
            <cmd type="RecCurPlayTime" ${taskId ? ` taskId="${taskId}"` : ''}>
                ${winList.map((item) => `<win index="${item.index}" time="${item.time}">${item.timeStamp}</win>`).join('')}
            </cmd>
        `,
    )
}

/**
 * @description 设置录像位置
 * @param location
 * @returns {string}
 */
export const OCX_XML_SetRecLocation = (location: string) => {
    return wrapXml(rawXml`<cmd type="SetRecLocation">${location}</cmd>`)
}

/**
 * @description 播放下一帧
 * @returns {string}
 */
export const OCX_XML_RecNextFrame = () => {
    return wrapXml('<cmd type="RecNextFrame"/>')
}

/**
 * @description 播放上一帧
 * @returns {string}
 */
export const OCX_XML_RecPreFrame = () => {
    return wrapXml('<cmd type="RecPreFrame"/>')
}

/**
 * @description 设置当前播放时间
 * @param seconds
 * @returns {string}
 */
export const OCX_XML_SetPlayTime = (seconds: number) => {
    return wrapXml(rawXml`<cmd type="RecCurPlayTime">${seconds}</cmd>`)
}

/**
 * @description 全屏
 * @returns {string}
 */
export const OCX_XML_FullScreen = () => {
    return wrapXml(rawXml`<cmd type="FullScreen"></cmd>`)
}

/**
 * @description 放大图像
 * @returns {string}
 */
export const OCX_XML_MagnifyImg = () => {
    return wrapXml(rawXml`<cmd type="MagnifyImg"></cmd>`)
}

/**
 * @description 缩小图像
 * @returns {string}
 */
export const OCX_XML_MinifyImg = () => {
    return wrapXml(rawXml`<cmd type="MinifyImg"></cmd>`)
}

/**
 * @description 恢复图像默认大小
 * @returns {string}
 */
export const OCX_XML_DefaultSize = () => {
    return wrapXml(rawXml`<cmd type="DefaultSize"></cmd>`)
}

/**
 * @description 设置录像播放模式--同步/非同步
 * @param mode
 * @param viewType
 * @returns {string}
 */
export const OCX_XML_SetRecPlayMode = (mode: string) => {
    return wrapXml(rawXml`<cmd type="SetRecPlayMode">${mode}</cmd>`)
}

/**
 * @description 获取“设置移动侦测区域操作类型”的XML命令字符串
 * @param action
 * @returns {string}
 */
export const OCX_XML_SetMotionAreaAction = (action: 'ADD' | 'DEL' | 'ALL' | 'NONE' | 'INVERSE') => {
    return wrapXml(rawXml`<cmd type="SetMotionAreaAction">${action}</cmd>`)
}

/**
 * @description 设置移动侦测区域
 * @param motion
 * @returns {string}
 */
export const OCX_XML_SetMotionArea = (motion: { column: number; row: number; areaInfo: string[] }) => {
    return wrapXml(rawXml`
        <cmd type="SetMotionArea">
            <column>${motion.column}</column>
            <row>${motion.row}</row>
            <areaInfo>
                ${motion.areaInfo.map((item) => `<item>${item}</item>`).join('')}
            </areaInfo>
        </cmd>
    `)
}

/**
 * @description 获取移动侦测区域
 * @returns {string}
 */
export const OCX_XML_GetMotionArea = () => {
    return wrapXml(rawXml`<request type="GetMotionArea"/>`)
}

/**
 * @description 获取OSD显示信息
 * @returns {string}
 */
export const OCX_XML_GetOSDInfo = () => {
    return '<request type="GetOSDInfo"/>'
}

export interface OcxXmlSetOSDInfoOption {
    X: number
    Y: number
    XMinValue: number
    XMaxValue: number
    YMinValue: number
    YMaxValue: number
    [key: string]: string | number | boolean
}
export interface OcxXmlSetOSDInfo {
    timeStamp: OcxXmlSetOSDInfoOption
    deviceName: OcxXmlSetOSDInfoOption
}

/**
 * @description 设置OSD显示信息
 * @param osd
 * @returns {string}
 */
export const OCX_XML_SetOSDInfo = (osd: OcxXmlSetOSDInfo) => {
    return wrapXml(rawXml`
        <cmd type="SetOSDInfo">
            ${
                (osd.timeStamp
                    ? `<timeStamp>${Object.keys(osd.timeStamp)
                          .map((key) => {
                              if (key === 'X') {
                                  return `<X min="${osd.timeStamp!.XMinValue}" max="${osd.timeStamp!.XMaxValue}">${osd.timeStamp.X}</X>`
                              } else if (key === 'Y') {
                                  return `<Y min="${osd.timeStamp!.YMinValue}" max="${osd.timeStamp!.YMaxValue}">${osd.timeStamp.Y}</Y>`
                              } else if (!['XMinValue', 'XMaxValue', 'YMinValue', 'YMaxValue'].includes(key)) {
                                  return `<${key}>${osd.timeStamp![key]}</${key}>`
                              } else return ''
                          })
                          .join('')}</timeStamp>`
                    : '') +
                (osd.deviceName
                    ? `<deviceName>${Object.keys(osd.deviceName!)
                          .map((key) => {
                              if (key === 'X') {
                                  return `<X min="${osd.deviceName!.XMinValue}" max="${osd.deviceName!.XMaxValue}">${osd.deviceName.X}</X>`
                              } else if (key === 'Y') {
                                  return `<Y min="${osd.deviceName!.YMinValue}" max="${osd.deviceName!.YMaxValue}">${osd.deviceName.Y}</Y>`
                              } else if (!['XMinValue', 'XMaxValue', 'YMinValue', 'YMaxValue'].includes(key)) {
                                  return `<${key}>${osd.deviceName![key]}</${key}>`
                              } else return ''
                          })
                          .join('')}</deviceName>`
                    : '')
            }
        </cmd>
    `)
}

interface OcxXmlSetLogoInfo {
    switch: 'ON' | 'OFF'
    minOpacity: number
    maxOpacity: number
    opacity: number
    minX: number
    maxX: number
    x: number
    minY: number
    maxY: number
    y: number
}
/**
 * @description 设置logo
 * @param opts
 * @returns {string}
 */
export const OCX_XML_SetLogoInfo = (opts: OcxXmlSetLogoInfo) => {
    return wrapXml(rawXml`
        <cmd type="SetLogoInfo">
            <switch>${opts.switch}</switch>
            <opacity min="${opts.minOpacity}" max="${opts.maxOpacity}" >${opts.opacity}</opacity>
            <X min="${opts.minX}" max="${opts.maxX}">${opts.x}</X>
            <Y min="${opts.minY}" max="${opts.maxY}">${opts.y}</Y>
        </cmd>
    `)
}

/**
 * @description 设置水印
 * @param opts
 * @returns {string}
 */
export const OCX_XML_SetWaterMark = (opts: { switch: 'ON' | 'OFF'; customText: string }) => {
    return wrapXml(rawXml`
        <cmd type="SetWaterMark">
            <switch>${opts.switch}</switch>
            <customText>${opts.customText}</customText>
        </cmd>
    `)
}

// 设置智能信息
export const OCX_XML_SETAIInfo = (bool: boolean, targetId: string) => {
    return wrapXml(rawXml`
        <cmd type="setAIInfo">
            <switch>${bool}</switch>
            <targetid>${targetId}</targetid>
        </cmd>
    `)
}

/**
 * @description 开启/关闭视频遮挡配置
 * @param action
 * @returns {string}
 */
export const OCX_XML_MaskAreaSetSwitch = (action: 'EDIT_ON' | 'EDIT_OFF' | 'NONE') => {
    return wrapXml(rawXml`<cmd type="MaskAreaSetSwitchV2">${action}</cmd>`)
}

/**
 * @description 设置视频遮挡区域
 * @param masks
 * @returns {string}
 */
export const OCX_XML_SetMaskArea = (masks: { X: number; Y: number; width: number; height: number; isSelect?: boolean; color: string }[]) => {
    return wrapXml(rawXml`
        <cmd type="SetMaskAreaV2">
            ${masks
                .map((item, index) => {
                    return rawXml`<item id="${index}">
                        <rectangle>
                            <X>${item.X}</X>
                            <Y>${item.Y}</Y>
                            <width>${item.width}</width>
                            <height>${item.height}</height>
                            <maskColor>${item.isSelect ? 'green' : item.color}</maskColor>
                        </rectangle>
                    </item>`
                })
                .join('')}
        </cmd>
    `)
}

/**
 * @description 获取视频遮挡区域
 * @returns {string}
 */
export const OCX_XML_GetActiveMaskArea = () => {
    return wrapXml(rawXml`<request type="GetActiveMaskArea"/>`)
}

/**
 * @description 打开或关闭3D定位
 * @return {string}
 */
export const OCX_XML_3DSwitch = (isSwitch: boolean) => {
    return wrapXml(rawXml`<cmd type="3dSwitch">${isSwitch ? 'ON' : 'OFF'}</cmd>`)
}

/**
 * @description 打开文件选择窗口
 * @param mode
 * @param extension
 * @param defaultFileName
 * @param multiSelect
 * @param multiExtension
 * @returns {string}
 */
export const OCX_XML_OpenFileBrowser = (mode: string, extension?: string, defaultFileName?: string, multiSelect?: boolean, multiExtension?: string) => {
    return wrapXml(rawXml`
        <request type="OpenFileBrowser">
            <extension>${extension || '*'}</extension>
            <defaultFileName>${defaultFileName || ''}</defaultFileName>
            <multiSelect>${multiSelect || false}</multiSelect>
            ${multiExtension ? `<multiExtension>${multiExtension}</multiExtension>` : ''}
            <mode>${mode}</mode>
        </request>
    `)
}

interface OcxXmlFileNetTransportObj {
    filePath: string
    version: string
    authName?: string
    authPwd?: string
    progressInterval?: number
    checkPassword?: string
    secPassword?: string
    chlIds?: string[]
    taskGUID?: string
}
/**
 * @description 传输文件
 * @param {String} action 操作类型：UpgradeIPC、ExportCert、ImportCert、Import、Export、Upgrade
 * @param {Object} obj 配置参数
 *   filePath：文件路径
 *   version：设备版本
 *   authName：鉴权用户名
 *   authPwd：鉴权密码
 *   progressInterval：进度间隔
 *   checkPassword：再次确认密码
 *   secPassword: 加密密码
 *   chlIds：通道id数组
 *   taskGUID：任务GUID
 */
export const OCX_XML_FileNetTransport = (action: 'UpgradeIPC' | 'ExportCert' | 'ImportCert' | 'Import' | 'Export' | 'Upgrade', obj: OcxXmlFileNetTransportObj) => {
    return wrapXml(rawXml`
        <cmd type="FileNetTransport">
            <action>${action}</action>
            <filePath>${obj.filePath}</filePath>
            <version>${obj.version}</version>
            ${obj.taskGUID ? `<taskGUID>${obj.taskGUID}</taskGUID>` : ''}
            <userName>${obj.authName || ''}</userName>
            <password>${obj.authPwd ? wrapCDATA(obj.authPwd) : ''}</password>
            <progressInterval>${obj.progressInterval || 1000}</progressInterval>
            ${obj.checkPassword ? `<checkPassword>${obj.checkPassword}</checkPassword>` : ''}
            ${obj.secPassword ? `<secPassword>${obj.secPassword}</secPassword>` : ''}
            ${obj.chlIds ? `<destID>${obj.chlIds.map((item) => `<item>${item}</item>`)}</destID>` : ''}
        </cmd>
    `)
}

/**
 * @description 传输文件
 * @param {String} action 操作类型：ImportAudio
 * @param {Object} obj 配置参数
 *   filePath：文件路径
 *   id: 文件id
 *   version：设备版本
 *   progressInterval：进度间隔
 */
export const OCX_XML_AudioFileNetTransport = (action: 'ImportAudio', filePath: string, id: string, version: string, progressInterval?: number) => {
    return wrapXml(rawXml`
        <cmd type="FileNetTransport">
            <action>${action}</action>
            <filePath>${filePath}</filePath>
            <id>${id}</id>
            <version>${version}</version>
            <progressInterval>${progressInterval || 1000}</progressInterval>
        </cmd>
    `)
}

/**
 * @description 传输文件返回base64
 * @param {string} filePath
 * @returns {string}
 */
export const OCX_XML_UploadIPCAudioBase64 = (filePath: string) => {
    return wrapXml(rawXml`
        <cmd type="UploadIPCAudioBase64">
            <filePath>${filePath}</filePath>
        </cmd>
    `)
}

/**
 * @description 返回文件前4K的base64（升级文件校验）
 * @param action
 * @param fileLength
 * @param filePath
 * @returns {string}
 */
export const OCX_XML_CheckUpgradeFile = (action: string, fileLength: number, filePath: string) => {
    return wrapXml(rawXml`
        <cmd type="UploadUpgradeCheckFileBase64">
            <action>${action}</action>
            <fileLength>${fileLength}</fileLength>
            <filePath>${filePath}</filePath>
        </cmd>
    `)
}

/**
 * @description 获取“查询本地配置”的XML命令字符串
 * @returns {string}
 */
export const OCX_XML_GetLocalCfg = () => {
    return wrapXml(rawXml`<request type="GetLocalCfg"/>`)
}

/**
 * @description 获取“设置本地配置”的XML命令字符串
 * @param snapCount
 * @param liveSnapSavePath
 * @param recSavePath
 * @param recBackUpPath
 * @returns {string}
 */
export const OCX_XML_SetLocalCfg = (snapCount?: number, liveSnapSavePath?: string, recSavePath?: string, recBackUpPath?: string) => {
    return wrapXml(rawXml`
        <cmd type="SetLocalCfg">
            ${snapCount ? `<snapCount>${snapCount}</snapCount>` : ''}
            ${liveSnapSavePath ? `<liveSnapSavePath><![CDATA[${liveSnapSavePath}]]</liveSnapSavePath>` : ''}
            ${recSavePath ? `<recSavePath><![CDATA[${recSavePath}]]</recSavePath>` : ''}
            ${recBackUpPath ? `<recBackUpPath><![CDATA[${recBackUpPath}]]</recBackUpPath>` : ''}
        </cmd>
    `)
}

/**
 * @description 获取“保存本地文件”的XML命令字符串
 * @param filePath
 * @param content
 * @returns {string}
 */
export const OCX_XML_SaveLocalFile = (path: string, content: string, fileName: string) => {
    return wrapXml(rawXml`
        <cmd type="SaveLocalFileEx">
            <path>${wrapCDATA(path)}</path>
            <fileName>${wrapCDATA(fileName)}</fileName>
            <content>${wrapCDATA(content)}</content>
        </cmd>
    `)
}

/**
 * @description 获取“查询OCX版本号”的XML命令字符串
 * @returns {string}
 */
export const OCX_XML_GetOcxVersion = () => {
    return wrapXml(rawXml`<request type="GetOcxVersion"/>`)
}

// 通知插件绑定父窗口
export const OCX_XML_PluginBindWin = (id: string) => {
    if (!id) {
        id = Date.now() + ''
        document.title = id
        history.pushState(null, '', location.href)
    }
    return wrapXml(rawXml`
        <cmd type="BindWin">
            <id>${id}</id>
        </cmd>
    `)
}

/**
 * @description 获取“查询OCX版本号”的XML命令字符串
 * @returns {string}
 */
export const OCX_XML_GetOcxDisplay = () => {
    return wrapXml(rawXml`<request type="GetOcxDisplay"/>`)
}

/**
 * @description 获取水印开关的XML命令字符串
 * @param {boolean} isSwitch
 * @returns {string}
 */
export const OCX_XML_WaterMarkSwitch = (isSwitch: boolean) => {
    return wrapXml(rawXml`<cmd type="WaterMarkSwitch">${isSwitch ? 'ON' : 'OFF'}</cmd>`)
}

interface OcxXmlSetRecList {
    chlId: string
    chlName: string
    event: string
    startTime: string
    startTimeEx: string
    endTime: string
    endTimeEx: string
    duration: string
}
/**
 * @description 获取“设置回放列表”的XML命令字符串
 * @param chlId
 * @param winIndex
 * @param list
 * @param timeZone
 * @returns
 */
export const OCX_XML_SetRecList = (chlId: string, winIndex: number, list: OcxXmlSetRecList[], timeZone = 'UTC') => {
    return wrapXml(rawXml`
        <cmd type='SetRecList' compatibilityMode='true'>
            <status>success</status>
            <chlId>${chlId}</chlId>
            <winIndex>${winIndex}</winIndex>
            <recList timeZone="${timeZone}">
                ${list
                    .map(
                        (item) =>
                            `<item chlId="${item.chlId}" chlName="${item.chlName}" event="${item.event}" startTime="${item.startTime}" startTimeEx="${item.startTimeEx}" endTime="${item.endTime}" endTimeEx="${item.endTimeEx}" duration="${item.duration}" />`,
                    )
                    .join('')}
            </recList>
        </cmd>
    `)
}

/**
 * @description 清除回放列表
 * @param {number} winIndex
 * @returns
 */
export const OCX_XML_ClearRecList = (winIndex: number) => {
    return wrapXml(rawXml`
        <cmd type='SetRecList'>
            <status>success</status>
            <winIndex>${winIndex}</winIndex>
            <recList></recList>
        </cmd>
    `)
}

interface OcxXmlBackUpRecList extends OcxXmlSetRecList {
    chlIndex: number
}

/**
 * @description 获取“设置备份列表”的XML命令字符串
 * @param format
 * @param path
 * @param isMainStream
 * @param list
 */
export const OCX_XML_BackUpRecList = (format: string, path: string, groupby = 'chlId', isMainStream: boolean, list: OcxXmlBackUpRecList[]) => {
    return wrapXml(rawXml`
        <cmd type='BackUpRecList'>
            <format>${format}</format>
            <path>${wrapCDATA(path)}</path>
            <isMainStream>${isMainStream}</isMainStream>
            <backupRecList groupby='${groupby}'>
                ${list
                    .map(
                        (item) =>
                            `<item chlId="${item.chlId}" chlName="${item.chlName}" chlIndex="${item.chlIndex}" event="${item.event}" startTime="${item.startTime}" startTimeEx="${item.startTimeEx}" endTime="${item.endTime}" endTimeEx="${item.endTimeEx}" duration="${item.duration}" />`,
                    )
                    .join('')}
            </backupRecList>
        </cmd>
    `)
}

/************************************************************************/
/* MAC平台指令（新协议）
/************************************************************************/

//预览
interface OcxXmlPreview {
    winIndexList: number[]
    chlIdList: string[]
    chlNameList: string[]
    streamType: string
    poe?: {
        poeSwitch: boolean
        chlIp: string
    }[]
    chlIndexList: string[]
    chlTypeList: string[]
}
/**
 * @description 预览
 * @param obj
 * @returns {string}
 */
export const OCX_XML_Preview = ({ chlIdList, chlNameList, streamType, chlIndexList, chlTypeList, poe, winIndexList }: OcxXmlPreview) => {
    const { pluginPort } = usePluginStore()
    const serverIp = useUserSessionStore().serverIp
    const url = `tvt://${serverIp}:${pluginPort}/`

    return wrapXml(rawXml`
        <cmd type="Preview">
            ${winIndexList
                .map((item, i) => {
                    const params = getURLSearchParams({
                        chlId: chlIdList[i],
                        chlIndex: chlIndexList ? chlIndexList[i] || '0' : null,
                        chlName: chlNameList[i],
                        stream: streamType,
                        chlTypeList: chlTypeList ? chlTypeList[i] : null,
                        poe: poe ? poe[i]?.poeSwitch || false : false,
                        chlIp: poe ? poe[i]?.chlIp || ' ' : ' ',
                    })
                    return `<streamUrl winIndex="${item}">${url}${params}</streamUrl>`
                })
                .join('')}
        </cmd>
    `)
}

// 开启移动侦测动态分析
export const OCX_XML_SetDynamicMotion = (flag: boolean) => {
    return wrapXml(rawXml`<cmd type="SetDynamicMotion">${flag}</cmd>`)
}

//设置OSD
export interface OcxXmlSetOsdListDatum {
    winIndex: number
    osd?: string
    dateFormat?: string
    timeFormat?: string
    xMin: number
    xMax: number
    x: number
    yMin: number
    yMax: number
    y: number
    status: 'ON' | 'OFF'
}

export const OCX_XML_SetOSD = (edit: string, osdList: OcxXmlSetOsdListDatum[] = []) => {
    const osd = osdList
        .map(
            (item) => rawXml`
                <item
                    winIndex="${item.winIndex}"
                    ${item.osd ? ` osd="${item.osd}"` : ` dateFormat="${item.dateFormat}" timeFormat="${item.timeFormat}" `}
                    x="${item.x}"
                    xMin="${item.xMin || 0}"
                    xMax="${item.xMax || 1920}"
                    y="${item.y}"
                    yMin="${item.yMin || 0}"
                    yMax="${item.yMax || 1080}"
                    status="${item.status || 'OFF'}"
                />
            `,
        )
        .join('')
    return wrapXml(rawXml`
        <cmd type="SetOSD">
            <edit>${edit}</edit>
            ${osd ? `<osd>${osd}</osd>` : ''}
        </cmd>
    `)
}

/**
 * @description 设置录像播放模式--同步/非同步
 * @param mode
 * @returns {string}
 */
export const OCX_XML_SetPlayMode = (mode: string) => {
    return wrapXml(rawXml`<cmd type="SetPlayMode">${mode}</cmd>`)
}

/**
 * @description 设置播放倍速
 * @param speed
 * @returns {string}
 */
export const OCX_XML_PlaySpeed = (speed: number) => {
    return wrapXml(rawXml`<cmd type="PlaySpeed">${speed}</cmd>`)
}

/**
 * @description 设置播放状态
 * @param status
 * @param winInfo
 * @returns {string}
 */
export const OCX_XML_PlayStatus = (status: 'FORWARDS_PAUSE' | 'FORWARDS' | 'STOP', winInfo: string) => {
    return wrapXml(rawXml`
        <cmd type="PlayStatus">
            <winInfo>${winInfo}</winInfo>
            <status>${status}</status>
        </cmd>
    `)
}

interface OcxXmlRequestRecStream {
    winIndexList: number[]
    chlIdList: string[]
    chlNameList: string[]
    streamTypeList: string[]
    playStartTime: string // UTC时间，format YYYY-MM-DD HH:mm:ss
    playDuration: number
    eventList: string[]
    chlIndexList: string[]
    chlTypeList: string[]
    cmdType: string
    modeType?: 1 | 2
}
/**
 * @description 请求回放流
 * @param option
 * @returns {string}
 */
export const OCX_XML_RequestRecStream = (option: OcxXmlRequestRecStream) => {
    const { pluginPort } = usePluginStore()
    const { serverIp } = useUserSessionStore()

    return wrapXml(rawXml`
        <cmd type="${option.cmdType}">
            ${option.modeType ? `<modeType>${option.modeType}</modeType>` : ''}
            ${option.winIndexList
                .map((item, i) => {
                    const url = `tvt://${serverIp}:${pluginPort}/`
                    const param = getURLSearchParams({
                        chlId: option.chlIdList[i],
                        chlIndex: option.chlIndexList ? option.chlIndexList[i] || '0' : null,
                        chlName: option.chlNameList[i],
                        stream: option.streamTypeList[i],
                        chlType: option.chlTypeList ? option.chlTypeList[i] : null,
                        playStartTime: option.playStartTime,
                        playDuration: option.playDuration,
                        recType: option.eventList ? option.eventList.join('|') : null,
                    })
                    return `<streamUrl winIndex="${item}">${url}${param}</streamUrl>`
                })
                .join('')}
        </cmd>
    `)
}

/**
 * @description 查询录像
 * @param chlIdList
 * @param chlNameList
 * @param startTime
 * @param endTime
 * @param eventList
 * @returns {string}
 */
export const OCX_XML_RecSearch = (chlIdList: number[], chlNameList: string[], startTime: number, endTime: number, eventList: string[]) => {
    const { pluginPort } = usePluginStore()
    const serverIp = useUserSessionStore()
    const url = `tvt://${serverIp}:${pluginPort}/`
    return wrapXml(rawXml`
        <cmd type="RecSearchNotBindWin">
            ${chlIdList
                .map((item, i) => {
                    const param = {
                        chlId: item,
                        chlName: chlNameList[i],
                        startTime,
                        endTime,
                        recType: eventList.join('|'),
                    }
                    return `<streamUrl>${url}${param}</streamUrl>`
                })
                .join('')}
        </cmd>
    `)
}

/**
 * 播放下一帧
 * @returns {string}
 */
export const OCX_XML_PlayNextFrame = () => {
    return wrapXml('<cmd type="PlayNextFrame"/>')
}

/**
 * 播放上一帧
 * @returns {string}
 */
export const OCX_XML_PlayPreFrame = () => {
    return wrapXml('<cmd type="PlayPreFrame"/>')
}

/**
 * 视频遮挡操作
 * @param action
 * @returns {string}
 */
export const OCX_XML_SetMaskAreaAction = (action: 'EDIT_ON' | 'EDIT_OFF' | 'NONE') => {
    return wrapXml(rawXml`<cmd type="SetMaskAreaAction">${action}</cmd>`)
}

/**
 * @description 设置录像状态
 * @param chls
 * @returns {string}
 */
export const OCX_XML_SetRecStatus = (chls: { id: string; recType: string }[]) => {
    return wrapXml(rawXml`
        <cmd type="SetRecStatus">
            ${chls.map((item) => `<chl id="${item.id}" recType="${item.recType}" />`).join('')}
        </cmd>
    `)
}

/**
 * @description 设置视频丢失状态
 * @param chls
 * @returns {string}
 */
export const OCX_XML_SetVideoLossSwitch = (chls: { id: number; switch: boolean }[]) => {
    return wrapXml(rawXml`
        <cmd type="SetVideoLossSwitch">
            ${chls.map((item) => `<chl id="${item.id}" switch="${item.switch}" />`).join('')}
        </cmd>
    `)
}

/**
 * @description 物品看护操作
 * @param action
 * @param pointCount
 * @returns {string}
 */
export const OCX_XML_SetOscAreaAction = (action: 'EDIT_ON' | 'EDIT_OFF' | 'NONE', pointCount?: number) => {
    return wrapXml(rawXml`<cmd type="SetOscAreaAction" ${pointCount && action === 'EDIT_ON' ? ` maxPointCount="${pointCount}"` : ''}>${action}</cmd>`)
}

/**
 * @description 设置物品看护
 * @param points
 * @param regulation
 * @returns {string}
 */
export const OCX_XML_SetOscArea = (points: { X: number; Y: number }[], regulation = false) => {
    return wrapXml(rawXml`
        <cmd type="SetOscArea">
            <points>
                ${points.map((item) => `<item X="${item.X}" Y="${item.Y}" />`).join('')}
            </points>
            ${regulation ? '<type>regulation</type>' : ''}
        </cmd>
    `)
}

/**
 * @description 获取物品看护
 * @returns {string}
 */
export const OCX_XML_GetOscArea = () => {
    return wrapXml(rawXml`<request type="GetOscArea"/>`)
}

/**
 * @description 人脸识别操作
 * @param action
 * @param type
 * @returns {string}
 */
export const OCX_XML_SetVfdAreaAction = (action: 'EDIT_ON' | 'EDIT_OFF' | 'NONE', type?: 'vfdArea' | 'faceMax' | 'faceMin') => {
    return wrapXml(rawXml`
        <cmd type="SetVfdAreaAction">
            <action ${action === 'NONE' ? ` type="${type}"` : ''}>${action}</action>
        </cmd>
    `)
}

/**
 * @description 人群密度操作
 * @param action
 * @returns {string}
 */
export const OCX_XML_SetCddAreaAction = (action: 'EDIT_ON' | 'EDIT_OFF' | 'NONE') => {
    return wrapXml(rawXml`
        <cmd type="SetCddAreaAction">
            <action>${action}</action>
        </cmd>
    `)
}

/**
 * @description 设置人脸识别
 * @param points
 * @param type
 * @param lineColor
 * @param eventType
 * @returns {string}
 */
export const OCX_XML_SetVfdArea = (points: { X1: number; X2: number; Y1: number; Y2: number }, type: string, lineColor: string, eventType?: number) => {
    return wrapXml(rawXml`
        <cmd type="SetVfdArea">
            ${lineColor ? `<LineColor>${lineColor}</LineColor>` : ''}
            ${eventType !== undefined ? `<EventType>${eventType}</EventType>` : ''}
            <item type="${type}">
                <X1>${points.X1}</X1>
                <X2>${points.X2}</X2>
                <Y1>${points.Y1}</Y1>
                <Y2>${points.Y2}</Y2>
            </item>
        </cmd>
    `)
}

/**
 * @description 设置人群密度
 * @param points
 * @returns {string}
 */
export const OCX_XML_SetCddArea = (points: { X1: number; X2: number; Y1: number; Y2: number }) => {
    return wrapXml(rawXml`
        <cmd type="SetCddParam">
            <regionInfo>
                <item>
                    <X1>${points.X1}</X1>
                    <X2>${points.X2}</X2>
                    <Y1>${points.Y1}</Y1>
                    <Y2>${points.Y2}</Y2>
                </item>
            </regionInfo>
        </cmd>
    `)
}

/**
 * @description 获取人{脸识别
 * @returns {string}
 */
export const OCX_XML_GetVfdArea = () => {
    return wrapXml('<request type="GetVfdArea"/>')
}

/**
 * @description 设置人数统计
 * @param points
 * @param line
 * @returns {string}
 */
export const OCX_XML_SetCpcArea = (points: { X1: number; X2: number; Y1: number; Y2: number }, line: { X1: number; X2: number; Y1: number; Y2: number }) => {
    return wrapXml(rawXml`
        <cmd type="SetCpcParam">
            <regionInfo>
                <item>
                    <X1>${points.X1}</X1>
                    <X2>${points.X2}</X2>
                    <Y1>${points.Y1}</Y1>
                    <Y2>${points.Y2}</Y2>
                </item>
            </regionInfo>
            <lineInfo>
                <item>
                    <X1>${line.X1}</X1>
                    <X2>${line.X2}</X2>
                    <Y1>${line.Y1}</Y1>
                    <Y2>${line.Y2}</Y2>
                </item>
            </lineInfo>
        </cmd>
    `)
}

/**
 * @description 人数统计操作
 * @param action
 * @returns {string}
 */
export const OCX_XML_SetCpcAreaAction = (action: 'EDIT_ON' | 'EDIT_OFF' | 'NONE') => {
    return wrapXml(`<cmd type="SetCpcAreaAction">${action}</cmd>`)
}

/**
 * @description 区域入侵操作
 * @param action
 * @returns {string}
 */
export const OCX_XML_SetPeaAreaAction = (action: 'EDIT_ON' | 'EDIT_OFF' | 'NONE', pointCount?: number) => {
    return wrapXml(`<cmd type="SetPeaAreaAction" ${pointCount && action === 'EDIT_ON' ? ` maxPointCount="${pointCount}"` : ''}>${action}</cmd>`)
}

/**
 * @description 设置区域入侵
 * @param points
 * @param regulation
 * @param lineColor
 * @param eventType
 * @returns {string}
 */
export const OCX_XML_SetPeaArea = (points: { X: number; Y: number }[], regulation?: boolean, lineColor?: string, eventType?: number) => {
    return wrapXml(rawXml`
        <cmd type="SetPeaArea">
            ${lineColor ? `<LineColor>${lineColor}</LineColor>` : ''}
            ${eventType !== undefined ? `<EventType>${eventType}</EventType>` : ''}
            <points>
                ${points.map((item) => `<item X="${item.X}" Y="${item.Y}" />`).join('')}
            </points>
            ${regulation ? '<type>regulation</type>' : ''}
        </cmd>
    `)
}

/**
 * @description 获取区域入侵
 * @returns {string}
 */
export const OCX_XML_GetPeaArea = () => {
    return '<request type="GetPeaArea"/>'
}

/**
 * @description 设置视频结构化OSD显示信息
 * @param data
 * @param type
 * @returns {string}
 */
export const OCX_XML_SetVsdAreaInfo = (data: { switch: boolean; osdFormat: string; X: number; Y: number }, type: string) => {
    return wrapXml(rawXml`
        <cmd type="SetTripwireLineInfo">
            <switch>${data.switch}</switch>
            <info>${data.osdFormat}</info>
            <X>${data.X}</X>
            <Y>${data.Y}</Y>
            <aiEventType>${type}</aiEventType>
        </cmd>
    `)
}

/**
 * @description 视频结构化操作
 * @param action
 * @returns {string}
 */
export const OCX_XML_SetVsdAreaAction = (action: 'EDIT_ON' | 'EDIT_OFF' | 'NONE' | 'CLEARALL') => {
    return `<cmd type="SetVsdAreaAction">${action}</cmd>`
}

/**
 * @description 设置视频结构化
 * @param points
 * @param regulation 是否为联咏ipc
 * @param areaIndex
 * @param lineColor
 * @returns {string}
 */
export const OCX_XML_SetVsdArea = (points: { X: number; Y: number }[], regulation: boolean, areaIndex: number, lineColor: string) => {
    return wrapXml(rawXml`
        <cmd type="SetVsdArea">
            <points>
                ${points.map((item) => `<item X="${item.X}" Y="${item.Y}" />`).join('')}
                <Area>${areaIndex}</Area>
                <LineColor>${lineColor}</LineColor>
            </points>
            ${regulation ? '<type>regulation</type>' : ''}
        </cmd>
    `)
}

/**
 * @description 设置视频结构化-显示全部区域
 * @param regulation 是否为联咏ipc
 * @param regionInfo
 * @param maskAreaInfo
 * @returns {string}
 */
export const OCX_XML_SetAllVsdArea = (regulation: boolean, regionInfo: { X: number; Y: number }[], maskAreaInfo: { X: number; Y: number }[]) => {
    const region = regionInfo?.length
        ? rawXml`
            <points>
                ${regionInfo.map((item) => `<item X="${item.X}" Y="${item.Y}" />`).join('')}
                <Area>${regionInfo.length}</Area>
                <LineColor>red</LineColor>
            </points>`
        : ''
    const maskArea = maskAreaInfo?.length
        ? maskAreaInfo
              .map(
                  (item, index) => rawXml`<points>
                        <item X="${item.X}" Y="${item.Y}" />
                        <Area>${index}</Area>
                        <LineColor>red</LineColor>
                    </points>`,
              )
              .join('')
        : ''
    return wrapXml(rawXml`
        <cmd type="SetAllVsdArea">
            ${region}
            ${maskArea}
            ${regulation ? '<type>regulation</type>' : ''}
        </cmd>
    `)
}

/**
 * @description 获取最大最小区域范围（配合插件使用）
 * @param points
 * @param type
 * @returns {string}
 */
export const OCX_XML_GetMaxMinXml = (points: { X1: number; X2: number; Y1: number; Y2: number }, type: string) => {
    return rawXml`<item type="${type}">
        <X1>${points.X1}</X1>
        <X2>${points.X2}</X2>
        <Y1>${points.Y1}</Y1>
        <Y2>${points.Y2}</Y2>
    </item>`
}

/**
 * @description 设置多边形区域/警戒线区域/矩形区域-显示全部区域(maxMinXml,isShowAll参数配合插件使用)
 * @param areaInfo
 * @param areaType
 * @param eventType
 * @param maxMinXml
 * @param isShowAll
 * @returns {string}
 */
interface OcxXmlSetAllAreaAreaInfoOption {
    detectAreaInfo?: { X: number; Y: number }[][]
    maskAreaInfo?: { X: number; Y: number }[][]
    regionInfoList?: { X1: number; Y1: number; X2: number; Y2: number }[]
    lineInfoList?: { direction: 'none' | 'rightortop' | 'leftorbotton'; startPoint: { X: number; Y: number }; endPoint: { X: number; Y: number } }[]
}
export const OCX_XML_SetAllArea = (
    areaInfo: OcxXmlSetAllAreaAreaInfoOption,
    areaType: 'IrregularPolygon' | 'Rectangle' | 'WarningLine',
    eventType: number,
    maxMinXml?: string,
    isShowAll?: boolean,
) => {
    const cmd = rawXml`<cmd type="SetAllArea">
        <AreaType>${areaType}</AreaType>
        <EventType>${eventType}</EventType>
        ${isShowAll ? `<IsShowAllArea>${isShowAll}</IsShowAllArea>` : ''}
        ${maxMinXml ?? ''}
    `

    if (areaType === 'IrregularPolygon') {
        const detectAreaInfo = areaInfo.detectAreaInfo || []
        const maskAreaInfo = areaInfo.maskAreaInfo || []
        let index = 0
        return wrapXml(rawXml`
            ${cmd}
            ${detectAreaInfo
                .map((item) =>
                    item.length
                        ? rawXml`
                            <points>
                                ${item.map((point) => `<item X="${point.X}" Y="${point.Y}" />`).join('')}
                                <Area>${++index}</Area>
                                <LineColor>green</LineColor>
                            </points>
                    `
                        : '',
                )
                .join('')}
            ${maskAreaInfo
                .map((item) =>
                    item.length
                        ? rawXml`
                            <points>
                                ${item.map((point) => `<item X="${point.X}" Y="${point.Y}" />`).join('')}
                                <Area>${++index}</Area>
                                <LineColor>red</LineColor>
                            </points>
                    `
                        : '',
                )
                .join('')}
            </cmd>
        `)
    } else if (areaType === 'Rectangle') {
        const regionInfo = areaInfo.regionInfoList || []
        return wrapXml(rawXml`
            ${cmd}
            ${regionInfo
                .map(
                    (item, index) => rawXml`
                        <points>
                            <item>
                                <X1>${item.X1}</X1>
                                <Y1>${item.Y1}</Y1>
                                <X2>${item.X2}</X2>
                                <Y2>${item.Y2}</Y2>
                            </item>
                            <Area>${index + 1}</Area>
                            <LineColor>green</LineColor>
                        </points>
                `,
                )
                .join('')}
            </cmd>
        `)
    } else if (areaType === 'WarningLine') {
        // 绘制警戒线
        const directionType = {
            none: 'NONE',
            rightortop: 'A_TO_B',
            leftorbotton: 'B_TO_A',
        }
        const lineInfo = areaInfo.lineInfoList || []
        return wrapXml(rawXml`
            ${cmd}
            ${lineInfo
                .map(
                    (item, index) => rawXml`
                        <points>
                            <direction>${directionType[item.direction]}</direction>
                            <startPoint X="${item.startPoint.X}" Y="${item.startPoint.Y}" />
                            <endPoint X="${item.endPoint.X}" Y="${item.endPoint.Y}" />
                            <Area>${index + 1}</Area>
                            <LineColor>green</LineColor>
                        </points>
                `,
                )
                .join('')}
            </cmd>
        `)
    }
    return ''
}

/**
 * @description 设置过线统计OSD显示信息
 * @param data
 * @returns {string}
 */
export const OCX_XML_SetTripwireLineInfo = (data: { switch: boolean; osdFormat: string; X: number; Y: number }, onlyOSD: boolean) => {
    return wrapXml(rawXml`
        <cmd type="SetTripwireLineInfo">
            <switch>${data.switch}</switch>
            <info>${data.osdFormat}</info>
            <X>${data.X}</X>
            <Y>${data.Y}</Y>
            <onlyOSD>${onlyOSD}</onlyOSD>
        </cmd>
    `)
}

/**
 * @description 越界侦测操作
 * @param action
 * @returns {string}
 */
export const OCX_XML_SetTripwireLineAction = (action: 'EDIT_ON' | 'EDIT_OFF' | 'NONE') => {
    return wrapXml(rawXml`<cmd type="SetTripwireLineAction">${action}</cmd>`)
}

/**
 * @description 设置越界侦测
 * @param line
 * @returns {string}
 */
export const OCX_XML_SetTripwireLine = (line: { direction: 'none' | 'rightortop' | 'leftorbotton'; startPoint: { X: number; Y: number }; endPoint: { X: number; Y: number } }) => {
    const directionType = {
        none: 'NONE',
        rightortop: 'A_TO_B',
        leftorbotton: 'B_TO_A',
    }
    return wrapXml(rawXml`
        <cmd type="SetTripwireLine">
            <direction>${directionType[line.direction]}</direction>
            <startPoint X="${line.startPoint.X}" Y="${line.startPoint.Y}" />
            <endPoint X="${line.endPoint.X}" Y="${line.endPoint.Y}" />
        </cmd>
    `)
}

/*
 * 设置矩形区域（通用：矩形侦测区域/最大最小区域）
 * rectangles：要进行显示的区域对象列表
 */
export const OCX_XML_AddRectangleArea = (rectangles: { ID: string; text?: string; LineColor?: string; X1: number; X2: number; Y1: number; Y2: number }[]) => {
    return wrapXml(rawXml`
        <cmd type="AddRectangleArea">
            ${rectangles
                .map(
                    (item) => rawXml`
                        <item>
                            <ID>${item.ID}</ID>
                            ${item.text ? `<text>${item.text}</text>` : ''}
                            ${item.LineColor ? `<LineColor>${item.LineColor}</LineColor>` : ''}
                            <X1>${item.X1}</X1>
                            <Y1>${item.Y1}</Y1>
                            <X2>${item.X2}</X2>
                            <Y2>${item.Y2}</Y2>
                        </item>
                    `,
                )
                .join('')}
        </cmd>
    `)
}

/*
 * 取消显示矩形区域（通用，传入区域ID进行删除区域）
 * IDs：要进行删除的区域ID列表
 */
export const OCX_XML_DeleteRectangleArea = (IDs: number[]) => {
    return wrapXml(rawXml`
        <cmd type="DeleteRectangleArea">${IDs.map((ID) => `<ID>${ID}</ID>`).join('')}</cmd>
    `)
}

/*
 * 设置多边形区域（通用：多边形侦测区域） TODO
 * polygonAreas：要进行显示的多边形区域对象列表
 * currentArea：当前绘制的警戒区域
 * showAll：是否绘制全部区域
 * curSubArea：当前绘制的绘制区域，双目计数特有
 */
export const OCX_XML_AddPolygonArea = (
    polygonAreas: { point: CanvasBasePoint[]; LineColor?: string; area: string }[] | CanvasBasePoint[][][],
    currentArea: string,
    showAll: boolean,
    curSubArea?: string,
) => {
    return wrapXml(rawXml`
        <cmd type="AddPolygonArea">
            ${
                curSubArea
                    ? (polygonAreas as CanvasBasePoint[][][])
                          .map((item, index) => {
                              return rawXml`
                                <points>
                                    <Area>${showAll ? index : currentArea}</Area>
                                    ${item
                                        .map((sub, id) => {
                                            return rawXml`
                                                <polygons>
                                                    <subArea>${id}</subArea>
                                                    ${sub.map((point) => `<item X="${point.X}" Y="${point.Y}" />`).join('')}
                                                    <LineColor>green</LineColor>
                                                </polygons>
                                            `
                                        })
                                        .join('')}
                                </points>
                            `
                          })
                          .join('') // 绘制其他AI事件的多边形区域
                    : (polygonAreas as { point: CanvasBasePoint[]; LineColor?: string; area: string }[])
                          .map((polygonItem) => {
                              return polygonItem.point.length
                                  ? rawXml`
                                        <points>
                                            ${polygonItem.point.map((point) => `<item X="${point.X}" Y="${point.Y}" />`).join('')}
                                            <Area>${polygonItem.area}</Area>
                                            ${polygonItem.LineColor ? `<LineColor>${polygonItem.LineColor}</LineColor>` : ''}
                                        </points>
                                    `
                                  : ''
                          })
                          .join('')
            }
            ${curSubArea ? `<curSubArea>${curSubArea.slice(-1)}</curSubArea>` : ''}
            <currentArea>${currentArea}</currentArea>
            <showAll>${showAll}</showAll>
        </cmd>
    `)
}

/*
 * 取消显示多边形区域（通用，传入区域ID进行删除区域）
 * area：要进行删除的区域ID
 * subArea：当前绘制的绘制区域，双目计数特有
 */
export const OCX_XML_DeletePolygonArea = (area: string, subArea?: string) => {
    return wrapXml(rawXml`
        <cmd type="DeletePolygonArea">
            ${area === 'clearAll' ? '<clearAll>true</clearAll>' : `<clearCurrent>${area}</clearCurrent>`}
            ${subArea ? `<clearCurSubArea>${subArea.slice(-1)}</clearCurSubArea>` : ''}
        </cmd>
    `)
}

/*
 * 设置OSD信息显示（通用：AI事件的OSD绘制）
 * data：OSD数据
 * type：当前绘制的AI事件类型（vsd、areaStatis等）
 */
export const OCX_XML_SetAiOSDInfo = (data: { switch: boolean; osdFormat: string; type: string; X: number; Y: number }, type: string) => {
    return wrapXml(rawXml`
        <cmd type="SetTripwireLineInfo">
            <switch>${data.switch}</switch>
            <info>${data.osdFormat}</info>
            <aiEventType>${type}</aiEventType>
            <X>${data.X}</X>
            <Y>${data.Y}</Y>
        </cmd>
    `)
}

/**
 * @description 解析流URL
 * @param url
 * @returns {Object}
 */
export const parseStreamUrl = (url: string) => {
    //tvt://用户名:密码@设备ip:设备port/chlId=GUID&chlIndex=0&chlName=通道1&stream=main[/sub]&chlType=analog[/digital]
    const urlParts = url.match(/tvt:\/\/(.+):([^\/]+)\/(.*)/i)
    if (urlParts && urlParts.length > 1) {
        const result: Record<string, string> = {}
        result.devIp = urlParts[1]
        result.devPort = urlParts[2]
        let param = urlParts[3]
        while (param.at(-1) === '/') {
            param = param.slice(0, -1)
        }
        const paramArr = param.split('&')
        let paramItem
        for (let i = 0; i < paramArr.length; i++) {
            paramItem = paramArr[i].split('=')
            if (paramItem[0] === 'chlName') {
                result[paramItem[0]] = decodeURIComponent(paramItem[1])
            } else {
                result[paramItem[0]] = paramItem[1]
            }
        }
        return result
    } else return null
}

/**
 * @description 设置POS显示区域
 * @param switchbool
 * @param winIndex
 * @param x
 * @param y
 * @param width
 * @param height
 * @param printMode
 * @returns {string}
 */
export const OCX_XML_SetPOSDisplayArea = (switchbool: boolean, winIndex: number, x: number, y: number, width: number, height: number, printMode?: string) => {
    return wrapXml(rawXml`
        <cmd type="SetPOSDisplayArea">
            <switch>${switchbool}</switch>
            <winIndex>${winIndex}</winIndex>
            <printMode>${printMode || 'page'}</printMode>
            <rectangle>
                <X>${x}</X>
                <Y>${y}</Y>
                <width>${width}</width>
                <height>${height}</height>
            </rectangle>
        </cmd>
    `)
}

/**
 * @description 设置POS显示颜色
 * @param data
 * @returns {string}
 */
export const OCX_XML_SETPosColor = (data: { text: string; RGB: string }[]) => {
    return wrapXml(rawXml`
        <cmd type="SetPosRGBInfo">
            <PosInfo>
                ${data.map((item) => `<item><text>${item.text}</text><RGB>${item.RGB}</RGB></item>`).join('')}
            </PosInfo>
        </cmd>
    `)
}

/**
 * @description 设置鱼眼
 * @param installType
 * @param fishEyeMode
 * @returns {string}
 */
export const OCX_XML_SetFishEyeMode = (installType: string, fishEyeMode: string, chlId?: string) => {
    return wrapXml(rawXml`
        <cmd type="SetFishEyeMode">
            ${chlId ? `<chlId>${chlId}</chlId>` : ''}
            <installType>${installType}</installType>
            <fishEyeMode>${fishEyeMode}</fishEyeMode>
        </cmd>
    `)
}

// 设置通道能力集
export const OCX_XML_SetAppendInfo = (appendInfo: string) => {
    return wrapXml(rawXml`<cmd type="SetAppendInfo">${appendInfo}</cmd>`)
}

/**
 * @description 发送是否显示logo命令
 * @returns {string}
 */
export const OCX_XML_GetPictureLogo = () => {
    //先默认为true
    return wrapXml(rawXml`
        <cmd type="GetPictureLogo">
            <switch>true</switch>
        </cmd>
    `)
}

// 监听插件区域鼠标事件（移入、移出等）
export const OCX_XML_SetScreenMouseEvent = (enable: boolean) => {
    return wrapXml(rawXml`
        <cmd type="SetScreenMouseEvent">
            <switch>${enable}</switch>
        </cmd>
    `)
}

// 设置插件窗口层级
export const OCX_XML_SetTopWnd = (enable: boolean) => {
    return wrapXml(rawXml`
        <cmd type="SetTopWnd">
            <switch>${enable}</switch>
        </cmd>
    `)
}

// 设置插件捕获ESC按键
export const OCX_XML_SetESCHook = (enable: boolean) => {
    return wrapXml(rawXml`
        <cmd type="SetESCHook">
            <switch>${enable}</switch>
        </cmd>
    `)
}
