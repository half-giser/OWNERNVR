/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-29 16:07:59
 * @Description: 现场预览-底部视图-手动报警
 */
export default defineComponent({
    emits: {
        trigger() {
            return true
        },
    },
    setup(_prop, ctx) {
        const { Translate } = useLangStore()

        const isDelay = import.meta.env.VITE_UI_TYPE === 'UI2-A'
        const userSession = useUserSessionStore()

        // 报警间隔
        const ALARM_INTERVAL_TIME = 5000

        const alarmOutStatusTimer = useRefreshTimer(() => {
            getStatus()
        }, ALARM_INTERVAL_TIME)

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

            if ($('content/item').length && pageData.value.delayList.length <= 1) {
                const $temp = queryXml($('content/item')[0].element)
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

            tableData.value = $('content/item')
                .filter((item) => queryXml(item.element)('onlineStatus').text().bool())
                .map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        id: item.attr('id'),
                        name: $item('name').text(),
                        // onlineStatus: $item('onlineStatus').text().bool(),
                        switch: $item('switch').text().bool(),
                        delay: delayMap[item.attr('id')] || pageData.value.delayList[0].value,
                    }
                })

            if (pageData.value.isAlarmPop) {
                alarmOutStatusTimer.repeat()
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
            return displaySecondWithUnit(time)
        }

        /**
         * @description 报警文本显示
         * @param {Boolean} bool
         * @returns {String}
         */
        const displaySwitch = (bool: boolean) => {
            return bool ? Translate('IDCS_NOW_ALARM') : Translate('IDCS_NORMAL')
        }

        const clearAllStatus = () => {
            setTimeout(() => {
                pageData.value.isAlarmPop = true
            }, 0)
            setStatus('', -1, false)
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
                    <switch>${status}</switch>
                    <alarmOutIds type="list">
                        ${ids.map((id) => `<item id="${id}"></item>`).join('')}
                    </alarmOutIds>
                </content>
            `
            const result = await setAlarmOutStatus(sendXml)
            const $ = queryXml(result)

            if ($('status').text() === 'success') {
                if (ids.length === 1) {
                    tableData.value[index].switch = status

                    if (import.meta.env.VITE_UI_TYPE === 'UI2-A' && status && tableData.value[index].delay > 0) {
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
                const errorCode = $('errorCode').text().num()
                if (errorCode === ErrorCode.USER_ERROR_NO_AUTH) {
                    openMessageBox(Translate('IDCS_NO_AUTH'))
                }
            }
        }

        /**
         * @description 一键修改所有延迟报警时间
         * @param {Number} delay
         */
        const changeAllDelay = (delay: number) => {
            setTimeout(() => {
                pageData.value.isAlarmPop = true
            }, 0)
            tableData.value.forEach((item) => {
                item.delay = delay
            })
        }

        watch(
            () => pageData.value.isAlarmPop,
            (val) => {
                ctx.emit('trigger')

                if (val) {
                    alarmOutStatusTimer.repeat(true)
                } else {
                    alarmOutStatusTimer.stop()
                }
            },
            {
                immediate: true,
            },
        )

        return {
            pageData,
            tableData,
            isDelay,
            disabled,
            displaySwitch,
            setStatus,
            clearAllStatus,
            changeAllDelay,
        }
    },
})
