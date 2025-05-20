/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-12 13:46:24
 * @Description: 备份图像弹窗
 */
export default defineComponent({
    props: {
        /**
         * @description 备份数据列表
         */
        backupList: {
            type: Array as PropType<PlaybackSearchImgList[]>,
            required: true,
        },
    },
    emits: {
        close() {
            return true
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const userSession = useUserSessionStore()

        const pageData = ref({
            // 目的地选项
            destinationOptions: [
                {
                    value: 'local',
                    label: Translate('IDCS_RECORD_LOCAL'),
                },
                {
                    value: 'remote',
                    label: Translate('IDCS_RECORD_REMOTE_DEVICE'),
                },
            ] as SelectOption<string, string>[],
            // 远程设备选项
            remoteDeviceOptions: [] as { name: string; remainSize: string }[],
        })

        const formData = ref({
            // 备份目的地
            destination: 'local',
            // 远程设备名称
            remoteDeviceName: '',
        })

        /**
         * @description 查询设备连接的U盘信息
         */
        const getExternalDisk = async () => {
            const result = await queryExternalDisks()
            const $ = queryXml(result)
            pageData.value.remoteDeviceOptions = $('content/item').map((item) => {
                const $item = queryXml(item.element)
                return {
                    name: item.attr('name'),
                    remainSize: $item('remainSize').text(),
                }
            })
            if (pageData.value.remoteDeviceOptions.length) {
                formData.value.remoteDeviceName = pageData.value.remoteDeviceOptions[0].name
            }
        }

        /**
         * @description 关闭弹窗，取消下载
         */
        const close = () => {
            ctx.emit('close')
        }

        /**
         * @description 确认表单，本地任务和远程任务做不同的处理
         */
        const confirm = () => {
            if (formData.value.destination === 'local') {
                backupLocalPicture()
            } else {
                backupRemotePicture()
            }
        }

        /**
         * @description 备份图像到远程设备
         */
        const backupRemotePicture = async () => {
            const sendXml = rawXml`
                <condition>
                    <pictures>
                        ${prop.backupList
                            .map((row) => {
                                return rawXml`
                                    <item>
                                        <chl id="${row.chlId}">${row.chlName}</chl>
                                        <captureMode>${row.captureMode}</captureMode>
                                        <captureTime>${row.captureTime}</captureTime>
                                    </item>
                                `
                            })
                            .join('')}
                    </pictures>
                    <backupPath>${formData.value.remoteDeviceName}</backupPath>
                </condition>
            `
            const result = await backupPicture(sendXml)
            const $ = queryXml(result)
            if ($('status').text() !== 'success') {
                openMessageBox(Translate('IDCS_SAVE_FAIL'))
            }
            ctx.emit('close')
        }

        /**
         * @description 加载图像
         * @param {string} url
         * @returns {Promise<HTMLImageElement>}
         */
        const getImg = (url: string) =>
            new Promise((resolve: (img: HTMLImageElement) => void) => {
                const img = new Image()
                img.onload = () => nextTick(() => resolve(img))
                img.src = url
            })

        /**
         * @description 备份图像到本地
         */
        const backupLocalPicture = async () => {
            ctx.emit('close')

            const canvas = document.createElement('canvas')
            const context = canvas.getContext('2d')!

            const link = document.createElement('a')
            link.style.display = 'none'

            document.body.appendChild(link)

            let index = -1
            while (index < prop.backupList.length - 1) {
                index++

                const item = prop.backupList[index]
                const data = {
                    chlId: item.chlId,
                    captureMode: item.captureMode,
                    captureTime: item.captureTime,
                    calendar: userSession.calendarType === 'Persian' ? 'persian' : 'gregorian',
                }

                const url = `${import.meta.env.VITE_BASE_URL}downloadPicture?${Object.entries(data)
                    .map((item) => item.join('='))
                    .join(',')}`
                const fileName = item.chlName + '_' + formatDate(item.captureTimeStamp, 'YYYYMMDDHHmmss') + '.jpg'
                const img = await getImg(url)

                canvas.width = img.width
                canvas.height = img.height

                await nextTick()

                context.drawImage(img, 0, 0, img.width, img.height)

                const dataURL = canvas.toDataURL('image/jpeg')

                link.setAttribute('href', dataURL)
                link.setAttribute('download', fileName)

                await nextTick()

                try {
                    link.click()
                } catch (e) {
                    openMessageBox('Your browser does not support downloading pictures')
                }

                context.clearRect(0, 0, canvas.width, canvas.height)
            }

            setTimeout(() => {
                document.body.removeChild(link)
            }, 1000)
        }

        /**
         * @description 打开弹窗，初始化表单和数据
         */
        const open = () => {
            formData.value.destination = 'local'
            formData.value.remoteDeviceName = ''
            getExternalDisk()
        }

        return {
            pageData,
            formData,
            open,
            confirm,
            close,
        }
    },
})
