/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-11-06 20:23:39
 * @Description: AI资源按钮与详情
 */
export default defineComponent({
    props: {
        /**
         * @property {string} 事件类型
         */
        event: {
            type: String,
            required: true,
        },
        /**
         * @property {boolean} 是否开启
         */
        enable: {
            type: Boolean,
            required: true,
        },
        /**
         * @property {string} 通道ID
         */
        chlId: {
            type: String,
            required: true,
        },
    },
    emits: {
        error() {
            return true
        },
        change() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()

        const pageData = ref({
            isPop: false,
            // 当前资源百分比
            totalResourceOccupancy: 0,
        })

        // 事件类型与显示文本的映射
        const eventTypeMapping: Record<string, string> = {
            faceDetect: Translate('IDCS_DETECTION') + '/' + Translate('IDCS_RECOGNITION'),
            faceMatch: Translate('IDCS_FACE_RECOGNITION'),
            tripwire: Translate('IDCS_BEYOND_DETECTION'),
            perimeter: Translate('IDCS_INVADE_DETECTION'),
            aoientry: Translate('IDCS_SMART_AOI_ENTRY_DETECTION'),
            aoileave: Translate('IDCS_SMART_AOI_LEAVE_DETECTION'),
            reid: Translate('IDCS_PICTURE_COMPARSION'),
        }

        const aiResTypeMapping: Record<string, string> = {
            face: Translate('IDCS_FACE_RECOGNITION'),
            boundary: Translate('IDCS_HUMAN_CAR_OTHER_BOUNDARY'),
            reid: Translate('IDCS_PICTURE_COMPARSION'),
        }

        const tableData = ref<AlarmAIResourceDto[]>([])

        /**
         * @description 获取AI资源列表
         */
        const getData = async () => {
            const sendXml = prop.enable
                ? rawXml`
                    <content>
                        <chl>
                            <item id="${prop.chlId}">
                                <eventType>${prop.event}</eventType>
                                <switch>${prop.enable}</switch>
                            </item>
                        </chl>
                    </content>
                `
                : ''

            const res = await queryAIResourceDetail(sendXml)
            const $ = queryXml(res)
            if ($('status').text() === 'success') {
                pageData.value.totalResourceOccupancy = Math.min(100, $('content/totalResourceOccupancy').text().num())

                if (pageData.value.totalResourceOccupancy <= 100) {
                    tableData.value = []
                    $('content/aiResInfo/item').forEach((element) => {
                        const $item = queryXml(element.element)

                        const aiResType = element.attr('aiResType')
                        const aiResPercent = $item('aiResPercent').text()

                        const aiResDetailInfo: Record<string, AlarmAIResDetailInfoDto> = {}
                        $item('detailInfos/item').forEach((ele) => {
                            const $detailItem = queryXml(ele.element)

                            const chlId = ele.attr('id')
                            let name = $detailItem('name').text()
                            // 解码状态（normal、resourceLess、resolutionOver、noDecode）
                            const decodeStatus = ele.attr('decodeStatus') || 'normal'
                            // 通道是否在线
                            const connectState = $detailItem('connectState').text().bool()
                            name = connectState ? name : name + '(' + Translate('IDCS_OFFLINE') + ')'
                            const eventType = ele.attr('eventType').array()
                            const aiResPercentForChl = $detailItem('aiResPercent').text() // AI资源（各个通道的AI资源）
                            const occupyDecodeCapPercent = ele.attr('occupyDecodeCapPercent') // 解码资源

                            // 获取当前aiResType的通道Id-通道信息的映射map
                            if (aiResDetailInfo[chlId]) {
                                eventType.forEach((e) => {
                                    if (!aiResDetailInfo[chlId].eventTypes.includes(e)) {
                                        aiResDetailInfo[chlId].eventTypes.push(e)
                                    }
                                })
                                aiResDetailInfo[chlId].aiResType.push(aiResType)
                            } else {
                                aiResDetailInfo[chlId] = {
                                    chlId: chlId,
                                    chlName: name,
                                    eventTypes: eventType,
                                    decodeStatus: decodeStatus,
                                    connectState: connectState,
                                    aiResType: [aiResType],
                                    aiResPercent: aiResPercentForChl,
                                    occupyDecodeCapPercent: occupyDecodeCapPercent,
                                }
                            }
                        })
                        let aiResDetailTips = ''
                        if (aiResType === 'reid') {
                            aiResDetailTips = `${Translate('IDCS_LINK_ALL_CHANNEL')}, ${Translate('IDCS_USAGE_RATE')}${aiResPercent}%`
                        } else {
                            const aiResDetailInfoList: AlarmAIResDetailInfoDto[] = []
                            // 遍历通道信息并推入列表
                            Object.entries(aiResDetailInfo).forEach(([, chlInfo]) => {
                                aiResDetailInfoList.push(chlInfo)
                            })
                            // 根据 chlId 排序
                            aiResDetailInfoList.sort((a, b) => {
                                const chlIdA = getChlId16(a.chlId)
                                const chlIdB = getChlId16(b.chlId)
                                return chlIdA - chlIdB
                            })
                            // 生成提示信息
                            aiResDetailInfoList.forEach((chlInfo) => {
                                aiResDetailTips += `${chlInfo.chlName}, `
                                chlInfo.eventTypes.forEach((eventType, idx) => {
                                    aiResDetailTips += `${eventTypeMapping[eventType]}/`
                                    if (idx === chlInfo.eventTypes.length - 1) {
                                        aiResDetailTips = aiResDetailTips.slice(0, -1) // 去掉最后的斜杠
                                        aiResDetailTips += ', '
                                    }
                                })
                                aiResDetailTips += `${Translate('IDCS_USAGE_RATE')}${chlInfo.aiResPercent}%, `
                                if (chlInfo.decodeStatus === 'noDecode') {
                                    aiResDetailTips = aiResDetailTips.slice(0, -1) // 去掉最后的逗号
                                    aiResDetailTips += '\n'
                                } else if (chlInfo.decodeStatus === 'normal') {
                                    aiResDetailTips += `${Translate('IDCS_DECODE_RESOURCE')}${chlInfo.occupyDecodeCapPercent}%\n`
                                } else {
                                    aiResDetailTips += `${Translate('IDCS_NO_DECODE_RESOURCE')}(${Translate('IDCS_DECODE_CAPABILITY_NOT_ENOUGH')})\n`
                                }
                            })
                        }
                        tableData.value.push({
                            aiResType,
                            aiResDetailInfo,
                            aiResDetailTips,
                            aiResPercent,
                        })
                    })
                } else {
                    // 资源占用率超过100
                    openMessageBox(Translate('IDCS_NO_RESOURCE'))
                    ctx.emit('error')
                }
            }
        }

        /**
         * @description 删除AI资源
         * @param {AlarmAIResourceDto} row
         */
        const deleteResource = (row: AlarmAIResourceDto) => {
            openMessageBox({
                type: 'question',
                message: Translate('IDCS_DELETE_MP_S'),
            }).then(async () => {
                if (row.aiResType === 'reid') {
                    const sendXml = rawXml`
                        <content>
                            <switch>false</switch>
                        </content>
                    `
                    openLoading()
                    const res = await editREIDCfg(sendXml)
                    closeLoading()
                    const $ = queryXml(res)
                    if ($('status').text() === 'success') {
                        getData()
                        ctx.emit('change')
                    }
                } else {
                    let requestCount = 0
                    let requestDoneCount = 0
                    openLoading()
                    Object.entries(row.aiResDetailInfo).forEach(async ([chlId, chlInfo]) => {
                        const sendXml = rawXml`
                            <content>
                                <chl id="${chlId}">
                                    <param>
                                        ${chlInfo.eventTypes.map((item) => `<item>${item}</item>`).join('')}
                                    </param>
                                </chl>
                            </content>
                        `
                        requestCount++
                        const res = await freeAIOccupyResource(sendXml)
                        const $ = queryXml(res)
                        if ($('status').text() === 'success') {
                            requestDoneCount++
                            if (requestDoneCount === requestCount) {
                                closeLoading()
                                getData()
                                ctx.emit('change')
                            }
                        }
                    })
                }
            })
        }

        onMounted(() => {
            if (prop.chlId) {
                getData()
            }
        })

        watch(
            () => prop.chlId,
            (chlId) => {
                if (chlId) {
                    getData()
                }
            },
        )

        watch(
            () => prop.enable,
            () => {
                getData()
            },
        )

        watch(
            () => prop.event,
            () => getData(),
        )

        return {
            aiResTypeMapping,
            pageData,
            tableData,
            deleteResource,
        }
    },
})
