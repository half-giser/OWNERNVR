/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-29 16:07:59
 * @Description: 现场预览-底部视图-手动报警
 * @LastEditors: yejiahao yejiahao@tvt.net.cn
 * @LastEditTime: 2024-07-29 16:43:07
 */
import { type LiveAlarmList } from '@/types/apiType/live'

export default defineComponent({
    setup() {
        const { Translate } = useLangStore()
        const { openMessageTipBox } = useMessageBox()
        const Plugin = inject('Plugin') as PluginType

        const theme = getUiAndTheme()
        const userSession = useUserSessionStore()

        // 报警间隔
        const ALARM_INTERVAL_TIME = 5000

        let timer: NodeJS.Timeout | number = 0

        const pageData = ref({
            // 是否显示报警弹窗框
            isAlarmPop: false,
            // 延迟报警选项列表
            delayList: [
                {
                    value: 0,
                    label: Translate('IDCS_MANUAL'),
                },
            ] as SelectOption<number, string>[],
        })

        // 报警状态列表
        const tableData = ref<LiveAlarmList[]>([])

        // 报警权限
        const disabled = computed(() => {
            return !userSession.hasAuth('alarmMgr')
        })

        /**
         * @description 获取报警状态列表
         */
        const getStatus = async () => {
            const result = await getAlarmOutStatus()
            const $ = queryXml(result)

            if ($('/response/content/item').length && pageData.value.delayList.length <= 1) {
                const $temp = queryXml($('/response/content/item')[0].element)
                pageData.value.delayList = $temp('delay/enum').map((item) => {
                    const text = item.text().toLocaleLowerCase()
                    let value = 0
                    if (text.indexOf('secs') > -1) {
                        value = Number(text.replace('secs', ''))
                    } else if (text.indexOf('mins') > -1) {
                        value = Number(text.replace('mins', '')) * 60
                    }
                    return {
                        value,
                        label: displayTime(value),
                    }
                })
            }

            const delayMap: Record<string, number> = {}
            tableData.value.forEach((item) => {
                delayMap[item.id] = item.delay
            })

            tableData.value = $('/response/content/item')
                .filter((item) => queryXml(item.element)('onlineStatus').text().toBoolean())
                .map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        id: item.attr('id')!,
                        name: $item('name').text(),
                        // onlineStatus: $item('onlineStatus').text().toBoolean(),
                        switch: $item('switch').text().toBoolean(),
                        delay: delayMap[item.attr('id')!] || pageData.value.delayList[0].value,
                    }
                })

            if (pageData.value.isAlarmPop) {
                timer = setTimeout(() => {
                    getStatus()
                }, ALARM_INTERVAL_TIME)
            }
        }

        /**
         * @description 时间文本回显
         * @param {Number} time
         * @returns {String}
         */
        const displayTime = (time: number) => {
            if (time === 0) {
                return Translate('IDCS_MANUAL')
            }
            if (time === 60) {
                return 1 + ' ' + Translate('IDCS_MINUTE')
            }
            if (time >= 60) {
                return time / 60 + ' ' + Translate('IDCS_MINUTES')
            }
            return time + ' ' + Translate('IDCS_SECONDS')
        }

        /**
         * @description 报警文本显示
         * @param {Boolean} bool
         * @returns {String}
         */
        const displaySwitch = (bool: boolean) => {
            return bool ? Translate('IDCS_NOW_ALARM') : Translate('IDCS_NORMAL')
        }

        /**
         * @description 设置报警状态
         * @param {String} id
         * @param {Number} index
         * @param {Boolean} status
         */
        const setStatus = async (id: string, index: number, status: boolean) => {
            const ids = index === -1 ? tableData.value.map((item) => item.id) : [id]
            const sendXml = rawXml`
                <content>
                    <switch>${status.toString()}</switch>
                    <alarmOutIds type="list">
                        ${ids.map((id) => `<item id="${id}"></item>`).join('')}
                    </alarmOutIds>
                </content>
            `
            const result = await setAlarmOutStatus(sendXml)
            const $ = queryXml(result)

            if ($('/response/status').text() === 'success') {
                if (ids.length === 1) {
                    console.log(index, tableData.value[index])
                    tableData.value[index].switch = status

                    if (theme.name === 'UI2-A' && status && tableData.value[index].delay > 0) {
                        setTimeout(() => {
                            setStatus(id, index, false)
                        }, tableData.value[index].delay * 1000)
                    }
                } else {
                    tableData.value.forEach((item) => {
                        item.switch = status
                    })
                }
            } else {
                const errorCode = Number($('/response/errorCode').text())
                if (errorCode === ErrorCode.USER_ERROR_NO_AUTH) {
                    openMessageTipBox({
                        type: 'info',
                        message: Translate('IDCS_NO_AUTH'),
                    })
                }
            }
        }

        /**
         * @description 一键修改所有延迟报警时间
         * @param {Number} delay
         */
        const changeAllDelay = (delay: number) => {
            tableData.value.forEach((item) => {
                item.delay = delay
            })
        }

        watch(
            () => pageData.value.isAlarmPop,
            (val) => {
                if (val) {
                    Plugin.DisplayOCX(false)
                    getStatus()
                } else {
                    Plugin.DisplayOCX(true)
                    clearTimeout(timer)
                }
            },
            {
                immediate: true,
            },
        )

        onBeforeUnmount(() => {
            clearTimeout(timer)
        })

        return {
            pageData,
            tableData,
            theme,
            disabled,
            displaySwitch,
            setStatus,
            changeAllDelay,
        }
    },
})
