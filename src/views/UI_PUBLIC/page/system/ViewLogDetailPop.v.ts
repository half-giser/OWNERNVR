/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-07-01 19:23:38
 * @Description: 查看日志详情
 */
export default defineComponent({
    props: {
        /**
         * @property 日志列表
         */
        data: {
            type: Array as PropType<SystemLogList[]>,
            required: true,
        },
        /**
         * @property 当前日志索引
         */
        activeIndex: {
            type: Number,
            required: true,
        },
    },
    emits: {
        close() {
            return true
        },
        change(index: number) {
            return !isNaN(index)
        },
    },
    setup(prop, ctx) {
        const isContentPlainText = ref(true)

        const pageData = ref({
            type1: '',
            name1: '',
            type2: '',
            name2: '',
            imgName: '',
            captureImg: '',
            scenesImg: '',
        })

        /**
         * @description 上一条
         */
        const prev = () => {
            if (prop.activeIndex > 0) {
                ctx.emit('change', prop.activeIndex - 1)
                handleCombinedType()
            }
        }

        /**
         * @description 下一条
         */
        const next = () => {
            if (prop.activeIndex < prop.data.length - 1) {
                ctx.emit('change', prop.activeIndex + 1)
                handleCombinedType()
            }
        }

        /**
         * @description 关闭弹窗
         */
        const close = () => {
            ctx.emit('close')
        }

        /**
         * @description 当前项
         */
        const item = computed(() => {
            if (prop.data[prop.activeIndex]) return prop.data[prop.activeIndex] as SystemLogList
            return new SystemLogList()
        })

        /**
         * @description 处理组合类型
         */
        const handleCombinedType = async () => {
            if (item.value.logType === 'LOG_ALARM_COMBINED' && item.value.content) {
                const content = item.value.content.trim()
                const contentReg = /\/|:|\n|;/g
                if (content.indexOf(';') !== -1) {
                    isContentPlainText.value = false
                    if (content.trim().match(contentReg)) {
                        const resultArr = content.split('\n')
                        pageData.value.type1 = resultArr[0].split(':')[0].trim()
                        pageData.value.name1 = resultArr[0].split(':')[1].trim()
                        pageData.value.type2 = resultArr[1].split(':')[0].trim()
                        pageData.value.name2 = resultArr[1].split(':')[1].trim()
                        // content有分号可视为组合报警含有人脸识别
                    } else {
                        pageData.value.type1 = ''
                        pageData.value.name1 = ''
                        pageData.value.type2 = ''
                        pageData.value.name2 = ''
                    }
                    /*设备端的逻辑如下
                     *有分号且分号后面内容解析正确：查抓拍图和原图
                     *否则：直接显示content内容
                     *分号后面内容解析正确：分号后面逗号分开四个参数，第一个参数是数字（imgId），第二个参数是时间，第四个参数符合GUID（chlId）
                     **/
                    // 请求抓拍图片和场景图片
                    const imgData = content.split('/')[1].split(';')[1].split(',')
                    // 这里先判断是否有值，不做解析正确的判断
                    if (imgData[0] && imgData[1] && imgData[3]) {
                        pageData.value.imgName = imgData[2]
                        const sendXML1 = rawXml`
                            <condition>
                                <imgId>${imgData[0]}</imgId>
                                <chlId>${imgData[3]}</chlId>
                                <frameTime>${imgData[1]}</frameTime>
                            </condition>
                        `
                        const sendXML2 = rawXml`
                            <condition>
                                <imgId>${imgData[0]}</imgId>
                                <chlId>${imgData[3]}</chlId>
                                <frameTime>${imgData[1]}</frameTime>
                                <isPanorama />
                            </condition>
                        `
                        const result1 = await requestChSnapFaceImage(sendXML1)
                        const result2 = await requestChSnapFaceImage(sendXML2)
                        const captureImg = queryXml(result1)('content').text()
                        const scenesImg = queryXml(result2)('content').text()
                        if (captureImg) {
                            pageData.value.captureImg = wrapBase64Img(captureImg)
                        } else {
                            pageData.value.captureImg = ''
                        }

                        if (scenesImg) {
                            pageData.value.scenesImg = wrapBase64Img(scenesImg)
                        } else {
                            pageData.value.scenesImg = ''
                        }
                    } else {
                        pageData.value.imgName = ''
                        pageData.value.scenesImg = ''
                        pageData.value.captureImg = ''
                    }
                } else {
                    isContentPlainText.value = true
                }
            } else {
                isContentPlainText.value = true
            }
        }

        return {
            isContentPlainText,
            prev,
            next,
            close,
            item,
            pageData,
            handleCombinedType,
        }
    },
})
