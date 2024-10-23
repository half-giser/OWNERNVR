/*
 * @Author: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @Date: 2024-10-23 15:30:55
 * @Description: 报警图像上传
 * @LastEditors: gaoxuefeng gaoxuefeng@tvt.net.cn
 * @LastEditTime: 2024-10-23 17:56:23
 */
import { SystemImageUploadAlarmItem } from '@/types/apiType/system'
import { cloneDeep } from 'lodash-es'
export default defineComponent({
    setup() {
        const router = useRouter()
        const userSessionStore = useUserSessionStore()
        const openMessageTipBox = useMessageBox().openMessageTipBox
        const { Translate } = useLangStore()
        const { openLoading, closeLoading, LoadingTarget } = useLoading()
        const pageData = ref({
            hasAuth: false,
            alarmType: '',
            originalAlarmTypeList: [] as SelectOption<string, string>[],
            alarmTypeList: [] as SelectOption<string, string>[],
            pretimeList: [] as SelectOption<string, string>[],
            saveTimeList: [] as SelectOption<string, string>[],
            preUnit: '',
            saveUnit: '',
            evTypeLangMap: {
                MOTION: Translate('IDCS_MOTION_DETECTION'),
                ALARM: Translate('IDCS_SENSOR_ALARM'),
                'MOTION,ALARM': Translate('IDCS_SENSOR_AND_MOTION'),
            } as Record<string, string>,
            menuIdMap: {
                MOTION: '/config/alarm/motion',
                ALARM: '/config/alarm/sensor',
                'MOTION,ALARM': '/config/alarm/sensor',
            } as Record<string, string>,
        })
        const tableData = ref<SystemImageUploadAlarmItem[]>([])
        const getAuth = async () => {
            const authGroupId = userSessionStore.authGroupId
            const sendXml = rawXml`
                        <condition>
                            <authGroupId>${authGroupId}</authGroupId>
                        </condition>
                        <requireField>
                            <name/>
                            <systemAuth/>
                        </requireField>
                    `
            const res = await queryAuthGroup(sendXml)
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                pageData.value.hasAuth = $('//content/systemAuth/alarmMgr').text() === 'true'
            }
        }
        // TODO待测试
        const getData = async () => {
            openLoading(LoadingTarget.FullScreen)
            const res = await querySHDBEventUploadCfg()
            closeLoading(LoadingTarget.FullScreen)
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                // pageData.value.alarmType = $('//content/eventType').text().trim() == '' ? 'MOTION' : $('//content/eventType').text()
                pageData.value.alarmType = $('//content/eventType').text().trim()
                $('//types/eventType/enum').forEach((item) => {
                    pageData.value.alarmTypeList.push({
                        value: item.text(),
                        label: pageData.value.evTypeLangMap[item.text()],
                    })
                })
                pageData.value.originalAlarmTypeList = cloneDeep(pageData.value.alarmTypeList)
                // TODO 用于测试，后续删除
                // if ($('//types/eventType/enum').length === 0) {
                //     pageData.value.alarmTypeList.push({
                //         value: 'MOTION',
                //         label: pageData.value.evTypeLangMap['MOTION'],
                //     })
                // }
                if (pageData.value.alarmTypeList.length > 0) {
                    pageData.value.alarmTypeList.push({
                        value: 'MOTION,ALARM',
                        label: pageData.value.evTypeLangMap['MOTION,ALARM'],
                    })
                }
                const pretimeList = $('//content/param/preTimeNote').text()
                pageData.value.pretimeList = pretimeList !== '' ? pretimeList.split(',').map((item) => ({ value: item.trim(), label: item.trim() + Translate('IDCS_SECONDS') })) : []
                const saveTimeList = $('//content/param/holdTimeNote').text()
                pageData.value.saveTimeList = saveTimeList !== '' ? saveTimeList.split(',').map((item) => ({ value: item.trim(), label: item.trim() + Translate('IDCS_SECONDS') })) : []
                pageData.value.preUnit = $('//content/param/chlParams/itemType/preTime').attr('unit') == '' ? 's' : $('//content/param/chlParams/itemType/preTime').attr('unit')
                pageData.value.saveUnit = $('//content/param/chlParams/itemType/holdTime').attr('unit') == '' ? 's' : $('//content/param/chlParams/itemType/holdTime').attr('unit')
                $('//content/param/chlParams/item').forEach((item) => {
                    const row = new SystemImageUploadAlarmItem()
                    const $item = queryXml(item.element)
                    row.id = $item('chl').attr('id')
                    row.name = $item('chl').text()
                    row.chlNum = getChlNumById(row.id)
                    row.preTime = $item('preTime').text()
                    row.saveTime = $item('holdTime').text()
                    tableData.value.push(row)
                })
                orderChl()
                console.log(tableData.value)
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
                                        (item) => `
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
        const setData = async () => {
            const sendXml = getSavaData()
            openLoading(LoadingTarget.FullScreen)
            editSHDBEventUploadCfg(sendXml).then((res) => {
                closeLoading(LoadingTarget.FullScreen)
                commSaveResponseHadler(res)
            })
        }
        const setDispose = async () => {
            if (!pageData.value.hasAuth) {
                openMessageTipBox({
                    type: 'info',
                    title: Translate('IDCS_INFO_TIP'),
                    message: Translate('IDCS_NO_AUTH'),
                })
                return
            }
            router.push(pageData.value.menuIdMap[pageData.value.alarmType])
        }
        // 通过id获取通道号
        const getChlNumById = (chlId: string) => {
            return parseInt(chlId.substring(1, chlId.indexOf('-')), 16)
        }
        // 通道排序
        const orderChl = function () {
            if (tableData.value.length > 1) {
                tableData.value.sort(function (a, b) {
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
            await getData()
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
