/*
 * @Date: 2025-05-17 10:11:39
 * @Description: 目标侦测
 * @Author: yejiahao yejiahao@tvt.net.cn
 */
export default defineComponent({
    setup() {
        const { Translate } = useLangStore()

        const formData = ref({
            switch: false,
        })

        const tableData = ref<AlarmDetectTargetDto[]>([])

        const getData = async () => {
            openLoading()

            const result = await queryREIDCfg()
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                formData.value.switch = $('content/switch').text().bool()

                tableData.value = $('content/frontDetectInfos/chls/item')
                    .map((item) => {
                        const $front = queryXml(item.element)
                        const chlId = item.attr('id')

                        const $back = queryXml($(`content/backDetectInfos/chls/item[@id="${chlId}"]`)[0].element)

                        const frontFaceDetectOnline = $front('faceDetect/online').text().bool()
                        const frontFaceDetectEnable = $front('faceDetect/enable').text().bool()
                        const frontTargetDetectOnline = $front('targetDetect/online').text().bool()
                        const frontTargetDetectEnable = $front('targetDetect/enable').text().bool()

                        const backFaceDetectOnline = $back('faceDetect/online').text().bool()
                        const backFaceDetectEnable = $back('faceDetect/enable').text().bool()
                        const backTargetDetectOnline = $back('targetDetect/online').text().bool()
                        const backTargetDetectEnable = $back('targetDetect/enable').text().bool()

                        return {
                            chlId: item.attr('id'),
                            chlName: item.attr('name'),
                            // 3种值： NULL AUTO MANUAL
                            workMode: $front('workMode').text(),
                            // enable节点控制是否显示：前、后智能均未打开，则列表不显示此通道
                            enable: frontFaceDetectEnable || frontTargetDetectEnable || backFaceDetectEnable || backTargetDetectEnable,
                            // online节点控制表格项目置灰：通道不在线则置灰该行
                            online: frontFaceDetectOnline || frontTargetDetectOnline || backFaceDetectOnline || backTargetDetectOnline,
                            front: [frontFaceDetectEnable, frontTargetDetectEnable],
                            back: [backFaceDetectEnable, backTargetDetectEnable],
                        }
                    })
                    .filter((item) => {
                        return item.enable
                    })
            }
        }

        const setData = async () => {
            openLoading()

            const sendXml = rawXml`
                <content>
                    <switch>${formData.value.switch}</switch>
                </content>
            `
            const result = await editREIDCfg(sendXml)
            const $ = queryXml(result)

            closeLoading()

            if ($('status').text() === 'success') {
                openMessageBox({
                    type: 'success',
                    message: Translate('IDCS_SAVE_DATA_SUCCESS'),
                })
                getData()
            } else {
                const errorCode = $('errorCode').text().num()
                switch (errorCode) {
                    case 536870983:
                        openMessageBox(Translate('IDCS_DECODE_CAPABILITY_NOT_ENOUGH'))
                        break
                    case 536871042:
                        openMessageBox(Translate('IDCS_SAVE_DATA_FAIL'))
                        break
                    case 536871091:
                        openMessageBox(Translate('IDCS_RESOLUTION_OVER_CAPABILITY'))
                        break
                    default:
                        openMessageBox(Translate('IDCS_SAVE_DATA_FAIL'))
                        break
                }
            }
        }

        const displayDetectTarget = (bools: boolean[]) => {
            return [bools[0] ? Translate('IDCS_FACE') : '', bools[1] ? `${Translate('IDCS_DETECTION_PERSON')}/${Translate('IDCS_VEHICLE')}` : ''].filter((item) => !!item).join('; ') || '--'
        }

        const handleRowClassName = (data: { row: AlarmDetectTargetDto; index: number }) => {
            if (!data.row.online) {
                return 'disabled'
            }
            return ''
        }

        onMounted(() => {
            getData()
        })

        return {
            tableData,
            displayDetectTarget,
            handleRowClassName,
            setData,
            formData,
        }
    },
})
