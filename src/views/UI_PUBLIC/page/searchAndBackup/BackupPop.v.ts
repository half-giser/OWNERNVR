/*
 * @Author: yejiahao yejiahao@tvt.net.cn
 * @Date: 2024-08-06 20:36:26
 * @Description: 备份录像弹窗
 */
import BackupRemoteEncryptPop from './BackupRemoteEncryptPop.vue'
import type { PlaybackBackUpRecList } from '@/types/apiType/playback'
import { type FormRules, type FormInstance } from 'element-plus'

export default defineComponent({
    components: {
        BackupRemoteEncryptPop,
    },
    props: {
        /**
         * @property {Enum} 播放器模式
         */
        mode: {
            type: String,
            required: true,
        },
        /**
         * @property {Array} 回放列表
         */
        backupList: {
            type: Array as PropType<PlaybackBackUpRecList[]>,
            required: true,
        },
    },
    emits: {
        close() {
            return true
        },
        confirm(type: 'local' | 'remote', path: string, format: string) {
            return !!type && typeof path === 'string' && typeof format === 'string'
        },
    },
    setup(prop, ctx) {
        const { Translate } = useLangStore()
        const { openMessageBox } = useMessageBox()
        const Plugin = inject('Plugin') as PluginType

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
            // 本地格式选项
            localFormatOptions: [
                {
                    value: 'AVI',
                    label: Translate('AVI'),
                },
            ] as SelectOption<string, string>[],
            // 远程格式选项
            remoteFormatOptions: [
                {
                    value: 'PRIVATE',
                    label: Translate('IDCS_PRIVATE'),
                },
                {
                    value: 'AVI',
                    label: Translate('AVI'),
                },
            ] as SelectOption<string, string>[],
            // 远程设备选项
            remoteDeviceOptions: [] as { name: string; remainSize: string }[],
            // 是否打开远程加密弹窗
            isRemoteEncryptPop: false,
        })

        const formRef = ref<FormInstance>()
        const formData = ref({
            // 备份目的地
            destination: 'local',
            // 本地格式
            localFormat: pageData.value.localFormatOptions[0].value,
            // 本地路径
            localPath: '',
            // 远程设备名称
            remoteDeviceName: '',
            // 远程格式
            remoteFormat: pageData.value.remoteFormatOptions[0].value,
        })

        const formRule = ref<FormRules>({
            localPath: [
                {
                    validator(_rule, value, callback) {
                        if (prop.mode !== 'ocx') {
                            callback()
                            return
                        }

                        if (!value) {
                            callback(new Error(Translate('IDCS_SELECT_PATH')))
                            return
                        }
                        callback()
                        return
                    },
                    trigger: 'manual',
                },
            ],
        })

        /**
         * @description 查询设备连接的U盘信息
         */
        const getExternalDisk = async () => {
            const result = await queryExternalDisks()
            const $ = queryXml(result)
            pageData.value.remoteDeviceOptions = $('//content/item').map((item) => {
                const $item = queryXml(item.element)
                return {
                    name: item.attr('name')!,
                    remainSize: $item('remainSize').text(),
                }
            })
        }

        /**
         * @description OCX获取本地储存路径
         */
        const getLastRecBackUpPath = () => {
            if (prop.mode !== 'ocx') {
                return
            }

            try {
                Plugin.AsynQueryInfo(Plugin.GetVideoPlugin(), OCX_XML_GetLocalCfg(), (result) => {
                    const $ = queryXml(XMLStr2XMLDoc(result))
                    formData.value.localPath = $('//recBackUpPath').text()
                })
            } catch {
                openMessageBox({
                    type: 'info',
                    message: Translate('IDCS_QUERY_DATA_FAIL'),
                })
            }
        }

        /**
         * @description 打开弹窗，初始化表单和数据
         */
        const open = async () => {
            formRef.value?.resetFields()
            formRef.value?.clearValidate()
            getExternalDisk()
            getLastRecBackUpPath()
        }

        /**
         * @description 确认表单，本地任务和远程任务做不同的处理
         */
        const confirm = () => {
            if (formData.value.destination === 'local') {
                ctx.emit('confirm', 'local', formData.value.localPath, formData.value.localFormat)
            } else {
                pageData.value.isRemoteEncryptPop = true
            }
        }

        /**
         * @description 提交远程任务数据
         * @param {String} password
         */
        const confirmCreateRecBackupTask = async (password = '') => {
            const sendXml = rawXml`
                <content>
                    ${prop.backupList
                        .map((item) => {
                            // if (!item.records.length) return ''
                            return rawXml`
                                <item>
                                    <chls>
                                        <item id="${item.chlId}"></item>
                                    </chls>
                                    <eventType>${item.events.join(',')}</eventType>
                                    <startTime>${localToUtc(item.startTime)}</startTime>
                                    <endTime>${localToUtc(item.endTime)}</endTime>
                                    <backupFileFormat>${formData.value.remoteFormat}</backupFileFormat>
                                    <backupPath>${formData.value.remoteDeviceName}</backupPath>
                                    <IsMainStream>${item.streamType === 0 ? 'true' : 'false'}</IsMainStream>
                                    ${ternary(password, `<encryptPassword>${password}</encryptPassword>`)}
                                </item>
                            `
                        })
                        .join('')}
                </content>
            `
            const result = await createRecBackupTask(sendXml)
            const $ = queryXml(result)
            if ($('//status').text() === 'success') {
                ctx.emit('confirm', 'remote', formData.value.remoteDeviceName, formData.value.remoteFormat)
            } else {
                const errorCode = Number($('//errorCode').text())
                let errorInfo = ''
                switch (errorCode) {
                    case ErrorCode.USER_ERROR_DISK_SPACE_NO_ENOUGH:
                        errorInfo = Translate('IDCS_DISK_SPACE_NO_ENOUGH')
                        break
                    case ErrorCode.USER_ERROR_NO_AUTH:
                        errorInfo = Translate('IDCS_NO_PERMISSION')
                        break
                    case ErrorCode.USER_ERROR_OVER_LIMIT:
                        const num = $('//errorDescription').text()
                        errorInfo = Translate('IDCS_BACKUP_TASK_NUM_LIMIT').formatForLang(num)
                        break
                    default:
                        break
                }

                if (errorInfo) {
                    openMessageBox({
                        type: 'info',
                        message: errorInfo,
                    })
                }
            }
        }

        /**
         * @description OCX浏览文件夹
         */
        const openFolder = () => {
            Plugin.AsynQueryInfo(Plugin.GetVideoPlugin(), OCX_XML_OpenFileBrowser('FOLDER'), (result) => {
                const path = OCX_XML_OpenFileBrowser_getpath(result).trim()
                if (path) {
                    formData.value.localPath = path
                }
            })
        }

        /**
         * @description 关闭弹窗，取消下载
         */
        const close = () => {
            ctx.emit('close')
        }

        return {
            formRef,
            pageData,
            formData,
            open,
            confirm,
            close,
            confirmCreateRecBackupTask,
            openFolder,
            formRule,
            BackupRemoteEncryptPop,
        }
    },
})
