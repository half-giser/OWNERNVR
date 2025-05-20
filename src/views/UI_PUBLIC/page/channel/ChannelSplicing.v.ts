/*
 * @Date: 2025-05-15 11:38:09
 * @Description: 双目拼接
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
import type { FormRules } from 'element-plus'
import AlarmBaseChannelSelector from '../aiAndEvent/AlarmBaseChannelSelector.vue'

export default defineComponent({
    components: {
        AlarmBaseChannelSelector,
    },
    setup() {
        const { Translate } = useLangStore()

        const SPLICE_TYPE_MAPPING: Record<string, string> = {
            manual: Translate('IDCS_STITCHING_BY_DISTANCE'),
            auto: Translate('IDCS_AUTO_STITCHING'),
        }

        const playerRef = ref<PlayerInstance>()

        let player: PlayerInstance['player']
        let plugin: PlayerInstance['plugin']

        const pageData = ref({
            currentChl: '',
            onlineChlList: [] as string[],
            requestType: '',
            chlList: [] as { id: string; name: string }[],
            isDistanceOutOfRange: false,
        })

        const chlMap: Record<string, string> = {}

        const formRef = useFormRef()
        const formData = ref(new ChannelSplicingDto())
        const watchEdit = useWatchEditData(formData)

        const rules = ref<FormRules>({
            spliceDistance: [
                {
                    validator(_rule, _value, callback) {
                        if (pageData.value.isDistanceOutOfRange) {
                            pageData.value.isDistanceOutOfRange = false
                            callback(new Error(Translate('IDCS_HEARTBEAT_RANGE_TIP').formatForLang(formData.value.spliceDistanceMin, formData.value.spliceDistanceMax)))
                            return
                        }

                        callback()
                    },
                    trigger: 'manual',
                },
            ],
        })

        const getOnlineChlList = async () => {
            const result = await queryOnlineChlList()
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                pageData.value.onlineChlList = $('content/item').map((item) => item.attr('id'))
            }
        }

        const getList = async () => {
            const result = await getChlList({
                requireField: ['ip', 'supportSplice'],
            })
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                $('content/item').forEach((item) => {
                    const $item = queryXml(item.element)
                    const supportSplice = $item('supportSplice').text().bool()
                    const protocolType = $item('protocolType').text()
                    const factoryName = $('factoryName').attr('factoryName')
                    const id = item.attr('id')
                    if (factoryName !== 'Recorder' && protocolType !== 'RTSP' && pageData.value.onlineChlList.includes(id) && supportSplice) {
                        chlMap[id] = $item('name').text()
                        pageData.value.chlList.push({
                            id: id,
                            name: $item('name').text(),
                        })
                    }
                })
            }
        }

        const getData = async () => {
            watchEdit.reset()
            openLoading()

            const sendXml = rawXml`
                <condition>
                    <chlId>${pageData.value.currentChl}</chlId>
                </condition>
                <requireField>
                    <param/>
                </requireField>
            `
            const result = await querySpliceConfig(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                formData.value = new ChannelSplicingDto()

                const $param = queryXml($('content/chl/param')[0].element)
                formData.value.spliceTypeList = $('types/spliceType/enum').map((item) => {
                    return {
                        value: item.text(),
                        label: SPLICE_TYPE_MAPPING[item.text()],
                    }
                })
                formData.value.spliceDistance = $param('spliceDistance').text().num() / 100
                formData.value.spliceDistanceMin = $param('spliceDistance').attr('min').num() / 100
                formData.value.spliceDistanceMax = $param('spliceDistance').attr('max').num() / 100
                formData.value.spliceDistanceDefault = $param('spliceDistance').attr('default').num() / 100
                formData.value.spliceType = $param('spliceInfo').text()
                pageData.value.requestType = 'success'
                watchEdit.listen()
            } else {
                pageData.value.requestType = 'fail'
            }
        }

        const setData = async () => {
            openLoading()

            const sendXml = rawXml`
                <content>
                    <chl id="${pageData.value.currentChl}">
                        <param>
                            <spliceInfo>${formData.value.spliceType}</spliceInfo>
                            <spliceDistance>${formData.value.spliceDistance * 100}</spliceDistance>
                        </param>
                    </chl>
                </content>
            `
            const result = await editSpliceConfig(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                watchEdit.update()
            } else {
                const errorCode = $('errorCode').text().num()
                if (errorCode === 536871053) {
                    openMessageBox(Translate('IDCS_INPUT_LIMIT_FOUR_POIONT'))
                } else {
                    openMessageBox(Translate('IDCS_SAVE_DATA_FAIL'))
                }
            }
        }

        const ready = computed(() => {
            return playerRef.value?.ready || false
        })

        // 播放模式
        const mode = computed(() => {
            if (!ready.value) {
                return ''
            }
            return playerRef.value!.mode
        })

        const handlePlayerReady = () => {
            player = playerRef.value!.player
            plugin = playerRef.value!.plugin

            if (mode.value === 'ocx') {
                const sendXML = OCX_XML_SetPluginModel('ReadOnly', 'Live')
                plugin.ExecuteCmd(sendXML)
            }
        }

        const play = () => {
            if (mode.value === 'h5') {
                player.play({
                    chlID: pageData.value.currentChl,
                    streamType: 2,
                })
            }

            if (mode.value === 'ocx') {
                plugin.RetryStartChlView(pageData.value.currentChl, chlMap[pageData.value.currentChl])
            }
        }

        // 首次加载成功 播放视频
        const stopWatchFirstPlay = watchEffect(() => {
            if (ready.value) {
                nextTick(() => play())
                stopWatchFirstPlay()
            }
        })

        const changeChl = async () => {
            await getData()
            if (pageData.value.requestType === 'success') {
                if (ready.value) {
                    play()
                }
            }
        }

        const outOfRange = () => {
            pageData.value.isDistanceOutOfRange = true
            formRef.value?.validateField(['spliceDistance'])
        }

        const toggleOCX = (bool: boolean) => {
            if (mode.value === 'ocx') {
                plugin.DisplayOCX(!bool)
            }
        }

        onMounted(async () => {
            await getOnlineChlList()
            await getList()
            if (pageData.value.chlList.length) {
                pageData.value.currentChl = pageData.value.chlList[0].id
                getData()
            } else {
                pageData.value.requestType = 'not-support'
            }
        })

        onBeforeUnmount(() => {
            if (plugin?.IsPluginAvailable() && mode.value === 'ocx') {
                const sendXML = OCX_XML_StopPreview('ALL')
                plugin.ExecuteCmd(sendXML)
            }
        })

        return {
            formRef,
            pageData,
            playerRef,
            handlePlayerReady,
            changeChl,
            formData,
            watchEdit,
            setData,
            outOfRange,
            rules,
            toggleOCX,
        }
    },
})
