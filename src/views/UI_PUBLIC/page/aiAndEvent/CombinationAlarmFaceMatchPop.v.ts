/*
 * @Description: 普通事件——组合报警——人脸识别edit弹窗
 * @Author: luoyiming luoyiming@tvt.net.cn
 * @Date: 2024-08-26 16:19:02
 */
export default defineComponent({
    props: {
        linkedEntity: {
            type: String,
            required: true,
        },
        linkedObj: {
            type: Object as PropType<Record<string, AlarmCombinedFaceMatchDto>>,
            required: false,
        },
    },
    emits: {
        confirm(entity: string, obj: AlarmCombinedFaceMatchDto) {
            return typeof entity === 'string' && typeof obj === 'object'
        },
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()

        const pageData = ref({
            rule: '1',
            duration: 5, // 开始 持续时间
            delay: 5, // 结束 延迟时间
            noShowDisplay: false,
            displayText: '',
            faceDataIds: [] as string[],
            // 人脸库数据列表
            faceList: [] as SelectOption<string, string>[],
            durationOptions: [5, 1, 3].map((value) => {
                return {
                    value,
                    label: displaySecondWithUnit(value),
                }
            }),
            ruleOptions: [
                {
                    label: Translate('IDCS_SUCCESSFUL_RECOGNITION'),
                    value: '1',
                },
                {
                    label: Translate('IDCS_GROUP_STRANGER'),
                    value: '0',
                },
                {
                    label: Translate('IDCS_WORKTIME_MISS_HIT'),
                    value: '2',
                },
            ],
        })

        /**
         * @description 开启弹窗 初始化数据
         */
        const open = async () => {
            pageData.value.faceDataIds = []
            pageData.value.faceList = []

            if (prop.linkedObj?.obj) {
                const obj = prop.linkedObj.obj
                pageData.value.rule = obj.rule
                pageData.value.duration = -obj.duration
                pageData.value.delay = obj.delay
                pageData.value.noShowDisplay = obj.noShowDisplay === 'true' ? true : false
                pageData.value.displayText = obj.displayText
                pageData.value.faceDataIds = obj.groupId.filter((item) => item !== 'undefined')
            }

            const result = await queryFacePersonnalInfoGroupList()
            commLoadResponseHandler(result, ($) => {
                pageData.value.faceList = $('content/item').map((item) => {
                    const $item = queryXml(item.element)
                    return {
                        value: item.attr('id'),
                        label: $item('name').text(),
                    }
                })
            })
        }

        /**
         * @description 确认修改
         */
        const save = () => {
            const groupId: string[] = []
            const faceDataBase: string[] = []
            pageData.value.faceList.forEach((item) => {
                if (pageData.value.faceDataIds.includes(item.value)) {
                    groupId.push(item.value)
                    faceDataBase.push(item.label)
                }
            })
            const obj = {
                rule: pageData.value.rule,
                duration: -pageData.value.duration,
                delay: pageData.value.delay,
                groupId: groupId,
                noShowDisplay: pageData.value.noShowDisplay ? 'true' : 'false',
                displayText: pageData.value.displayText,
                faceDataBase: faceDataBase,
            }
            ctx.emit('confirm', prop.linkedEntity!, obj)
            close()
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            pageData.value.rule = '1'
            pageData.value.duration = 5
            pageData.value.delay = 5
            pageData.value.noShowDisplay = false
            pageData.value.displayText = ''
            pageData.value.faceDataIds = []
            ctx.emit('close')
        }

        return {
            pageData,
            open,
            save,
            close,
        }
    },
})
