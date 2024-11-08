/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-11-06 20:23:39
 * @Description: AI资源按钮与详情
 */
import { type AlarmAIResourceDto } from '@/types/apiType/aiAndEvent'

export default defineComponent({
    props: {
        event: {
            type: String,
            required: true,
        },
        enable: {
            type: Boolean,
            required: true,
        },
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
        const { openMessageBox } = useMessageBox()
        const { openLoading, closeLoading } = useLoading()

        const pageData = ref({
            isPop: false,
            totalResourceOccupancy: 0,
        })

        const eventTypeMapping: Record<string, string> = {
            faceDetect: Translate('IDCS_FACE_DETECTION') + '+' + Translate('IDCS_FACE_RECOGNITION'),
            faceMatch: Translate('IDCS_FACE_RECOGNITION'),
            tripwire: Translate('IDCS_BEYOND_DETECTION'),
            perimeter: Translate('IDCS_INVADE_DETECTION'),
        }

        const tableData = ref<AlarmAIResourceDto[]>([])

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
            if ($('status').text() == 'success') {
                pageData.value.totalResourceOccupancy = Math.min(100, Number($('//content/totalResourceOccupancy').text()))

                if (pageData.value.totalResourceOccupancy <= 100) {
                    tableData.value = []
                    $('//content/chl/item').forEach((element) => {
                        const $item = queryXml(element.element)
                        const id = element.attr('id')

                        let name = $item('name').text()
                        // 通道是否在线
                        const connectState = $item('connectState').text().toBoolean()
                        name = connectState ? name : name + '(' + Translate('IDCS_OFFLINE') + ')'

                        $item('resource/item').forEach((ele) => {
                            const eventType: string[] = ele.attr('eventType') ? ele.attr('eventType')!.split(',') : []

                            const eventTypeText = eventType
                                .map((item) => {
                                    return eventTypeMapping[item]
                                })
                                .join('+')

                            const percent = ele.text() + '%'

                            const decodeResource = ele.attr('occupyDecodeCapPercent')
                                ? ele.attr('occupyDecodeCapPercent') == 'notEnough'
                                    ? Translate('IDCS_NO_DECODE_RESOURCE')
                                    : ele.attr('occupyDecodeCapPercent') + '%'
                                : '--'

                            tableData.value.push({
                                id: id || '',
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
                    openMessageBox({
                        type: 'info',
                        message: Translate('IDCS_NO_RESOURCE'),
                    })
                    ctx.emit('error')
                }
            }
        }

        const deleteResource = async (row: AlarmAIResourceDto) => {
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
                if ($('status').text() == 'success') {
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
