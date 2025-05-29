/*
 * @Author: liyanqi a11219@tvt.net.cn
 * @Date: 2025-05-14 20:05:32
 * @Description: 视频结构化入口
 */
import AlarmBaseChannelSelector from './AlarmBaseChannelSelector.vue'
import VideoStructurePanel from './VideoStructurePanel.vue'
import AlarmBaseErrorPanel from './AlarmBaseErrorPanel.vue'

export default defineComponent({
    components: {
        AlarmBaseChannelSelector,
        VideoStructurePanel,
        AlarmBaseErrorPanel,
    },
    setup() {
        const systemCaps = useCababilityStore()
        const pageData = ref({
            reqFail: false,
            // 当前选中的通道
            currChlId: '',
            // 在线通道id列表
            onlineChannelIdList: [] as string[],
            // 在线通道列表
            onlineChannelList: [] as AlarmOnlineChlDto[],
            // 通道能力集
            chlCaps: {} as Record<string, AlarmChlDto>,
            notSupport: false,
            // 声音列表
            voiceList: [] as SelectOption<string, string>[],
            tab: '',
        })

        const chlData = computed(() => {
            return pageData.value.chlCaps[pageData.value.currChlId] || new AlarmChlDto()
        })

        // 切换通道
        const changeChannel = () => {
            const tabList: [string, boolean][] = [['videoStructure', chlData.value.supportVideoMetadata]]

            tabList.some((item) => {
                if (item[1]) {
                    pageData.value.tab = item[0]
                }
                return item[1]
            })

            // 若都不可用，则显示提示
            if (!pageData.value.tab) {
                pageData.value.notSupport = true
            } else {
                pageData.value.notSupport = false
            }
        }

        // 获取在线通道
        const getOnlineChannel = async () => {
            const res = await queryOnlineChlList()
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                pageData.value.onlineChannelIdList = $('content/item').map((item) => {
                    return item.attr('id')
                })
            }

            if (!pageData.value.onlineChannelIdList.length) {
                pageData.value.notSupport = true
            }
        }

        // 获取通道数据
        const getChannelData = async () => {
            const result = await getChlList({
                requireField: ['ip', 'supportVideoMetadata'],
            })
            const $ = queryXml(result)
            if ($('status').text() === 'success') {
                $('content/item').forEach((element) => {
                    const $item = queryXml(element.element)
                    const protocolType = $item('protocolType').text()
                    const factoryName = $item('productModel').attr('factoryName')
                    if (factoryName === 'Recorder') return
                    const curChlId = element.attr('id')
                    if (protocolType !== 'RTSP' && pageData.value.onlineChannelIdList.some((item) => item === curChlId)) {
                        const id = element.attr('id')
                        const name = $item('name').text()
                        const ip = $item('ip').text()
                        const chlType = $item('chlType').text()
                        const accessType = $item('AccessType').text()
                        const supportVideoMetadata = $item('supportVideoMetadata').text().bool()
                        // 保存当前通道的所有能力集，若全部为false，则过滤掉该通道
                        const allCapsArr = [supportVideoMetadata]
                        if (allCapsArr.includes(true)) {
                            pageData.value.onlineChannelList.push({
                                id: id,
                                ip: ip,
                                name: name,
                                accessType: accessType,
                            })
                            const item = new AlarmChlDto()
                            item.id = id
                            item.ip = ip
                            item.name = name
                            item.accessType = accessType
                            item.chlType = chlType
                            item.supportVideoMetadata = supportVideoMetadata
                            pageData.value.chlCaps[id] = item
                        }
                    }
                })

                if (!pageData.value.onlineChannelList.length) {
                    pageData.value.notSupport = true
                    return
                }
                pageData.value.currChlId = pageData.value.onlineChannelList[0].id
            }
        }

        // 获取音频列表
        const getVoiceList = async () => {
            if (systemCaps.supportAlarmAudioConfig) {
                pageData.value.voiceList = await buildAudioList()
            }
        }

        onMounted(async () => {
            openLoading()
            await getOnlineChannel()
            await getChannelData()
            await getVoiceList()
            changeChannel()
            closeLoading()
        })

        return {
            pageData,
            chlData,
            changeChannel,
        }
    },
})
