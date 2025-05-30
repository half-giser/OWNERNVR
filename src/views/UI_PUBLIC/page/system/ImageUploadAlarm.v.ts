/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-10-23 15:30:55
 * @Description: 报警图像上传
 */
export default defineComponent({
    setup() {
        const router = useRouter()
        const userSessionStore = useUserSessionStore()
        const { Translate } = useLangStore()

        const EVENT_TYPE_MAPPING: Record<string, string> = {
            MOTION: Translate('IDCS_MOTION_DETECTION'),
            ALARM: Translate('IDCS_SENSOR_ALARM'),
            'MOTION,ALARM': Translate('IDCS_SENSOR_AND_MOTION'),
        }

        const MENU_ID_MAPPING: Record<string, string> = {
            MOTION: '/config/alarm/motion',
            ALARM: '/config/alarm/sensor',
            'MOTION,ALARM': '/config/alarm/sensor',
        }

        const pageData = ref({
            hasAuth: false,
            alarmType: '',
            originalAlarmTypeList: [] as SelectOption<string, string>[],
            alarmTypeList: [] as SelectOption<string, string>[],
            pretimeList: [] as SelectOption<string, string>[],
            saveTimeList: [] as SelectOption<string, string>[],
            preUnit: '',
            saveUnit: '',
        })

        const tableData = ref<SystemImageUploadAlarmItem[]>([])

        const getAuth = async () => {
            const authGroupId = userSessionStore.authGroupId
            if (!authGroupId) {
                return
            }
            const sendXml = rawXml`
                <authGroupId>${authGroupId}</authGroupId>
                <requireField>
                    <name/>
                    <systemAuth/>
                </requireField>
            `
            const res = await queryMyAuth(sendXml)
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                pageData.value.hasAuth = $('content/systemAuth/alarmMgr').text().bool()
            }
        }

        const getTranslateForSecond = (value: number) => {
            if (value > 1) {
                return value + Translate('IDCS_SECONDS')
            } else {
                return value + Translate('IDCS_SECOND')
            }
        }

        const getData = async () => {
            openLoading()
            const res = await querySHDBEventUploadCfg()
            closeLoading()
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                pageData.value.alarmType = $('content/eventType').text().trim() || 'MOTION'
                pageData.value.alarmTypeList = $('types/eventType/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: EVENT_TYPE_MAPPING[item.text()],
                    }
                })
                pageData.value.originalAlarmTypeList = cloneDeep(pageData.value.alarmTypeList)
                if (pageData.value.alarmTypeList.length) {
                    pageData.value.alarmTypeList.push({
                        value: 'MOTION,ALARM',
                        label: EVENT_TYPE_MAPPING['MOTION,ALARM'],
                    })
                }
                pageData.value.pretimeList = $('content/param/preTimeNote')
                    .text()
                    .array()
                    .map((item) => ({
                        value: item.trim(),
                        label: getTranslateForSecond(item.trim().num()),
                    }))
                pageData.value.saveTimeList = $('content/param/holdTimeNote')
                    .text()
                    .array()
                    .map((item) => ({
                        value: item.trim(),
                        label: getTranslateForSecond(item.trim().num()),
                    }))
                pageData.value.preUnit = $('content/param/chlParams/itemType/preTime').attr('unit') || 's'
                pageData.value.saveUnit = $('content/param/chlParams/itemType/holdTime').attr('unit') || 's'

                tableData.value = $('content/param/chlParams/item').map((item) => {
                    const row = new SystemImageUploadAlarmItem()
                    const $item = queryXml(item.element)
                    row.id = $item('chl').attr('id')
                    row.name = $item('chl').text()
                    row.chlNum = getChlNumById(row.id)
                    row.preTime = $item('preTime').text()
                    row.saveTime = $item('holdTime').text()
                    return row
                })
                orderChl()
            } else {
            }
        }

        const getSavaData = () => {
            const sendXml = rawXml`
                    <types>
                        <eventType>
                            ${pageData.value.originalAlarmTypeList.map((item) => `<enum>${item.value}</enum>`).join('')}
                        </eventType>
                    </types>
                    <content>
                        <eventType type='eventType'>${pageData.value.alarmType}</eventType>
                        <param>
                            <chlParams type='list'>
                                <itemType>
                                    <preTime unit='${pageData.value.preUnit}' />
                                    <holdTime unit='${pageData.value.saveUnit}' />
                                </itemType>
                                ${tableData.value
                                    .map(
                                        (item) => rawXml`
                                            <item>
                                                <chl id='${item.id}'>${item.name}</chl>
                                                <preTime>${item.preTime}</preTime>
                                                <holdTime>${item.saveTime}</holdTime>
                                            </item>
                                        `,
                                    )
                                    .join('')}
                            </chlParams>
                        </param>
                    </content>
                `
            return sendXml
        }

        const setData = () => {
            const sendXml = getSavaData()
            openLoading()
            editSHDBEventUploadCfg(sendXml).then((res) => {
                closeLoading()
                commSaveResponseHandler(res)
            })
        }

        const setDispose = () => {
            if (!pageData.value.hasAuth) {
                openMessageBox(Translate('IDCS_NO_AUTH'))
                return
            }
            router.push(MENU_ID_MAPPING[pageData.value.alarmType])
        }

        // 通过id获取通道号
        const getChlNumById = (chlId: string) => {
            return hexToDec(chlId.substring(1, chlId.indexOf('-')))
        }

        // 通道排序
        const orderChl = () => {
            if (tableData.value.length > 1) {
                tableData.value.sort((a, b) => {
                    const aChlNum = getChlNumById(a.id)
                    const bChlNum = getChlNumById(b.id)
                    return aChlNum > bChlNum ? 1 : -1
                })
            }
        }

        const handlePreTimeChangeAll = (preTime: string) => {
            tableData.value.forEach((item) => {
                if (!item.rowDisable) {
                    item.preTime = preTime
                }
            })
        }

        const handleSaveTimeChangeAll = (saveTime: string) => {
            tableData.value.forEach((item) => {
                if (!item.rowDisable) {
                    item.saveTime = saveTime
                }
            })
        }

        onMounted(async () => {
            await getAuth()
            getData()
        })

        return {
            pageData,
            tableData,
            handlePreTimeChangeAll,
            handleSaveTimeChangeAll,
            setData,
            setDispose,
        }
    },
})
