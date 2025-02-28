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
            faceDetect: Translate('IDCS_FACE_DETECTION') + '+' + Translate('IDCS_FACE_RECOGNITION'),
            faceMatch: Translate('IDCS_FACE_RECOGNITION'),
            tripwire: Translate('IDCS_BEYOND_DETECTION'),
            perimeter: Translate('IDCS_INVADE_DETECTION'),
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
                                <eventType>tripwire</eventType>
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
                    $('content/chl/item').forEach((element) => {
                        const $item = queryXml(element.element)
                        const id = element.attr('id')

                        let name = $item('name').text()
                        // 通道是否在线
                        const connectState = $item('connectState').text().bool()
                        name = connectState ? name : name + '(' + Translate('IDCS_OFFLINE') + ')'

                        $item('resource/item').forEach((ele) => {
                            const eventType = ele.attr('eventType').array()

                            const eventTypeText = eventType
                                .map((item) => {
                                    return eventTypeMapping[item]
                                })
                                .join('+')

                            const percent = ele.text() + '%'

                            const decodeResource = ele.attr('occupyDecodeCapPercent')
                                ? ele.attr('occupyDecodeCapPercent') === 'notEnough'
                                    ? Translate('IDCS_NO_DECODE_RESOURCE')
                                    : ele.attr('occupyDecodeCapPercent') + '%'
                                : '--'

                            tableData.value.push({
                                id: id,
                                name,
                                eventType,
                                eventTypeText,
                                percent,
                                decodeResource,
                            })
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
                const sendXml = rawXml`
                    <content>
                        <chl id="${row.id}">
                            <param>
                                ${row.eventType.map((item) => `<item>${item}</item>`).join('')}
                            </param>
                        </chl>
                    </content>
                `
                openLoading()
                const res = await freeAIOccupyResource(sendXml)
                closeLoading()
                const $ = queryXml(res)
                if ($('status').text() === 'success') {
                    getData()
                    ctx.emit('change')
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
            (enable) => {
                if (enable) {
                    getData()
                }
            },
        )

        watch(
            () => prop.event,
            () => getData(),
        )

        return {
            pageData,
            tableData,
            deleteResource,
        }
    },
})
